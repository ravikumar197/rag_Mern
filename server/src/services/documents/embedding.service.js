const { pipeline } = require('@xenova/transformers');

let embeddingModel = null;

async function getEmbeddingModel() {
  if (!embeddingModel) {
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingModel;
}

async function generateEmbedding(text) {
  try {
    const model = await getEmbeddingModel();
    const embedding = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(embedding.data);
  } catch (error) {
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

module.exports = {
  generateEmbedding,
};