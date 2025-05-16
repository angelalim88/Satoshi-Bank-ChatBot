const ChatSession = require('../models/chatSession');
const { createPrompt, saveMessage } = require('../services/chatService');
// CHAT SESSION
exports.chat = async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Buat sesi baru jika sessionId tidak ada, atau gunakan yang ada
    let session;
    if (sessionId) {
      session = await ChatSession.findByPk(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });
    } else {
      session = await ChatSession.create();
    }

    // Simpan pesan user ke database
    await saveMessage(session.id, 'user', message);

    // Buat prompt untuk Ollama
    const prompt = await createPrompt(message, session.id);

    // Panggil Ollama API
    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: prompt },
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

    // Simpan respon bot ke database
    await saveMessage(session.id, 'bot', reply);

    res.json({ sessionId: session.id, reply });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
};

exports.getAllChatMessages = async (req, res) => {
  try {
    const messages = await ChatSession.findAll({
      order: [['created_at', 'ASC']],
    });

    console.log('Data chat messages yang dikembalikan:', messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChatSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({ error: 'Valid Session ID is required' });
    }

    const session = await ChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Panggil fungsi untuk menghapus semua pesan di chat_messages
    await require('./chatMController').deleteMessagesBySession({ params: { sessionId } }, { json: () => {} });

    // Hapus sesi dari chat_sessions
    await ChatSession.destroy({ where: { id: sessionId } });

    res.json({ message: `Successfully deleted chat session with ID ${sessionId} and its messages` });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
};