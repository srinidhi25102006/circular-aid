import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBox from './ChatBox';
import OrganizationProfileModal from './OrganizationProfileModal';

function NgoDashboard({ userEmail, firebaseUid, onSignOut }) {
  const [donations, setDonations] = useState([]);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'create' | 'history'

  // NGO Request Form state
  const [reqFoodDescription, setReqFoodDescription] = useState('40 cooked meals');
  const [reqQuantity, setReqQuantity] = useState('40 meals');
  const [preferredTime, setPreferredTime] = useState('6:00 PM - 7:00 PM');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [submittingReq, setSubmittingReq] = useState(false);

  // Rejection Modal state
  const [rejectingDonation, setRejectingDonation] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('No volunteers available');
  const [customReason, setCustomReason] = useState('');

  // Selected Hotel Profile Modal state
  const [inspectHotelModal, setInspectHotelModal] = useState(null);

  // Active Chat Box State
  const [activeChatDonation, setActiveChatDonation] = useState(null);

  const fetchNgoDonations = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/donations/ngo/${firebaseUid}`);
      const data = await res.json();
      if (Array.isArray(data)) setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyHotels = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/matching/nearby-hotels?ngoUid=${firebaseUid}`);
      const data = await res.json();
      if (Array.isArray(data)) setNearbyHotels(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNgoDonations();
    fetchNearbyHotels();
  }, [firebaseUid]);

  const handleAccept = async (donationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/donations/${donationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          userUid: firebaseUid,
          role: 'NGO',
        }),
      });

      if (res.ok) {
        fetchNgoDonations();
        const updated = donations.find((d) => d.id === donationId);
        if (updated) setActiveChatDonation(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteReject = async () => {
    if (!rejectingDonation) return;
    const finalReason = rejectionReason === 'Other' ? customReason : rejectionReason;

    try {
      const res = await fetch(`http://localhost:5000/api/donations/${rejectingDonation.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason: finalReason,
          userUid: firebaseUid,
          role: 'NGO',
        }),
      });

      if (res.ok) {
        setRejectingDonation(null);
        fetchNgoDonations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNgoRequest = async (e) => {
    e.preventDefault();
    setSubmittingReq(true);

    try {
      const res = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoFirebaseUid: firebaseUid,
          initiatorRole: 'NGO',
          foodType: 'Meals Required',
          foodDescription: reqFoodDescription,
          quantity: reqQuantity,
          pickupWindowStart: preferredTime.split('-')[0] || '6:00 PM',
          pickupWindowEnd: preferredTime.split('-')[1] || '7:00 PM',
          targetId: selectedHotel?.user?.id || selectedHotel?.hotelProfile?.id || null,
        }),
      });

      if (res.ok) {
        setReqFoodDescription('40 cooked meals');
        setSelectedHotel(null);
        setActiveTab('incoming');
        fetchNgoDonations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReq(false);
    }
  };

  const incomingRequests = donations.filter((d) => d.status === 'pending' || d.status === 'matched');
  const historyDonations = donations.filter((d) => d.status === 'completed' || d.status === 'rejected');

  const REJECTION_OPTIONS = [
    'Too far',
    'No volunteers available',
    'Cannot accept this quantity',
    'Other',
  ];

  // If active chat open
  if (activeChatDonation) {
    return (
      <ChatBox
        donation={activeChatDonation}
        userRole="ngo"
        userEmail={userEmail}
        userUid={firebaseUid}
        onClose={() => {
          setActiveChatDonation(null);
          fetchNgoDonations();
        }}
        onRefresh={fetchNgoDonations}
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
              🤝 NGO Distribution Hub
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
              Claim food donations, send volunteer pickups, and coordinate handover photo proof.
            </p>
          </div>
          <span className="badge badge-ngo" style={{ padding: '8px 16px' }}>
            🤝 Verified NGO Partner
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'incoming' ? 'btn-ngo' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 22px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => setActiveTab('incoming')}
          >
            🔔 Incoming Food Requests ({incomingRequests.length})
          </button>
          <button
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 22px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => {
              setActiveTab('create');
              fetchNearbyHotels();
            }}
          >
            ➕ Post Meal Need (NGO → Hotel)
          </button>
          <button
            className={`btn ${activeTab === 'history' ? 'btn-outline' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 22px', fontSize: 14, fontWeight: 700, marginBottom: 0 }}
            onClick={() => setActiveTab('history')}
          >
            📜 Food Rescue History ({historyDonations.length})
          </button>
        </div>

        {/* TAB 1: INCOMING & ACTIVE DONATION REQUESTS */}
        {activeTab === 'incoming' && (
          <div className="card card-ngo">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 className="title" style={{ fontSize: 20, marginBottom: 2 }}>Surplus Food Feed</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  Review meal offers from nearby hotels, accept requests, and initiate volunteer pickup chat.
                </p>
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0 }} onClick={fetchNgoDonations}>
                🔄 Refresh Feed
              </button>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : incomingRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍲</div>
                <p style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4, fontSize: 16 }}>No active food requests pending</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>When a hotel posts surplus meals, it will immediately appear in your feed.</p>
              </div>
            ) : (
              <div className="grid-2">
                {incomingRequests.map((d) => {
                  const hotelProfile = d.hotelUser?.hotelProfile || {};
                  const hotelName = hotelProfile.hotelName || 'Partner Hotel';
                  const isPendingUnclaimed = d.status === 'pending';

                  return (
                    <div key={d.id} className="card" style={{ padding: 20, border: '1px solid var(--ngo-accent-border)', marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span className={`badge ${isPendingUnclaimed ? 'badge-warning' : 'badge-success'}`}>
                          {isPendingUnclaimed ? '🔔 New Request' : d.timelineStatus || 'Matched'}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                          {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                        {d.photoUrl ? (
                          <img src={d.photoUrl} alt="Food Photo" style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 68, height: 68, borderRadius: 12, background: 'var(--ngo-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                            🍲
                          </div>
                        )}
                        <div>
                          <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text)' }}>
                            {d.foodDescription || d.foodType}
                          </h3>
                          <p style={{ fontSize: 13, color: 'var(--ngo-accent-dark)', fontWeight: 800, margin: 0 }}>
                            🏨 {hotelName}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                            📍 {hotelProfile.address || 'Location on map'}
                          </p>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, fontSize: 12, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>👥 Quantity: {d.quantity} &bull; Prepared: {d.preparedAt || 'Fresh'}</p>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--muted)' }}>⏰ Window: <b>{d.pickupWindowStart} - {d.pickupWindowEnd}</b> (Best before {d.bestBefore || 'Tonight'})</p>
                      </div>

                      {isPendingUnclaimed ? (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn btn-ngo"
                            style={{ marginBottom: 0, fontWeight: 800 }}
                            onClick={() => handleAccept(d.id)}
                          >
                            ✅ Accept Request
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn btn-danger"
                            style={{ width: 'auto', padding: '0 14px', marginBottom: 0 }}
                            onClick={() => setRejectingDonation(d)}
                          >
                            ✕ Reject
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="btn btn-ngo"
                          style={{ marginBottom: 0, fontWeight: 800 }}
                          onClick={() => setActiveChatDonation(d)}
                        >
                          💬 Open Coordination Chat & Progress Timeline →
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NGO CREATES REQUEST (NGO → HOTEL) */}
        {activeTab === 'create' && (
          <div className="card card-ngo">
            <h2 className="title" style={{ fontSize: 22, marginBottom: 4 }}>📌 Post Meal Requirement (NGO → Hotel)</h2>
            <p className="subtitle" style={{ marginBottom: 20 }}>Request meals needed for community distribution and match nearby registered hotels</p>

            <form onSubmit={handleCreateNgoRequest}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Food Required Description</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Need approx 40 meals for community shelter distribution"
                    value={reqFoodDescription}
                    onChange={(e) => setReqFoodDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Approximate Portion Count</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 40 meals"
                    value={reqQuantity}
                    onChange={(e) => setReqQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Time Window</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 6:00 PM - 7:00 PM"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* SMART NEARBY HOTEL MATCHING DISPLAY */}
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 12 }}>
                  🗺️ Select Nearby Registered Hotel (Smart GPS Distance Ranking)
                </span>

                <div className="grid-2">
                  {nearbyHotels.map((item) => {
                    const isSelected = selectedHotel?.user?.id === item.user.id;
                    const p = item.hotelProfile || {};
                    return (
                      <div
                        key={item.user.id}
                        style={{
                          padding: 16,
                          borderRadius: 14,
                          border: isSelected ? '2px solid var(--ngo-accent-dark)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--ngo-accent-light)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => setSelectedHotel(item)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{p.hotelName}</span>
                          <span className="badge badge-success" style={{ fontSize: 11 }}>📍 {item.distanceKm} km</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                          👥 Daily Capacity: <b>{item.capacity}</b> &bull; 🟢 Active
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '4px 10px', fontSize: 11, marginBottom: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectHotelModal(item);
                            }}
                          >
                            View Profile →
                          </button>
                          <span style={{ fontSize: 12, color: isSelected ? 'var(--ngo-accent-dark)' : 'var(--muted)', fontWeight: 800 }}>
                            {isSelected ? '✓ Selected' : 'Tap to select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="btn btn-ngo"
                disabled={submittingReq}
                style={{ fontWeight: 800, fontSize: 16 }}
              >
                {submittingReq ? 'Sending Request...' : '🚀 Submit Food Requirement Request'}
              </motion.button>
            </form>
          </div>
        )}

        {/* TAB 3: RESCUE HISTORY */}
        {activeTab === 'history' && (
          <div className="card">
            <h2 className="title" style={{ fontSize: 20, marginBottom: 14 }}>📜 Food Rescue History Audit</h2>
            {historyDonations.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 700 }}>No previous food rescue history.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px' }}>Food Description</th>
                      <th style={{ padding: '12px' }}>Quantity</th>
                      <th style={{ padding: '12px' }}>Partner Hotel</th>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyDonations.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontWeight: 800 }}>{d.foodDescription || d.foodType}</td>
                        <td style={{ padding: '12px' }}>{d.quantity}</td>
                        <td style={{ padding: '12px' }}>🏨 {d.hotelUser?.hotelProfile?.hotelName || 'Hotel'}</td>
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

        {/* REJECTION REASON MODAL */}
        <AnimatePresence>
          {rejectingDonation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="card"
                style={{ maxWidth: 450, width: '100%', padding: 24, textAlign: 'left' }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--danger)' }}>
                  Reject Food Request
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                  Select a reason for declining this request from <b>{rejectingDonation.hotelUser?.hotelProfile?.hotelName || 'Hotel'}</b>:
                </p>

                <div className="form-group">
                  <label className="form-label">Reason for Rejection</label>
                  <select
                    className="input-field"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  >
                    {REJECTION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {rejectionReason === 'Other' && (
                  <div className="form-group">
                    <label className="form-label">Specific Reason</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Cold storage facility full"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button className="btn btn-secondary" onClick={() => setRejectingDonation(null)}>
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn btn-danger"
                    onClick={handleExecuteReject}
                  >
                    Confirm Rejection
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOTEL PROFILE INSPECTION MODAL */}
        <OrganizationProfileModal
          isOpen={!!inspectHotelModal}
          onClose={() => setInspectHotelModal(null)}
          orgData={inspectHotelModal?.user || inspectHotelModal}
          orgType="hotel"
        />
      </div>
    </div>
  );
}

export default NgoDashboard;
