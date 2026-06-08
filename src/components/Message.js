import React, { useState } from 'react';

// Deconstruct the new 'avatar' and 'role' props sent from App.js
function Message({ user, texts, isOwnMessage, avatar, role }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  const rawTimestamp = texts[texts.length - 1]?.timestamp;
  const dateObj = new Date(rawTimestamp);
  const finalDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

  const displayTime = finalDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  // Dynamic fallback assets in case older accounts don't have these items set
  const finalAvatar = avatar || 'https://i.pravatar.cc/150';
  const finalRole = role || '';

  // Exact role constants (must match titles in Auth.js)
  const ROLE_DIABEET = '🩸 Ik ben iemand met diabetes';
  const ROLE_KEN = '💙 Ik ken iemand met diabetes';
  const ROLE_MEDISCH = '🩺 Ik behandel iemand met diabetes';

  // Map exact roles to colors
  let roleColor = '#CBD5E1'; // neutral fallback
  if (finalRole === ROLE_DIABEET) roleColor = '#FF9B39';
  else if (finalRole === ROLE_MEDISCH) roleColor = '#3B82F6';
  else if (finalRole === ROLE_KEN) roleColor = '#22C55E';

  return (
    <div style={{
      ...styles.messageWrapper,
      flexDirection: isOwnMessage ? 'row-reverse' : 'row'
    }}>
      {/* Zoom Modal Overlay */}
      {zoomedImage && (
        <div style={styles.modalOverlay} onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} style={styles.modalImage} alt="Zoomed" />
          <div style={styles.closeBtn}>&times;</div>
        </div>
      )}

      {/* Render the dynamically uploaded user avatar profile photo with role-colored stroke */}
      <img 
        src={finalAvatar} 
        style={{
          ...styles.avatar,
          marginRight: isOwnMessage ? '0' : '12px',
          marginLeft: isOwnMessage ? '12px' : '0',
          border: `3px solid ${roleColor}`
        }} 
        alt={`${user}'s avatar`}
      />

      <div style={{
        ...styles.contentWrapper,
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
      }}>
        {/* Header containing name and localized level badge */}
        <div style={{
          ...styles.headerContainer,
          flexDirection: isOwnMessage ? 'row-reverse' : 'row'
        }}>
          <svg
            viewBox="0 0 33 33"
            width="20"
            height="20"
            style={{
              flexShrink: 0,
              marginRight: isOwnMessage ? '0' : '0.12em',
              marginLeft: isOwnMessage ? '0.12em' : '0'
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.7889 2.77503C13.7239 -0.924871 18.9807 -0.924871 19.9156 2.77503V2.77503C20.4768 4.9958 22.9106 6.16784 24.9967 5.22195V5.22195C28.4723 3.64605 31.7499 7.75602 29.4401 10.7938V10.7938C28.0538 12.6172 28.6548 15.2507 30.6951 16.292V16.292C34.0942 18.0268 32.9244 23.1518 29.1092 23.24V23.24C26.8193 23.2929 25.135 25.4049 25.593 27.6492V27.6492C26.356 31.3884 21.6197 33.6692 19.1721 30.7414V30.7414C17.7029 28.984 15.0017 28.984 13.5325 30.7414V30.7414C11.0848 33.6692 6.34859 31.3884 7.11158 27.6492V27.6492C7.56955 25.4049 5.88532 23.2929 3.59537 23.24V23.24C-0.219813 23.1518 -1.38957 18.0268 2.00953 16.292V16.292C4.04974 15.2507 4.65084 12.6172 3.26445 10.7938V10.7938C0.954665 7.75602 4.23225 3.64605 7.70787 5.22195V5.22195C9.79402 6.16784 12.2278 4.9958 12.7889 2.77503V2.77503Z"
              fill={roleColor}
            />
          </svg>
          <div style={styles.username}>{user}</div>
        </div>
        
        <div style={{
          ...styles.bubble,
          backgroundColor: isOwnMessage ? '#FF7817' : '#FFFFFF',
          color: isOwnMessage ? '#FFFFFF' : '#1A202C',
          borderTopLeftRadius: isOwnMessage ? '18px' : '4px',
          borderTopRightRadius: isOwnMessage ? '4px' : '18px',
          border: isOwnMessage ? 'none' : '1px solid #E2E8F0',
        }}>
          {texts.map((item, i) => (
            <div key={item.id || i} style={styles.textRow}>
              {item.text && <div style={{ marginBottom: item.image ? '8px' : '0' }}>{item.text}</div>}
              
              {item.image && (
                <img 
                  src={item.image} 
                  alt="sent" 
                  style={styles.thumbnailImage} 
                  onClick={() => setZoomedImage(item.image)}
                />
              )}
            </div>
          ))}
        </div>

        <div style={styles.timestamp}>{displayTime}</div>
      </div>
    </div>
  );
}

const styles = {
  messageWrapper: { display: 'flex', marginBottom: '15px', padding: '0 10px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', marginTop: '2px', objectFit: 'cover', flexShrink: 0 },
  contentWrapper: { display: 'flex', flexDirection: 'column', maxWidth: '75%' },
  
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  username: { fontSize: '14px', fontWeight: '700', color: '#2D3748' },
  
  // Custom Role badge styling matching Discord's layout template
  badge: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    background: '#edf2f7',
    fontSize: '11px',
    fontWeight: '800',
    color: '#4a5568',
    border: '1px solid #cbd5e0',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    userSelect: 'none'
  },

  bubble: { padding: '12px 16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
  textRow: { fontSize: '15px', lineHeight: '1.4', wordBreak: 'break-word' },
  timestamp: { fontSize: '11px', color: '#A0AEC0', marginTop: '6px', marginLeft: '4px', marginRight: '4px' },

  thumbnailImage: {
    maxWidth: '200px', 
    maxHeight: '200px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'block',
    transition: 'opacity 0.2s',
    border: '1px solid rgba(0,0,0,0.05)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    cursor: 'zoom-out'
  },
  modalImage: {
    maxWidth: '90%',
    maxHeight: '90%',
    borderRadius: '8px',
    boxShadow: '0 5px 30px rgba(0,0,0,0.5)'
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '30px',
    color: 'white',
    fontSize: '40px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Message;