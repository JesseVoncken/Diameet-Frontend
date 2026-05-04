import React from 'react';

function Sidebar({ currentChannel, onChannelChange, allMessages, users, currentUser, customWidth }) {
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

  return (
    <div style={{ ...styles.sidebar, width: `${customWidth}px` }}>
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
                backgroundColor: isActive ? '#F1F5F9' : 'transparent',
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

          return (
            <div 
              key={u._id || u.username} 
              onClick={() => onChannelChange(u.username)}
              style={{
                ...styles.item,
                backgroundColor: isActive ? '#F1F5F9' : 'transparent',
                borderLeft: isActive ? '4px solid #FF7817' : '4px solid transparent'
              }}
            >
              <img 
                src={`https://ui-avatars.com/api/?name=${u.username}&background=random&color=fff`} 
                style={styles.userAvatar} 
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
  );
}

const styles = {
  sidebar: {
    background: '#FDFDFE',
    borderRight: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    overflowY: 'auto',
    height: 'auto', // Takes full height of parent appContainer
    flexShrink: 0 
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    marginBottom: '20px'
  },
  title: { fontSize: '22px', fontWeight: '800', color: '#1A202C', margin: 0 },
  addBtn: {
    width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0',
    background: 'white', color: '#1A202C', fontSize: '18px', cursor: 'pointer',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  section: { marginBottom: '20px' },
  sectionLabel: { 
    fontSize: '11px', fontWeight: '700', color: '#94A3B8', 
    letterSpacing: '1px', padding: '0 25px', marginBottom: '10px' 
  },
  item: {
    display: 'flex', alignItems: 'center', padding: '10px 20px',
    cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
    overflow: 'hidden' 
  },
  hashIcon: {
    width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    marginRight: '12px', color: '#64748B', fontWeight: 'bold', fontSize: '18px',
    flexShrink: 0 
  },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%', marginRight: '12px', 
    objectFit: 'cover', flexShrink: 0 
  },
  itemInfo: { flex: 1, overflow: 'hidden' },
  itemName: { fontSize: '14px', fontWeight: '700', color: '#1A202C' },
  itemDesc: { 
    fontSize: '12px', color: '#94A3B8', marginTop: '2px', 
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
  }
};

export default Sidebar;