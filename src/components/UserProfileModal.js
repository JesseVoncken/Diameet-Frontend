import React, { useState } from 'react';

function UserProfileModal({ user, avatar, role, onClose }) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'https://diameet-backend.onrender.com';

  const handleSendFriendRequest = async () => {
    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('diameet_token');

      const response = await fetch(`${API_BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientUsername: user
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Vriendverzoek kon niet worden verzonden.');
      }

      setSuccess('Vriendverzoek verzonden! ✓');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(`Fout: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Determine role color based on role title
  let roleColor = '#CBD5E1';
  if (role && role.includes('🩸')) roleColor = '#FF9B39';
  else if (role && role.includes('🩺')) roleColor = '#3B82F6';
  else if (role && role.includes('💙')) roleColor = '#22C55E';

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.content}>
          {/* Avatar Section */}
          <div style={styles.avatarSection}>
            <img 
              src={avatar} 
              alt={`${user}'s avatar`}
              style={{...styles.largeAvatar, border: `4px solid ${roleColor}`}}
            />
          </div>

          {/* User Info Section */}
          <div style={styles.userInfo}>
            <h2 style={styles.username}>{user}</h2>
            <div style={{...styles.roleBadge, background: `${roleColor}20`, borderColor: roleColor}}>
              <span style={{ color: roleColor, fontWeight: '700' }}>{role || 'Geen rol gekozen'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button 
              style={{...styles.primaryButton, opacity: isSending ? 0.7 : 1}}
              onClick={handleSendFriendRequest}
              disabled={isSending}
            >
              {isSending ? 'Verzenden...' : '+ Vriendverzoek Sturen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998
  },
  modalContent: {
    background: '#FFEBD7',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    width: 'min(90%, 400px)',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    width: '100%'
  },
  avatarSection: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '12px'
  },
  largeAvatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  username: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#3D2D1E'
  },
  roleBadge: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '2px solid',
    fontSize: '14px',
    fontWeight: '700'
  },
  actions: {
    width: '100%',
    display: 'flex',
    gap: '12px'
  },
  primaryButton: {
    flex: 1,
    padding: '12px 20px',
    background: '#FF7817',
    color: '#FFEBD7',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  errorBox: {
    background: '#FEF2F2',
    color: '#EF4444',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #FCA5A5',
    textAlign: 'center',
    width: '100%'
  },
  successBox: {
    background: '#F0FDF4',
    color: '#22C55E',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #86EFAC',
    textAlign: 'center',
    width: '100%'
  }
};

export default UserProfileModal;
