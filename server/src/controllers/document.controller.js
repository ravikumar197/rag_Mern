// const parserService = require('../services/documents/parser.service');
// const chunkingService = require('../services/documents/chunking.service');
// const embeddingService = require('../services/documents/embedding.service');
// const Document = require('../models/Document');

// async function getAllDocuments(req, res) {
//   try {
//     const documents = await Document.find({}, { chunks: 1, name: 1, pageCount: 1, uploadedAt: 1 });
//     res.json({
//       success: true,
//       documents: documents.map(doc => ({
//         _id: doc._id,
//         name: doc.name,
//         pageCount: doc.pageCount,
//         chunks: doc.chunks,
//         uploadedAt: doc.uploadedAt,
//       })),
//     });
//   } catch (error) {
//     console.error('Fetch error:', error);
//     res.status(500).json({ error: error.message });
//   }
// }

// async function uploadDocument(req, res) {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const { originalname, buffer, mimetype, size } = req.file;

//     // Extract text from PDF
//     const { text, pageCount, metadata } = await parserService.extractTextFromPDF(buffer);

//     // Chunk the text
//     const chunks = chunkingService.chunkText(text, 500, 50);

//     // Generate embeddings for each chunk
//     const chunksWithEmbeddings = await Promise.all(
//       chunks.map(async (chunk) => {
//         const embedding = await embeddingService.generateEmbedding(chunk.text);
//         return {
//           ...chunk,
//           tokenCount: chunkingService.estimateTokenCount(chunk.text),
//           embedding,
//         };
//       })
//     );

//     // Save to MongoDB
//     const doc = new Document({
//       name: originalname,
//       mimeType: mimetype,
//       fileSize: size,
//       pageCount,
//       totalCharacters: text.length,
//       metadata,
//       chunks: chunksWithEmbeddings,
//     });

//     const savedDoc = await doc.save();

//     res.json({
//       success: true,
//       documentId: savedDoc._id,
//       document: {
//         name: savedDoc.name,
//         pageCount: savedDoc.pageCount,
//         chunks: {
//           total: chunksWithEmbeddings.length,
//           message: 'Embeddings generated and stored',
//         },
//       },
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ error: error.message });
//   }
// }

// async function deleteDocument(req, res) {
//   try {
//     const { id } = req.params;
//     await Document.findByIdAndDelete(id);
//     res.json({ success: true, message: 'Document deleted' });
//   } catch (error) {
//     console.error('Delete error:', error);
//     res.status(500).json({ error: error.message });
//   }
// }

// module.exports = {
//   getAllDocuments,
//   uploadDocument,
//   deleteDocument,
// };








const parserService = require('../services/documents/parser.service');
const chunkingService = require('../services/documents/chunking.service');
const embeddingService = require('../services/documents/embedding.service');
const vectorService = require('../services/vector/vector.service');
const { v4: uuidv4 } = require('uuid');

const Document = require('../models/Document');

async function getAllDocuments(req, res) {
  try {
    const documents = await Document.find(
      {},
      {
        name: 1,
        pageCount: 1,
        chunkCount: 1,
        uploadedAt: 1,
      }
    );

    res.json({
      success: true,

      documents: documents.map(doc => ({
        _id: doc._id,
        name: doc.name,
        pageCount: doc.pageCount,
        chunkCount: doc.chunkCount,
        uploadedAt: doc.uploadedAt,
      })),
    });
  } catch (error) {
    console.error('Fetch error:', error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    const {
      originalname,
      buffer,
      mimetype,
      size,
    } = req.file;

    // ---------------------------------------
    // 1. Extract text
    // ---------------------------------------

    const {
      text,
      pageCount,
      metadata,
    } = await parserService.extractTextFromPDF(buffer);

    // ---------------------------------------
    // 2. Split text into chunks
    // ---------------------------------------

    const chunks =
      chunkingService.chunkText(text, 500, 50);

    // ---------------------------------------
    // 3. Create MongoDB document
    // ---------------------------------------

    const doc = new Document({
      name: originalname,
      mimeType: mimetype,
      fileSize: size,
      pageCount,
      totalCharacters: text.length,
      chunkCount: chunks.length,
      metadata,
    });

    const savedDoc = await doc.save();

    // ---------------------------------------
    // 4. Generate embeddings
    // ---------------------------------------

    const chunksWithEmbeddings =
      await Promise.all(
        chunks.map(async (chunk) => {
          const embedding =
            await embeddingService.generateEmbedding(
              chunk.text
            );

          return {
            // id: `${savedDoc._id}-${chunk.index}`,
            id: uuidv4(),

            documentId: savedDoc._id,

            documentName: originalname,

            ...chunk,

            tokenCount:
              chunkingService.estimateTokenCount(
                chunk.text
              ),

            embedding,
          };
        })
      );

    // ---------------------------------------
    // 5. Store vectors in Qdrant
    // ---------------------------------------

    await vectorService.upsertChunks(
      chunksWithEmbeddings
    );

    // ---------------------------------------
    // 6. Return response
    // ---------------------------------------

    res.json({
      success: true,

      documentId: savedDoc._id,

      document: {
        name: savedDoc.name,

        pageCount: savedDoc.pageCount,

        chunks: {
          total: chunks.length,

          message:
            'Document processed and vectors stored in Qdrant',
        },
      },
    });
  } catch (error) {
    console.error('Upload error:', error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    // Delete vectors from Qdrant first
    await vectorService.deleteDocumentVectors(id);

    // Delete document metadata from MongoDB
    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Document deleted',
    });
  } catch (error) {
    console.error('Delete error:', error);

    res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  getAllDocuments,
  uploadDocument,
  deleteDocument,
};