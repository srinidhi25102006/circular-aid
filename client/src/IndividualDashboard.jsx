import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RecycleFlow from './RecycleFlow';

function IndividualDashboard({ userEmail, firebaseUid }) {
  const [inFlow, setInFlow] = useState(false);
  const [stats, setStats] = useState({ count: 0, points: 0, co2: 0 });
  const [recentDevices, setRecentDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserDevicesAndStats = async () => {
    if (!firebaseUid) return;
    try {
      const res = await fetch(`http://localhost:5000/api/devices/user/${firebaseUid}`);
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
      if (Array.isArray(data.devices)) {
        setRecentDevices(data.devices);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDevicesAndStats();
  }, [firebaseUid]);

  const handleFlowComplete = () => {
    setInFlow(false);
    fetchUserDevicesAndStats();
  };

  if (inFlow) {
    return (
      <RecycleFlow
        firebaseUid={firebaseUid}
        userEmail={userEmail}
        onExit={() => setInFlow(false)}
        onComplete={handleFlowComplete}
      />
    );
  }

  return (
    <div className="page fade-in">
      <div className="container-lg">
        {/* Welcome Greeting Banner */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#17352D', letterSpacing: '-0.02em', margin: 0 }}>
              Good day 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0, fontWeight: 500 }}>
              Welcome back to CircularAid Command Center. Let's keep resources circulating.
            </p>
          </div>
          <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: 12 }}>
            🌱 Individual Member • Active
          </span>
        </div>

        {/* Real Dynamic Impact Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div style={{ fontSize: 24, marginBottom: 4 }}>📦</div>
            <div className="stat-value">{stats.count}</div>
            <div className="stat-label">Devices Recycled</div>
          </div>
          <div className="stat-box">
            <div style={{ fontSize: 24, marginBottom: 4 }}>🌱</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.points}</div>
            <div className="stat-label">Green Points Earned</div>
          </div>
          <div className="stat-box">
            <div style={{ fontSize: 24, marginBottom: 4 }}>🌍</div>
            <div className="stat-value" style={{ color: 'var(--info)' }}>{stats.co2} kg</div>
            <div className="stat-label">CO₂ Offset (Est.)</div>
          </div>
        </div>

        {/* Core Primary Action Cards Grid */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* E-Waste Scan CTA */}
          <div className="card" style={{ borderTop: '4px solid var(--ewaste-accent)', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)' }}>
            <span className="badge badge-info" style={{ marginBottom: 12 }}>AI Vision Scanning</span>
            <h2 className="title" style={{ fontSize: 22 }}>♻️ E-Waste Scanner</h2>
            <p className="subtitle" style={{ fontSize: 14, marginBottom: 20 }}>
              Snap a device photo for Gemini AI analysis, lithium hazard check, and automated routing to certified recycling facilities.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-ewaste"
              onClick={() => setInFlow(true)}
              style={{ fontSize: 15, fontWeight: 800 }}
            >
              📷 Start Device Scanning Flow →
            </motion.button>
          </div>

          {/* Food Rescue & NGO Network Info CTA */}
          <div className="card" style={{ borderTop: '4px solid var(--food-accent)', background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)' }}>
            <span className="badge badge-warning" style={{ marginBottom: 12 }}>Surplus Circulation</span>
            <h2 className="title" style={{ fontSize: 22 }}>🍱 Food & NGO Ecosystem</h2>
            <p className="subtitle" style={{ fontSize: 14, marginBottom: 20 }}>
              Discover how hotel surplus food is rescued and distributed through verified non-profit networks.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="badge badge-success" style={{ fontSize: 11 }}>2,450+ kg Food Rescued</span>
              <span className="badge badge-ngo" style={{ fontSize: 11 }}>84+ Verified NGOs</span>
            </div>
          </div>
        </div>

        {/* Recent Recycling Activity Log */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 className="title" style={{ fontSize: 19, margin: 0 }}>📋 Your E-Waste Activity Log</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Track your scanned devices and drop-off receipts.</p>
            </div>
            <span className="badge badge-info">{recentDevices.length} Recycled Items</span>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : recentDevices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📱</div>
              <p style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4, fontSize: 16 }}>No devices scanned yet</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 380, margin: '0 auto 16px' }}>
                Scan your old smartphone, laptop, battery, or electrical appliance to earn 50 Green Points and save CO₂.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary"
                onClick={() => setInFlow(true)}
                style={{ width: 'auto', padding: '10px 24px' }}
              >
                Start Your First Scan 🚀
              </motion.button>
            </div>
          ) : (
            recentDevices.map((d) => (
              <div key={d.id} className="center-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{d.deviceType}</span>
                  <span className={`badge ${d.status === 'received' || d.status === 'completed' ? 'badge-success' : d.status === 'scheduled' ? 'badge-info' : 'badge-warning'}`}>
                    {d.status ? d.status.toUpperCase() : 'PENDING'}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  <b>Condition:</b> {d.estimatedCondition} &bull; <b>Handoff:</b> {d.pickupMethod === 'pickup' ? '🚚 Home Pickup' : '📍 Self Drop-off'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default IndividualDashboard;