import React, { useState, useEffect } from 'react';

function Auth({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1); 
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    avatar: '', // Start empty so fallback can handle it if not uploaded
    role: '',
    interests: []
  });

  const API_BASE_URL = 'https://diameet-backend.onrender.com';

  // Disable page scrolling while this auth component is mounted
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const roleOptions = [
    { title: '🩸 Ik ben iemand met diabetes', desc: 'Ik wil mijn bloedsuikerwaarden bijhouden en patronen ontdekken.' },
    { title: '💙 Ik ken iemand met diabetes', desc: 'Ik monitor de gegevens van een gezinslid of geliefde.' },
    { title: '🩺 Ik behandel iemand met diabetes', desc: 'Ik ben een behandelaar of behandelaar-ondersteuner.' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPDATED IMAGE UPLOAD WITH CANVAS RESIZING AND COMPRESSION ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Define clean, small avatar bounds
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        // Maintain strict image aspect ratio limits
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG format string at 70% quality factor
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        setFormData({ ...formData, avatar: compressedBase64 });
      };
      img.src = event.target.result;
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
        alert(`Account aangemaakt! Welkom bij DiaMEET, ${formData.username}! Je kunt nu inloggen.`);
        setIsRegistering(false);
        setStep(1); 
        setFormData({ username: '', password: '', avatar: '', role: '', interests: [] });
      } else {
        localStorage.setItem('diameet_token', data.token);
        localStorage.setItem('diameet_user', data.username);
        
        if (data.avatar) localStorage.setItem('diameet_avatar', data.avatar);
        if (data.role) localStorage.setItem('diameet_role', data.role);
        
        onLoginSuccess(data.username);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative background SVG placed behind the card */}
      <svg
        viewBox="0 0 1877 838"
        preserveAspectRatio="xMidYMid slice"
        style={{
            position: 'absolute',
            top: '-8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '110vw',
            height: 'auto',
            zIndex: 0,
            pointerEvents: 'none'
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1851 834.633C1851 834.633 1828.39 641.088 1784.92 525.577C1706.57 317.367 1404.36 581.534 1233.5 439.133C1125.38 349.026 1223.5 141.133 1074 53.1334C898.379 -50.2425 896.896 173.884 701 117.633C401.5 31.6333 467.085 216.517 401.5 406.133C335.915 595.75 341.094 627.987 232 707.633C136.559 777.312 85 821.133 -60.5 785.133" stroke="#FF9B39" strokeWidth="51" fill="none"/>
      </svg>

      <div style={styles.formCard}>
        
        {!isRegistering ? (
          <form onSubmit={handleSubmit} style={styles.verticalFlow}>
            <h2 style={styles.heading}>Welkom terug!</h2>
            <p style={styles.subheading}>Fijn om je weer te zien!</p>
            {error && <div style={styles.errorBox}>{error}</div>}
            
            <input name="username" placeholder="Gebruikersnaam" style={styles.input} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Wachtwoord" style={styles.input} onChange={handleChange} required />
            
            <button type="submit" style={styles.primaryButton}>Inloggen</button>
            <p style={styles.toggleText} onClick={() => { setIsRegistering(true); setError(''); }}>Nieuw hier? Registreer je account →</p>
          </form>
        ) : (
          <div style={styles.verticalFlow}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${(step / 3) * 100}%` }}></div>
            </div>

            <h2 style={styles.heading}>Account Aanmaken</h2>
            {error && <div style={styles.errorBox}>{error}</div>}

            {step === 1 && (
              <form onSubmit={handleNextStep} style={styles.verticalFlow}>
                <p style={styles.subheading}>Kies een unieke gebruikersnaam en een sterk wachtwoord.</p>
                <input name="username" value={formData.username} placeholder="Gebruikersnaam" style={styles.input} onChange={handleChange} required />
                <input name="password" value={formData.password} type="password" placeholder="Wachtwoord" style={styles.input} onChange={handleChange} required />
                <button type="submit" style={styles.primaryButton}>Volgende Stap</button>
              </form>
            )}

            {step === 2 && (
              <div style={styles.verticalFlow}>
                <p style={styles.subheading}>Upload een profielfoto om je profiel compleet te maken:</p>
                <div style={styles.uploadArea}>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Preview" style={styles.avatarPreview} />
                  ) : (
                    <div style={{ ...styles.avatarPreview, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1f22', color: '#b5bac1', fontSize: '13px' }}>Geen foto</div>
                  )}
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
      {roleOptions.map((r) => {
        const isSelected = formData.role === r.title;
        return (
          <div 
            key={r.title} 
            style={{ 
              ...styles.discordRoleCard, 
              // Active highlight state switches to clean subtle orange
              background: isSelected ? '#FF781708' : '#FFFFFF', 
              borderColor: isSelected ? '#FF7817' : '#E2E8F0',
              boxShadow: isSelected ? '0 4px 12px rgba(255, 120, 23, 0.1)' : '0 4px 10px rgba(0, 0, 0, 0.03)',
              transform: isSelected ? 'translateY(-1px)' : 'none'
            }}
            onClick={() => handleSelectRole(r.title)}
          >
            <div style={{ fontWeight: '700', color: isSelected ? '#FF7817' : '#1A202C', fontSize: '15px' }}>
              {r.title}
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
              {r.desc}
            </div>
          </div>
        );
      })}
    </div>
    <div style={styles.rowActions}>
      <button onClick={handlePrevStep} style={styles.secondaryButton}>Terug</button>
      <button onClick={handleSubmit} style={styles.successButton} disabled={!formData.role}>Account Afronden 🚀</button>
    </div>
  </div>
)}


            <p style={styles.toggleText} onClick={() => { setIsRegistering(false); setStep(1); setError(''); }}>Al een account? Annuleer & Log in</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  // THE NEW GRADIENT BACKGROUND: Replicates the exact glow from your landing page mock-up
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative',
    minHeight: '100vh', 
    background: '#FC850F', 
    fontFamily: "var(--font-body, 'Helvetica', sans-serif)", 
    padding: '20px' 
  },
  
  // Clean, modern glass-morphism style card container
  formCard: { 
    background: '#FFEBD7', 
    padding: '28px', 
    borderRadius: '16px', 
    width: 'min(92%, 360px)', 
    color: '#1A202C', 
    boxShadow: '0 10px 30px rgba(255, 120, 23, 0.08), 0 1px 3px rgba(0,0,0,0.02)',
    border: '1px solid #E2E8F0',
    position: 'relative',
    zIndex: 1
  },
  
  verticalFlow: { display: 'flex', flexDirection: 'column', gap: '18px' },
  rowActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  heading: { textAlign: 'center', margin: 0, fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '800', color: '#3D2D1E', letterSpacing: '0.03em', fontFamily: "var(--font-heading, 'Helvetica Compressed', sans-serif)" },
  subheading: { textAlign: 'center', margin: 0, fontSize: 'clamp(12px, 3.5vw, 14px)', color: '#3D2D1E', lineHeight: '1.4' },
  
  // Styled text inputs matching your dashboard theme
  input: { 
    padding: '12px 14px', 
    borderRadius: '8px', 
    border: '1px solid #CBD5E1', 
    background: '#F8FAFC', 
    color: '#1A202C', 
    fontSize: 'clamp(14px, 3.5vw, 15px)', 
    outline: 'none',
    transition: 'border-color 0.2s',
    '&:focus': { borderColor: '#FF7817' }
  },
  
  // Custom Orange Accent Buttons matching your brand guidelines
  primaryButton: { 
    flex: 1, 
    padding: '12px', 
    borderRadius: '8px', 
    border: 'none', 
    background: '#FF7817', 
    color: 'white', 
    cursor: 'pointer', 
    fontWeight: '700', 
    fontSize: 'clamp(14px, 3.5vw, 15px)',
    boxShadow: '0 4px 12px rgba(255, 120, 23, 0.2)'
  },
  secondaryButton: { 
    padding: '12px 20px', 
    borderRadius: '8px', 
    border: '1px solid #CBD5E1', 
    background: '#FFFFFF', 
    color: '#64748B', 
    cursor: 'pointer', 
    fontWeight: '700' 
  },
  successButton: { 
    flex: 1, 
    padding: '12px', 
    borderRadius: '8px', 
    border: 'none', 
    background: '#22C55E', 
    color: 'white', 
    cursor: 'pointer', 
    fontWeight: '700', 
    fontSize: 'clamp(14px, 3.5vw, 15px)' 
  },
  
  toggleText: { fontSize: '13px', color: '#FF7817', textAlign: 'center', cursor: 'pointer', margin: '5px 0 0 0', fontWeight: '600' },
  errorBox: { background: '#FEF2F2', color: '#EF4444', padding: '10px', borderRadius: '6px', fontSize: '13px', border: '1px solid #FCA5A5', textAlign: 'center' },
  
  progressTrack: { width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' },
  progressBar: { height: '100%', background: '#FF7817', transition: 'width 0.3s ease' },
  
  uploadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '2px dashed #CBD5E1' },
  avatarPreview: { width: 'min(22vw, 100px)', height: 'min(22vw, 100px)', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' },
  uploadLabel: { padding: '8px 14px', background: '#E2E8F0', color: '#4A5568', borderRadius: '6px', fontSize: 'clamp(13px, 3vw, 14px)', cursor: 'pointer', fontWeight: '700', transition: 'background 0.2s' },
  
  // Refined Light Role selection cards matching Discord structure but inside a clean workspace palette
  // Refined light-themed role cards matching your new aesthetic perfectly
  discordRoleCard: { 
    padding: '16px', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px', 
    transition: 'all 0.2s ease',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.03)'
  },
  tagWrapContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' },
  badge: { padding: '8px 12px', borderRadius: '20px', fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: '700', cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s', border: '1px solid #E2E8F0' }
};

export default Auth;