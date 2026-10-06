const express = require('express');

const {
  createConversation,
  sendMessage,
  getConversation,
} = require('../controllers/chat.controller');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/conversations',
  createConversation
);

router.post(
  '/conversations/:conversationId/messages',
  sendMessage
);

router.get(
  '/conversations/:conversationId',
  getConversation
);

module.exports = router;