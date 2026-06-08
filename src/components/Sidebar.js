import React from 'react';

function Sidebar({ currentChannel, onChannelChange, allMessages, users, currentUser, customWidth, isOpen = true, onClose, isPhone = false }) {
  // Static list of public channels
  const channels = [
    { id: 'general', name: 'Algemeen' },
    { id: 'sport', name: 'Sport & Beweging' },
    { id: 'voeding', name: 'Voeding & Tips' }
  ];

  // Helper to generate the same shared ID for private chats
  const getPrivateRoomId = (userA, userB) => {
    return [userA, userB].sort().join('--');
  };

  // Helper function to find the latest message for any given target (channel or user)
  const getLastMessage = (targetId, isPrivate = false) => {
    // Determine the correct room ID to filter by
    const roomId = isPrivate ? getPrivateRoomId(currentUser, targetId) : targetId;
    
    const channelMessages = allMessages.filter(m => m.channel === roomId);
    if (channelMessages.length === 0) return "Start een gesprek...";
    
    const lastMsg = channelMessages[channelMessages.length - 1];
    const prefix = lastMsg.user === currentUser ? "Jij: " : `${lastMsg.user}: `;
    
    if (lastMsg.image && !lastMsg.text) return `${prefix}📷 Afbeelding`;
    return `${prefix}${lastMsg.text}`;
  };

  // Always render the sidebar so we can animate open/close on phones.
  const containerBase = isPhone ? { ...styles.sidebar, ...styles.mobileOverlay, width: `${Math.min(customWidth, 320)}px` } : { ...styles.sidebar, width: `${customWidth}px` };

  const containerStyle = {
    ...containerBase,
    transition: 'transform 260ms ease, opacity 180ms ease',
    transform: isPhone ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
    opacity: isPhone ? (isOpen ? 1 : 0) : 1
  };

  return (
    <>
      {isPhone && isOpen && <div style={{ ...styles.backdrop, backgroundColor: 'transparent' }} onClick={onClose} />}
      <div style={containerStyle}>
      {/* Sidebar Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Berichten</h2>
        <button style={styles.addBtn}>+</button>
      </div>

      {/* KANALEN SECTION */}
      <div style={styles.section}>
        <h4 style={styles.sectionLabel}>KANALEN</h4>
        {channels.map(ch => {
          const isActive = currentChannel === ch.id;
          return (
            <div 
              key={ch.id} 
              onClick={() => onChannelChange(ch.id)}
              style={{
                ...styles.item,
                backgroundColor: isActive ? '#FFEBD7' : 'transparent',
                borderLeft: isActive ? '4px solid #FF7817' : '4px solid transparent'
              }}
            >
              <div style={styles.hashIcon}>#</div>
              <div style={styles.itemInfo}>
                <div style={styles.itemName}>{ch.name}</div>
                <div style={styles.itemDesc}>{getLastMessage(ch.id)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DIRECTE BERICHTEN SECTION */}
      <div style={styles.section}>
        <h4 style={styles.sectionLabel}>DIRECTE BERICHTEN</h4>
        {users && users.map(u => {
          // Check if the current room is the private room with this specific user
          const privateRoomId = getPrivateRoomId(currentUser, u.username);
          const isActive = currentChannel === privateRoomId;

          // Determine avatar source (use uploaded avatar when available)
          const avatarSrc = u.avatar && u.avatar !== 'undefined' ? u.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=random&color=FFEBD7`;

          // Map exact role titles from Auth.js to colors
          const ROLE_DIABEET = '🩸 Ik ben iemand met diabetes';
          const ROLE_KEN = '💙 Ik ken iemand met diabetes';
          const ROLE_MEDISCH = '🩺 Ik behandel iemand met diabetes';
          const roleVal = u.role || '';
          let borderColor = '#CBD5E1';
          if (roleVal === ROLE_DIABEET) borderColor = '#FF9B39';
          else if (roleVal === ROLE_MEDISCH) borderColor = '#3B82F6';
          else if (roleVal === ROLE_KEN) borderColor = '#22C55E';

          return (
            <div 
              key={u._id || u.username} 
              onClick={() => onChannelChange(u.username)}
              style={{
                ...styles.item,
                backgroundColor: isActive ? '#FFEBD7' : 'transparent',
                borderLeft: isActive ? '4px solid #FF7817' : '4px solid transparent'
              }}
            >
              <img 
                src={avatarSrc} 
                style={{ ...styles.userAvatar, border: `3px solid ${borderColor}` }} 
                alt="Avatar"
              />
              <div style={styles.itemInfo}>
                <div style={styles.itemName}>{u.username}</div>
                <div style={styles.itemDesc}>{getLastMessage(u.username, true)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}

const styles = {
  sidebar: {
    background: '#FFEBD7',
    borderRight: '1px solid #AE9881',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    overflowY: 'auto',
    height: 'auto', // Takes full height of parent appContainer
    flexShrink: 0 
  },
  mobileOverlay: {
    position: 'fixed',
    top: '70px',
    left: 0,
    height: 'calc(100vh - 70px)',
    zIndex: 1500,
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 1400
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    marginBottom: '20px'
  },
  title: { fontSize: '22px', fontWeight: '800', color: '#3D2D1E', margin: 0 },
  addBtn: {
    width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #AE9881',
    background: '#FFEBD7', color: '#3D2D1E', fontSize: '18px', cursor: 'pointer',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  section: { marginBottom: '20px' },
  sectionLabel: { 
    fontSize: '11px', fontWeight: '700', color: '#AE9881', 
    letterSpacing: '1px', padding: '0 25px', marginBottom: '10px' 
  },
  item: {
    display: 'flex', alignItems: 'center', padding: '10px 20px',
    cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
    overflow: 'hidden' 
  },
  hashIcon: {
    width: '36px', height: '36px', borderRadius: '8px', background: '#AE9881',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    marginRight: '12px', color: '#3D2D1E', fontWeight: 'bold', fontSize: '18px',
    flexShrink: 0 
  },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%', marginRight: '12px', 
    objectFit: 'cover', flexShrink: 0, boxSizing: 'border-box'
  },
  itemInfo: { flex: 1, overflow: 'hidden' },
  itemName: { fontSize: '14px', fontWeight: '700', color: '#3D2D1E' },
  itemDesc: { 
    fontSize: '12px', color: '#94A3B8', marginTop: '2px', 
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
  }
};

export default Sidebar;