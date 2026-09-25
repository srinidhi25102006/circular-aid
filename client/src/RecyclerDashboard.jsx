import { useState, useEffect } from 'react';
import GlobalNavControls from './GlobalNavControls';
import { motion } from 'framer-motion';

function RecyclerDashboard({ userEmail, firebaseUid }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [proofPhoto, setProofPhoto] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/devices/recycler/${firebaseUid}`);
      const data = await res.json();
      if (Array.isArray(data)) setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [firebaseUid]);

  const handleProofPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProofPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleMarkReceived = async (deviceId) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/devices/${deviceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'received',
          proofPhotoUrl: proofPhoto || undefined,
        }),
      });

      if (res.ok) {
        setSelectedDevice(null);
        setProofPhoto('');
        fetchDevices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container-lg">
        {/* Portal Header */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <GlobalNavControls />
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#17352D', margin: 0 }}>
                🏭 Certified Recycling Facility Portal
              </h1>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
              Facility intake queue, incoming e-waste verification, and digital recycling certificate issuance.
            </p>
          </div>
          <span className="badge badge-info" style={{ padding: '8px 16px', background: 'var(--recycler-accent-light)', color: 'var(--recycler-accent-dark)' }}>
            ♻️ Certified Plant Active
          </span>
        </div>

        <div className="card card-recycler">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 className="title" style={{ fontSize: 20, marginBottom: 2 }}>Incoming E-Waste Intake Queue</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Scheduled pickups & drop-offs assigned to your plant</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '8px 16px', fontSize: 13, marginBottom: 0 }}
              onClick={fetchDevices}
            >
              🔄 Refresh Queue
            </motion.button>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : devices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏭</div>
              <p style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4, fontSize: 16 }}>Intake queue is currently empty</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>New e-waste requests submitted by individuals will appear here.</p>
            </div>
          ) : (
            <div className="grid-2">
              {devices.map((d) => (
                <div key={d.id} className="card" style={{ padding: 20, border: '1px solid var(--border)', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{d.deviceType}</span>
                    <span className={`badge ${d.status === 'received' || d.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {d.status ? d.status.toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                    <b>Condition:</b> {d.estimatedCondition} &bull; <b>Handoff:</b> {d.pickupMethod === 'pickup' ? '🚚 Home Pickup' : '📍 Self Drop-off'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                    <b>Est. Recyclable Materials:</b> {d.recyclableMaterialEstimate || 'N/A'}
                  </p>

                  {d.status !== 'received' && d.status !== 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn btn-recycler"
                      style={{ marginBottom: 0, fontWeight: 800 }}
                      onClick={() => setSelectedDevice(d)}
                    >
                      📦 Confirm Receipt & Issue Certificate
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for marking received with proof photo */}
        {selectedDevice && (
          <div className="card card-recycler" style={{ marginTop: 24 }}>
            <h3 className="title" style={{ fontSize: 19, marginBottom: 4 }}>Confirm Receipt: {selectedDevice.deviceType}</h3>
            <p className="subtitle" style={{ marginBottom: 16 }}>Upload optional proof photo to issue official recycling certificate to owner.</p>

            <div className="form-group">
              <label className="form-label">Receipt Proof Photo</label>
              <label className="upload-box" style={{ padding: 20, background: 'var(--recycler-accent-light)', borderColor: 'var(--recycler-accent-border)' }}>
                <input type="file" accept="image/*" onChange={handleProofPhotoUpload} style={{ display: 'none' }} />
                {proofPhoto ? '📸 Photo Uploaded (Tap to Change)' : '📷 Tap to Upload Proof Photo'}
              </label>
              {proofPhoto && <img src={proofPhoto} alt="Proof" className="preview-img" style={{ maxHeight: 160 }} />}
            </div>

            <div className="row">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-recycler"
                disabled={updating}
                onClick={() => handleMarkReceived(selectedDevice.id)}
                style={{ fontWeight: 800 }}
              >
                {updating ? 'Confirming...' : 'Confirm Receipt'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-secondary"
                onClick={() => setSelectedDevice(null)}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecyclerDashboard;
