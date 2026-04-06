import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChatWindow({ chatRoomId, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    // Load chat history
    api.getMessages(chatRoomId).then(({ data }) => setMessages(data));

    // Join socket room
    socket.emit('join:room', chatRoomId);

    // Listen for new messages
    socket.on('chat:message', (msg) => {
      if (msg.chatRoomId === chatRoomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('chat:message');
      socket.emit('leave:room', chatRoomId);
    };
  }, [chatRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('chat:message', {
      chatRoomId,
      senderId: user._id,
      senderName: user.name,
      content: input.trim(),
    });
    setInput('');
  };

  const handleKey = (e) => { if (e.key === 'Enter') sendMessage(); };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg2)', borderTop: '1px solid var(--border)',
      zIndex: 500, display: 'flex', flexDirection: 'column',
      height: '60vh', maxWidth: '480px', margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>Buddy Chat</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Room: {chatRoomId.slice(-8)}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px', marginTop: '40px' }}>
            Say hi to your travel buddy! 👋
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender === user._id || msg.sender?._id === user._id;
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                background: isMe ? 'var(--rose)' : 'var(--bg3)',
                color: 'white', fontSize: '14px', lineHeight: 1.4,
              }}>
                {!isMe && <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px', opacity: 0.7 }}>{msg.senderName}</div>}
                <div>{msg.content}</div>
                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="btn btn-primary"
          style={{ padding: '12px 16px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
