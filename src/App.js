import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Auth from './components/Auth';
import Message from './components/Message';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DateSeparator from './components/DateSeparator';


// Replace http://localhost:4000 with your actual Render URL
const socket = io('https://diameet-backend.onrender.com');

const API_BASE_URL = 'https://diameet-backend.onrender.com';

const EMOJI_LIBRARY = [
  { label: 'Recently Used', emojis: ['😊', '😂', '🤣', '❤️', '👍', '🙏', '🔥', '✨'] },
  { label: 'Smileys', emojis: ['🥰', '😎', '🤔', '😅', '🙌', '👀', '💯', '🎉'] }
];

function App() {
  // --- 1. STATE & REFS ---
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false); // State for + menu
  const [currentChannel, setCurrentChannel] = useState('general');
  const [user, setUser] = useState(localStorage.getItem('diameet_user') || null);
  const [usersList, setUsersList] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const messagesEndRef = useRef(null);
  const pickerRef = useRef(null); // Ref for Emoji Picker
  const plusMenuRef = useRef(null); // Ref for Plus Menu
  const fileInputRef = useRef(null);

  // --- 2. HELPERS & HANDLERS ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Helper to ensure both users end up in the same secret room
  const getPrivateRoomId = (userA, userB) => {
    return [userA, userB].sort().join('--'); 
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 3. RESIZING LOGIC ---
  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);
  
  const resize = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 600) setSidebarWidth(newWidth);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  // --- 4. DATA FETCHING & SOCKETS ---
