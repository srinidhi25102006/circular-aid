import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import PageTransition from './PageTransition';
import { useNavigation } from './NavigationContext';
import Welcome from './Welcome';
import RoleSelect from './RoleSelect';
import Login from './Login';
import RoleRegistration from './RoleRegistration';
import PendingVerification from './PendingVerification';
import IndividualDashboard from './IndividualDashboard';
import HotelDashboard from './HotelDashboard';
import NgoDashboard from './NgoDashboard';
import RecyclerDashboard from './RecyclerDashboard';
import AdminDashboard from './AdminDashboard';
import Navbar from './Navbar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { currentNavState, pushNavState } = useNavigation();
  const screen = currentNavState.screen || 'welcome';
  const [authMode, setAuthMode] = useState('signup');
  const [selectedRole, setSelectedRole] = useState(() => {
    return sessionStorage.getItem('circularaid_selected_role') || null;
  });

  const navigateScreen = (newScreen) => {
    pushNavState({ screen: newScreen });
  };

  const syncUserWithBackend = async (firebaseUser, roleHint) => {
    const savedRole = roleHint || selectedRole || sessionStorage.getItem('circularaid_selected_role') || 'INDIVIDUAL';
    try {
      const res = await fetch('http://localhost:5000/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          role: savedRole.toUpperCase(),
        }),
      });

      if (res.ok) {
        const userData = await res.json();
        setDbUser(userData);
        navigateScreen('dashboard', true);
      } else {
        navigateScreen('dashboard', true);
      }
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
      navigateScreen('dashboard', true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const savedRole = sessionStorage.getItem('circularaid_selected_role');
        await syncUserWithBackend(firebaseUser, savedRole);
      } else {
        setDbUser(null);
      }
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  const handleRefreshStatus = async () => {
    if (user) {
      const savedRole = sessionStorage.getItem('circularaid_selected_role');
      await syncUserWithBackend(user, savedRole);
    }
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem('circularaid_selected_role');
    setSelectedRole(null);
    setDbUser(null);
    setUser(null);
    navigateScreen('welcome', true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="page" style={{ justifyContent: 'center' }}>
        <div className="spinner" />
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 12, fontWeight: 600 }}>
          Connecting to CircularAid Platform...
        </p>
      </div>
    );
  }

  // Active authenticated user view routing
  if (user) {
    const savedRole = sessionStorage.getItem('circularaid_selected_role');
    let currentRole = dbUser?.role?.toLowerCase() || savedRole || selectedRole || 'individual';
    const emailLower = user.email ? user.email.toLowerCase() : '';
    if (emailLower === 'admin@circularaid.com' || emailLower === 'srinidhi.25oct@gmail.com') {
      currentRole = 'admin';
    }
    const status = dbUser?.verificationStatus;

    if (currentRole === 'admin') {
      return (
        <div>
          <Navbar userEmail={user.email} userRole="admin" activeTab={currentNavState.tab} onSelectTab={(tab) => pushNavState({ screen: 'dashboard', tab })} onSignOut={handleSignOut} />
          <AnimatePresence mode="wait">
            <PageTransition key="admin-dash">
              <AdminDashboard userEmail={user.email} onSignOut={handleSignOut} />
            </PageTransition>
          </AnimatePresence>
        </div>
      );
    }

    if (currentRole === 'individual') {
      return (
        <div>
          <Navbar userEmail={user.email} userRole="individual" activeTab={currentNavState.tab} onSelectTab={(tab) => pushNavState({ screen: 'dashboard', tab })} onSignOut={handleSignOut} />
          <AnimatePresence mode="wait">
            <PageTransition key="individual-dash">
              <IndividualDashboard userEmail={user.email} firebaseUid={user.uid} onSignOut={handleSignOut} />
            </PageTransition>
          </AnimatePresence>
        </div>
      );
    }

    // Role-specific profile check for Hotel, NGO, Recycler
    const hasProfile =
      (currentRole === 'hotel' && dbUser?.hotelProfile) ||
      (currentRole === 'ngo' && dbUser?.ngoProfile) ||
      (currentRole === 'recycler' && dbUser?.recyclingCenterProfile);

    if (!hasProfile) {
      return (
        <div>
          <Navbar userEmail={user.email} userRole={currentRole} onSignOut={handleSignOut} />
          <AnimatePresence mode="wait">
            <PageTransition key="role-registration">
              <RoleRegistration
                role={currentRole}
                userEmail={user.email}
                firebaseUid={user.uid}
                onSubmitComplete={() => syncUserWithBackend(user, currentRole)}
                onSignOut={handleSignOut}
              />
            </PageTransition>
          </AnimatePresence>
        </div>
      );
    }

    if (status === 'PENDING' || status === 'INFO_REQUESTED') {
      return (
        <div>
          <Navbar userEmail={user.email} userRole={currentRole} onSignOut={handleSignOut} />
          <AnimatePresence mode="wait">
            <PageTransition key="pending-verification">
              <PendingVerification
                role={currentRole}
                userEmail={user.email}
                firebaseUid={user.uid}
                dbUser={dbUser}
                onRefreshStatus={handleRefreshStatus}
                onSignOut={handleSignOut}
              />
            </PageTransition>
          </AnimatePresence>
        </div>
      );
    }

    if (status === 'REJECTED') {
      const adminNotes = dbUser?.ngoProfile?.adminNotes || dbUser?.hotelProfile?.adminNotes || dbUser?.recyclingCenterProfile?.adminNotes;
      return (
        <div>
          <Navbar userEmail={user.email} userRole={currentRole} onSignOut={handleSignOut} />
          <div className="page fade-in">
            <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
              <div className="card" style={{ padding: 32 }}>
                <span className="badge badge-danger">Application Declined</span>
                <p className="title" style={{ marginTop: 12 }}>Registration Status</p>
                <p className="subtitle" style={{ marginBottom: 16 }}>
                  Unfortunately, your organization application could not be verified at this time.
                </p>
                {adminNotes && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: 16, borderRadius: 10, marginBottom: 20, textAlign: 'left' }}>
                    <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 800, marginBottom: 4 }}>📝 Admin Feedback Note:</p>
                    <p style={{ fontSize: 13, color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>{adminNotes}</p>
                  </div>
                )}
                <button className="btn btn-secondary" onClick={handleSignOut}>Log Out to Public Home</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Approved Role Dashboards
    if (currentRole === 'hotel') {
      return (
        <div>
          <Navbar userEmail={user.email} userRole="hotel" activeTab={currentNavState.tab} onSelectTab={(tab) => pushNavState({ screen: 'dashboard', tab })} onSignOut={handleSignOut} />
          <AnimatePresence mode="wait">
            <PageTransition key="hotel-dash">
              <HotelDashboard userEmail={user.email} firebaseUid={user.uid} onSignOut={handleSignOut} />
            </PageTransition>
          </AnimatePresence>
        </div>
      );
    }

    if (currentRole === 'ngo') {
      return (
        <div>
          <Navbar userEmail={user.email} userRole="ngo" activeTab={currentNavState.tab} onSelectTab={(tab) => pushNavState({ screen: 'dashboard', tab })} onSignOut={handleSignOut} />
          <AnimatePresence mode="wait">
            <PageTransition key="ngo-dash">
              <NgoDashboard userEmail={user.email} firebaseUid={user.uid} onSignOut={handleSignOut} />
            </PageTransition>
          </AnimatePresence>
        </div>
      );
    }

    if (currentRole === 'recycler') {
      return (
        <div>
          <Navbar userEmail={user.email} userRole="recycler" activeTab={currentNavState.tab} onSelectTab={(tab) => pushNavState({ screen: 'dashboard', tab })} onSignOut={handleSignOut} />
          <AnimatePresence mode="wait">
            <PageTransition key="recycler-dash">
              <RecyclerDashboard userEmail={user.email} firebaseUid={user.uid} onSignOut={handleSignOut} />
            </PageTransition>
          </AnimatePresence>
        </div>
      );
    }
  }

  // Unauthenticated flow screens
  return (
    <AnimatePresence mode="wait">
      {screen === 'welcome' && (
        <PageTransition key="welcome">
          <Welcome
            onGetStarted={(mode) => {
              setAuthMode(mode);
              navigateScreen('roleSelect');
            }}
          />
        </PageTransition>
      )}

      {screen === 'roleSelect' && (
        <PageTransition key="roleSelect">
          <RoleSelect
            onSelectRole={(r) => {
              sessionStorage.setItem('circularaid_selected_role', r);
              setSelectedRole(r);
              navigateScreen('auth');
            }}
            onBack={() => navigateScreen('welcome')}
          />
        </PageTransition>
      )}

      {screen === 'auth' && (
        <PageTransition key="auth">
          <Login
            mode={authMode}
            role={selectedRole || sessionStorage.getItem('circularaid_selected_role')}
            onBack={() => navigateScreen('roleSelect')}
            onLogin={() => {
              const r = selectedRole || sessionStorage.getItem('circularaid_selected_role');
              if (user) syncUserWithBackend(user, r);
              navigateScreen('dashboard');
            }}
          />
        </PageTransition>
      )}
    </AnimatePresence>
  );
}

export default App;