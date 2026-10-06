const express = require('express');
const upload = require('../middleware/upload');
const documentController = require('../controllers/document.controller');
const ragController = require('../controllers/rag.controller');

const router = express.Router();

router.get('/', documentController.getAllDocuments);
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.post('/search', ragController.ragQuery);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;