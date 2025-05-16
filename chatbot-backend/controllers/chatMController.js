const ragService = require('../services/ragService');
const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');
const { saveMessage } = require('../services/chatService');

// CHAT MESSAGE

// Helper function to summarize the topic (exactly 3 words)
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

// Function to start a new chat session, save the first message, and get a bot response
exports.startChatSession = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required to start a session' });
  }

  try {
    // Summarize the topic from the user's first message
    const topic = summarizeTopic(message);

    // Create a new chat session with the summarized topic
    const session = await ChatSession.create({ topic });

    // Save the user's first message to the chat_messages table
    await saveMessage(session.id, 'user', message);

    // Step 1: Retrieve relevant information using RAG
    const { retrievedAnswer, retrievedQuestion } = await ragService.executeRAG(message);

    // Step 2: Create a prompt for Ollama using the retrieved answer
   const systemPrompt = `You are a helpful assistant. Use the following retrieved information to answer the user's question:\nRetrieved Question: ${retrievedQuestion}\nRetrieved Answer: ${retrievedAnswer}\nProvide a concise and natural response based on this information.`;

    // Step 3: Call Ollama API to generate a refined response
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

    // Step 4: Save the bot's response to the chat_messages table
    await saveMessage(session.id, 'bot', reply);

    // Step 5: Return the session ID, topic, reply, and retrieved answer
    res.json({ sessionId: session.id, topic, reply, retrievedAnswer });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
};

// Function to retrieve all messages for a given session_id
exports.getMessagesBySession = async (req, res) => {
  const { sessionId } = req.params; // Use URL parameter for sessionId

  try {
    // Validate sessionId
    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({ error: 'Valid Session ID is required' });
    }

    // Check if the session exists
    const session = await ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Retrieve all messages for the session, ordered by timestamp
    const messages = await ChatMessage.findAll({
      where: { session_id: sessionId },
      order: [['timestamp', 'ASC']], // Order by timestamp ascending
    });

    res.json({ sessionId, topic: session.topic, messages });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

// Existing RAG function, updated to require sessionId
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

    await saveMessage(session.id, 'bot', reply);
    res.json({ sessionId: session.id, reply, retrievedAnswer });
  } catch (error) {
    console.error('Error in RAG controller:', error);
    res.status(500).json({ error: 'RAG service failed' });
  }
};

// Function to delete all messages for a given session_id
exports.deleteMessagesBySession = async (req, res) => {
  const { sessionId } = req.params; // Use URL parameter for sessionId

  try {
    // Validate sessionId
    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({ error: 'Valid Session ID is required' });
    }

    // Check if the session exists
    const session = await ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete all messages associated with the session_id
    const deletedCount = await ChatMessage.destroy({
      where: { session_id: sessionId },
    });

    res.json({ message: `Successfully deleted ${deletedCount} messages for session ID ${sessionId}` });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
};