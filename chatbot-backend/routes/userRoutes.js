const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const natural = require('natural');

// Load dataset Q&A
const datasetPath = path.join(__dirname, '../data/banking77_qa_full.json');
const qaDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

// Chat history (stored in memory)
let chatHistory = [];

// Setup untuk cosine similarity
const tfidf = new natural.TfIdf();
qaDataset.forEach((item) => tfidf.addDocument(item.question));

// Function to find the most similar question
const findMostSimilarQuestion = (userQuestion) => {
  let maxSimilarity = 0;
  let bestMatch = null;

  qaDataset.forEach((item, index) => {
    const similarity = tfidf.tfidf(userQuestion, index);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = item;
    }
  });

  // Threshold untuk similarity
  return maxSimilarity > 0.3 ? bestMatch : null;
};

// Function to create prompt for Ollama
const createPrompt = (userMessage, dataset) => {
  const qaContext = dataset
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n');

  // Ubah userMessage ke lowercase untuk pencocokan
  const normalizedUserMessage = userMessage.toLowerCase();
  const bestMatch = findMostSimilarQuestion(normalizedUserMessage);

  return `
You are an admin assistant for Bank Satoshi, here to help customers with their banking queries. Use the following Q&A dataset as your knowledge base to answer questions accurately. If the user's question is similar to one in the dataset, provide the corresponding answer exactly as it appears in the dataset, without summarizing, modifying, or omitting any part of it. If the question is not covered or not similar enough, provide a general helpful response related to Bank Satoshi services, but do not make up specific details not present in the dataset.


### Q&A Dataset:
${qaContext}

### Chat History:
${chatHistory.map((msg) => `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}: ${msg.message}`).join('\n')}

### Most Similar Question (if any):
${bestMatch ? `Q: ${bestMatch.question}\nA: ${bestMatch.answer}` : 'None'}

### User Question:
${userMessage}

### Instructions:
- Answer as a polite and professional Satoshi Bank admin.
- If the user's question is similar to one in the dataset (or matches the "Most Similar Question" above), provide the corresponding answer exactly as it appears in the dataset, including all details, without summarizing or omitting any part.
- Keep responses concise and relevant, but do not alter the dataset answers.
- If no match is found or the question is unclear, respond with: "I'm sorry, I don't have that specific information. For more details, you can contact Bank Satoshi directly or visit our official platform."
  `;
};

// Chat endpoint
router.post('/chat', async (req, res) => {
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

    // Limit chat history to last 10 messages
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
});

module.exports = router;