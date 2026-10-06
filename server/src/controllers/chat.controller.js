const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ragService = require('../services/ai/rag.service');

/**
 * Create a new conversation
 */
async function createConversation(req, res) {
  try {
    const conversation = await Conversation.create({
      userId: req.user.userId,
      title: 'New Conversation',
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      'Create conversation error:',
      error
    );

    res.status(500).json({
      error: error.message,
    });
  }
}

/**
 * Send a message
 */
async function sendMessage(req, res) {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        error: 'Message is required',
      });
    }

    // --------------------------------
    // 1. Verify conversation
    // --------------------------------

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        userId: req.user.userId,
      });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }

    // --------------------------------
    // 2. Save user message
    // --------------------------------

    await Message.create({
      conversationId,
      role: 'user',
      content: message.trim(),
    });

    // --------------------------------
    // 3. Get conversation history
    // --------------------------------

    const history = await Message.find({
      conversationId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    history.reverse();

    // --------------------------------
    // 4. Run conversational RAG
    // --------------------------------

    const result =
      await ragService.answerQuestion({
        question: message.trim(),
        history,
      });

    // --------------------------------
    // 5. Save assistant message
    // --------------------------------

    await Message.create({
      conversationId,
      role: 'assistant',
      content: result.answer,
      sources: result.sources,
    });

    // --------------------------------
    // 6. Update conversation title
    // --------------------------------

    if (conversation.title === 'New Conversation') {
      conversation.title =
        message.trim().substring(0, 60);

      await conversation.save();
    }

    // --------------------------------
    // 7. Return answer
    // --------------------------------

    res.json({
      success: true,

      conversationId,

      answer: result.answer,

      sources: result.sources,
    });
  } catch (error) {
    console.error(
      'Send message error:',
      error
    );

    res.status(500).json({
      error: error.message,
    });
  }
}

/**
 * Get conversation history
 */
async function getConversation(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation =
      await Conversation.findOne({
        _id: conversationId,
        userId: req.user.userId,
      }).lean();

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }

    const messages =
      await Message.find({
        conversationId,
      })
        .sort({ createdAt: 1 })
        .lean();

    res.json({
      success: true,

      conversation,

      messages,
    });
  } catch (error) {
    console.error(
      'Get conversation error:',
      error
    );

    res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  createConversation,
  sendMessage,
  getConversation,
};