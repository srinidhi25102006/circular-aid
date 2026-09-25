import { motion } from 'framer-motion';
import GlobalNavControls from './GlobalNavControls';

function Welcome({ onGetStarted }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', position: 'relative' }}>
      {/* Sticky Public Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 28px',
          boxShadow: '0 4px 20px rgba(23, 53, 45, 0.04)',
        }}
      >
        <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GlobalNavControls style={{ marginRight: 6 }} />
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #00A878, #064E3B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: 'white',
                boxShadow: '0 4px 14px rgba(0, 168, 120, 0.35)',
              }}
            >
              ♻️
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#17352D', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                CircularAid
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                CIRCULAR ECONOMY PLATFORM
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onGetStarted('login')}
              className="btn btn-outline"
              style={{ width: 'auto', padding: '9px 20px', fontSize: 14, marginBottom: 0, fontWeight: 700 }}
            >
              Log In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onGetStarted('signup')}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '9px 22px', fontSize: 14, marginBottom: 0, fontWeight: 700 }}
            >
              Get Started 🚀
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 70px',
          background: 'radial-gradient(circle at 50% 10%, #E6F8F2 0%, #F4FBF7 60%, #FFFFFF 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 16px',
                borderRadius: 99,
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary-hover)',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              🌱 Sustainable Resource Circulation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(36px, 5.5vw, 58px)',
              fontWeight: 800,
              color: '#17352D',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 20,
            }}
          >
            Turn waste into resources.{' '}
            <span style={{ background: 'linear-gradient(135deg, #00A878, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Connect surplus with purpose.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--muted)',
              maxWidth: 720,
              margin: '0 auto 36px',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            A modern circular-economy platform connecting individuals, hotel businesses, NGOs, and certified recyclers to keep food, electronics, and valuable materials in active circulation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onGetStarted('signup')}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '16px 36px', fontSize: 17, fontWeight: 800 }}
            >
              Get Started — Create Account 🚀
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onGetStarted('login')}
              className="btn btn-outline"
              style={{ width: 'auto', padding: '16px 32px', fontSize: 17, fontWeight: 700 }}
            >
              Log In to Account 🔑
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Core Feature Pillars Grid */}
      <section style={{ padding: '70px 24px', maxWidth: 1150, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Core Ecosystem Capabilities
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#17352D', marginTop: 6, letterSpacing: '-0.02em' }}>
            Three Pillars of Resource Rescue
          </h2>
        </div>

        <div className="grid-3">
          {/* Food Rescue Pillar */}
          <motion.div
            whileHover={{ y: -6 }}
            className="card"
            style={{ borderTop: '4px solid var(--food-accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'var(--food-accent-light)',
                  border: '1px solid var(--food-accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 18,
                }}
              >
                🍱
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: '#17352D' }}>Food Rescue</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
                Redirect fresh surplus meals from hotels and caterers to verified NGOs and distribution hubs before expiration.
              </p>
            </div>
            <button
              onClick={() => onGetStarted('signup')}
              className="btn btn-food"
              style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 18px', fontSize: 13 }}
            >
              Explore Food Rescue →
            </button>
          </motion.div>

          {/* E-Waste Scan Pillar */}
          <motion.div
            whileHover={{ y: -6 }}
            className="card"
            style={{ borderTop: '4px solid var(--ewaste-accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'var(--ewaste-accent-light)',
                  border: '1px solid var(--ewaste-accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 18,
                }}
              >
                ♻️
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: '#17352D' }}>E-Waste Scan</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
                Scan electronics using Gemini AI to analyze materials, detect lithium battery hazards, and automatically route items for reuse or certified recycling.
              </p>
            </div>
            <button
              onClick={() => onGetStarted('signup')}
              className="btn btn-ewaste"
              style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 18px', fontSize: 13 }}
            >
              Scan Electronics →
            </button>
          </motion.div>

          {/* NGO Distribution Pillar */}
          <motion.div
            whileHover={{ y: -6 }}
            className="card"
            style={{ borderTop: '4px solid var(--ngo-accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'var(--ngo-accent-light)',
                  border: '1px solid var(--ngo-accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 18,
                }}
              >
                🤝
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: '#17352D' }}>NGO Distribution</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
                Connect verified non-profit networks with donors via automated pickup windows, timeline chats, and photo handover confirmation.
              </p>
            </div>
            <button
              onClick={() => onGetStarted('signup')}
              className="btn btn-ngo"
              style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 18px', fontSize: 13 }}
            >
              Connect with NGOs →
            </button>
          </motion.div>
        </div>
      </section>

      {/* Impact Statistics Banner */}
      <section style={{ padding: '60px 24px', background: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1150, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Real Sustainability Impact
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#17352D', marginTop: 4 }}>
              Circulating Resources Across Communities
            </h2>
          </div>

          <div className="stats-grid" style={{ gap: 20 }}>
            <div className="stat-box" style={{ padding: '28px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🍱</div>
              <div className="stat-value" style={{ fontSize: 32, color: 'var(--food-accent)' }}>2,450+ kg</div>
              <div className="stat-label">Food Rescued</div>
            </div>
            <div className="stat-box" style={{ padding: '28px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>📱</div>
              <div className="stat-value" style={{ fontSize: 32, color: 'var(--ewaste-accent)' }}>1,280+</div>
              <div className="stat-label">Devices Recycled</div>
            </div>
            <div className="stat-box" style={{ padding: '28px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🤝</div>
              <div className="stat-value" style={{ fontSize: 32, color: 'var(--ngo-accent)' }}>84+</div>
              <div className="stat-label">Verified NGOs Connected</div>
            </div>
          </div>
        </div>
      </section>

      {/* How CircularAid Works */}
      <section style={{ padding: '80px 24px', maxWidth: 1150, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Four-Step Lifecycle
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#17352D', marginTop: 6, letterSpacing: '-0.02em' }}>
            How CircularAid Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { step: '01', icon: '📸', title: 'Donate or Scan', desc: 'Post surplus food or snap a photo of an electronic device.' },
            { step: '02', icon: '🤖', title: 'AI Evaluation', desc: 'Gemini AI evaluates condition, material composition, and safety hazards.' },
            { step: '03', icon: '🚗', title: 'Smart Route & Pickup', desc: 'Match with local NGOs or certified recyclers for coordinated pickup.' },
            { step: '04', icon: '🎉', title: 'Circular Impact', desc: 'Track CO₂ savings, earn Green Points, and receive audit certificates.' },
          ].map((item) => (
            <div
              key={item.step}
              className="card"
              style={{ background: '#ffffff', textAlign: 'center', padding: '32px 20px', position: 'relative' }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 18,
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--primary-border)',
                }}
              >
                {item.step}
              </span>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#17352D' }}>{item.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#17352D', color: '#ffffff', padding: '40px 24px', textAlign: 'center', borderTop: '1px solid #2d554a' }}>
        <div style={{ maxWidth: 1150, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>♻️</span>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>CircularAid</span>
          </div>
          <p style={{ fontSize: 14, color: '#84A98C', marginBottom: 20 }}>
            Building zero-waste communities through artificial intelligence and shared circular networks.
          </p>
          <div style={{ fontSize: 12, color: '#52796F' }}>
            &copy; {new Date().getFullYear()} CircularAid Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;