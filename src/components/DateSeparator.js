import React from 'react';

const DateSeparator = ({ label }) => (
  <div style={styles.separatorWrapper}>
    <div style={styles.separatorLine} />
    <span style={styles.separatorText}>{label}</span>
    <div style={styles.separatorLine} />
  </div>
);

const styles = {
  separatorWrapper: {
    display: 'flex',
    alignItems: 'center',
    margin: '30px 0',
    padding: '0 20px',
    width: '100%',
    boxSizing: 'border-box'
  },
  separatorLine: {
    flex: 1,
    height: '1px',
    background: '#E2E8F0', // The soft blue/grey line from your image
  },
  separatorText: {
    padding: '0 15px',
    color: '#94A3B8', // Muted text color
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    fontFamily: 'sans-serif'
  },
};

export default DateSeparator;