const express = require('express');
const router = express.Router();
const chatMController = require('../controllers/chatSController');

router.post('/', chatMController.chat);
router.delete('/delete-session/:sessionId', chatMController.deleteChatSession);

module.exports = router;