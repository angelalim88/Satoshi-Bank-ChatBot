const { findMostSimilarQuestion } = require('../utils/similarity');

const executeRAG = async (message) => {
  try {
    const match = findMostSimilarQuestion(message);
    if (!match) {
      return {
        retrievedAnswer: "I couldn't find specific information in my dataset.",
        retrievedQuestion: "No matching question found.",
        similarity: 0
      };
    }
    return {
      retrievedAnswer: match.answer,
      retrievedQuestion: match.question,
      similarity: match.similarity
    };
  } catch (error) {
    console.error('Error in RAG retrieval:', error);
    return {
      retrievedAnswer: "I couldn't find specific information in my dataset.",
      retrievedQuestion: "No matching question found.",
      similarity: 0
    };
  }
};

module.exports = { executeRAG };