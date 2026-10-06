const pdfParse = require('pdf-parse');

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    
    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: {
        producer: data.info?.Producer || 'Unknown',
        creator: data.info?.Creator || 'Unknown',
      },
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

module.exports = {
  extractTextFromPDF,
};