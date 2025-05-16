const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ragRoutes = require('../routes/ragRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', ragRoutes);

// Load dataset Q&A
const datasetPath = path.join(__dirname, '../data/banking77_qa_full.json');
const qaDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

// Chat history (stored in memory)
let chatHistory = [];

// Function to create prompt for Ollama
const createPrompt = (userMessage, dataset) => {
  const qaContext = dataset
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n');

  return `
You are an admin assistant for Bank Satoshi, here to help customers with their banking queries. Use the following Q&A dataset as your knowledge base to answer questions accurately. If the question is not covered in the dataset, provide a general helpful response related to Bank Satoshi services, but do not make up specific details not present in the dataset.

### Q&A Dataset:
${qaContext}

### Chat History:
${chatHistory.map((msg) => `${msg.sender}: ${msg.text}`).join('\n')}

### User Question:
${userMessage}

### Instructions:
- Answer as a polite and professional Satoshi Bank admin.
- Keep responses concise and relevant.
- If the question matches a dataset entry, use the exact answer provided.
- If the question is unclear or not in the dataset, respond with a general helpful message (e.g., "I'm sorry, I don't have that information. Can I assist you with something else?").
  `;
};

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Add user message to chat history
  chatHistory.push({ sender: 'User', text: message });

  // Create prompt for Ollama
  const prompt = createPrompt(message, qaDataset);

  try {
    // Call Ollama API
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

    const data = await ollamaResponse.json();
    const reply = data.message.content.trim();

    // Add bot response to chat history
    chatHistory.push({ sender: 'Bot', text: reply });

    // Limit chat history to last 10 messages to avoid excessive memory usage
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});