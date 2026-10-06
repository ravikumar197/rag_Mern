/**
 * Split text into chunks with overlap
 * Default: 500 chars per chunk, 50 chars overlap
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  
  if (text.length <= chunkSize) {
    return [{ text, index: 0 }];
  }

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.substring(i, i + chunkSize);
    chunks.push({
      text: chunk.trim(),
      index: chunks.length,
      startPosition: i,
      endPosition: i + chunk.length,
    });

    // Stop if we've reached the end
    if (i + chunkSize >= text.length) break;
  }

  return chunks;
}

/**
 * Count approximate tokens (rough estimate: 1 token ≈ 4 chars)
 */
function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

module.exports = {
  chunkText,
  estimateTokenCount,
};