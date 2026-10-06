// const embeddingService = require('./embedding.service');
// const Document = require('../../models/Document');

// /**
//  * Calculate cosine similarity between two vectors
//  */
// function cosineSimilarity(vecA, vecB) {
//   const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
//   const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
//   const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
//   return dotProduct / (magnitudeA * magnitudeB);
// }

// /**
//  * Search for relevant chunks based on query
//  */
// async function searchChunks(query, topK = 3) {
//   try {
//     // Generate embedding for the query
//     const queryEmbedding = await embeddingService.generateEmbedding(query);

//     // Get all documents with chunks
//     const documents = await Document.find({}, { chunks: 1, name: 1 });

//     // Calculate similarity scores for all chunks
//     const scoredChunks = [];
//     documents.forEach((doc) => {
//       doc.chunks.forEach((chunk) => {
//         if (chunk.embedding) {
//           const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
//           scoredChunks.push({
//             documentId: doc._id,
//             documentName: doc.name,
//             chunkIndex: chunk.index,
//             text: chunk.text,
//             similarity,
//           });
//         }
//       });
//     });

//     // Sort by similarity and return top K
//     return scoredChunks
//       .sort((a, b) => b.similarity - a.similarity)
//       .slice(0, topK);
//   } catch (error) {
//     throw new Error(`Search failed: ${error.message}`);
//   }
// }

// module.exports = {
//   searchChunks,
//   cosineSimilarity,
// };










const embeddingService = require('./embedding.service');
const vectorService = require('../vector/vector.service');

/**
 * Search for relevant chunks using Qdrant.
 */
async function searchChunks(query, topK = 3) {
    try {
        // 1. Convert user question into an embedding
        const queryEmbedding =
            await embeddingService.generateEmbedding(query);

        // 2. Search Qdrant
        const results = await vectorService.searchVectors(
            queryEmbedding,
            topK
        );

        console.log(
            '\n========== QDRANT RESULTS =========='
        );

        results.forEach((result, index) => {
            console.log(`\nResult ${index + 1}`);
            console.log('Score:', result.score);
            console.log('Document:', result.payload?.documentName);
            console.log('Chunk:', result.payload?.chunkIndex);
            console.log('Text:', result.payload?.text);
        });

        console.log(
            '====================================\n'
        );

        // 3. Convert Qdrant results into our application's format
        return results.map(result => ({
            documentId: result.payload.documentId,

            documentName: result.payload.documentName,

            chunkIndex: result.payload.chunkIndex,

            text: result.payload.text,

            similarity: result.score,
        }));
    } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
}

module.exports = {
    searchChunks,
};