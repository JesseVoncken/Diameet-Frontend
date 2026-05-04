import React, { useState } from 'react';

function Auth({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
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
        // Save the Token and Username to LocalStorage
        localStorage.setItem('diameet_token', data.token);
        localStorage.setItem('diameet_user', data.username);
        onLoginSuccess(data.username);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ textAlign: 'center' }}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && <p style={{ color: '#fa777a', fontSize: '14px' }}>{error}</p>}

        <input
          name="username"
          placeholder="Username"
          style={styles.input}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          style={styles.input}
          onChange={handleChange}
          required
        />

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
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#313338' },
  form: { background: '#2b2d31', padding: '30px', borderRadius: '8px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px', color: 'white' },
  input: { padding: '10px', borderRadius: '4px', border: 'none', background: '#1e1f22', color: 'white' },
  button: { padding: '12px', borderRadius: '4px', border: 'none', background: '#5865f2', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
  toggleText: { fontSize: '12px', color: '#00a8fc', textAlign: 'center', cursor: 'pointer', marginTop: '10px' }
};

export default Auth;