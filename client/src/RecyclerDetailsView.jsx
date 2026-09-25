import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function RecyclerDetailsView({ recyclerData, onBack, onStatusUpdate }) {
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'approve' | 'reject' | 'info' | null
  const [modalNotes, setModalNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  if (!recyclerData) return null;

  const profile = recyclerData.recyclingCenterProfile || {};
  const userEmail = recyclerData.email || 'N/A';
  const status = recyclerData.verificationStatus || 'PENDING';
  const submittedDate = recyclerData.createdAt
    ? new Date(recyclerData.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const lat = profile.latitude || 13.0827; // Default Chennai coords if missing
  const lng = profile.longitude || 80.2707;
  const bboxPadding = 0.01;
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bboxPadding}%2C${lat - bboxPadding}%2C${parseFloat(lng) + bboxPadding}%2C${parseFloat(lat) + bboxPadding}&layer=mapnik&marker=${lat}%2C${lng}`;

  // Parse specialties array safely
  let specialtiesArr = [];
  if (profile.specialties) {
    try {
      specialtiesArr = typeof profile.specialties === 'string' 
        ? JSON.parse(profile.specialties) 
        : profile.specialties;
    } catch (e) {
      specialtiesArr = [profile.specialties];
    }
  }

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED':
        return <span className="badge badge-success" style={{ fontSize: 13, padding: '6px 14px' }}>✓ Approved / Verified</span>;
      case 'REJECTED':
        return <span className="badge badge-danger" style={{ fontSize: 13, padding: '6px 14px' }}>✕ Application Rejected</span>;
      case 'INFO_REQUESTED':
        return <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px' }}>⚠️ Revision Requested</span>;
      default:
        return <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px', background: '#fef3c7', color: '#92400e' }}>⏳ Pending Verification</span>;
    }
  };

  const handleExecuteAction = async () => {
    if (!activeModal) return;

    if (activeModal === 'reject' && !modalNotes.trim()) {
      alert('Please provide a reason for rejection so the applicant understands what was missing.');
      return;
    }

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
          userId: recyclerData.id,
          status: targetStatus,
          adminNotes: modalNotes.trim(),
        }),
      });

      if (res.ok) {
        setActionSuccess(`Recycling Centre status updated to ${targetStatus}`);
        setTimeout(() => {
          setActiveModal(null);
          setModalNotes('');
          if (onStatusUpdate) onStatusUpdate();
        }, 1200);
      } else {
        alert('Failed to update Recycling Centre status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server.');
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
            ← Back to Facilities Directory
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {getStatusBadge(status)}
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Submitted: {submittedDate}</span>
          </div>
        </div>

        {/* Page Header Card */}
        <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #ffffff 0%, #f4fbf7 100%)', borderLeft: '5px solid var(--ewaste-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: 'var(--recycler-accent-light)',
                  border: '1px solid var(--recycler-accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  color: 'var(--recycler-accent-dark)',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.15)',
                }}
              >
                🏭
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                  {profile.centerName || 'Unnamed Recycling Facility'}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 0 }}>
                  E-Waste Recycling Facility File &bull; PCB License #{profile.licenseNumber || 'Pending'}
                </p>
              </div>
            </div>

            {/* Governance Action Bar */}
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
                ✕ Reject Application
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
                ⚠️ Request Revision
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 20px', fontSize: 13, marginBottom: 0, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                onClick={() => {
                  setModalNotes('');
                  setActiveModal('approve');
                }}
              >
                ✓ Approve Facility
              </motion.button>
            </div>
          </div>
        </div>

        {/* Existing Admin Notes / Rejection History Banner */}
        {profile.adminNotes && (
          <div
            className="card"
            style={{
              marginBottom: 20,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderLeft: '5px solid #d97706',
              padding: 16,
            }}
          >
            <h4 style={{ fontSize: 14, color: '#92400e', fontWeight: 800, margin: '0 0 4px 0' }}>
              📝 Previous Admin Audit Note / Feedback:
            </h4>
            <p style={{ fontSize: 13, color: '#78350f', margin: 0, whiteSpace: 'pre-wrap' }}>
              {profile.adminNotes}
            </p>
          </div>
        )}

        {/* 2-Column Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20 }}>
          
          {/* Card 1: Facility Contact & Profile Details */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Primary Registration Details
            </h3>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                  Facility / Organization Name
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                  {profile.centerName || 'N/A'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    Contact Person
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    👤 {profile.contactPerson || 'N/A'}
                  </span>
                </div>

                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    Official Phone
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    📞 {profile.phone || 'N/A'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    Email Account
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', wordBreak: 'break-all' }}>
                    ✉️ {userEmail}
                  </span>
                </div>

                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    PCB / E-Waste License #
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ewaste-accent)' }}>
                    📜 {profile.licenseNumber || 'Not Provided'}
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                  Operating Hours & Shift Timings
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  🕒 {profile.operatingHours || '8:00 AM - 7:00 PM (Monday - Saturday)'}
                </span>
              </div>

              {profile.description && (
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    Facility Description / Capabilities
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                    {profile.description}
                  </span>
                </div>
              )}

              {specialtiesArr.length > 0 && (
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Processed E-Waste Material Specialties
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {specialtiesArr.map((spec, i) => (
                      <span
                        key={i}
                        className="badge"
                        style={{
                          background: 'var(--recycler-accent-light)',
                          color: 'var(--recycler-accent-dark)',
                          border: '1px solid var(--recycler-accent-border)',
                          fontSize: 12,
                          padding: '4px 10px',
                        }}
                      >
                        ⚡ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Physical Address & Map Location Preview */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              📍 Physical Address & GPS Location
            </h3>

            <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                Registered Plant Address
              </span>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                {profile.address || 'Address not provided during registration.'}
              </p>

              {profile.latitude && profile.longitude ? (
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 8 }}>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>
                    GPS: Lat {profile.latitude}, Lng {profile.longitude}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${profile.latitude},${profile.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}
                  >
                    ↗ Open in Google Maps
                  </a>
                </div>
              ) : (
                <span className="badge badge-warning" style={{ fontSize: 11, marginTop: 4 }}>
                  ⚠️ GPS Coordinates set to default city centroid
                </span>
              )}
            </div>

            {/* Embedded OpenStreetMap Preview */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: 260, position: 'relative' }}>
              <iframe
                title="Facility Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={mapIframeUrl}
                style={{ border: 0 }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                🗺️ OpenStreetMap Verification Marker
              </div>
            </div>
          </div>

          {/* Card 3: Uploaded License & Proof Document */}
          <div className="card" style={{ padding: 22, gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              📄 Verification License & Governance Document
            </h3>

            {profile.documentUrl ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg)',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px dashed var(--recycler-accent-border)',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: '#ecfdf5',
                      color: '#047857',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                    }}
                  >
                    📑
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text)' }}>
                      PCB License / Incorporation Proof Document
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                      Uploaded Document &bull; License #{profile.licenseNumber || 'On Record'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: 13, marginBottom: 0 }}
                    onClick={() => setDocModalOpen(true)}
                  >
                    👁️ View Document
                  </motion.button>

                  <a
                    href={profile.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: 13, marginBottom: 0, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    ⬇️ Download / Open Link
                  </a>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>⚠️</span>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#991b1b', margin: '0 0 4px 0' }}>
                  No Verification License Document Uploaded
                </h4>
                <p style={{ fontSize: 13, color: '#7f1d1d', margin: '0 0 12px 0' }}>
                  The applicant did not attach an electronic license file during registration. You can request revision to ask for proof.
                </p>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: 12, borderColor: '#d97706', color: '#b45309', marginBottom: 0 }}
                  onClick={() => {
                    setModalNotes('Please upload your Pollution Control Board (PCB) operating license or government incorporation certificate.');
                    setActiveModal('info');
                  }}
                >
                  ✉️ Request License Upload
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROOF DOCUMENT VIEWER MODAL */}
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
                background: 'rgba(0,0,0,0.82)',
                backdropFilter: 'blur(5px)',
                zIndex: 99999,
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
                style={{ maxWidth: 850, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Submitted Proof & License Document</h3>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                      Facility: {profile.centerName || 'Recycling Center'} &bull; License: {profile.licenseNumber || 'N/A'}
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '4px 12px', fontSize: 12, marginBottom: 0 }}
                    onClick={() => setDocModalOpen(false)}
                  >
                    ✕ Close
                  </button>
                </div>

                <div style={{ textAlign: 'center', background: '#0f172a', padding: 16, borderRadius: 10, minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profile.documentUrl ? (
                    <img
                      src={profile.documentUrl}
                      alt="License Proof"
                      style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 6 }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<div style="color:#ffffff; padding:40px;">
                          <p style="font-size:16px; font-weight:700;">📄 External Document Preview</p>
                          <p style="font-size:13px; color:#94a3b8;">This document is stored as an external URL. Click below to view directly.</p>
                          <a href="${profile.documentUrl}" target="_blank" class="btn btn-primary" style="display:inline-block; margin-top:12px; padding:8px 20px;">Open Document in New Tab ↗</a>
                        </div>`;
                      }}
                    />
                  ) : (
                    <div style={{ color: '#94a3b8' }}>No document image available</div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <a
                    href={profile.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '8px 18px', fontSize: 13, marginBottom: 0 }}
                  >
                    ↗ Open Full Document Original
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DECISION ACTION MODAL (APPROVE / REJECT / REVISION) */}
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
                style={{ maxWidth: 520, width: '100%', padding: 24 }}
              >
                {actionSuccess ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Action Submitted!</h3>
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>{actionSuccess}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: activeModal === 'reject' ? '#dc2626' : activeModal === 'approve' ? '#059669' : '#d97706' }}>
                        {activeModal === 'approve' && '✓ Confirm Application Approval'}
                        {activeModal === 'reject' && '✕ Reject Recycling Centre Application'}
                        {activeModal === 'info' && '⚠️ Request Revision / Details'}
                      </h3>
                      <button
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '4px 10px', fontSize: 12, marginBottom: 0 }}
                        onClick={() => setActiveModal(null)}
                      >
                        ✕
                      </button>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                      {activeModal === 'approve' && 'Approving this recycling plant will mark their status as APPROVED and list their facility in public e-waste recycling searches.'}
                      {activeModal === 'reject' && 'Rejecting this application requires providing a clear reason so the applicant is informed why their registration was rejected.'}
                      {activeModal === 'info' && 'Requesting revision allows the applicant to resubmit missing PCB license certificates or updated address details.'}
                    </p>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                        {activeModal === 'reject' ? 'Reason for Rejection * (Required)' : 'Admin Audit Notes / Feedback (Optional)'}
                      </label>
                      <textarea
                        className="input-field"
                        rows="4"
                        placeholder={
                          activeModal === 'reject'
                            ? 'e.g. Invalid PCB license number provided, or license document was illegible/expired.'
                            : 'Add any audit remarks or notes for record keeping...'
                        }
                        value={modalNotes}
                        onChange={(e) => setModalNotes(e.target.value)}
                        style={{ width: '100%', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '8px 16px', fontSize: 13, marginBottom: 0 }}
                        onClick={() => setActiveModal(null)}
                        disabled={processing}
                      >
                        Cancel
                      </button>

                      <button
                        className={`btn ${activeModal === 'reject' ? 'btn-danger' : activeModal === 'approve' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          width: 'auto',
                          padding: '8px 20px',
                          fontSize: 13,
                          fontWeight: 800,
                          marginBottom: 0,
                          ...(activeModal === 'approve' ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : {}),
                          ...(activeModal === 'info' ? { borderColor: '#d97706', color: '#b45309' } : {})
                        }}
                        onClick={handleExecuteAction}
                        disabled={processing}
                      >
                        {processing ? 'Processing...' : activeModal === 'approve' ? 'Confirm Approval' : activeModal === 'reject' ? 'Submit Rejection' : 'Send Revision Request'}
                      </button>
                    </div>
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

export default RecyclerDetailsView;
