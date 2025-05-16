const ChatSession = require('../models/chatSession');
const ChatMessage = require('../models/chatMessage');
const { findMostSimilarQuestion, qaDataset } = require('../utils/similarity');

const createPrompt = async (userMessage, sessionId) => {
  const chatHistory = await ChatMessage.findAll({
    where: { session_id: sessionId },
    order: [['timestamp', 'ASC']],
    limit: 10,
  });

  const qaContext = qaDataset
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n');

  const normalizedUserMessage = userMessage.toLowerCase();
  const bestMatch = findMostSimilarQuestion(normalizedUserMessage);

  return `
You are an admin assistant for Bank Satoshi, here to help customers with their banking queries. Use the following Q&A dataset as your knowledge base to answer questions accurately. If the user's question is similar to one in the dataset, provide the corresponding answer exactly as it appears in the dataset, without summarizing, modifying, or omitting any part of it. If the question is not covered or not similar enough, provide a general helpful response related to Bank Satoshi services, but do not make up specific details not present in the dataset.

### Q&A Dataset:
${qaContext}

### Chat History:
${chatHistory.map((msg) => `${msg.sender}: ${msg.message}`).join('\n')}

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

const saveMessage = async (sessionId, sender, message) => {
  await ChatMessage.create({
    session_id: sessionId,
    sender,
    message,
  });
};

module.exports = { createPrompt, saveMessage };