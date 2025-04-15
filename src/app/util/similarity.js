import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';

let model = null;

export async function loadUSEModel() {
    if (!model) {
        model = await use.load();
    }
    return model;
}

export async function getSimilarityScore(text1, text2) {
    const model = await loadUSEModel();

    const embeddings = await model.embed([text1, text2]);
    const embeddingArray = await embeddings.array();

    const dotProduct = tf.dot(embeddingArray[0], embeddingArray[1]).dataSync()[0];
    const normA = tf.norm(embeddingArray[0]).dataSync()[0];
    const normB = tf.norm(embeddingArray[1]).dataSync()[0];

    const cosineSimilarity = dotProduct / (normA * normB);
    return cosineSimilarity;
}
