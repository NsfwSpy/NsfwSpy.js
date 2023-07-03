import * as tf from '@tensorflow/tfjs-node';
import * as tfjs from '@tensorflow/tfjs';
import * as fs from 'fs';

tf.enableProdMode();

export class NsfwSpy {
    private imageSize: number;
    private modelPath: string;
    private model: tf.GraphModel | null;

    constructor(modelPath: string) {
        this.imageSize = 224;
        this.modelPath = modelPath;
        this.model = null;
    }

    async load(loadOptions?: tfjs.io.LoadOptions) {
        this.model = await tf.loadGraphModel(this.modelPath, loadOptions);
    }

    async classifyImageFromByteArray(imageBuffer: Buffer) {
        const outputs = tf.tidy(() => {
            if (!this.model) throw new Error("The NsfwSpy model has not been loaded yet.");

            const decodedImage = tf.node.decodeImage(imageBuffer, 3)
                .toFloat()
                .div(tf.scalar(255)) as tf.Tensor3D;

            const resizedImage = tf.image.resizeBilinear(decodedImage, [this.imageSize, this.imageSize], true);
            const image = resizedImage.reshape([1, this.imageSize, this.imageSize, 3]);

            return this.model.execute(
                { 'import/input': image },
                ['Score']
            ) as tf.Tensor2D;
        });

        var data = await outputs.data();
        outputs.dispose();

        return new NsfwSpyResult(data);
    }

    async classifyImageFile(filePath: string) {
        const imageBuffer = await fs.readFileSync(filePath);
        return this.classifyImageFromByteArray(imageBuffer);
    }
}

export class NsfwSpyResult {
    hentai: number;
    neutral: number;
    pornography: number;
    sexy: number;
    predictedLabel: ClassificationTypes;

    constructor(results: Uint8Array | Float32Array | Int32Array) {
        this.hentai = results[0];
        this.neutral = results[1];
        this.pornography = results[2];
        this.sexy = results[3];
        this.predictedLabel = this.toDictionary()[0].key;
    }

    get isNsfw() {
        return this.neutral < 0.5;
    }

    toDictionary() {
        const dictionary: { key: ClassificationTypes, value: number }[] = [
            { key: "hentai", value: this.hentai },
            { key: "neutral", value: this.neutral },
            { key: "pornography", value: this.pornography },
            { key: "sexy", value: this.sexy }
        ];

        return dictionary.sort((a, b) => {
            return b.value - a.value;
        });
    }
}

export type ClassificationTypes = "hentai" | "neutral" | "pornography" | "sexy";