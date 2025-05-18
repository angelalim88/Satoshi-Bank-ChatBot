import React, { useState, useEffect, useRef } from 'react';
import { startChat, sendChat, getAllMessagesBySessionId } from '../clients/ChatbotService';

const ChatbotPage = ({ selectedSessionId, refreshSessions }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedSessionId) {
      const fetchMessages = async () => {
        try {
          const response = await getAllMessagesBySessionId(selectedSessionId);
          setMessages(response.messages);
          setSessionId(selectedSessionId);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
      setSessionId(null);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const typeMessage = (text, callback) => {
    const words = text.split(' ');
    let currentText = '';
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        callback(currentText);
        wordIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', message: input }]);
    setIsLoading(true);

    setInput('');
    try {
      let response;
      if (!sessionId) {
        response = await startChat({ message: input });
        setSessionId(response.sessionId);
      } else {
        response = await sendChat({ message: input, sessionId });
      }

      setIsLoading(false);

      setMessages(prev => [...prev, { sender: 'bot', message: '' }]);

      typeMessage(response.reply, (typedText) => {
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = { sender: 'bot', message: typedText };
          return updatedMessages;
        });
      });

      refreshSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <div className="p-3 text-white" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        HaloSatoshi <i class="bi bi-headset"></i>
      </div>
      <div
        className="flex-grow-1 px-4 py-3 overflow-auto"
        style={{
          background: 'radial-gradient(circle at bottom, rgba(150, 120, 255, 0.4) 0%, rgba(40, 30, 70, 0.8) 50%, rgba(20, 20, 40, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex mb-4 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            {msg.sender === 'bot' && (
              <img
                src="https://i.pravatar.cc/40?img=3"
                alt="bot"
                className="rounded-circle me-2"
                style={{ width: '40px', height: '40px' }}
              />
            )}
            <div
              className={`p-3 rounded-4 ${msg.sender === 'user' ? 'text-white' : 'bg-white text-dark'}`}
              style={{
                maxWidth: '60%',
                borderRadius: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(200, 200, 200, 0.1))'
                  : 'rgba(255, 255, 255, 1)',
                opacity: msg.sender === 'user' ? 0.9 : 1,
              }}
            >
              {msg.sender === 'bot' && <strong className="d-block">HaloSatoshi</strong>}
              <div>{msg.message}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="d-flex justify-content-start mb-4">
            <div className="loader"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-chat" style={{ background: 'transparent', margin: '0 1rem 1rem 1rem' }}>
        <div
          className="d-flex flex-column"
          style={{
            background: 'linear-gradient(135deg, rgba(90, 70, 150, 0.4), rgba(60, 50, 100, 0.6))',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            padding: '10px',
          }}
        >
          <input
            type="text"
            className="form-control text-light border-0"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              background: 'transparent',
              color: '#fff',
              height: '40px',
              marginBottom: '8px',
            }}
          />
          <div className="d-flex justify-content-end">
            <button
              className="btn rounded-circle"
              onClick={handleSend}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(200, 200, 200, 0.7))',
                backdropFilter: 'blur(10px)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i
                className="bi bi-arrow-up"
                style={{
                  color: '#000',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              ></i>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap');
        .loader {
          width: 30px;
          aspect-ratio: 2;
          --_g: no-repeat radial-gradient(circle closest-side, #fff 90%, #0000);
          background: 
            var(--_g) 0%   50%,
            var(--_g) 50%  50%,
            var(--_g) 100% 50%;
          background-size: calc(100%/3) 50%;
          animation: l3 1s infinite linear;
        }
        @keyframes l3 {
          20% {background-position: 0% 0%, 50% 50%, 100% 50%}
          40% {background-position: 0% 100%, 50% 0%, 100% 50%}
          60% {background-position: 0% 50%, 50% 100%, 100% 0%}
          80% {background-position: 0% 50%, 50% 50%, 100% 100%}
        }
        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .form-control:focus {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default ChatbotPage;