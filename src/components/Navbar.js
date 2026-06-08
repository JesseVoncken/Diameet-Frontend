import React, { useState, useEffect, useRef } from 'react';
import ProfileSettings from './settings';
import Friends from './friends';
import logo from '../assets/logo.svg';

function Navbar({ user, onLogout, onDeleteAccount, onToggleSidebar, isPhone = false }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- PERSISTENT SELECTION CAPTURING ---
  // Grab active roles and uploaded string images directly out of cached local instances
  const cachedRole = localStorage.getItem('diameet_role') || 'Beheerder';
  const cachedAvatar = localStorage.getItem('diameet_avatar');

  // If a custom image was never uploaded, revert cleanly back to the monogram letter URL you had before
  const finalAvatar = (cachedAvatar && cachedAvatar !== 'undefined' && !cachedAvatar.includes('pravatar.cc'))
    ? cachedAvatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user || '??')}&background=random&color=fff`;

  // Static app branding
  const BRAND = 'Diameet';

  return (
    <div style={styles.navContainer}>
      <div style={styles.leftSection}>
        {isPhone && (
          <button style={styles.hamburger} onClick={onToggleSidebar} aria-label="Toggle menu">
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="2" rx="1" fill="currentColor" />
              <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="12" width="20" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        )}

        {/* Branding: use bundled logo */}
        <img src={logo} alt="Brand logo" style={styles.brandImage} />
        {!isPhone && <h2 style={styles.brandName}>{BRAND}</h2>}
      </div>

      <div style={styles.rightSection}>

        {/* Dropdown Wrapper */}
        <div style={styles.dropdownWrapper} ref={dropdownRef}>
          <div 
            style={styles.userProfile}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div style={styles.userInfo}>
              <div style={isPhone ? {...styles.userName, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'} : styles.userName}>{user} &#9662;</div>
              {/* Renders the custom selected registration role instead of hardcoded data */}
              <div style={styles.userRole}>{cachedRole}</div>
            </div>
            <img 
              src={finalAvatar} 
              style={styles.navAvatar} 
              alt="User profile avatar" 
            />
          </div>

          {showDropdown && (
            <div style={styles.dropdownMenu}>
              <div 
                style={styles.dropdownItem}
                onClick={() => {
                  setShowSettings(true);
                  setShowDropdown(false);
                }}
              >
                Profiel instellingen
              </div>
              <div 
                style={styles.dropdownItem}
                onClick={() => {
                  setShowFriends(true);
                  setShowDropdown(false);
                }}
              >
                Vrienden
              </div>
              
              {/* THE NEW ACCOUNT DELETION ITEM (Styled to match your layout perfectly) */}
              <div 
                style={{...styles.dropdownItem, color: '#ed4245', fontWeight: '600'}}
                onClick={() => {
                  setShowDropdown(false);
                  onDeleteAccount(); // Triggers delete function from App.js
                }}
              >
                ⚠️ Account Verwijderen
              </div>

              <div style={styles.divider}></div>
              <div 
                style={{...styles.dropdownItem, color: '#ed4245'}} 
                onClick={onLogout}
              >
                Uitloggen
              </div>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} user={user} />
      )}

      {showFriends && (
        <div style={styles.friendsModalOverlay} onClick={() => setShowFriends(false)}>
          <div style={styles.friendsModalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.friendsCloseBtn} onClick={() => setShowFriends(false)}>×</button>
            <Friends user={user} />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  navContainer: {
    height: '70px',
    background: '#FFEBD7',
    borderBottom: '1px solid #AE9881',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
    zIndex: 100,
    position: 'relative',
    fontFamily: 'sans-serif'
  },
  leftSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  hamburger: {
    background: 'transparent',
    border: 'none',
    color: '#3D2D1E',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center'
  },
  logoBox: {
    background: '#FF7817',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px'
  },
  brandName: { fontSize: '22px', color: '#3D2D1E', margin: 0, letterSpacing: '-0.5px' },
  brandImage: { width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', marginRight: '10px' },
  navLinks: { display: 'flex', gap: '8px', marginLeft: '30px' },
  activeLink: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#F1F5F9', color: '#FF7817', padding: '10px 16px',
    borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
  },
  link: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: '#64748B', padding: '10px 16px',
    borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
  },
  rightSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  notification: { fontSize: '20px', color: '#64748B', position: 'relative', cursor: 'pointer' },
  dot: { 
    position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', 
    background: '#FF7817', borderRadius: '50%', border: '2px solid white' 
  },
  dropdownWrapper: { position: 'relative' },
  userProfile: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    borderLeft: '1px solid #AE9881', 
    paddingLeft: '20px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  userInfo: { textAlign: 'right' },
  userName: { fontSize: '14px', fontWeight: '700', color: '#3D2D1E' },
  userRole: { fontSize: '12px', color: '#AE9881' },
  navAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', background: '#F1F5F9', boxSizing: 'border-box' },

  
  dropdownMenu: {
    position: 'absolute',
    top: '60px',
    right: '0',
    background: '#FFEBD7',
    minWidth: '190px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #AE9881',
    padding: '8px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  dropdownItem: {
    padding: '10px 16px',
    fontSize: '14px',
    color: '#4A5568',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    width: '100%',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'sans-serif',
    '&:hover': { background: '#F8FAFC' }
  },
  divider: {
    height: '1px',
    background: '#AE9881',
    margin: '8px 0'
  },
  friendsModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  friendsModalContent: {
    background: '#FDFDFE',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    width: 'min(90%, 600px)',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  },
  friendsCloseBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#AE9881',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    zIndex: 10000
  }
};

export default Navbar;