import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function HotelDetailsView({ hotelData, onBack, onStatusUpdate }) {
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'approve' | 'reject' | 'info' | null
  const [modalNotes, setModalNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  if (!hotelData) return null;

  const profile = hotelData.hotelProfile || {};
  const userEmail = hotelData.email || 'N/A';
  const status = hotelData.verificationStatus || 'PENDING';
  const submittedDate = hotelData.createdAt
    ? new Date(hotelData.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const lat = profile.latitude || 13.0405; // default Chennai coords if missing
  const lng = profile.longitude || 80.2337;
  const bboxPadding = 0.01;
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bboxPadding}%2C${lat - bboxPadding}%2C${parseFloat(lng) + bboxPadding}%2C${parseFloat(lat) + bboxPadding}&layer=mapnik&marker=${lat}%2C${lng}`;

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED':
        return <span className="badge badge-success" style={{ fontSize: 13, padding: '6px 14px' }}>✓ Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger" style={{ fontSize: 13, padding: '6px 14px' }}>✕ Rejected</span>;
      case 'INFO_REQUESTED':
        return <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px' }}>⚠️ Info Requested</span>;
      default:
        return <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px', background: '#fef3c7', color: '#92400e' }}>⏳ Pending Verification</span>;
    }
  };

  const handleExecuteAction = async () => {
    if (!activeModal) return;
    setProcessing(true);
    setActionSuccess('');

    let targetStatus = 'APPROVED';
    if (activeModal === 'reject') targetStatus = 'REJECTED';
    if (activeModal === 'info') targetStatus = 'INFO_REQUESTED';

    try {
      const res = await fetch('http://localhost:5000/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: hotelData.id,
          status: targetStatus,
          adminNotes: modalNotes,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Hotel status updated to ${targetStatus}`);
        setTimeout(() => {
          setActiveModal(null);
          setModalNotes('');
          if (onStatusUpdate) onStatusUpdate();
        }, 1200);
      } else {
        alert('Failed to update Hotel status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Top Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '8px 18px', fontSize: 14 }}
            onClick={onBack}
          >
            ← Back to Hotels
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {getStatusBadge(status)}
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Submitted: {submittedDate}</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)', borderLeft: '5px solid var(--hotel-accent-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Hotel Facade"
                  style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--hotel-accent-border)' }}
                />
              ) : (
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 12,
                    background: 'var(--hotel-accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    color: 'var(--hotel-accent-dark)',
                    fontWeight: 800,
                  }}
                >
                  🏨
                </div>
              )}
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                  {profile.hotelName || 'Unnamed Hotel'}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 0 }}>
                  Hotel & Hospitality Governance File &bull; GST/FSSAI #{profile.gstNumber || 'Pending'}
                </p>
              </div>
            </div>

            {/* Verification Action Bar */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-danger"
                style={{ width: 'auto', padding: '10px 16px', fontSize: 13, marginBottom: 0 }}
                onClick={() => {
                  setModalNotes('');
                  setActiveModal('reject');
                }}
              >
                ✕ Reject
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '10px 16px', fontSize: 13, marginBottom: 0, borderColor: '#d97706', color: '#b45309' }}
                onClick={() => {
                  setModalNotes('');
                  setActiveModal('info');
                }}
              >
                📝 Request More Information
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-hotel"
                style={{ width: 'auto', padding: '10px 20px', fontSize: 13, fontWeight: 700, marginBottom: 0 }}
                onClick={() => {
                  setModalNotes('');
                  setActiveModal('approve');
                }}
              >
                ✓ Approve Hotel
              </motion.button>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Basic Information Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>🏨</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Basic Establishment Info</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Hotel Name</span>
                <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{profile.hotelName || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>FSSAI / GST Number</span>
                <span style={{ fontWeight: 700, color: 'var(--hotel-accent-dark)', fontSize: 14 }}>{profile.gstNumber || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>General Manager</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{profile.managerName || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Contact Phone</span>
                <a href={`tel:${profile.phone}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                  📞 {profile.phone || 'N/A'}
                </a>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Official Email</span>
                <a href={`mailto:${userEmail}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                  📧 {userEmail}
                </a>
              </div>
              {profile.category && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Category</span>
                  <span className="badge badge-info" style={{ background: 'var(--hotel-accent-light)', color: 'var(--hotel-accent-dark)', fontSize: 12 }}>
                    {profile.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Map Verification Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📍</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Location & Map Verification</h3>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
              >
                MAPS ↗
              </a>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 10 }}>
              <b>Address:</b> {profile.address || 'No location provided.'}
            </p>
            {profile.latitude && profile.longitude && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                <b>GPS Geolocation:</b> Lat {profile.latitude}, Lng {profile.longitude}
              </p>
            )}

            {/* Interactive Map Embed */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#e2e8f0', height: 200, width: '100%' }}>
              <iframe
                title="Hotel Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={mapIframeUrl}
              />
            </div>
          </div>

          {/* Food Operations & Capacity Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>🍱</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Food Operations & Capacity</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Daily Surplus Capacity</span>
                <span style={{ fontWeight: 800, color: 'var(--hotel-accent-dark)', fontSize: 15 }}>{profile.dailyCapacity || '50-150 meals'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Availability Hours</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{profile.operatingTimings || '12:00 PM - 11:00 PM'}</span>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Food Types Provided</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{profile.foodTypesProvided || 'Cooked meals, Rice, Curries'}</span>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Description</span>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                  {profile.description || 'No additional description provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* FSSAI / GST Document Verification Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Business License & Documents</h3>
            </div>

            {profile.documentUrl || profile.photoUrl ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--hotel-accent-light)', padding: 14, borderRadius: 10, border: '1px solid var(--hotel-accent-border)' }}>
                  <span style={{ fontSize: 28 }}>📜</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: 14, color: 'var(--hotel-accent-dark)' }}>FSSAI License / GST Proof</p>
                    <p style={{ fontSize: 12, margin: 0, color: 'var(--muted)' }}>Uploaded Business Credentials</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn btn-hotel"
                    style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0, fontWeight: 700 }}
                    onClick={() => setDocModalOpen(true)}
                  >
                    👁️ View / Preview Document
                  </motion.button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fffbeb', border: '1px dashed #f59e0b', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#b45309', margin: 0, fontWeight: 600 }}>
                  ⚠️ No digital FSSAI/GST document preview uploaded.
                </p>
                <p style={{ fontSize: 12, color: '#d97706', marginTop: 4, marginBottom: 0 }}>
                  You can click <b>"Request More Information"</b> to ask the hotel manager for a scanned copy.
                </p>
              </div>
            )}
          </div>

          {/* Admin Audit Trail & Notes */}
          {profile.adminNotes && (
            <div className="card" style={{ gridColumn: 'span 2', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>📝</span>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#1e40af' }}>Previous Admin Feedback Notes</h4>
              </div>
              <p style={{ fontSize: 13, color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                {profile.adminNotes}
              </p>
            </div>
          )}
        </div>

        {/* DOCUMENT PREVIEW MODAL */}
        <AnimatePresence>
          {docModalOpen && (
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
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card"
                style={{ maxWidth: 800, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>Document Preview</h3>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{profile.hotelName} &bull; FSSAI / Business License</p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 12px', fontSize: 12 }} onClick={() => setDocModalOpen(false)}>
                    ✕ Close
                  </button>
                </div>

                {profile.documentUrl || profile.photoUrl ? (
                  <img
                    src={profile.documentUrl || profile.photoUrl}
                    alt="Hotel License Preview"
                    style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', objectFit: 'contain', maxHeight: '70vh' }}
                  />
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VERIFICATION ACTIONS MODAL (Approve Confirmation / Reject Reason / Request Info) */}
        <AnimatePresence>
          {activeModal && (
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
                zIndex: 9999,
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
                style={{ maxWidth: 500, width: '100%', padding: 28 }}
              >
                {activeModal === 'approve' && (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text)' }}>Confirm Hotel Approval</h3>
                      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                        Are you sure you want to approve <b>{profile.hotelName}</b>?
                      </p>
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 12, borderRadius: 8, textAlign: 'left', marginTop: 12 }}>
                        <p style={{ fontSize: 12, color: '#047857', margin: 0, lineHeight: 1.4 }}>
                          💡 Once approved, this Hotel will become active on CircularAid to post surplus food donations to verified NGOs.
                        </p>
                      </div>
                    </div>

                    {actionSuccess ? (
                      <div style={{ padding: 12, background: 'var(--success-light)', color: 'var(--success)', borderRadius: 8, textAlign: 'center', fontWeight: 700 }}>
                        {actionSuccess}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                        <button className="btn btn-secondary" disabled={processing} onClick={() => setActiveModal(null)}>
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="btn btn-hotel"
                          disabled={processing}
                          onClick={handleExecuteAction}
                        >
                          {processing ? 'Approving...' : 'Confirm Approval'}
                        </motion.button>
                      </div>
                    )}
                  </>
                )}

                {activeModal === 'reject' && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 28 }}>⚠️</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--danger)' }}>Reject Hotel Application</h3>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                        Specify an optional reason for declining <b>{profile.hotelName}</b>'s registration.
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Rejection Reason / Internal Note</label>
                      <textarea
                        className="input-field"
                        style={{ minHeight: 90, resize: 'vertical' }}
                        placeholder="e.g. FSSAI License expired or unverified business location..."
                        value={modalNotes}
                        onChange={(e) => setModalNotes(e.target.value)}
                      />
                    </div>

                    {actionSuccess ? (
                      <div style={{ padding: 12, background: '#fef2f2', color: 'var(--danger)', borderRadius: 8, textAlign: 'center', fontWeight: 700 }}>
                        {actionSuccess}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button className="btn btn-secondary" disabled={processing} onClick={() => setActiveModal(null)}>
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="btn btn-danger"
                          disabled={processing}
                          onClick={handleExecuteAction}
                        >
                          {processing ? 'Rejecting...' : 'Reject Hotel'}
                        </motion.button>
                      </div>
                    )}
                  </>
                )}

                {activeModal === 'info' && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 28 }}>📝</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#b45309' }}>Request More Information</h3>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                        Send feedback to <b>{profile.hotelName}</b> asking for clearer FSSAI documents or operating details.
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">What information is missing / needed?</label>
                      <textarea
                        className="input-field"
                        style={{ minHeight: 100, resize: 'vertical' }}
                        placeholder="e.g. Please upload a clear photo of your valid FSSAI license certificate..."
                        value={modalNotes}
                        onChange={(e) => setModalNotes(e.target.value)}
                        required
                      />
                    </div>

                    {actionSuccess ? (
                      <div style={{ padding: 12, background: '#fffbeb', color: '#b45309', borderRadius: 8, textAlign: 'center', fontWeight: 700 }}>
                        {actionSuccess}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button className="btn btn-secondary" disabled={processing} onClick={() => setActiveModal(null)}>
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="btn btn-primary"
                          style={{ background: '#d97706' }}
                          disabled={processing || !modalNotes.trim()}
                          onClick={handleExecuteAction}
                        >
                          {processing ? 'Sending Request...' : 'Send Information Request'}
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default HotelDetailsView;
