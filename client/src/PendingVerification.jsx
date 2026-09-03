import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

function PendingVerification({ role, userEmail, firebaseUid, dbUser, onRefreshStatus }) {
  const isInfoRequested = dbUser?.verificationStatus === 'INFO_REQUESTED';
  const ngoProfile = dbUser?.ngoProfile || {};
  const adminNotes = ngoProfile.adminNotes || 'Please review your registration details and update missing info.';

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    ngoName: ngoProfile.ngoName || '',
    contactPerson: ngoProfile.contactPerson || '',
    phone: ngoProfile.phone || '',
    address: ngoProfile.address || '',
    registrationNumber: ngoProfile.registrationNumber || '',
    websiteUrl: ngoProfile.websiteUrl || '',
    causes: ngoProfile.causes || 'Food Rescue & Surplus Distribution',
    description: ngoProfile.description || '',
    logoUrl: ngoProfile.logoUrl || '',
    certificateUrl: ngoProfile.certificateUrl || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState('');

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResubmitSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/ngo/resubmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid,
          ...formData,
        }),
      });

      if (res.ok) {
        setResubmitSuccess('Profile updated and resubmitted successfully!');
        setTimeout(() => {
          setEditing(false);
          onRefreshStatus();
        }, 1200);
      } else {
        alert('Failed to resubmit application.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error resubmitting profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container" style={{ textAlign: 'center', maxWidth: 650 }}>
        <div className="card" style={{ padding: '36px 28px' }}>
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 54, marginBottom: 12 }}
          >
            {isInfoRequested ? '📝' : '⏳'}
          </motion.div>

          <span
            className={`badge ${isInfoRequested ? 'badge-warning' : 'badge-warning'}`}
            style={{
              fontSize: 13,
              padding: '6px 16px',
              marginBottom: 16,
              background: isInfoRequested ? '#fef3c7' : undefined,
              color: isInfoRequested ? '#b45309' : undefined,
            }}
          >
            {isInfoRequested ? '⚠️ Action Required: Additional Information Requested' : 'Verification Pending'}
          </span>

          <h2 className="title" style={{ marginTop: 8, fontSize: 24 }}>
            {isInfoRequested ? 'Admin Requested More Details' : 'Application Under Review'}
          </h2>

          <p className="subtitle" style={{ marginTop: 8, lineHeight: 1.6 }}>
            Organization: <b>{role?.toUpperCase()}</b> ({userEmail})
          </p>

          {/* ADMIN NOTES ALERT (IF INFO REQUESTED) */}
          {isInfoRequested && (
            <div style={{ background: '#fffbeb', border: '2px dashed #f59e0b', padding: 20, borderRadius: 12, marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 14, color: '#b45309', fontWeight: 800, marginBottom: 6 }}>
                📌 Message from Governance Admin:
              </p>
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                "{adminNotes}"
              </p>
              <div style={{ marginTop: 14 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-ngo"
                  style={{ width: '100%', marginBottom: 0, fontWeight: 700 }}
                  onClick={() => setEditing(true)}
                >
                  ✏️ Update Credentials & Resubmit Profile
                </motion.button>
              </div>
            </div>
          )}

          {!isInfoRequested && (
            <div style={{ background: 'var(--warning-light)', border: '1px solid var(--hotel-accent-border)', padding: 18, borderRadius: 'var(--radius)', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: 'var(--hotel-accent-dark)', fontWeight: 800, marginBottom: 4 }}>📌 What happens next?</p>
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5, margin: 0 }}>
                Once an admin reviews and approves your application, clicking <b>"Check Approval Status"</b> below will grant access to your full organization dashboard.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary"
              style={{ width: 'auto' }}
              onClick={onRefreshStatus}
            >
              🔄 Check Approval Status
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-secondary"
              style={{ width: 'auto' }}
              onClick={() => signOut(auth)}
            >
              Log Out
            </motion.button>
          </div>
        </div>

        {/* RESUBMIT CREDENTIALS MODAL */}
        <AnimatePresence>
          {editing && (
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
                background: 'rgba(0,0,0,0.7)',
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
                style={{ maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Update Profile Credentials</h3>
                  <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 12px', fontSize: 12 }} onClick={() => setEditing(false)}>
                    ✕ Cancel
                  </button>
                </div>

                <form onSubmit={handleResubmit}>
                  <div className="form-group">
                    <label className="form-label">NGO Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.ngoName}
                      onChange={(e) => handleInputChange('ngoName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Society / Trust Registration Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Official Phone</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Physical Operating Address</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Causes / Focus Area</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.causes}
                      onChange={(e) => handleInputChange('causes', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website / Social Links</label>
                    <input
                      type="url"
                      className="input-field"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">About the NGO / Mission Statement</label>
                    <textarea
                      className="input-field"
                      style={{ minHeight: 80 }}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Registration Certificate Document</label>
                    <label className="upload-box" style={{ padding: 14, background: 'var(--ngo-accent-light)', borderColor: 'var(--ngo-accent-border)' }}>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('certificateUrl', e)} style={{ display: 'none' }} />
                      {formData.certificateUrl ? '📄 Document Attached (Tap to Replace)' : '📂 Upload Scanned Certificate'}
                    </label>
                  </div>

                  {resubmitSuccess ? (
                    <div style={{ padding: 12, background: 'var(--success-light)', color: 'var(--success)', borderRadius: 8, textAlign: 'center', fontWeight: 700, marginBottom: 14 }}>
                      {resubmitSuccess}
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="btn btn-ngo"
                      disabled={submitting}
                      style={{ fontWeight: 700 }}
                    >
                      {submitting ? 'Resubmitting...' : '✓ Resubmit for Admin Verification'}
                    </motion.button>
                  )}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PendingVerification;
