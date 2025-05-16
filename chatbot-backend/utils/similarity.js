const natural = require('natural');
const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '../data/banking77_qa_full.json');
const qaDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
console.log(`Loaded dataset with ${qaDataset.length} items`);

const tfidf = new natural.TfIdf();
qaDataset.forEach((item) => tfidf.addDocument(item.question));

const findMostSimilarQuestion = (userQuestion) => {
  let maxSimilarity = 0;
  let bestMatch = null;

  qaDataset.forEach((item, index) => {
    const similarity = tfidf.tfidf(userQuestion, index);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = { ...item, similarity }; // Include similarity in the result
    }
  });

  return maxSimilarity > 0.3 ? bestMatch : null;
};

module.exports = { findMostSimilarQuestion, qaDataset };