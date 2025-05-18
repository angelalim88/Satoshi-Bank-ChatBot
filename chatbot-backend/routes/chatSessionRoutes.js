const express = require('express');
const router = express.Router();
const chatMController = require('../controllers/chatSController');

router.get('/', chatMController.getAllChatMessages);
router.delete('/delete-session/:sessionId', chatMController.deleteChatSession);

module.exports = router;