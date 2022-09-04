import { NsfwSpyResult } from '../../nsfwspy-core';
import { NsfwSpy } from '../../nsfwspy-node';
import * as nsfwjs from 'nsfwjs';
import pLimit from 'p-limit';
// import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';

(async () => {
    const testImagesPath = "E:\\NsfwSpy\\Test";
    const classificationTypes = [
        "hentai",
        "neutral",
        "pornography",
        "sexy"
    ];
    const limit = pLimit(15);

    const results: PerformanceResult[] = [];
    const nsfwSpy = new NsfwSpy();
    await nsfwSpy.load();
    // const nsfwJs = await nsfwjs.load("file://./model/", { size: 299 })

    for (let index = 0; index < classificationTypes.length; index++) {
        const classificationType = classificationTypes[index];
        const testFileDirectory = path.join(testImagesPath, classificationType);
        const testFilenames = fs.readdirSync(testFileDirectory);
        const testFiles = testFilenames.map((filename) => path.join(testFileDirectory, filename));

        const pr = new PerformanceResult(classificationType);
        const promises = testFiles.map((testFile) => limit(async () => {
            try {
                // const imageBuffer = await fs.readFileSync(testFile);
                // const image = await tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;
                // const prResult = await nsfwJs.classify(image);
                // const nsfwSpyResult = new NsfwJsResult(prResult);
                // image.dispose();

                const nsfwSpyResult = await nsfwSpy.classifyImageFile(testFile);
                pr.results.push(nsfwSpyResult);
                console.log(`${pr.key}  | Correct Asserts: ${pr.correctAsserts} / ${pr.totalAsserts} (${(pr.correctAsserts / pr.totalAsserts) * 100}%) | IsNsfw: ${pr.nsfwAsserts} / ${pr.totalAsserts} (${(pr.nsfwAsserts / pr.totalAsserts) * 100}%) | ${testFile}`);
            } catch (ex) {
                console.log(`FAILED TO CLASSIFY ${testFile} | ${ex}`);
            }
        }));

        await Promise.all(promises);

        results.push(pr);
    }

    results.forEach((pr) => {
        console.log(`${pr.key}  | Correct Asserts: ${pr.correctAsserts} / ${pr.totalAsserts} (${(pr.correctAsserts / pr.totalAsserts) * 100}%) | IsNsfw: ${pr.nsfwAsserts} / ${pr.totalAsserts} (${(pr.nsfwAsserts / pr.totalAsserts) * 100}%)`);
    })

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
    predictedLabel: string;

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
        const dictionary = [
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
