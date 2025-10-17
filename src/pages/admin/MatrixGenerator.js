import React, { useState } from 'react';
import axios from 'axios';

const MatrixGenerator = () => {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('feeder');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const stageInfo = {
    feeder: { slots: 6, totalPeople: 6, bonus: 1.5, description: 'Creates 6 paid referrals directly under the user' },
    bronze: { slots: 14, totalPeople: 84, bonus: 4.8, description: 'Creates 14 accounts, each with completed feeder matrix (6 people each)' },
    silver: { slots: 14, totalPeople: 1176, bonus: 30, description: 'Creates 14 accounts, each with completed bronze matrix (84 people each)' },
    gold: { slots: 14, totalPeople: 16464, bonus: 150, description: 'Creates 14 accounts, each with completed silver matrix (1,176 people each)' },
    diamond: { slots: 14, totalPeople: 230496, bonus: 750, description: 'Creates 14 accounts, each with completed gold matrix (16,464 people each)' }
  };

  const generateMatrix = async () => {
    if (!email) {
      setResult({ success: false, error: 'Please enter a user email' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/generate-complete-matrix/${email}/${stage}`);
      setResult(response.data);
    } catch (error) {
      setResult({ success: false, error: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  const info = stageInfo[stage];

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '30px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🌳 MLM Matrix Generator</h1>
        <p style={{ opacity: 0.9 }}>Generate complete matrices for any user at any stage</p>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>User Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Matrix Stage to Complete</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px' }}
          >
            <option value="feeder">Feeder (2x2 = 6 people)</option>
            <option value="bronze">Bronze (2x3 = 14 feeder-completed accounts = 84 people)</option>
            <option value="silver">Silver (2x3 = 14 bronze-completed accounts = 1,176 people)</option>
            <option value="gold">Gold (2x3 = 14 silver-completed accounts = 16,464 people)</option>
            <option value="diamond">Diamond (2x3 = 14 gold-completed accounts = 230,496 people)</option>
          </select>
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '10px', fontSize: '14px' }}>
            <strong>{info.description}</strong><br />
            📊 Matrix Slots: {info.slots}<br />
            👥 Total People Generated: {info.totalPeople.toLocaleString()}<br />
            💰 Bonus per slot: ${info.bonus}
          </div>
        </div>

        <button
          onClick={generateMatrix}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Generating...' : 'Generate Matrix'}
        </button>

        {result && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            borderRadius: '8px',
            background: result.success ? '#d4edda' : '#f8d7da',
            border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
            color: result.success ? '#155724' : '#721c24'
          }}>
            {result.success ? (
              <>
                <h3 style={{ marginBottom: '15px' }}>✅ Matrix Generated Successfully!</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '20px 0' }}>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>STAGE COMPLETED</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{stage.toUpperCase()}</div>
                  </div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>ACCOUNTS CREATED</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{result.totalCreated || 0}</div>
                  </div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>TOTAL EARNINGS</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>${result.totalEarnings || 0}</div>
                  </div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>NEW STAGE</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>{result.newStage || stage}</div>
                  </div>
                </div>
                {result.accounts && result.accounts.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Generated Accounts:</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', background: 'white', borderRadius: '8px', padding: '15px' }}>
                      {result.accounts.map((acc, idx) => (
                        <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{acc.name || acc.full_name}</div>
                            <div style={{ fontSize: '14px', color: '#666' }}>{acc.email}</div>
                          </div>
                          <div style={{ background: '#667eea', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                            {acc.stage || 'feeder'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h3>❌ Error</h3>
                <p>{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixGenerator;
