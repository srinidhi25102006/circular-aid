import { motion } from 'framer-motion';

function Navbar({ userEmail, userRole, onSignOut, activeTab, onSelectTab }) {
  const roleName = userRole ? userRole.toUpperCase() : 'USER';

  const getRoleBadgeStyle = () => {
    switch (roleName) {
      case 'HOTEL':
        return { bg: 'var(--food-accent-light)', border: 'var(--food-accent-border)', text: 'var(--food-accent-dark)', label: '🏨 Hotel Partner' };
      case 'NGO':
        return { bg: 'var(--ngo-accent-light)', border: 'var(--ngo-accent-border)', text: 'var(--ngo-accent-dark)', label: '🤝 Verified NGO' };
      case 'RECYCLER':
        return { bg: 'var(--recycler-accent-light)', border: 'var(--recycler-accent-border)', text: 'var(--recycler-accent-dark)', label: '♻️ Certified Recycler' };
      case 'ADMIN':
        return { bg: 'var(--admin-accent-light)', border: 'var(--admin-accent-border)', text: 'var(--admin-accent-dark)', label: '🛡️ System Admin' };
      default:
        return { bg: 'var(--primary-light)', border: 'var(--primary-border)', text: 'var(--primary-dark)', label: '🌱 Individual Eco Member' };
    }
  };

  const badgeInfo = getRoleBadgeStyle();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo & Tagline */}
        <div 
          className="navbar-brand" 
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          title="CircularAid — Return to Command Center"
        >
          <div className="navbar-brand-icon">♻️</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>CircularAid</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', boxShadow: '0 0 8px var(--primary)' }}></span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginTop: -2 }}>
              Circular Economy Network
            </span>
          </div>
        </div>

        {/* Dynamic Quick Navigation Tabs */}
        <nav className="navbar-menu">
          <button
            className={`nav-link ${!activeTab || activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('dashboard')}
          >
            📊 Dashboard
          </button>
          
          {(roleName === 'INDIVIDUAL' || roleName === 'NGO' || roleName === 'HOTEL') && (
            <button
              className={`nav-link ${activeTab === 'food' ? 'active' : ''}`}
              onClick={() => onSelectTab && onSelectTab('food')}
            >
              🍱 Food Rescue
            </button>
          )}

          {(roleName === 'INDIVIDUAL' || roleName === 'RECYCLER') && (
            <button
              className={`nav-link ${activeTab === 'ewaste' ? 'active' : ''}`}
              onClick={() => onSelectTab && onSelectTab('ewaste')}
            >
              ♻️ E-Waste Scan
            </button>
          )}

          {(roleName === 'INDIVIDUAL' || roleName === 'NGO') && (
            <button
              className={`nav-link ${activeTab === 'ngos' ? 'active' : ''}`}
              onClick={() => onSelectTab && onSelectTab('ngos')}
            >
              🤝 NGO Network
            </button>
          )}
        </nav>

        {/* User Account Controls & Logout */}
        <div className="navbar-right">
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 99,
                background: badgeInfo.bg,
                border: `1px solid ${badgeInfo.border}`,
                color: badgeInfo.text,
              }}
            >
              {badgeInfo.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginTop: 2 }}>
              {userEmail}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary"
            style={{
              width: 'auto',
              padding: '7px 14px',
              fontSize: 13,
              marginBottom: 0,
              fontWeight: 700,
              borderRadius: 99,
            }}
            onClick={onSignOut}
            title="Log Out & Return to Public Home"
          >
            🔒 Log Out
          </motion.button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
