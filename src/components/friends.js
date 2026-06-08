import React, { useState, useEffect } from 'react';

function Friends({ user }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'friends'

  const API_BASE_URL = 'https://diameet-backend.onrender.com';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('diameet_token');

      // Fetch pending friend requests
      const requestsRes = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch friends list
      const friendsRes = await fetch(`${API_BASE_URL}/api/friends/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!requestsRes.ok || !friendsRes.ok) {
        throw new Error('Fout bij het ophalen van vrienden gegevens.');
      }

      const requestsData = await requestsRes.json();
      const friendsData = await friendsRes.json();

      setPendingRequests(requestsData || []);
      setFriendsList(friendsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (senderId, senderUsername) => {
    try {
      const token = localStorage.getItem('diameet_token');

      const response = await fetch(`${API_BASE_URL}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: senderId
        })
      });

      if (!response.ok) {
        throw new Error('Verzoek kon niet worden geaccepteerd.');
      }

      // Update UI
      setPendingRequests(pendingRequests.filter(req => req.sender._id !== senderId));
      setFriendsList([...friendsList, { username: senderUsername, avatar: '', role: '' }]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      const token = localStorage.getItem('diameet_token');

      const response = await fetch(`${API_BASE_URL}/api/friends/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: senderId
        })
      });

      if (!response.ok) {
        throw new Error('Verzoek kon niet worden afgewezen.');
      }

      setPendingRequests(pendingRequests.filter(req => req.sender._id !== senderId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loadingText}>Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Vrienden</h2>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.tabs}>
          <button
            style={{...styles.tab, background: activeTab === 'requests' ? '#FF7817' : '#F1F5F9', color: activeTab === 'requests' ? 'white' : '#64748B'}}
            onClick={() => setActiveTab('requests')}
          >
            Verzoeken ({pendingRequests.length})
          </button>
          <button
            style={{...styles.tab, background: activeTab === 'friends' ? '#FF7817' : '#F1F5F9', color: activeTab === 'friends' ? 'white' : '#64748B'}}
            onClick={() => setActiveTab('friends')}
          >
            Vrienden ({friendsList.length})
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'requests' && (
            <div>
              {pendingRequests.length === 0 ? (
                <p style={styles.emptyText}>Geen openstaande vriendverzoeken</p>
              ) : (
                <div style={styles.itemList}>
                  {pendingRequests.map((request) => (
                    <div key={request._id} style={styles.requestItem}>
                      <div style={styles.itemInfo}>
                        <div style={styles.itemName}>{request.sender.username}</div>
                        <div style={styles.itemRole}>{request.sender.role}</div>
                      </div>
                      <div style={styles.itemActions}>
                        <button
                          style={styles.acceptBtn}
                          onClick={() => handleAcceptRequest(request.sender._id, request.sender.username)}
                        >
                          Accepteren
                        </button>
                        <button
                          style={styles.rejectBtn}
                          onClick={() => handleRejectRequest(request.sender._id)}
                        >
                          Afwijzen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div>
              {friendsList.length === 0 ? (
                <p style={styles.emptyText}>Je hebt nog geen vrienden. Stuur vriendverzoeken!</p>
              ) : (
                <div style={styles.itemList}>
                  {friendsList.map((friend, index) => (
                    <div key={index} style={styles.friendItem}>
                      <div style={styles.itemInfo}>
                        <div style={styles.itemName}>{friend.username}</div>
                        <div style={styles.itemRole}>{friend.role}</div>
                      </div>
                      <div style={{color: '#22C55E', fontWeight: '700'}}>✓ Vrienden</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button style={styles.refreshBtn} onClick={fetchData}>
          Vernieuwen
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  card: {
    background: '#FDFDFE',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '24px'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#3D2D1E'
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  tab: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  content: {
    minHeight: '200px',
    marginBottom: '24px'
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '14px',
    padding: '40px 20px'
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  requestItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0'
  },
  friendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#F0FDF4',
    borderRadius: '12px',
    border: '1px solid #86EFAC'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#3D2D1E',
    marginBottom: '4px'
  },
  itemRole: {
    fontSize: '12px',
    color: '#94A3B8'
  },
  itemActions: {
    display: 'flex',
    gap: '8px'
  },
  acceptBtn: {
    padding: '8px 12px',
    background: '#22C55E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },
  rejectBtn: {
    padding: '8px 12px',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },
  refreshBtn: {
    width: '100%',
    padding: '12px',
    background: '#FF7817',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  },
  errorBox: {
    background: '#FEF2F2',
    color: '#EF4444',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #FCA5A5',
    marginBottom: '16px'
  },
  loadingText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '14px'
  }
};

export default Friends;
