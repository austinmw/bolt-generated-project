import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !apiKey.trim()) return;

    setChat([...chat, { role: 'user', content: message }]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [...chat, { role: 'user', content: message }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      const botReply = response.data.choices[0].message.content;
      setChat(prevChat => [...prevChat, { role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error('Error:', error);
      setChat(prevChat => [...prevChat, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>GenAI Chatbot</h1>
      <input
        type="password"
        placeholder="Enter your OpenAI API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <div className="chat-container" ref={chatContainerRef}>
        {chat.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="message assistant">Thinking...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={isLoading || !apiKey.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
