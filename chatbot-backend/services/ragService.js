const { findMostSimilarQuestion } = require('../utils/similarity');

const executeRAG = async (message) => {
  try {
    const match = findMostSimilarQuestion(message);
    if (!match) {
      // Return a fallback instead of throwing an error
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
    // Log the error but return a fallback
    console.error('Error in RAG retrieval:', error);
    return {
      retrievedAnswer: "I couldn't find specific information in my dataset.",
      retrievedQuestion: "No matching question found.",
      similarity: 0
    };
  }
};

module.exports = { executeRAG };