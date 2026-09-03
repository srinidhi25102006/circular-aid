import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatBox from './ChatBox';
import OrganizationProfileModal from './OrganizationProfileModal';

function HotelDashboard({ userEmail, firebaseUid, onSignOut }) {
  const [donations, setDonations] = useState([]);
  const [nearbyNgos, setNearbyNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'create' | 'history'

  // Food Donation Form State
  const [foodType, setFoodType] = useState('Cooked Meals');
  const [foodDescription, setFoodDescription] = useState('');
  const [quantity, setQuantity] = useState('50 meals');
  const [preparedAt, setPreparedAt] = useState('7:30 PM');
  const [pickupStart, setPickupStart] = useState('8:00 PM');
  const [pickupEnd, setPickupEnd] = useState('9:00 PM');
  const [bestBefore, setBestBefore] = useState('10:00 PM');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selected NGO Profile Modal state
  const [inspectNgoModal, setInspectNgoModal] = useState(null);

  // Active Chat Box State
  const [activeChatDonation, setActiveChatDonation] = useState(null);

  const fetchDonations = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/donations/hotel/${firebaseUid}`);
      const data = await res.json();
      if (Array.isArray(data)) setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyNgos = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/matching/nearby-ngos?hotelUid=${firebaseUid}`);
      const data = await res.json();
      if (Array.isArray(data)) setNearbyNgos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDonations();
    fetchNearbyNgos();
  }, [firebaseUid]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelFirebaseUid: firebaseUid,
          initiatorRole: 'HOTEL',
          foodType,
          foodDescription: foodDescription || foodType,
          quantity,
          preparedAt,
          pickupWindowStart: pickupStart,
          pickupWindowEnd: pickupEnd,
          bestBefore,
          photoUrl,
          targetId: selectedNgo?.user?.id || selectedNgo?.ngoProfile?.id || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to post food donation.');

      setFoodDescription('');
      setQuantity('50 meals');
      setPhotoUrl('');
      setSelectedNgo(null);
      setActiveTab('active');
      fetchDonations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const activeDonations = donations.filter((d) => d.status !== 'completed' && d.status !== 'rejected');
  const historyDonations = donations.filter((d) => d.status === 'completed' || d.status === 'rejected');

  // If viewing active chat coordination
  if (activeChatDonation) {
    return (
      <ChatBox
        donation={activeChatDonation}
        userRole="hotel"
        userEmail={userEmail}
        userUid={firebaseUid}
        onClose={() => {
          setActiveChatDonation(null);
          fetchDonations();
        }}
        onRefresh={fetchDonations}
      />
    );
  }

  return (
    <div className="page fade-in">
      <div className="container-lg">
        {/* Portal Header */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#17352D', margin: 0 }}>
              🏨 Hotel Food Rescue Hub
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
              Post surplus food, coordinate volunteer pickups, and eliminate kitchen waste.
            </p>
          </div>
          <span className="badge badge-warning" style={{ padding: '8px 16px' }}>
            🍱 Food Partner Account
          </span>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'active' ? 'btn-food' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 22px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => setActiveTab('active')}
          >
            🍱 Active Donations ({activeDonations.length})
          </button>
          <button
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 22px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => {
              setActiveTab('create');
              fetchNearbyNgos();
            }}
          >
            ➕ Post New Surplus Food
          </button>
          <button
            className={`btn ${activeTab === 'history' ? 'btn-outline' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 22px', fontSize: 14, fontWeight: 700, marginBottom: 0 }}
            onClick={() => setActiveTab('history')}
          >
            📜 Completed Audit Trail ({historyDonations.length})
          </button>
        </div>

        {/* TAB 1: ACTIVE DONATIONS & CHAT COORDINATION */}
        {activeTab === 'active' && (
          <div className="card card-hotel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 className="title" style={{ fontSize: 20, marginBottom: 2 }}>Active Food Rescue Listings</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  Monitor status timeline, chat with matched NGOs, and confirm handover photo proof.
                </p>
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0 }} onClick={fetchDonations}>
                🔄 Refresh Listings
              </button>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : activeDonations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍱</div>
                <p style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4, fontSize: 16 }}>No active food rescue requests</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Post kitchen surplus food to match automatically with nearby verified NGOs.</p>
                <button className="btn btn-food" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => setActiveTab('create')}>
                  ➕ Post Surplus Food Now
                </button>
              </div>
            ) : (
              <div className="grid-2">
                {activeDonations.map((d) => {
                  const ngoName = d.matchedNgoUser?.ngoProfile?.ngoName || 'Searching Nearby NGOs...';
                  return (
                    <div key={d.id} className="card" style={{ padding: 20, border: '1px solid var(--food-accent-border)', marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <span className="badge badge-warning">{d.timelineStatus || d.status}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                          {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text)' }}>
                        {d.foodDescription || d.foodType}
                      </h3>

                      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                        👥 Quantity: <b>{d.quantity}</b> &bull; Prepared: <b>{d.preparedAt || 'Fresh'}</b>
                      </p>

                      <div style={{ background: 'var(--food-accent-light)', padding: 12, borderRadius: 10, marginBottom: 16 }}>
                        <p style={{ fontSize: 12, color: 'var(--food-accent-dark)', margin: 0, fontWeight: 800 }}>
                          🏢 NGO Partner: {ngoName}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0 0' }}>
                          ⏰ Window: {d.pickupWindowStart} - {d.pickupWindowEnd} &bull; Best before {d.bestBefore || 'Tonight'}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn btn-food"
                        style={{ marginBottom: 0, fontWeight: 800 }}
                        onClick={() => setActiveChatDonation(d)}
                      >
                        💬 Open Coordination Chat & Progress Timeline →
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATE FOOD DONATION WIZARD */}
        {activeTab === 'create' && (
          <div className="card card-hotel">
            <h2 className="title" style={{ fontSize: 22, marginBottom: 4 }}>🍱 Post New Surplus Food Donation</h2>
            <p className="subtitle" style={{ marginBottom: 20 }}>Provide item details and choose a nearby verified NGO for pickup coordination</p>

            <form onSubmit={handleCreateDonation}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Food Items & Description</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 40 Portions Biryani + Dal Makhani + Roti"
                    value={foodDescription}
                    onChange={(e) => setFoodDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity / Servings</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 50 meals"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preparation Timestamp</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 7:30 PM"
                    value={preparedAt}
                    onChange={(e) => setPreparedAt(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pickup Window Start</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="8:00 PM"
                    value={pickupStart}
                    onChange={(e) => setPickupStart(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pickup Window End</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="9:00 PM"
                    value={pickupEnd}
                    onChange={(e) => setPickupEnd(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Best Consumed Before (Expiry)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 10:30 PM"
                    value={bestBefore}
                    onChange={(e) => setBestBefore(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Food Photo Proof (Optional)</label>
                  <label className="upload-box" style={{ padding: 20, background: 'var(--food-accent-light)' }}>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    {photoUrl ? '📸 Food Photo Attached (Tap to Change)' : '📷 Tap to Upload Photo of Prepared Food'}
                  </label>
                  {photoUrl && <img src={photoUrl} alt="Food" className="preview-img" style={{ maxHeight: 160 }} />}
                </div>
              </div>

              {/* SMART NEARBY NGO MATCHING DISPLAY */}
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 12 }}>
                  🗺️ Select Nearby Registered NGO (GPS Distance & Capacity Ranking)
                </span>

                <div className="grid-2">
                  {nearbyNgos.map((item) => {
                    const isSelected = selectedNgo?.user?.id === item.user.id;
                    const p = item.ngoProfile || {};
                    return (
                      <div
                        key={item.user.id}
                        style={{
                          padding: 16,
                          borderRadius: 14,
                          border: isSelected ? '2px solid var(--food-accent-dark)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--food-accent-light)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => setSelectedNgo(item)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{p.ngoName}</span>
                          <span className="badge badge-success" style={{ fontSize: 11 }}>📍 {item.distanceKm} km</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                          👥 Capacity: <b>{item.capacity}</b> &bull; 🟢 Active
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '4px 10px', fontSize: 11, marginBottom: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectNgoModal(item);
                            }}
                          >
                            View Profile →
                          </button>
                          <span style={{ fontSize: 12, color: isSelected ? 'var(--food-accent-dark)' : 'var(--muted)', fontWeight: 800 }}>
                            {isSelected ? '✓ Selected' : 'Tap to select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="btn btn-food"
                disabled={submitting}
                style={{ fontWeight: 800, fontSize: 16 }}
              >
                {submitting ? 'Posting Food Request...' : '🚀 Publish Surplus Food Request'}
              </motion.button>
            </form>
          </div>
        )}

        {/* TAB 3: DONATION HISTORY */}
        {activeTab === 'history' && (
          <div className="card">
            <h2 className="title" style={{ fontSize: 20, marginBottom: 14 }}>📜 Completed Donation Audit Trail</h2>
            {historyDonations.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 700 }}>No completed donation history yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px' }}>Food Description</th>
                      <th style={{ padding: '12px' }}>Quantity</th>
                      <th style={{ padding: '12px' }}>Recipient NGO</th>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyDonations.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontWeight: 800 }}>{d.foodDescription || d.foodType}</td>
                        <td style={{ padding: '12px' }}>{d.quantity}</td>
                        <td style={{ padding: '12px' }}>🏢 {d.matchedNgoUser?.ngoProfile?.ngoName || 'NGO'}</td>
                        <td style={{ padding: '12px', fontSize: 13 }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${d.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                            {d.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* NGO PROFILE INSPECTION MODAL */}
        <OrganizationProfileModal
          isOpen={!!inspectNgoModal}
          onClose={() => setInspectNgoModal(null)}
          orgData={inspectNgoModal?.user || inspectNgoModal}
          orgType="ngo"
        />
      </div>
    </div>
  );
}

export default HotelDashboard;
