declare module "predictionary" {
    export interface PredictionResult {
        word: string;
        score: number;
    }

    export interface PredictOptions {
        maxPredictions?: number;
        minScore?: number;
    }

    export interface Predictor {
        predict(input: string, options?: PredictOptions): PredictionResult[];
        learn(word: string): void;
    }

    function Predictionary(language: string): Predictor;

    export default Predictionary;
}
