const express = require('express');
const router = express.Router();
const chatSController = require('../controllers/chatMController');

router.post('/', chatSController.rag);
router.post('/start', chatSController.startChatSession);
router.get('/messages/:sessionId', chatSController.getMessagesBySession);
router.delete('/delete-messages/:sessionId', chatSController.deleteMessagesBySession);

module.exports = router;