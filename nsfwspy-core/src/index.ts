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