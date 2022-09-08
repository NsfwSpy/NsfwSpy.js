import * as tf from '@tensorflow/tfjs';

tf.enableProdMode();

export class NsfwSpy {
    private imageSize: number;
    private modelPath: string;
    private model: tf.GraphModel | null;

    constructor(modelPath?: string) {
        this.imageSize = 224;
        this.modelPath = modelPath ?? "https://nsfwspy.s3.eu-west-2.amazonaws.com/models/mobilenet-v1.0.0/model.json";
        this.model = null;
    }

    async load(loadOptions?: tf.io.LoadOptions) {
        this.model = await tf.loadGraphModel(this.modelPath, loadOptions);
    }

    async classifyImage(image: ImageData | HTMLImageElement | HTMLCanvasElement | ImageBitmap) {
        const outputs = tf.tidy(() => {
            if (!this.model) throw new Error("The NsfwSpy model has not been loaded yet.");

            const decodedImage = tf.browser.fromPixels(image, 3)
                .toFloat()
                .div(tf.scalar(255)) as tf.Tensor3D;

            const resizedImage = tf.image.resizeBilinear(decodedImage, [224, 224], true);
            const tensor = resizedImage.reshape([1, this.imageSize, this.imageSize, 3]);

            return this.model.execute(
                { 'import/input': tensor },
                ['Score']
            ) as tf.Tensor2D;
        });

        var data = await outputs.data();
        outputs.dispose();

        return new NsfwSpyResult(data);
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