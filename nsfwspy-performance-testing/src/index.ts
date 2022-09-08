import { NsfwSpy, ClassificationTypes, NsfwSpyResult } from '../../nsfwspy-node';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs-node';
import * as readline from 'readline';
import fs from 'fs';
import path from 'path';

const runPerformanceTesting = async (classifier: "nsfwspy" | "nsfwjs") => {
    const testImagesPath = "E:\\NsfwSpy\\Test";
    const classificationTypes: ClassificationTypes[] = [
        "hentai",
        "neutral",
        "pornography",
        "sexy"
    ];

    const results: PerformanceResult[] = [];
    let nsfwSpy = new NsfwSpy();
    let nsfwJs: nsfwjs.NSFWJS;
    if (classifier === "nsfwspy") {
        await nsfwSpy.load({
            onProgress: (progress) => {
                console.log(`Loading NsfwSpy model... ${progress * 100}%`)
            }
        });
    } else {
        console.log("Loading NSFWJS model...")
        nsfwJs = await nsfwjs.load("https://nsfwjs.com/model/model.json", { size: 299 })
    }

    console.time("Total runtime");
    for (let index = 0; index < classificationTypes.length; index++) {
        const classificationType = classificationTypes[index];
        const testFileDirectory = path.join(testImagesPath, classificationType);
        const testFilenames = fs.readdirSync(testFileDirectory);
        const testFiles = testFilenames.map((filename) => path.join(testFileDirectory, filename));

        const pr = new PerformanceResult(classificationType);
        for (let index = 0; index < testFiles.length; index++) {
            const testFile = testFiles[index];

            try {
                let nsfwResult: NsfwSpyResult | NsfwJsResult;

                if (classifier === "nsfwspy") {
                    nsfwResult = await nsfwSpy.classifyImageFile(testFile);
                } else {
                    const imageBuffer = await fs.readFileSync(testFile);
                    const image = await tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;
                    const prResult = await nsfwJs!.classify(image);
                    nsfwResult = new NsfwJsResult(prResult);
                    image.dispose();
                }

                pr.results.push(nsfwResult);
                console.log(`${pr.key}  | Correct Asserts: ${pr.correctAsserts} / ${pr.totalAsserts} (${(pr.correctAsserts / pr.totalAsserts) * 100}%) | IsNsfw: ${pr.nsfwAsserts} / ${pr.totalAsserts} (${(pr.nsfwAsserts / pr.totalAsserts) * 100}%) | ${testFile}`);
            } catch (ex) {
                console.log(`FAILED TO CLASSIFY ${testFile} | ${ex}`);
            }
        };

        results.push(pr);
    }

    results.forEach((pr) => {
        console.log(`${pr.key}  | Correct Asserts: ${pr.correctAsserts} / ${pr.totalAsserts} (${(pr.correctAsserts / pr.totalAsserts) * 100}%) | IsNsfw: ${pr.nsfwAsserts} / ${pr.totalAsserts} (${(pr.nsfwAsserts / pr.totalAsserts) * 100}%)`);
    })
    console.timeEnd("Total runtime");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {
    console.log("NSFW Performance Testing");
    rl.question("Select library:\n1. NsfwSpy\n2. NSFWJS\n", (librarySelection) => {
        if (librarySelection === "1")
            runPerformanceTesting("nsfwspy");
        else if (librarySelection === "2")
            runPerformanceTesting("nsfwjs");
    });
})();

class PerformanceResult {
    key: string;
    results: NsfwSpyResult[] | NsfwJsResult[];

    constructor(key: string) {
        this.key = key;
        this.results = [];
    }

    get correctAsserts() {
        return this.results.filter((r) => r.predictedLabel === this.key).length;
    }

    get nsfwAsserts() {
        return this.results.filter((r) => r.isNsfw).length;
    }

    get hentaiAsserts() {
        return this.results.filter((r) => r.predictedLabel === "hentai").length;
    }

    get neutralAsserts() {
        return this.results.filter((r) => r.predictedLabel === "neutral").length;
    }

    get pornographyAsserts() {
        return this.results.filter((r) => r.predictedLabel === "pornography").length;
    }

    get sexyAsserts() {
        return this.results.filter((r) => r.predictedLabel === "sexy").length;
    }

    get totalAsserts() {
        return this.results.length;
    }
}

class NsfwJsResult {
    hentai: number;
    neutral: number;
    pornography: number;
    sexy: number;
    predictedLabel: ClassificationTypes;

    constructor(results: nsfwjs.predictionType[]) {
        this.hentai = results.find((r) => r.className === "Hentai")?.probability ?? 0;
        this.neutral = (results.find((r) => r.className === "Neutral")?.probability ?? 0) + (results.find((r) => r.className === "Drawing")?.probability ?? 0);
        this.pornography = (results.find((r) => r.className === "Porn")?.probability ?? 0) + (results.find((r) => r.className === "Sexy")?.probability ?? 0);
        this.sexy = results.find((r) => r.className === "Sexy")?.probability ?? 0;
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
