require('dotenv').config();
const ragService = require('../services/ai/rag.service');
const { Groq } = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function ragQuery(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await ragService.ragQuery(query, groq, 3);

    res.json({
      success: true,
      query,
      ...result,
    });
  } catch (error) {
    console.error('RAG error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  ragQuery,
};