import React, { useState } from 'react';

function Auth({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // --- CONFIGURATION ---
  // Replace this with your actual Render URL if it's different
  const API_BASE_URL = 'https://diameet-backend.onrender.com';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      if (isRegistering) {
        alert('Account created! You can now log in.');
        setIsRegistering(false);
      } else {
        // Save the Token and Username to LocalStorage for persistence
        localStorage.setItem('diameet_token', data.token);
        localStorage.setItem('diameet_user', data.username);
        onLoginSuccess(data.username);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ textAlign: 'center' }}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>USERNAME</label>
          <input
            name="username"
            placeholder="Enter username"
            style={styles.input}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>PASSWORD</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            style={styles.input}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          {isRegistering ? 'Register' : 'Log In'}
        </button>

        <p 
          style={styles.toggleText} 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Already have an account? Log in' : "Need an account? Register"}
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    background: '#313338' 
  },
  form: { 
    background: '#2b2d31', 
    padding: '30px', 
    borderRadius: '8px', 
    width: '320px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    color: 'white',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#b5bac1'
  },
  input: { 
    padding: '10px', 
    borderRadius: '4px', 
    border: 'none', 
    background: '#1e1f22', 
    color: 'white',
    outline: 'none'
  },
  button: { 
    padding: '12px', 
    borderRadius: '4px', 
    border: 'none', 
    background: '#5865f2', 
    color: 'white', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: 'background 0.2s',
    marginTop: '10px'
  },
  toggleText: { 
    fontSize: '13px', 
    color: '#00a8fc', 
    textAlign: 'left', 
    cursor: 'pointer', 
    marginTop: '5px' 
  },
  errorBox: {
    background: '#f23f4222',
    color: '#fa777a',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px',
    border: '1px solid #f23f43'
  }
};

export default Auth;