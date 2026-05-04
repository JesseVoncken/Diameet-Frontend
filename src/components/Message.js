import React, { useState } from 'react';

function Message({ user, texts, isOwnMessage }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  const rawTimestamp = texts[texts.length - 1]?.timestamp;
  const dateObj = new Date(rawTimestamp);
  const finalDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

  const displayTime = finalDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

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

      {!isOwnMessage && (
        <img 
          src={`https://ui-avatars.com/api/?name=${user}&background=random&color=fff`} 
          style={styles.avatar} 
          alt="Avatar"
        />
      )}

      <div style={{
        ...styles.contentWrapper,
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
      }}>
        {!isOwnMessage && <div style={styles.username}>{user}</div>}
        
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
  // ... (keeping your existing styles) ...
  messageWrapper: { display: 'flex', marginBottom: '15px', padding: '0 10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', marginTop: '4px' },
  contentWrapper: { display: 'flex', flexDirection: 'column', maxWidth: '75%' },
  username: { fontSize: '13px', fontWeight: '700', color: '#556987', marginBottom: '4px', marginLeft: '4px' },
  bubble: { padding: '12px 16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
  textRow: { fontSize: '15px', lineHeight: '1.4', wordBreak: 'break-word' },
  timestamp: { fontSize: '11px', color: '#A0AEC0', marginTop: '6px' },

  // --- NEW STYLES FOR ZOOMING ---
  thumbnailImage: {
    maxWidth: '200px', // Keeps it relatively small in chat
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