useEffect(() => {
  if (!user) return;
  
  // Use the new Render URL here
  fetch(`${API_BASE_URL}/api/users`)
    .then(res => res.json())
    .then(data => setUsersList(data.filter(u => u.username !== user)))
    .catch(err => console.error("Error fetching users:", err));
}, [user]);

  useEffect(() => {
    if (!user) return;
    socket.emit('join-channel', currentChannel);

    const onChatMessage = (data) => {
      setMessages((prev) => (prev.some(m => m.id === data.id) ? prev : [...prev, data]));
    };

    socket.on('chat-message', onChatMessage);
    socket.on('load-history', (history) => setMessages(history));
    socket.on('channel-cleared-perm', () => setMessages([]));

    return () => {
      socket.off('chat-message', onChatMessage);
      socket.off('load-history');
      socket.off('channel-cleared-perm');
    };
  }, [user, currentChannel]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // --- 5. MESSAGE SENDING ---
  const sendMessage = () => {
    if (!inputText.trim()) return;
    const command = inputText.trim().toLowerCase();
    
    if (command === '/clear') { setMessages([]); setInputText(''); return; }
    if (command === '/clear perm') { socket.emit('clear-channel-perm', currentChannel); setInputText(''); return; }

    socket.emit('chat-message', { 
      id: generateId(), 
      user, 
      text: inputText, 
      channel: currentChannel, 
      timestamp: new Date() 
    });
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2000000) return alert("Afbeelding te groot (max 2MB)");

    const reader = new FileReader();
    reader.onload = (ev) => {
      socket.emit('chat-message', { 
        id: generateId(), 
        user, 
        image: ev.target.result, 
        channel: currentChannel, 
        timestamp: new Date() 
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  // --- 6. RENDER LOGIC ---
  const groupedMessages = messages.reduce((acc, current) => {
    const lastGroup = acc[acc.length - 1];
    const currentTs = current.timestamp ? new Date(current.timestamp) : new Date();
    const entry = { id: current.id, text: current.text || null, image: current.image || null, timestamp: currentTs };
    
    if (lastGroup && lastGroup.user === current.user) lastGroup.texts.push(entry);
    else acc.push({ user: current.user, texts: [entry], timestamp: currentTs });
    return acc;
  }, []);

  if (!user) return <Auth onLoginSuccess={(username) => setUser(username)} />;

  return (
    <div style={{
      ...styles.mainWrapper,
      userSelect: isResizing ? 'none' : 'auto', 
      cursor: isResizing ? 'col-resize' : 'default' 
    }}>
      <Navbar user={user} onLogout={handleLogout} />

      <div style={styles.appContainer}>
        <Sidebar 
          currentChannel={currentChannel} 
          onChannelChange={(target) => {
            const isUser = usersList.some(u => u.username === target);
            if (isUser) {
              setCurrentChannel(getPrivateRoomId(user, target));
            } else {
              setCurrentChannel(target);
            }
          }} 
          allMessages={messages}
          users={usersList}
          currentUser={user}
          customWidth={sidebarWidth} 
        />

        <div style={{...styles.resizer, backgroundColor: isResizing ? '#FF7817' : 'transparent'}} onMouseDown={startResizing} />
        
        <div style={styles.chatArea}>
          <div style={styles.chatHeader}>
            <h3 style={styles.channelTitle}>
              {currentChannel.includes('--') 
                ? `@ ${currentChannel.replace('--', '').replace(user, '')}` 
                : `# ${currentChannel}`}
            </h3>
          </div>

          <div style={styles.messageList}>
            {groupedMessages.map((group, index) => {
              const dateObj = new Date(group.timestamp);
              const today = new Date().toDateString();
              const currentDate = dateObj.toDateString();
              let showSeparator = false;
              let label = currentDate === today ? "VANDAAG" : currentDate;

              if (index === 0) showSeparator = true;
              else if (currentDate !== new Date(groupedMessages[index - 1].timestamp).toDateString()) showSeparator = true;

              return (
                <React.Fragment key={index}>
                  {showSeparator && <DateSeparator label={label} />}
                  <Message user={group.user} texts={group.texts} isOwnMessage={group.user === user} />
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputBar}>
            {/* EMOJI PICKER POPUP */}
            {showEmojiPicker && (
              <div style={styles.emojiPopup} ref={pickerRef}>
                {EMOJI_LIBRARY.map((section) => (
                  <div key={section.label}>
                    <p style={styles.emojiLabel}>{section.label}</p>
                    <div style={styles.emojiGrid}>
                      {section.emojis.map(emoji => (
                        <span key={emoji} style={styles.emojiItem} onClick={() => setInputText(prev => prev + emoji)}>{emoji}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.inputContainer}>
              {/* PLUS MENU WRAPPER */}
              <div style={{ position: 'relative' }} ref={plusMenuRef}>
                <button style={styles.iconButton} onClick={() => setShowPlusMenu(!showPlusMenu)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showPlusMenu ? "#FF7817" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>

                {showPlusMenu && (
                  <div style={styles.plusPopup}>
                    <div style={styles.plusItem} onClick={() => { fileInputRef.current.click(); setShowPlusMenu(false); }}>
                      <span style={{ marginRight: '10px' }}>🖼️</span> Afbeelding uploaden
                    </div>
                    <div style={styles.plusItem} onClick={() => setShowPlusMenu(false)}>
                      <span style={{ marginRight: '10px' }}>📅</span> Event aanmaken
                    </div>
                  </div>
                )}
              </div>

              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
              
              <input 
                style={styles.inputField} 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                placeholder="Schrijf een bericht..." 
              />
              
              <button style={styles.iconButton} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showEmojiPicker ? "#FF7817" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
              </button>

              <button style={styles.sendButton} onClick={sendMessage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(40deg) translate(-3px, 3px)' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Stuur
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 7. STYLES ---
const styles = {
  mainWrapper: { display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overflow: 'hidden', background: '#FDFDFE' },
  appContainer: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' },
  chatHeader: { height: '60px', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #E2E8F0', background: '#FDFDFE' },
  channelTitle: { fontSize: '18px', fontWeight: '800', color: '#1A202C' },
  messageList: { flex: 1, overflowY: 'auto', padding: '20px', minHeight: 0 },
  resizer: { width: '6px', cursor: 'col-resize', height: '100%', zIndex: 10, borderLeft: '1px solid #E2E8F0', transition: 'background-color 0.2s' },
  inputBar: { padding: '15px 20px', background: '#FDFDFE', borderTop: '1px solid #E2E8F0', flexShrink: 0, position: 'relative' },
  emojiPopup: { position: 'absolute', bottom: '80px', right: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, border: '1px solid #E2E8F0', width: '250px' },
  plusPopup: { position: 'absolute', bottom: '50px', left: '0', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', padding: '8px', zIndex: 1001, width: '200px' },
  plusItem: { padding: '10px 12px', fontSize: '14px', color: '#4A5568', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s', '&:hover': { background: '#F8FAFC' } },
  emojiLabel: { fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  emojiItem: { fontSize: '24px', cursor: 'pointer', textAlign: 'center' },
  inputContainer: { display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '6px 10px', borderRadius: '15px', border: '1px solid #E2E8F0' },
  inputField: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', padding: '10px 12px', color: '#4A5568' },
  iconButton: { background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' },
  sendButton: { display: 'flex', alignItems: 'center', gap: '8px', background: '#FF7817', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginLeft: '5px' }
};

export default App;