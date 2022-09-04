import * as tf from '@tensorflow/tfjs-node';

export class NsfwSpy {
    private modelPath: string;
    private model: tf.GraphModel | null;

    constructor(modelPath?: string) {
        this.modelPath = modelPath ?? "https://raw.githubusercontent.com/d00ML0rDz/NsfwSpy.js/main/src/models/mobilenet%20v1.0.0/";
        this.model = null;
    }

    async load() {
        this.model = await tf.loadGraphModel(this.modelPath);
    }
}