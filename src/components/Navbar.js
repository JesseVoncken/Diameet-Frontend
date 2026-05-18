import React, { useState, useEffect, useRef } from 'react';

function Navbar({ user, onLogout, onDeleteAccount }) {
  const [showDropdown, setShowDropdown] = useState(false);
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

  return (
    <div style={styles.navContainer}>
      <div style={styles.leftSection}>
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>&#8605;</span>
        </div>
        <h1 style={styles.brandName}>Dia<span style={{fontWeight: '900'}}>MEET</span></h1>
        
        <nav style={styles.navLinks}>
          <div style={styles.activeLink}>
            <span style={styles.navIcon}>&#128101;</span> Community
          </div>
        </nav>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.notification}>
          &#128276;<span style={styles.dot}></span>
        </div>

        {/* Dropdown Wrapper */}
        <div style={styles.dropdownWrapper} ref={dropdownRef}>
          <div 
            style={styles.userProfile} 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user} &#9662;</div>
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
              <div style={styles.dropdownItem}>Profiel instellingen</div>
              <div style={styles.dropdownItem}>Bestanden</div>
              
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
    </div>
  );
}

const styles = {
  navContainer: {
    height: '70px',
    background: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
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
  brandName: { fontSize: '22px', color: '#1A202C', margin: 0, letterSpacing: '-0.5px' },
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
    borderLeft: '1px solid #E2E8F0', 
    paddingLeft: '20px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  userInfo: { textAlign: 'right' },
  userName: { fontSize: '14px', fontWeight: '700', color: '#1A202C' },
  userRole: { fontSize: '12px', color: '#94A3B8' },
  navAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', background: '#F1F5F9' },
  
  dropdownMenu: {
    position: 'absolute',
    top: '60px',
    right: '0',
    background: 'white',
    minWidth: '190px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #E2E8F0',
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
    background: '#E2E8F0',
    margin: '8px 0'
  }
};

export default Navbar;