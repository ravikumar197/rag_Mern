const qdrant = require('../../config/qdrant');

const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION || 'knowledge_base';

const VECTOR_SIZE = 384;

/**
 * Create a payload index if it doesn't already exist.
 */
async function ensurePayloadIndex(fieldName) {
  try {
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: fieldName,
      field_schema: 'keyword',
    });

    console.log(
      `Qdrant payload index "${fieldName}" is ready`
    );
  } catch (error) {
    // Index already exists - that's okay
    if (
      error.message?.toLowerCase().includes('already exists')
    ) {
      console.log(
        `Qdrant payload index "${fieldName}" already exists`
      );

      return;
    }

    throw error;
  }
}

/**
 * Create the Qdrant collection if it doesn't already exist.
 */
async function initializeCollection() {
  try {
    const collections = await qdrant.getCollections();

    const exists = collections.collections.some(
      collection => collection.name === COLLECTION_NAME
    );

    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
      });

      console.log(
        `Qdrant collection "${COLLECTION_NAME}" created`
      );
    } else {
      console.log(
        `Qdrant collection "${COLLECTION_NAME}" already exists`
      );
    }

    // Required because we filter by documentId
    await ensurePayloadIndex('documentId');

  } catch (error) {
    console.error(
      'Qdrant collection initialization failed:',
      error.message
    );

    throw error;
  }
}

/**
 * Store document chunks and their embeddings in Qdrant.
 */
async function upsertChunks(chunks) {
  if (!chunks.length) {
    return;
  }

  const points = chunks.map(chunk => ({
    id: chunk.id,

    vector: chunk.embedding,

    payload: {
      documentId: String(chunk.documentId),

      documentName: chunk.documentName,

      chunkIndex: chunk.index,

      text: chunk.text,

      startPosition: chunk.startPosition,

      endPosition: chunk.endPosition,

      tokenCount: chunk.tokenCount,
    },
  }));

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });

  console.log(
    `Stored ${points.length} vectors in Qdrant`
  );
}

/**
 * Search for semantically similar chunks.
 */
async function searchVectors(queryEmbedding, limit = 3) {
  const response = await qdrant.query(
    COLLECTION_NAME,
    {
      query: queryEmbedding,

      limit,

      with_payload: true,
    }
  );

  return response.points || [];
}

/**
 * Delete all vectors belonging to a document.
 */
async function deleteDocumentVectors(documentId) {
  await qdrant.delete(
    COLLECTION_NAME,
    {
      wait: true,

      filter: {
        must: [
          {
            key: 'documentId',

            match: {
              value: String(documentId),
            },
          },
        ],
      },
    }
  );

  console.log(
    `Deleted Qdrant vectors for document ${documentId}`
  );
}

module.exports = {
  initializeCollection,
  upsertChunks,
  searchVectors,
  deleteDocumentVectors,
};