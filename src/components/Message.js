import React, { useState, useEffect, useRef } from 'react';
import UserProfileModal from './UserProfileModal';

// Deconstruct the new 'avatar' and 'role' props sent from App.js
function Message({ user, texts, isOwnMessage, avatar, role, currentUser, onToggleReaction }) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const [reaction, setReaction] = useState({ count: 0, me: false });
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [pickerLeft, setPickerLeft] = useState(null);
  const [isBubbleHover, setIsBubbleHover] = useState(false);
  const containerRef = useRef(null);
  const bubbleRef = useRef(null);
  const reactBtnRef = useRef(null);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setGroupPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Compute picker placement when opened so it stays centered on the react button
  useEffect(() => {
    if (!groupPickerOpen) return;
    const POPUP_W = 220; // must match styles.pickerPopup.width
    const br = bubbleRef.current;
    const btn = reactBtnRef.current;
    if (!br || !btn) {
      setPickerLeft(null);
      return;
    }
    const bubbleRect = br.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // compute left relative to bubble: center the popup on the button center
    const centerX = (btnRect.left + btnRect.right) / 2;
    const desiredAbsolute = centerX - (POPUP_W / 2);

    // clamp to viewport with 8px margin
    const minAbsolute = 8;
    const maxAbsolute = Math.max(8, window.innerWidth - POPUP_W - 8);
    const finalAbsolute = Math.min(maxAbsolute, Math.max(minAbsolute, desiredAbsolute));

    // convert back to left relative to bubble
    const leftPx = finalAbsolute - bubbleRect.left;
    setPickerLeft(`${leftPx}px`);
  }, [groupPickerOpen]);

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

  // --- NEW: DYNAMIC BUBBLE BACKGROUND CONFIGURATION ---
  // Replicates the soft gradient look from the screenshot while keeping text highly readable
  let bubbleBackground = '#FFFFFF';
  
  if (isOwnMessage) {
    // Keep your own message a cohesive brand color or gradient
    bubbleBackground = '#FF7817'; 
  } else {
    // Assign a soft gradient depending on the role of the person sending the message
    if (finalRole === ROLE_DIABEET) {
      bubbleBackground = 'linear-gradient(135deg, #FFEBD7 10%, #FFCC99 100%)'; // Soft cyan to warm orange tint
    } else if (finalRole === ROLE_MEDISCH) {
      bubbleBackground = 'linear-gradient(135deg, #FFEBD7 10%, #D9F6FF 100%)'; // Soft blue gradient
    } else if (finalRole === ROLE_KEN) {
      bubbleBackground = 'linear-gradient(135deg, #FFEBD7 10%, #D3FDD4 100%)'; // Soft green gradient
    } else {
      bubbleBackground = 'linear-gradient(135deg, #FFEBD7 20%, #F1F5F9 100%)'; // Clean fallback gradient
    }
  }

  return (
    <div ref={containerRef} style={{
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
          margin: '0 12px',
          border: `3px solid ${roleColor}`,
          cursor: !isOwnMessage ? 'pointer' : 'default'
        }} 
        alt={`${user}'s avatar`}
        onClick={() => !isOwnMessage && setShowUserProfile(true)}
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
        
        <div ref={bubbleRef} style={{
          ...styles.bubble,
          background: bubbleBackground, // Switched from 'backgroundColor' to 'background' to support gradients
          color: isOwnMessage ? '#FFFFFF' : '#3D2D1E',
          borderTopLeftRadius: isOwnMessage ? '18px' : '4px',
          borderTopRightRadius: isOwnMessage ? '4px' : '18px',
        }}
        onMouseEnter={() => setIsBubbleHover(true)}
        onMouseLeave={() => { setIsBubbleHover(false); setGroupPickerOpen(false); }}>
          {texts.map((item, i) => (
              <div
                key={item.id || i}
                style={{ ...styles.textRow }}
              >
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

          {/* Aggregate item-level reactions into group-level display */}
          {(() => {
            const agg = {};
            texts.forEach(item => {
              if (item.reactions) {
                Object.entries(item.reactions).forEach(([emoji, users]) => {
                  if (!agg[emoji]) agg[emoji] = new Set();
                  users.forEach(u => agg[emoji].add(u));
                });
              }
            });
            const entries = Object.entries(agg).map(([emoji, set]) => ({ emoji, users: Array.from(set) }));
            if (entries.length === 0) return null;
            return (
              <div style={styles.reactionsRow}>
                {entries.map(({emoji, users}) => {
                  const reactedByMe = users.includes(currentUser);
                  return (
                    <button key={emoji} style={{
                      ...styles.reactionPill,
                      background: reactedByMe ? '#FF7817' : '#FFFFFF',
                      color: reactedByMe ? '#FFFFFF' : '#3D2D1E',
                      border: reactedByMe ? 'none' : '1px solid #E6E0D8'
                    }} onClick={() => {
                      // call onToggleReaction on the first text id as representative
                      const repId = texts[0]?.id || texts[texts.length-1]?.id;
                      onToggleReaction && onToggleReaction(repId, emoji);
                    }}>
                      <span style={{ marginRight: 6 }}>{emoji}</span>
                      <span style={{ fontWeight: 700 }}>{users.length}</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* Group-level react icon (opens emoji picker) */}
          {isBubbleHover && (
            <button
              ref={reactBtnRef}
              aria-label="Open reactions"
              style={styles.reactIcon}
              onClick={(e) => { e.stopPropagation(); setGroupPickerOpen(open => !open); }}
            >
              🙂
            </button>
          )}

          {groupPickerOpen && (
            <div
              style={{
                ...styles.pickerPopup,
                ...(pickerLeft !== null ? { left: pickerLeft } : { right: 8 })
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {['👍','❤️','😂','😮','😢','🙏'].map(em => (
                <button key={em} onClick={() => {
                  const repId = texts[0]?.id || texts[texts.length-1]?.id;
                  onToggleReaction && onToggleReaction(repId, em);
                  setGroupPickerOpen(false);
                }} style={styles.pickerEmoji}>{em}</button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.timestamp}>{displayTime}</div>
      </div>

      {showUserProfile && (
        <UserProfileModal 
          user={user}
          avatar={finalAvatar}
          role={finalRole}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  );
}

const styles = {
  messageWrapper: { display: 'flex', marginBottom: '15px', padding: '0 16px', boxSizing: 'border-box', width: '100%' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', marginTop: '2px', objectFit: 'cover', flexShrink: 0, boxSizing: 'border-box', marginLeft: 0, marginRight: 0 },

  contentWrapper: { display: 'flex', flexDirection: 'column', maxWidth: '100%', minWidth: 0 },
  
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  username: { fontSize: '14px', fontWeight: '700', color: '#3D2D1E' },
  
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

  bubble: { position: 'relative', padding: '12px 16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'break-word', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)' },
  textRow: { fontSize: '15px', lineHeight: '1.4', wordBreak: 'break-word', overflowWrap: 'break-word', width: '100%', paddingRight: '64px' },
  timestamp: { fontSize: '11px', color: '#A0AEC0', marginTop: '6px', marginLeft: '4px', marginRight: '4px' },

  thumbnailImage: {
    maxWidth: '100%',
    width: 'auto',
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
  ,
  reactButton: { position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '999px', padding: '6px 8px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', zIndex: 30 },
  reactionsRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  reactionPill: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '999px', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  emojiQuick: { display: 'flex', gap: '6px', marginLeft: '6px' },
  emojiBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }
  ,
  reactIcon: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#FFFFFF',
    border: '1px solid #E6E0D8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    zIndex: 50,
    fontSize: '14px',
    padding: 0
  },
  pickerToggle: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '6px'
  },
  pickerPopup: {
    position: 'absolute',
    top: '-46px',
    background: '#FFFFFF',
    border: '1px solid #E6E0D8',
    borderRadius: '22px',
    padding: '6px 8px',
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    zIndex: 40,
    width: '220px',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  pickerEmoji: { background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', padding: 0, width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
};

export default Message;