import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RecycleFlow from './RecycleFlow';

function IndividualDashboard({ userEmail, firebaseUid }) {
  const [inFlow, setInFlow] = useState(false);
  const [stats, setStats] = useState({ count: 0, points: 0, co2: 0 });
  const [recentDevices, setRecentDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedDeviceForReview, setSelectedDeviceForReview] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeviceForReview) return;
    setSubmittingReview(true);
    setReviewError('');

    try {
      const res = await fetch('http://localhost:5000/api/recycling-center-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDeviceForReview.id,
          userFirebaseUid: firebaseUid,
          stars: ratingStars,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      alert('✓ Thank you! Your review has been published.');
      setSelectedDeviceForReview(null);
      setReviewComment('');
      setRatingStars(5);
      fetchUserDevicesAndStats();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
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
            recentDevices.map((d) => {
              const isCompleted = d.status === 'received' || d.status === 'completed';
              return (
                <div key={d.id} className="center-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{d.deviceType}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${isCompleted ? 'badge-success' : d.status === 'scheduled' ? 'badge-info' : 'badge-warning'}`}>
                        {d.status ? d.status.toUpperCase() : 'PENDING'}
                      </span>
                      {isCompleted && (
                        d.review ? (
                          <span className="badge badge-success" style={{ fontSize: 11 }}>
                            ✓ Reviewed ({d.review.stars}★)
                          </span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="btn btn-warning"
                            style={{ padding: '4px 10px', fontSize: 12, marginBottom: 0, fontWeight: 700 }}
                            onClick={() => setSelectedDeviceForReview(d)}
                          >
                            ⭐ Rate Facility
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                    <b>Condition:</b> {d.estimatedCondition} &bull; <b>Plant:</b> {d.recyclingCenter?.centerName || 'Assigned Plant'} &bull; <b>Handoff:</b> {d.pickupMethod === 'pickup' ? '🚚 Home Pickup' : '📍 Self Drop-off'}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* POST-COMPLETION REVIEW MODAL */}
        <AnimatePresence>
          {selectedDeviceForReview && (
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
                background: 'rgba(0,0,0,0.75)',
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
                style={{ maxWidth: 480, width: '100%', padding: 24, textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#17352D' }}>
                    ⭐ Rate & Review Recycling Facility
                  </h3>
                  <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 12px', fontSize: 12, marginBottom: 0 }} onClick={() => setSelectedDeviceForReview(null)}>
                    ✕ Close
                  </button>
                </div>

                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                  Share your feedback for <b>{selectedDeviceForReview.recyclingCenter?.centerName || 'Recycling Plant'}</b> regarding your completed request for <b>{selectedDeviceForReview.deviceType}</b>.
                </p>

                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label className="form-label">Star Rating (1 to 5 Stars)</label>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            fontSize: 28,
                            cursor: 'pointer',
                            opacity: star <= ratingStars ? 1 : 0.3,
                            transition: 'opacity 0.15s ease'
                          }}
                          onClick={() => setRatingStars(star)}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Written Comment / Review</label>
                    <textarea
                      className="input-field"
                      style={{ minHeight: 90, resize: 'vertical' }}
                      placeholder="How was your experience with pickup/drop-off, staff professionalism, and speed?"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>

                  {reviewError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>⚠️ {reviewError}</p>}

                  <div className="row">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn btn-primary"
                      disabled={submittingReview}
                      style={{ fontWeight: 800 }}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default IndividualDashboard;