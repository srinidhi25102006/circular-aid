import { motion, AnimatePresence } from 'framer-motion';

function OrganizationProfileModal({ isOpen, onClose, orgData, orgType }) {
  if (!isOpen || !orgData) return null;

  const profile = orgType === 'ngo' ? (orgData.ngoProfile || orgData) : (orgData.hotelProfile || orgData);
  const titleName = profile.ngoName || profile.hotelName || orgData.email;
  const isNgo = orgType === 'ngo';

  const lat = profile.latitude || 13.0827;
  const lng = profile.longitude || 80.2707;
  const bboxPadding = 0.01;
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bboxPadding}%2C${lat - bboxPadding}%2C${parseFloat(lng) + bboxPadding}%2C${parseFloat(lat) + bboxPadding}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <AnimatePresence>
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
          style={{ maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24, textAlign: 'left' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 12,
                  background: isNgo ? 'var(--ngo-accent-light)' : 'var(--hotel-accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                {profile.logoUrl || profile.photoUrl ? (
                  <img src={profile.logoUrl || profile.photoUrl} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} />
                ) : (
                  isNgo ? '🏢' : '🏨'
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text)' }}>{titleName}</h3>
                <span className="badge badge-success" style={{ fontSize: 11, padding: '3px 10px', marginTop: 4 }}>
                  ✓ Verified Organization
                </span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 12px', fontSize: 12 }} onClick={onClose}>
              ✕ Close
            </button>
          </div>

          {/* Key Grid Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--background)', padding: 14, borderRadius: 10, marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                {isNgo ? 'Society Reg #' : 'GST / FSSAI License #'}
              </span>
              <p style={{ fontWeight: 700, color: 'var(--primary)', margin: 0, fontSize: 13 }}>
                {profile.registrationNumber || profile.gstNumber || 'Verified'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Contact Manager</span>
              <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0, fontSize: 13 }}>
                👤 {profile.contactPerson || profile.managerName || 'N/A'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Phone</span>
              <a href={`tel:${profile.phone}`} style={{ fontWeight: 600, color: 'var(--primary)', margin: 0, fontSize: 13, textDecoration: 'none' }}>
                📞 {profile.phone || 'N/A'}
              </a>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Email</span>
              <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0, fontSize: 13, wordBreak: 'break-all' }}>
                📧 {orgData.email || 'N/A'}
              </p>
            </div>

            {isNgo && profile.causes && (
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Causes Supported</span>
                <p style={{ fontWeight: 600, color: 'var(--ngo-accent-dark)', margin: 0, fontSize: 13 }}>
                  🎯 {profile.causes}
                </p>
              </div>
            )}

            {!isNgo && profile.category && (
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Category & Capacity</span>
                <p style={{ fontWeight: 600, color: 'var(--hotel-accent-dark)', margin: 0, fontSize: 13 }}>
                  🏷️ {profile.category} &bull; 👥 Capacity: {profile.dailyCapacity || '50-150 meals'}
                </p>
              </div>
            )}
          </div>

          {/* Address & Map */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              📍 Physical Location
            </span>
            <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>{profile.address || 'Address provided'}</p>
            <div style={{ borderRadius: 10, overflow: 'hidden', height: 160, border: '1px solid var(--border)' }}>
              <iframe title="Org Location" width="100%" height="100%" frameBorder="0" scrolling="no" src={mapIframeUrl} />
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                📝 About Organization
              </span>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{profile.description}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default OrganizationProfileModal;
