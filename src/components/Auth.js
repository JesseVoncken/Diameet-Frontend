import React, { useState } from 'react';

function Auth({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1); 
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    avatar: 'https://i.pravatar.cc/150', // Default fallback
    role: '',
    interests: []
  });

  const API_BASE_URL = 'https://diameet-backend.onrender.com';

  // Custom localized roles
  const roleOptions = [
    { title: '🩸 Diabeet', desc: 'Ik wil mijn bloedsuikerwaarden bijhouden en patronen ontdekken.' },
    { title: '💙 Verzorger', desc: 'Ik monitor de gegevens van een gezinslid of geliefde.' },
    { title: '🩺 Medisch personeel', desc: 'Ik ben een behandelaar of behandelaar-ondersteuner.' }
  ];

  const interestTags = ['#Type1', '#Type2', '#Pomp', '#Pen', '#CGM', '#FGM', '#Voeding', '#Sport'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Converts uploaded image to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Afbeelding is te groot. Maximaal 5MB toegestaan.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectRole = (roleTitle) => {
    setFormData({ ...formData, role: roleTitle });
  };

  const handleToggleInterest = (tag) => {
    const current = formData.interests;
    if (current.includes(tag)) {
      setFormData({ ...formData, interests: current.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, interests: [...current, tag] });
    }
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    setError('');
    
    if (step === 1 && (!formData.username || !formData.password)) {
      setError('Vul eerst je inloggegevens in.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Er is iets misgegaan');

      if (isRegistering) {
        alert(`Account aangemaakt! Welkom bij DiaMEET, ${formData.username}!`);
        setIsRegistering(false);
        setStep(1); 
      } else {
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
      <div style={styles.formCard}>
        
        {/* LOGIN MODE */}
        {!isRegistering ? (
          <form onSubmit={handleSubmit} style={styles.verticalFlow}>
            <h2 style={styles.heading}>Welkom terug!</h2>
            <p style={styles.subheading}>Fijn om je weer te zien!</p>
            {error && <div style={styles.errorBox}>{error}</div>}
            
            <input name="username" placeholder="Gebruikersnaam" style={styles.input} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Wachtwoord" style={styles.input} onChange={handleChange} required />
            
            <button type="submit" style={styles.primaryButton}>Inloggen</button>
            <p style={styles.toggleText} onClick={() => setIsRegistering(true)}>Nieuw hier? Registreer je account →</p>
          </form>
        ) : (
          
          /* REGISTER STORYTELLING MODE */
          <div style={styles.verticalFlow}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${(step / 4) * 100}%` }}></div>
            </div>

            <h2 style={styles.heading}>Account Aanmaken</h2>
            {error && <div style={styles.errorBox}>{error}</div>}

            {/* STEP 1: CREDENTIALS */}
            {step === 1 && (
              <form onSubmit={handleNextStep} style={styles.verticalFlow}>
                <p style={styles.subheading}>Kies een unieke gebruikersnaam en een sterk wachtwoord.</p>
                <input name="username" value={formData.username} placeholder="Gebruikersnaam" style={styles.input} onChange={handleChange} required />
                <input name="password" value={formData.password} type="password" placeholder="Wachtwoord" style={styles.input} onChange={handleChange} required />
                <button type="submit" style={styles.primaryButton}>Volgende Stap</button>
              </form>
            )}

            {/* STEP 2: AVATAR UPLOAD */}
            {step === 2 && (
              <div style={styles.verticalFlow}>
                <p style={styles.subheading}>Upload een profielfoto om je profiel compleet te maken:</p>
                <div style={styles.uploadArea}>
                  <img src={formData.avatar} alt="Preview" style={styles.avatarPreview} />
                  <label style={styles.uploadLabel}>
                    Kies een afbeelding
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <div style={styles.rowActions}>
                  <button onClick={handlePrevStep} style={styles.secondaryButton}>Terug</button>
                  <button onClick={() => handleNextStep()} style={styles.primaryButton}>Ziet er goed uit</button>
                </div>
              </div>
            )}

            {/* STEP 3: ROLE SELECT */}
            {step === 3 && (
              <div style={styles.verticalFlow}>
                <p style={styles.subheading}>Wat is jouw rol binnen dit platform?</p>
                <div style={styles.verticalFlow}>
                  {roleOptions.map((r) => (
                    <div 
                      key={r.title} 
                      style={{ 
                        ...styles.discordRoleCard, 
                        background: formData.role === r.title ? '#5865f215' : '#1e1f22', 
                        border: formData.role === r.title ? '1px solid #5865f2' : '1px solid transparent' 
                      }}
                      onClick={() => handleSelectRole(r.title)}
                    >
                      <div style={{ fontWeight: 'bold', color: formData.role === r.title ? '#5865f2' : 'white' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: '#b5bac1' }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={styles.rowActions}>
                  <button onClick={handlePrevStep} style={styles.secondaryButton}>Terug</button>
                  <button onClick={() => handleNextStep()} style={styles.primaryButton} disabled={!formData.role}>Volgende</button>
                </div>
              </div>
            )}

            {/* STEP 4: INTEREST TAGS */}
            {step === 4 && (
              <div style={styles.verticalFlow}>
                <p style={styles.subheading}>Selecteer optioneel een aantal onderwerpen die je interesseren:</p>
                <div style={styles.tagWrapContainer}>
                  {interestTags.map((tag) => {
                    const selected = formData.interests.includes(tag);
                    return (
                      <span 
                        key={tag} 
                        style={{ ...styles.badge, background: selected ? '#5865f2' : '#1e1f22', color: selected ? 'white' : '#b5bac1' }}
                        onClick={() => handleToggleInterest(tag)}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
                <div style={styles.rowActions}>
                  <button onClick={handlePrevStep} style={styles.secondaryButton}>Terug</button>
                  <button onClick={handleSubmit} style={styles.successButton}>Account Afronden 🚀</button>
                </div>
              </div>
            )}

            <p style={styles.toggleText} onClick={() => { setIsRegistering(false); setStep(1); }}>Al een account? Annuleer & Log in</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#313338', fontFamily: 'sans-serif', padding: '20px' },
  formCard: { background: '#2b2d31', padding: '30px', borderRadius: '12px', width: '360px', color: 'white', boxShadow: '0 12px 24px rgba(0,0,0,0.3)' },
  verticalFlow: { display: 'flex', flexDirection: 'column', gap: '18px' },
  rowActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  heading: { textAlign: 'center', margin: 0, fontSize: '24px', fontWeight: 'bold' },
  subheading: { textAlign: 'center', margin: 0, fontSize: '14px', color: '#b5bac1', lineHeight: '1.4' },
  input: { padding: '12px', borderRadius: '4px', border: 'none', background: '#1e1f22', color: 'white', fontSize: '15px', outline: 'none' },
  primaryButton: { flex: 1, padding: '12px', borderRadius: '4px', border: 'none', background: '#5865f2', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  secondaryButton: { padding: '12px 20px', borderRadius: '4px', border: 'none', background: '#4e5058', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
  successButton: { flex: 1, padding: '12px', borderRadius: '4px', border: 'none', background: '#23a55a', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  toggleText: { fontSize: '13px', color: '#00a8fc', textAlign: 'center', cursor: 'pointer', margin: '5px 0 0 0' },
  errorBox: { background: '#f23f4222', color: '#fa777a', padding: '10px', borderRadius: '4px', fontSize: '13px', border: '1px solid #f23f43', textAlign: 'center' },
  
  progressTrack: { width: '100%', height: '6px', background: '#1e1f22', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' },
  progressBar: { height: '100%', background: '#5865f2', transition: 'width 0.3s ease' },
  
  // File upload configuration
  uploadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', background: '#1e1f22', borderRadius: '8px', border: '2px dashed #4e5058' },
  avatarPreview: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', background: '#2b2d31' },
  uploadLabel: { padding: '8px 16px', background: '#4e5058', borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' },
  
  discordRoleCard: { padding: '14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', transition: 'all 0.2s' },
  tagWrapContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' },
  badge: { padding: '8px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s' }
};

export default Auth;