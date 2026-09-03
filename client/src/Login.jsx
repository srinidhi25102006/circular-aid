import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

function Login({ mode, role, onLogin, onBack }) {
  const [isNewUser, setIsNewUser] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRoleBadge = () => {
    switch (role?.toLowerCase()) {
      case 'hotel':
        return <span className="badge badge-warning">🏨 Hotel / Restaurant Partner</span>;
      case 'ngo':
        return <span className="badge badge-info" style={{ background: 'var(--ngo-accent-light)', color: 'var(--ngo-accent-dark)' }}>🤝 NGO / Shelter</span>;
      case 'recycler':
        return <span className="badge badge-info">🏭 Recycling Center</span>;
      default:
        return <span className="badge badge-success">📱 Individual Account</span>;
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container">
        <button className="back-link" onClick={onBack}>← Back to Role Selection</button>

        <div className="card">
          <div style={{ marginBottom: 14 }}>
            {getRoleBadge()}
          </div>

          <p className="title">{isNewUser ? 'Create Your Account' : 'Welcome Back'}</p>
          <p className="subtitle">Enter your credentials to access the CircularAid ecosystem.</p>

          <form onSubmit={handleEmailAuth}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-light)', color: 'var(--danger)', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : isNewUser ? 'Sign Up & Continue' : 'Log In to Dashboard'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', margin: '16px 0', fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>— OR —</p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleLogin}
            className="btn btn-secondary"
            disabled={loading}
          >
            🌐 Continue with Google
          </motion.button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
            {isNewUser ? 'Already registered?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => setIsNewUser(!isNewUser)}
              style={{ border: 'none', background: 'none', color: 'var(--primary-hover)', fontWeight: 800, cursor: 'pointer' }}
            >
              {isNewUser ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;