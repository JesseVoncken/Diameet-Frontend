import React, { useState, useEffect } from 'react';

function ProfileSettings({ onClose, user }) {
  const [formData, setFormData] = useState({
    avatar: localStorage.getItem('diameet_avatar') || '',
    role: localStorage.getItem('diameet_role') || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'https://diameet-backend.onrender.com';

  const roleOptions = [
    { title: '🩸 Ik ben iemand met diabetes', desc: 'Ik wil mijn bloedsuikerwaarden bijhouden en patronen ontdekken.' },
    { title: '💙 Ik ken iemand met diabetes', desc: 'Ik monitor de gegevens van een gezinslid of geliefde.' },
    { title: '🩺 Ik behandel iemand met diabetes', desc: 'Ik ben een behandelaar of behandelaar-ondersteuner.' }
  ];

  // Handle image upload with canvas resizing
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

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

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, avatar: compressedBase64 });
        setSuccess('');
        setError('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };


  const handleSelectRole = (roleTitle) => {
    setFormData({ ...formData, role: roleTitle });
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('diameet_token');

      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          avatar: formData.avatar,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update mislukt.');
      }

      // Update localStorage after successful backend response
      if (formData.avatar) localStorage.setItem('diameet_avatar', formData.avatar);
      if (formData.role) localStorage.setItem('diameet_role', formData.role);
      // Update local avatar/role as before

      setSuccess('Instellingen opgeslagen! ✓');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(`Fout: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Profiel Instellingen</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.content}>
          {/* Avatar Section */}
          {/* Avatar Section */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Profielfoto</label>
            <div style={styles.uploadArea}>
              {formData.avatar && !formData.avatar.includes('pravatar.cc') ? (
                <img src={formData.avatar} alt="Avatar Preview" style={styles.avatarPreview} />
              ) : (
                <div style={{ ...styles.avatarPreview, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', color: '#94A3B8', fontSize: '13px' }}>
                  Geen foto
                </div>
              )}
              <label style={styles.uploadLabel}>
                Foto wijzigen
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Role Section */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Jouw Rol</label>
            <div style={styles.roleContainer}>
              {roleOptions.map((roleOpt) => {
                const isSelected = formData.role === roleOpt.title;
                return (
                  <div
                    key={roleOpt.title}
                    style={{
                      ...styles.roleCard,
                      background: isSelected ? '#FF781708' : '#FFFFFF',
                      borderColor: isSelected ? '#FF7817' : '#E2E8F0',
                      boxShadow: isSelected ? '0 4px 12px rgba(255, 120, 23, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                    onClick={() => handleSelectRole(roleOpt.title)}
                  >
                      <div style={{ fontWeight: '700', color: isSelected ? '#FF7817' : '#3D2D1E', fontSize: '14px' }}>
                      {roleOpt.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                      {roleOpt.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryButton} onClick={onClose}>Annuleren</button>
          <button style={styles.primaryButton} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </button>
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
    zIndex: 9999
  },
  modalContent: {
    background: '#FDFDFE',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    width: 'min(90%, 500px)',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #E2E8F0'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '800',
    color: '#3D2D1E'
  },
  closeBtn: {
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
    padding: '24px',
    flex: 1
  },
  section: {
    marginBottom: '28px'
  },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: '1px',
    marginBottom: '12px',
    display: 'block',
    textTransform: 'uppercase'
  },
  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: '#F8FAFC',
    borderRadius: '12px',
    border: '2px dashed #CBD5E1'
  },
  avatarPreview: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E2E8F0'
  },
  uploadLabel: {
    padding: '8px 16px',
    background: '#E2E8F0',
    color: '#4A5568',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'background 0.2s'
  },
  roleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  roleCard: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #E2E8F0',
    background: '#FDFDFE'
  },
  primaryButton: {
    flex: 1,
    padding: '12px 20px',
    background: '#FF7817',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  secondaryButton: {
    flex: 1,
    padding: '12px 20px',
    background: '#F1F5F9',
    color: '#64748B',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  errorBox: {
    background: '#FEF2F2',
    color: '#EF4444',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #FCA5A5',
    textAlign: 'center',
    margin: '12px 24px 0'
  },
  successBox: {
    background: '#F0FDF4',
    color: '#22C55E',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #86EFAC',
    textAlign: 'center',
    margin: '12px 24px 0'
  }
};

export default ProfileSettings;
