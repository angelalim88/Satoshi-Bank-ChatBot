import { useState, useEffect } from 'react';
import { ChatbotService } from '../clients/ChatbotService'; // Import ChatbotService

const ChatbotPages = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [fullBotMessage, setFullBotMessage] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!isTyping || !fullBotMessage) return;

    const typingInterval = setInterval(() => {
      if (charIndex < fullBotMessage.length) {
        setCurrentBotMessage((prev) => prev + fullBotMessage[charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'BOT', text: fullBotMessage },
        ]);
        setIsTyping(false);
        setCurrentBotMessage('');
        setFullBotMessage('');
        setCharIndex(0);
        clearInterval(typingInterval);
      }
    }, 35);

    return () => clearInterval(typingInterval);
  }, [isTyping, charIndex, fullBotMessage]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'ME', text: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const reply = await ChatbotService.sendMessage(input); // Use ChatbotService
      setFullBotMessage(reply);
      setIsTyping(true);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      setFullBotMessage('Sorry, something went wrong. Please try again.');
      setIsTyping(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(e);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '95vh',
        background: 'linear-gradient(135deg, #f9a8d4, #c4b5fd, #a5b4fc)',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#333' }}>
          ✨
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
          Ask Kiko
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'ME' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '300px',
                padding: '10px 15px',
                borderRadius: '15px',
                backgroundColor: msg.sender === 'ME' ? '#3b82f6' : '#fff',
                color: msg.sender === 'ME' ? '#fff' : '#333',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: msg.sender === 'ME' ? '#dbeafe' : '#9ca3af',
                  marginBottom: '5px',
                }}
              >
                {msg.sender}
              </span>
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        {isTyping && currentBotMessage && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '300px',
                padding: '10px 15px',
                borderRadius: '15px',
                backgroundColor: '#fff',
                color: '#333',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#9ca3af',
                  marginBottom: '5px',
                }}
              >
                BOT
              </span>
              <span>{currentBotMessage}</span>
            </div>
          </div>
        )}
      </div>

      < div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '15px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginTop: '15px',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about BCA..."
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#333',
            backgroundColor: 'transparent',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: '#3b82f6',
            cursor: 'pointer',
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatbotPages;