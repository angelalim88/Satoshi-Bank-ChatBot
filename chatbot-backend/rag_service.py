const { spawn } = require('child_process');
const path = require('path');

const executeRAG = (message) => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, '../rag-env/bin/python');
    const scriptPath = path.join(__dirname, '../rag_service.py');

    const py = spawn(pythonPath, [scriptPath, message]);

    let responseData = '';
    py.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    py.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error('RAG service failed'));
      }
      resolve({ retrievedAnswer: responseData.trim() });
    });
  });
};

module.exports = { executeRAG };