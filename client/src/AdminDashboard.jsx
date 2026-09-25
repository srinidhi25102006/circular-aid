import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NgoDetailsView from './NgoDetailsView';
import HotelDetailsView from './HotelDetailsView';
import RecyclerDetailsView from './RecyclerDetailsView';
import GlobalNavControls from './GlobalNavControls';

function AdminDashboard({ userEmail, onSignOut }) {
  const [ngos, setNgos] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab State: 'ngo' | 'hotel' | 'recycler' | 'donations' | 'pendingAll'
  const [activeTab, setActiveTab] = useState('ngo');

  // NGO Management Filters State
  const [ngoStatusFilter, setNgoStatusFilter] = useState('PENDING');
  const [ngoSearchQuery, setNgoSearchQuery] = useState('');
  const [selectedNgoData, setSelectedNgoData] = useState(null);

  // Hotel Management Filters State
  const [hotelStatusFilter, setHotelStatusFilter] = useState('PENDING');
  const [hotelSearchQuery, setHotelSearchQuery] = useState('');
  const [selectedHotelData, setSelectedHotelData] = useState(null);

  // Recycler Management Filters State
  const [recyclerStatusFilter, setRecyclerStatusFilter] = useState('PENDING');
  const [recyclerSearchQuery, setRecyclerSearchQuery] = useState('');
  const [selectedRecyclerData, setSelectedRecyclerData] = useState(null);

  // Donation Audit State
  const [selectedDonationAudit, setSelectedDonationAudit] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [resettingData, setResettingData] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ngosRes, hotelsRes, recyclersRes, donationsRes, pendingRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/ngos?status=ALL'),
        fetch('http://localhost:5000/api/admin/hotels?status=ALL'),
        fetch('http://localhost:5000/api/admin/recyclers?status=ALL'),
        fetch('http://localhost:5000/api/admin/donations'),
        fetch('http://localhost:5000/api/admin/pending-users'),
        fetch('http://localhost:5000/api/admin/stats'),
      ]);

      const ngosData = await ngosRes.json();
      const hotelsData = await hotelsRes.json();
      const recyclersData = await recyclersRes.json();
      const donationsData = await donationsRes.json();
      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();

      if (Array.isArray(ngosData)) setNgos(ngosData);
      if (Array.isArray(hotelsData)) setHotels(hotelsData);
      if (Array.isArray(recyclersData)) setRecyclers(recyclersData);
      if (Array.isArray(donationsData)) setDonations(donationsData);
      if (Array.isArray(pendingData)) setPendingUsers(pendingData);
      if (statsData && !statsData.error) setStats(statsData);

      if (selectedNgoData) {
        const fresh = ngosData.find((n) => n.id === selectedNgoData.id);
        if (fresh) setSelectedNgoData(fresh);
      }
      if (selectedHotelData) {
        const fresh = hotelsData.find((h) => h.id === selectedHotelData.id);
        if (fresh) setSelectedHotelData(fresh);
      }
      if (selectedRecyclerData) {
        const fresh = recyclersData.find((r) => r.id === selectedRecyclerData.id);
        if (fresh) setSelectedRecyclerData(fresh);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetData = async () => {
    if (!window.confirm('⚠️ Reset Platform Database?\n\nThis will wipe all existing users, device scans, recycling centre applications, and food donations to start completely fresh. Are you sure?')) {
      return;
    }
    setResettingData(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/reset-data', { method: 'POST' });
      if (res.ok) {
        alert('✓ Platform database reset successfully!');
        fetchData();
      }
    } catch (err) {
      alert('Failed to reset data: ' + err.message);
    } finally {
      setResettingData(false);
    }
  };

  const handleVerifyQuick = async (userId, status, notes = '') => {
    setProcessingId(userId);
    let adminNotes = notes;
    if (status === 'REJECTED' && !notes) {
      adminNotes = prompt('Please enter a rejection reason for the applicant:') || 'Registration requirements not met.';
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status, adminNotes }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered NGOs
  const filteredNgos = ngos.filter((u) => {
    if (ngoStatusFilter !== 'ALL' && u.verificationStatus !== ngoStatusFilter) return false;
    const p = u.ngoProfile || {};
    const q = ngoSearchQuery.toLowerCase().trim();
    if (q) {
      const matchesName = (p.ngoName || '').toLowerCase().includes(q);
      const matchesContact = (p.contactPerson || '').toLowerCase().includes(q);
      const matchesReg = (p.registrationNumber || '').toLowerCase().includes(q);
      const matchesEmail = (u.email || '').toLowerCase().includes(q);
      if (!matchesName && !matchesContact && !matchesReg && !matchesEmail) return false;
    }
    return true;
  });

  // Filtered Hotels
  const filteredHotels = hotels.filter((u) => {
    if (hotelStatusFilter !== 'ALL' && u.verificationStatus !== hotelStatusFilter) return false;
    const p = u.hotelProfile || {};
    const q = hotelSearchQuery.toLowerCase().trim();
    if (q) {
      const matchesName = (p.hotelName || '').toLowerCase().includes(q);
      const matchesManager = (p.managerName || '').toLowerCase().includes(q);
      const matchesGst = (p.gstNumber || '').toLowerCase().includes(q);
      const matchesEmail = (u.email || '').toLowerCase().includes(q);
      if (!matchesName && !matchesManager && !matchesGst && !matchesEmail) return false;
    }
    return true;
  });

  // Filtered Recyclers
  const filteredRecyclers = recyclers.filter((u) => {
    if (recyclerStatusFilter !== 'ALL' && u.verificationStatus !== recyclerStatusFilter) return false;
    const p = u.recyclingCenterProfile || {};
    const q = recyclerSearchQuery.toLowerCase().trim();
    if (q) {
      const matchesName = (p.centerName || '').toLowerCase().includes(q);
      const matchesContact = (p.contactPerson || '').toLowerCase().includes(q);
      const matchesLicense = (p.licenseNumber || '').toLowerCase().includes(q);
      const matchesEmail = (u.email || '').toLowerCase().includes(q);
      if (!matchesName && !matchesContact && !matchesLicense && !matchesEmail) return false;
    }
    return true;
  });

  // Counts
  const pendingNgoCount = ngos.filter((n) => n.verificationStatus === 'PENDING').length;
  const pendingHotelCount = hotels.filter((h) => h.verificationStatus === 'PENDING').length;
  const pendingRecyclerCount = recyclers.filter((r) => r.verificationStatus === 'PENDING').length;

  const renderStatusPill = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-success">Approved / Verified</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">Rejected</span>;
      case 'INFO_REQUESTED':
        return <span className="badge badge-warning">Info Requested</span>;
      default:
        return <span className="badge badge-warning">Pending Verification</span>;
    }
  };

  // If viewing dedicated NGO details page
  if (selectedNgoData) {
    return (
      <NgoDetailsView
        ngoData={selectedNgoData}
        onBack={() => {
          setSelectedNgoData(null);
          fetchData();
        }}
        onStatusUpdate={fetchData}
      />
    );
  }

  // If viewing dedicated Hotel details page
  if (selectedHotelData) {
    return (
      <HotelDetailsView
        hotelData={selectedHotelData}
        onBack={() => {
          setSelectedHotelData(null);
          fetchData();
        }}
        onStatusUpdate={fetchData}
      />
    );
  }

  // If viewing dedicated Recycler details page
  if (selectedRecyclerData) {
    return (
      <RecyclerDetailsView
        recyclerData={selectedRecyclerData}
        onBack={() => {
          setSelectedRecyclerData(null);
          fetchData();
        }}
        onStatusUpdate={fetchData}
      />
    );
  }

  return (
    <div className="page fade-in">
      <div className="container-lg">
        {/* Portal Header */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <GlobalNavControls />
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#17352D', margin: 0 }}>
                🛡️ Governance & Platform Administration
              </h1>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
              Verify recycling facilities, approve NGOs & hotels, and manage platform data.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn btn-danger"
              style={{ width: 'auto', padding: '8px 16px', fontSize: 12, fontWeight: 800, marginBottom: 0 }}
              onClick={handleResetData}
              disabled={resettingData}
            >
              {resettingData ? 'Wiping Data...' : '🧹 Reset Database'}
            </button>
            <span className="badge badge-info" style={{ padding: '8px 16px', background: 'var(--admin-accent-light)', color: 'var(--admin-accent-dark)', border: '1px solid var(--admin-accent-border)' }}>
              System Administrator
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-box">
              <div style={{ fontSize: 24, marginBottom: 4 }}>🏭</div>
              <div className="stat-value" style={{ color: 'var(--ewaste-accent)' }}>{recyclers.length}</div>
              <div className="stat-label">Recycling Plants ({pendingRecyclerCount} Pending)</div>
            </div>
            <div className="stat-box">
              <div style={{ fontSize: 24, marginBottom: 4 }}>🏢</div>
              <div className="stat-value" style={{ color: 'var(--ngo-accent)' }}>{ngos.length}</div>
              <div className="stat-label">Registered NGOs ({pendingNgoCount} Pending)</div>
            </div>
            <div className="stat-box">
              <div style={{ fontSize: 24, marginBottom: 4 }}>🏨</div>
              <div className="stat-value" style={{ color: 'var(--food-accent)' }}>{hotels.length}</div>
              <div className="stat-label">Registered Hotels ({pendingHotelCount} Pending)</div>
            </div>
            <div className="stat-box">
              <div style={{ fontSize: 24, marginBottom: 4 }}>📦</div>
              <div className="stat-value" style={{ color: 'var(--admin-accent)' }}>{donations.length}</div>
              <div className="stat-label">Total Donations Logged</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'recycler' ? 'btn-recycler' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => setActiveTab('recycler')}
          >
            🏭 Recycling Facilities ({recyclers.length})
          </button>
          <button
            className={`btn ${activeTab === 'ngo' ? 'btn-ngo' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => setActiveTab('ngo')}
          >
            🏢 NGO Verification ({ngos.length})
          </button>
          <button
            className={`btn ${activeTab === 'hotel' ? 'btn-food' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => setActiveTab('hotel')}
          >
            🏨 Hotel Verification ({hotels.length})
          </button>
          <button
            className={`btn ${activeTab === 'donations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14, fontWeight: 800, marginBottom: 0 }}
            onClick={() => setActiveTab('donations')}
          >
            📦 Food Audit ({donations.length})
          </button>
          <button
            className={`btn ${activeTab === 'pendingAll' ? 'btn-outline' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14, fontWeight: 700, marginBottom: 0 }}
            onClick={() => setActiveTab('pendingAll')}
          >
            📋 Global Queue ({pendingUsers.length})
          </button>
        </div>

        {/* 0. RECYCLING CENTRES MANAGEMENT TAB */}
        {activeTab === 'recycler' && (
          <div className="card card-recycler">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 className="title" style={{ fontSize: 20, marginBottom: 2 }}>Recycling Facilities & E-Waste Hub Directory</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  Inspect PCB license credentials, proof documents, GPS coordinates, and approve or reject recycling plants. Only approved plants appear in public user searches.
                </p>
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0 }} onClick={fetchData}>
                🔄 Refresh Directory
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['PENDING', 'ALL', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: recyclerStatusFilter === st ? 'var(--recycler-accent-dark)' : 'var(--bg)',
                    color: recyclerStatusFilter === st ? '#ffffff' : 'var(--text)',
                  }}
                  onClick={() => setRecyclerStatusFilter(st)}
                >
                  {st === 'PENDING' ? `⏳ Pending Approval (${pendingRecyclerCount})` : st}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search Recycling Plants by name, email, license #..."
              value={recyclerSearchQuery}
              onChange={(e) => setRecyclerSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            {/* Table */}
            {filteredRecyclers.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 700 }}>No Recycling Plants matching current filter</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--recycler-accent-light)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px' }}>Facility Name</th>
                      <th style={{ padding: '12px' }}>License & Proof</th>
                      <th style={{ padding: '12px' }}>Address & Location</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecyclers.map((u) => {
                      const p = u.recyclingCenterProfile || {};
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 800, color: 'var(--text)' }}>🏭 {p.centerName || u.email}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Contact: {p.contactPerson || 'N/A'} ({p.phone || u.email})</div>
                          </td>
                          <td style={{ padding: '12px', fontSize: 13 }}>
                            <div><b>License:</b> {p.licenseNumber || 'N/A'}</div>
                            {p.documentUrl ? (
                              <a href={p.documentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                                📄 View Submitted Document
                              </a>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--muted)' }}>No Document Uploaded</span>
                            )}
                          </td>
                          <td style={{ padding: '12px', fontSize: 13 }}>
                            📍 {p.address || 'N/A'}
                            {p.latitude && p.longitude && (
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>GPS: ({p.latitude}, {p.longitude})</div>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>{renderStatusPill(u.verificationStatus)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ width: 'auto', padding: '6px 12px', fontSize: 12, fontWeight: 700, marginBottom: 0 }}
                                onClick={() => setSelectedRecyclerData(u)}
                              >
                                🔍 View Details
                              </button>
                              {u.verificationStatus !== 'APPROVED' && (
                                <button
                                  className="btn btn-primary"
                                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, fontWeight: 700, marginBottom: 0 }}
                                  disabled={processingId === u.id}
                                  onClick={() => handleVerifyQuick(u.id, 'APPROVED')}
                                >
                                  ✓ Approve
                                </button>
                              )}
                              {u.verificationStatus !== 'REJECTED' && (
                                <button
                                  className="btn btn-danger"
                                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, fontWeight: 700, marginBottom: 0 }}
                                  disabled={processingId === u.id}
                                  onClick={() => handleVerifyQuick(u.id, 'REJECTED')}
                                >
                                  ✕ Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 1. NGO MANAGEMENT TAB */}
        {activeTab === 'ngo' && (
          <div className="card card-ngo">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 className="title" style={{ fontSize: 20, marginBottom: 2 }}>NGO Verification Directory</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Inspect NGO credentials, OpenStreetMap location, certificate documents, approve or request info</p>
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0 }} onClick={fetchData}>
                🔄 Refresh
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['PENDING', 'ALL', 'APPROVED', 'INFO_REQUESTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: ngoStatusFilter === st ? 'var(--ngo-accent-dark)' : 'var(--bg)',
                    color: ngoStatusFilter === st ? '#ffffff' : 'var(--text)',
                  }}
                  onClick={() => setNgoStatusFilter(st)}
                >
                  {st === 'PENDING' ? `⏳ Pending (${pendingNgoCount})` : st}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search NGOs by name, email, reg #..."
              value={ngoSearchQuery}
              onChange={(e) => setNgoSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            {/* Table */}
            {filteredNgos.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 700 }}>No NGOs matching current filter</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--ngo-accent-light)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px' }}>NGO</th>
                      <th style={{ padding: '12px' }}>Location</th>
                      <th style={{ padding: '12px' }}>Submitted</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNgos.map((u) => {
                      const p = u.ngoProfile || {};
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 800 }}>{p.ngoName || u.email}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Reg #: {p.registrationNumber || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '12px', fontSize: 13 }}>📍 {p.address || 'N/A'}</td>
                          <td style={{ padding: '12px', fontSize: 13 }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                          </td>
                          <td style={{ padding: '12px' }}>{renderStatusPill(u.verificationStatus)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button className="btn btn-ngo" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, fontWeight: 700, marginBottom: 0 }} onClick={() => setSelectedNgoData(u)}>
                              View Details →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. HOTEL MANAGEMENT TAB */}
        {activeTab === 'hotel' && (
          <div className="card card-hotel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 className="title" style={{ fontSize: 20, marginBottom: 2 }}>Hotel & Restaurant Verification Directory</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Inspect hotel capacity, FSSAI/GST license documents, OpenStreetMap location, approve or request info</p>
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0 }} onClick={fetchData}>
                🔄 Refresh
              </button>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['PENDING', 'ALL', 'APPROVED', 'INFO_REQUESTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: hotelStatusFilter === st ? 'var(--food-accent-dark)' : 'var(--bg)',
                    color: hotelStatusFilter === st ? '#ffffff' : 'var(--text)',
                  }}
                  onClick={() => setHotelStatusFilter(st)}
                >
                  {st === 'PENDING' ? `⏳ Pending (${pendingHotelCount})` : st}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search Hotels by name, manager, GST #..."
              value={hotelSearchQuery}
              onChange={(e) => setHotelSearchQuery(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            {/* Table */}
            {filteredHotels.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 700 }}>No Hotels matching current filter</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--food-accent-light)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px' }}>Hotel</th>
                      <th style={{ padding: '12px' }}>Location</th>
                      <th style={{ padding: '12px' }}>Submitted</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHotels.map((u) => {
                      const p = u.hotelProfile || {};
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 800 }}>{p.hotelName || u.email}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Manager: {p.managerName || 'N/A'} &bull; GST: {p.gstNumber}</div>
                          </td>
                          <td style={{ padding: '12px', fontSize: 13 }}>📍 {p.address || 'N/A'}</td>
                          <td style={{ padding: '12px', fontSize: 13 }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                          </td>
                          <td style={{ padding: '12px' }}>{renderStatusPill(u.verificationStatus)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button className="btn btn-food" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, fontWeight: 700, marginBottom: 0 }} onClick={() => setSelectedHotelData(u)}>
                              View Details →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. FOOD DONATION AUDIT & MONITORING TAB */}
        {activeTab === 'donations' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 className="title" style={{ fontSize: 20, marginBottom: 2 }}>Food Donation Monitoring & Audit Logs</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Monitor all live platform donations, inspect complete chat history transcripts and handover proof photos</p>
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0 }} onClick={fetchData}>
                🔄 Refresh Audit Logs
              </button>
            </div>

            {donations.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 700 }}>No food donations logged yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px' }}>Hotel</th>
                      <th style={{ padding: '12px' }}>Matched NGO</th>
                      <th style={{ padding: '12px' }}>Food & Quantity</th>
                      <th style={{ padding: '12px' }}>Timeline Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => {
                      const hotelName = d.hotelUser?.hotelProfile?.hotelName || 'Hotel';
                      const ngoName = d.matchedNgoUser?.ngoProfile?.ngoName || 'Pending NGO';

                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 800 }}>🏨 {hotelName}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--ngo-accent-dark)' }}>🏢 {ngoName}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600 }}>{d.foodDescription || d.foodType}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{d.quantity} &bull; Pickup: {d.pickupWindowStart} - {d.pickupWindowEnd}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${d.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                              {d.timelineStatus || d.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ width: 'auto', padding: '6px 14px', fontSize: 12, fontWeight: 700, marginBottom: 0 }}
                              onClick={() => setSelectedDonationAudit(d)}
                            >
                              Inspect Audit →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. GLOBAL PENDING QUEUE TAB */}
        {activeTab === 'pendingAll' && (
          <div className="card card-admin">
            <h2 className="title" style={{ fontSize: 20, marginBottom: 12 }}>Global Organization Queue</h2>
            <div className="grid-2">
              {pendingUsers.map((u) => {
                const p = u.hotelProfile || u.ngoProfile || u.recyclingCenterProfile || {};
                const orgName = p.hotelName || p.ngoName || p.centerName || u.email;
                return (
                  <div key={u.id} className="card" style={{ padding: 18, border: '1px solid var(--border)', marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{orgName}</span>
                      <span className="badge badge-warning">{u.role}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, marginBottom: 12 }}>Address: {p.address || 'N/A'} &bull; Phone: {p.phone || 'N/A'}</p>
                    <div className="row" style={{ width: '100%', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ marginBottom: 0, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}
                        onClick={() => {
                          if (u.role === 'RECYCLER' || u.recyclingCenterProfile) {
                            setSelectedRecyclerData(u);
                          } else if (u.role === 'NGO' || u.ngoProfile) {
                            setSelectedNgoData(u);
                          } else if (u.role === 'HOTEL' || u.hotelProfile) {
                            setSelectedHotelData(u);
                          }
                        }}
                      >
                        🔍 View Details & Document
                      </button>
                      <button className="btn btn-primary" style={{ marginBottom: 0, padding: '6px 12px', fontSize: 12, fontWeight: 700 }} disabled={processingId === u.id} onClick={() => handleVerifyQuick(u.id, 'APPROVED')}>
                        ✓ Approve
                      </button>
                      <button className="btn btn-danger" style={{ marginBottom: 0, padding: '6px 12px', fontSize: 12, fontWeight: 700 }} disabled={processingId === u.id} onClick={() => handleVerifyQuick(u.id, 'REJECTED')}>
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DONATION AUDIT INSPECTION MODAL */}
        <AnimatePresence>
          {selectedDonationAudit && (
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
                style={{ maxWidth: 750, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24, textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Donation Audit Record</h3>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>ID: {selectedDonationAudit.id}</p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 12px', fontSize: 12, marginBottom: 0 }} onClick={() => setSelectedDonationAudit(null)}>
                    ✕ Close
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'var(--bg)', padding: 14, borderRadius: 10, marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Donor Hotel</span>
                    <p style={{ fontWeight: 800, color: 'var(--food-accent-dark)', margin: 0 }}>
                      🏨 {selectedDonationAudit.hotelUser?.hotelProfile?.hotelName || 'Hotel'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Recipient NGO</span>
                    <p style={{ fontWeight: 800, color: 'var(--ngo-accent-dark)', margin: 0 }}>
                      🏢 {selectedDonationAudit.matchedNgoUser?.ngoProfile?.ngoName || 'Pending NGO'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Food & Quantity</span>
                    <p style={{ fontWeight: 700, margin: 0 }}>{selectedDonationAudit.foodDescription || selectedDonationAudit.foodType} ({selectedDonationAudit.quantity})</p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status Timeline</span>
                    <p style={{ fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{selectedDonationAudit.timelineStatus || selectedDonationAudit.status}</p>
                  </div>
                </div>

                {/* Handover Proof Photo */}
                {selectedDonationAudit.handoverPhotoUrl && (
                  <div style={{ marginBottom: 16, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 14, borderRadius: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#047857', display: 'block', marginBottom: 6 }}>
                      ✅ Verified Handover Proof Photo:
                    </span>
                    <img src={selectedDonationAudit.handoverPhotoUrl} alt="Handover Proof" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8 }} />
                  </div>
                )}

                {/* Chat History Transcript */}
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                    💬 Complete Coordination Chat History Transcript:
                  </span>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', maxHeight: 200, overflowY: 'auto' }}>
                    {selectedDonationAudit.messages?.length === 0 ? (
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>No messages recorded.</p>
                    ) : (
                      selectedDonationAudit.messages?.map((m) => (
                        <div key={m.id} style={{ fontSize: 12, marginBottom: 6, paddingBottom: 6, borderBottom: '1px dashed #cbd5e1' }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>[{m.senderRole}]</span> {m.messageText}
                          <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>{new Date(m.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminDashboard;
