const ragService = require('../services/ragService');
const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');
const { saveMessage } = require('../services/chatService');

const summarizeTopic = (message) => {
  const stopWords = [
    'what', 'is', 'are', 'how', 'to', 'a', 'an', 'the', 'in', 'on', 'at', 'for', 'with',
    'available', 'your', 'my', 'our', 'do', 'i', 'can', 'you'
  ];

  const words = message
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !stopWords.includes(word) && word.length > 1);

  const summarized = words.slice(0, 3).join(' ');
  return summarized || 'General Inquiry';
};

exports.startChatSession = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required to start a session' });
  }

  try {
    const topic = summarizeTopic(message);
    const session = await ChatSession.create({ topic });
    await saveMessage(session.id, 'user', message);

    const { retrievedAnswer, retrievedQuestion } = await ragService.executeRAG(message);
    const systemPrompt = `You are a helpful assistant. Use the following retrieved information to answer the user's question:\nRetrieved Question: ${retrievedQuestion}\nRetrieved Answer: ${retrievedAnswer}\nProvide a concise and natural response based on this information.`;

    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Failed to communicate with Ollama');
    }

    const data = await ollamaResponse.json();
    const reply = data.message.content.trim();

    if (retrievedAnswer === "I couldn't find specific information in my dataset.") {
      const rejectionMessage = "I’m sorry, but your question is outside the scope of our services. For more details or support, please reach out to the call center 080808 or visit the Satoshi Bank website.";
      await saveMessage(session.id, 'bot', rejectionMessage);
      return res.json({ sessionId: session.id, topic, reply: rejectionMessage, retrievedAnswer });
    }

    await saveMessage(session.id, 'bot', reply);
    res.json({ sessionId: session.id, topic, reply, retrievedAnswer });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
};

exports.getMessagesBySession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({ error: 'Valid Session ID is required' });
    }

    const session = await ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messages = await ChatMessage.findAll({
      where: { session_id: sessionId },
      order: [['timestamp', 'ASC']],
    });

    res.json({ sessionId, topic: session.topic, messages });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

exports.rag = async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (!sessionId) return res.status(400).json({ error: 'Session ID is required. Please start a new session using /api/rag/start.' });

  try {
    const session = await ChatSession.findByPk(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    await saveMessage(session.id, 'user', message);
    const { retrievedAnswer, retrievedQuestion } = await ragService.executeRAG(message);
    const systemPrompt = `You are a helpful assistant. Use the following retrieved information to answer the user's question:\nRetrieved Question: ${retrievedQuestion}\nRetrieved Answer: ${retrievedAnswer}\nProvide a concise and natural response based on this information.`;

    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Failed to communicate with Ollama');
    }

    const data = await ollamaResponse.json();
    const reply = data.message.content.trim();

    if (retrievedAnswer === "I couldn't find specific information in my dataset.") {
      const rejectionMessage = "I’m sorry, but your question is outside the scope of our services. For more details or support, please reach out to the call center 080808 or visit the Satoshi Bank website.";
      await saveMessage(session.id, 'bot', rejectionMessage);
      return res.json({ sessionId: session.id, reply: rejectionMessage, retrievedAnswer });
    }

    await saveMessage(session.id, 'bot', reply);
    res.json({ sessionId: session.id, reply, retrievedAnswer });
  } catch (error) {
    console.error('Error in RAG controller:', error);
    res.status(500).json({ error: 'RAG service failed' });
  }
};

exports.deleteMessagesBySession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({ error: 'Valid Session ID is required' });
    }

    const session = await ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const deletedCount = await ChatMessage.destroy({
      where: { session_id: sessionId },
    });

    res.json({ message: `Successfully deleted ${deletedCount} messages for session ID ${sessionId}` });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
};