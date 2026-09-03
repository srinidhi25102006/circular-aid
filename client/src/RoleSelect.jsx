import { motion } from 'framer-motion';

function RoleSelect({ onSelectRole, onBack }) {
  const roles = [
    {
      key: 'individual',
      title: 'Individual User',
      desc: 'Recycle or donate electronics, earn green points, and track CO₂ saved.',
      icon: '📱',
      accentColor: 'var(--primary)',
      accentBg: 'var(--primary-light)',
      borderColor: 'var(--primary-border)'
    },
    {
      key: 'hotel',
      title: 'Hotel / Restaurant',
      desc: 'Donate excess cooked food and ingredients to verified shelters & NGOs.',
      icon: '🏨',
      accentColor: 'var(--hotel-accent)',
      accentBg: 'var(--hotel-accent-light)',
      borderColor: 'var(--hotel-accent-border)'
    },
    {
      key: 'ngo',
      title: 'NGO / Ashram / Shelter',
      desc: 'Browse nearby food donations, coordinate pickups, and receive supplies.',
      icon: '🤝',
      accentColor: 'var(--ngo-accent)',
      accentBg: 'var(--ngo-accent-light)',
      borderColor: 'var(--ngo-accent-border)'
    },
    {
      key: 'recycler',
      title: 'Recycling Center',
      desc: 'Manage incoming e-waste streams, confirm receipts, and issue certificates.',
      icon: '🏭',
      accentColor: 'var(--recycler-accent)',
      accentBg: 'var(--recycler-accent-light)',
      borderColor: 'var(--recycler-accent-border)'
    },
  ];

  return (
    <div className="page fade-in">
      <div className="container">
        {onBack && (
          <button className="back-link" onClick={onBack}>← Back to Welcome</button>
        )}

        <div className="card">
          <p className="title">Select Account Type</p>
          <p className="subtitle">Choose how you want to participate in the circular economy.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {roles.map((r, i) => (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectRole(r.key)}
                className="center-list-item"
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius)',
                  borderColor: 'var(--border)',
                  borderLeft: `5px solid ${r.accentColor}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: r.accentBg,
                    border: `1px solid ${r.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0
                  }}>
                    {r.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 2, color: 'var(--text)' }}>{r.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 0, lineHeight: 1.4 }}>{r.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;