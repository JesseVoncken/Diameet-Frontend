import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';
import Auth from './components/Auth';
import Message from './components/Message';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DateSeparator from './components/DateSeparator';

// Replace with your actual Render URL
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
  const [showPlusMenu, setShowPlusMenu] = useState(false); 
  const [currentChannel, setCurrentChannel] = useState('general');
  const [user, setUser] = useState(localStorage.getItem('diameet_user') || null);
  const [usersList, setUsersList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  // Dedicated phone breakpoint (for iPhone / small devices)
  const [isPhone, setIsPhone] = useState(typeof window !== 'undefined' ? window.innerWidth <= 480 : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const pickerRef = useRef(null); 
  const plusMenuRef = useRef(null); 
  const fileInputRef = useRef(null);

  // --- 2. HELPERS & HANDLERS ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Ensure chat is scrolled to the latest message when messages or channel change
  useEffect(() => {
    // Use a short timeout to allow the DOM to render grouped messages first
    const t = setTimeout(() => {
      if (messagesEndRef.current) {
        try { messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); } catch (e) { /* ignore */ }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [messages, currentChannel]);

  const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

  // Helper fallback generator: Creates the monogram letter-avatar from before
  const getMonogramAvatar = (username) => {
    const nameStr = username ? username.toString() : '??';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=random&color=fff`;
  };

  // document title is set by public/index.html; no dynamic profile-based title

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- NEW ACCOUNT DELETION FUNCTION ---
  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Weet je zeker dat je jouw account definitief wilt verwijderen? Al je gegevens worden permanent gewist."
    );
    if (!confirmation) return;

    const token = localStorage.getItem('diameet_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Account kon niet worden verwijderd.');
      }

      alert('Je account is succesvol verwijderd.');
      handleLogout();
    } catch (err) {
      console.error("Deletion Error:", err);
      alert(`Fout bij verwijderen: ${err.message}`);
    }
  };

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
    const handleResize = () => setIsPhone(window.innerWidth <= 480);
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener('resize', handleResize);
    };
  }, [isResizing]);

  // --- 4. DATA FETCHING & SOCKETS ---
  // --- 4. DATA FETCHING & SOCKETS (RE-ARCHITECTED) ---
  useEffect(() => {
    if (!user) return;
    
    fetch(`${API_BASE_URL}/api/users`)
      .then(res => res.json())
      .then(data => setUsersList(data.filter(u => u.username !== user)))
      .catch(err => console.error("Error fetching users:", err));
  }, [user]);

  // Fetch friends list to filter direct messages
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('diameet_token');
    fetch(`${API_BASE_URL}/api/friends/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setFriendsList(data || []))
      .catch(err => console.error("Error fetching friends list:", err));
  }, [user]);

  // Persistent Socket Event Listeners Hook
  useEffect(() => {
    if (!user) return;

    const onChatMessage = (data) => {
      setMessages((prev) => (prev.some(m => m.id === data.id) ? prev : [...prev, data]));
    };

    const onLoadHistory = (history) => {
      // Explicitly check that history is a valid array before modifying state
      setMessages(Array.isArray(history) ? history : []);
    };

    const onReaction = (data) => {
      // data: { messageId, emoji, user, channel }
      setMessages((prev) => prev.map(m => {
        if (m.id !== data.messageId) return m;
        const reactions = m.reactions ? { ...m.reactions } : {};
        const users = reactions[data.emoji] ? [...reactions[data.emoji]] : [];
        const has = users.includes(data.user);
        if (has) {
          // remove
          const filtered = users.filter(u => u !== data.user);
          if (filtered.length) reactions[data.emoji] = filtered;
          else delete reactions[data.emoji];
        } else {
          users.push(data.user);
          reactions[data.emoji] = users;
        }
        return { ...m, reactions };
      }));
    };

    // Register active real-time listeners immediately
    socket.on('chat-message', onChatMessage);
    socket.on('load-history', onLoadHistory);
    socket.on('reaction', onReaction);
    socket.on('channel-cleared-perm', () => setMessages([]));

    // Tell the backend to join the channel room
    socket.emit('join-channel', currentChannel);

    return () => {
      socket.off('chat-message', onChatMessage);
      socket.off('load-history', onLoadHistory);
      socket.off('reaction', onReaction);
      socket.off('channel-cleared-perm');
    };
  }, [user, currentChannel]); // Fires cleanly whenever you toggle rooms or reload the site

  // Toggle reaction on a message and broadcast via socket
  const toggleReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const reactions = m.reactions ? { ...m.reactions } : {};
      const users = reactions[emoji] ? [...reactions[emoji]] : [];
      const has = users.includes(user);
      let newUsers;
      if (has) newUsers = users.filter(u => u !== user);
      else newUsers = [...users, user];
      if (newUsers.length) reactions[emoji] = newUsers;
      else delete reactions[emoji];
      return { ...m, reactions };
    }));

    socket.emit('reaction', { messageId, emoji, user, channel: currentChannel });
  };

  // --- 5. MESSAGE SENDING ---
  const sendMessage = () => {
    if (!inputText.trim()) return;
    const command = inputText.trim().toLowerCase();
    
    if (command === '/clear') { setMessages([]); setInputText(''); return; }
    if (command === '/clear perm') { socket.emit('clear-channel-perm', currentChannel); setInputText(''); return; }

    // Stripped random placeholder assets out. If no registration avatar string, fall back to monogram.
    const rawAvatar = localStorage.getItem('diameet_avatar');
    const currentAvatar = (rawAvatar && rawAvatar !== 'undefined' && !rawAvatar.includes('pravatar.cc')) 
      ? rawAvatar 
      : getMonogramAvatar(user);

    const currentRole = localStorage.getItem('diameet_role') || '🩸 Diabeet';

    socket.emit('chat-message', { 
      id: generateId(), 
      user, 
      avatar: currentAvatar,
      role: currentRole,
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

    const rawAvatar = localStorage.getItem('diameet_avatar');
    const currentAvatar = (rawAvatar && rawAvatar !== 'undefined' && !rawAvatar.includes('pravatar.cc')) 
      ? rawAvatar 
      : getMonogramAvatar(user);

    const currentRole = localStorage.getItem('diameet_role') || '🩸 Diabeet';

    const reader = new FileReader();
    reader.onload = (ev) => {
      socket.emit('chat-message', { 
        id: generateId(), 
        user, 
        avatar: currentAvatar,
        role: currentRole,
        image: ev.target.result, 
        channel: currentChannel, 
        timestamp: new Date() 
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  // --- 6. DATA GROUPING FOR CLEAN LIST VIEW ---
  const groupedMessages = messages.reduce((acc, current) => {
    const lastGroup = acc[acc.length - 1];
    const currentTs = current.timestamp ? new Date(current.timestamp) : new Date();
    const entry = { 
      id: current.id, 
      text: current.text || null, 
      image: current.image || null, 
      timestamp: currentTs,
      reactions: current.reactions || {} 
    };
    
    // Explicit Fallback Check: If database records lack pfp data, parse the letter monogram avatar
    let msgAvatar = current.avatar;
    if (!msgAvatar || msgAvatar === 'undefined' || msgAvatar.includes('pravatar.cc')) {
      msgAvatar = getMonogramAvatar(current.user);
    }

    if (lastGroup && lastGroup.user === current.user) {
      lastGroup.texts.push(entry);
    } else {
      acc.push({ 
        user: current.user, 
        avatar: msgAvatar,
        role: current.role || '🩸 Diabeet',
        texts: [entry], 
        timestamp: currentTs 
      });
    }
    return acc;
  }, []);

  if (!user) return <Auth onLoginSuccess={(username) => setUser(username)} />;

  return (
    <div style={{
      ...styles.mainWrapper,
      userSelect: isResizing ? 'none' : 'auto', 
      cursor: isResizing ? 'col-resize' : 'default' 
    }}>
      {/* Navbar with injection to support account deletion */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onDeleteAccount={handleDeleteAccount} 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isPhone={isPhone}
      />

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
            // close sidebar on phone after navigation
            if (isPhone) setIsSidebarOpen(false);
          }} 
          allMessages={messages}
          users={usersList.filter(u => friendsList.some(f => f.username === u.username))}
          currentUser={user}
          customWidth={sidebarWidth}
          isOpen={isPhone ? isSidebarOpen : true}
          isPhone={isPhone}
          onClose={() => setIsSidebarOpen(false)}
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

          <div style={{
            ...styles.messageList,
            padding: isPhone ? '12px' : styles.messageList.padding
          }}>
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
                  
                        <Message 
                          user={group.user} 
                          avatar={group.avatar}
                          role={group.role}
                          timestamp={dateObj}
                          texts={group.texts} 
                          isOwnMessage={group.user === user}
                          currentUser={user}
                          onToggleReaction={toggleReaction}
                        />
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputBar}>
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

              <button className="sendButton" style={styles.sendButton} onClick={sendMessage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(40deg) translate(-3px, 3px)' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                <span className="sendText">Stuur</span>
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
  mainWrapper: { display: 'flex', flexDirection: 'column', minHeight: '100dvh', height: '100dvh', width: '100%', overflowX: 'hidden', overflowY: 'hidden', background: '#FFEBD7', fontFamily: 'sans-serif' },
  appContainer: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' },
  chatHeader: { height: '60px', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #AE9881', background: '#FFEBD7' },
  channelTitle: { fontSize: '18px', fontWeight: '800', color: '#3D2D1E' },
  messageList: { flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px', paddingBottom: '96px', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '14px' },
  resizer: { width: '6px', cursor: 'col-resize', height: '100%', zIndex: 10, borderLeft: '1px solid #AE9881', transition: 'background-color 0.2s' },
  inputBar: { padding: '12px 16px', background: '#FFEBD7', borderTop: '1px solid #AE9881', flexShrink: 0, position: 'sticky', bottom: 0, zIndex: 60, boxSizing: 'border-box' },
  emojiPopup: { position: 'absolute', bottom: '80px', right: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, border: '1px solid #AE9881', width: '250px' },
  plusPopup: { position: 'absolute', bottom: '50px', left: '0', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #AE9881', padding: '8px', zIndex: 1001, width: '200px' },
  plusItem: { padding: '10px 12px', fontSize: '14px', color: '#4A5568', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s', '&:hover': { background: '#F8FAFC' } },
  emojiLabel: { fontSize: '11px', color: '#E3D2C0', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  emojiItem: { fontSize: '24px', cursor: 'pointer', textAlign: 'center' },
  inputContainer: { display: 'flex', alignItems: 'center', background: '#FFEBD7', padding: '6px 10px', borderRadius: '15px', border: '1px solid #AE9881' },
  inputField: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', padding: '10px 12px', color: '#4A5568' },
  iconButton: { background: 'transparent', border: 'none', color: '#E3D2C0', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' },
  inputContainer: { display: 'flex', alignItems: 'center', background: '#FFEBD7', padding: '6px 10px', borderRadius: '15px', border: '1px solid #AE9881', width: '100%', boxSizing: 'border-box', minWidth: 0 },
  inputField: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', padding: '10px 12px', color: '#4A5568', minWidth: 0, maxWidth: '100%' },
  iconButton: { background: 'transparent', border: 'none', color: '#E3D2C0', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  sendButton: { display: 'flex', alignItems: 'center', gap: '8px', background: '#FF7817', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginLeft: '6px', flexShrink: 0 }
};

export default App;