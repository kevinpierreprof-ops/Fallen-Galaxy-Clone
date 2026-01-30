import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ChatPanel() {
  const [message, setMessage] = useState('');
  const sendMessage = useGameStore((state) => state.sendMessage);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <h3>Chat</h3>
      <div className="chat-messages">
        {/* Messages will be displayed here */}
        <div className="chat-message">
          <span className="chat-user">System:</span>
          <span className="chat-text">Welcome to the game!</span>
        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
