import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ChatBox({ donation, userRole, userEmail, userUid, onClose, onRefresh }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [handoverPhoto, setHandoverPhoto] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);

  const messagesEndRef = useRef(null);

  const donationId = donation?.id;
  const currentTimeline = donation?.timelineStatus || 'REQUEST_SENT';
  const isHotel = userRole === 'hotel' || userRole === 'HOTEL';
  const otherRoleName = isHotel
    ? donation?.matchedNgoUser?.ngoProfile?.ngoName || 'NGO'
    : donation?.hotelUser?.hotelProfile?.hotelName || 'Hotel';

  const fetchMessages = async () => {
    if (!donationId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/donations/${donationId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3s for real-time messages
    return () => clearInterval(interval);
  }, [donationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timeline Stages
  const TIMELINE_STAGES = [
    { key: 'REQUEST_SENT', label: 'Request Sent', icon: '📢' },
    { key: 'ACCEPTED', label: 'Accepted', icon: '✅' },
    { key: 'FOOD_PREPARED', label: 'Preparing', icon: '🍳' },
    { key: 'FOOD_READY', label: 'Food Ready', icon: '🍱' },
    { key: 'VOLUNTEER_ON_THE_WAY', label: 'En Route', icon: '🚗' },
    { key: 'ARRIVED', label: 'Arrived', icon: '🟢' },
    { key: 'HANDOVER_COMPLETED', label: 'Handover', icon: '📦' },
    { key: 'COMPLETED', label: 'Completed', icon: '🎉' },
  ];

  const getCurrentStageIndex = () => {
    const idx = TIMELINE_STAGES.findIndex((s) => s.key === currentTimeline);
    return idx === -1 ? 0 : idx;
  };
  const activeStageIdx = getCurrentStageIndex();

  const handleSendMessage = async (customText, actionType) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    setSending(true);
    try {
      await fetch(`http://localhost:5000/api/donations/${donationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderUserId: userUid || 'current_user',
          senderRole: isHotel ? 'HOTEL' : 'NGO',
          messageText: textToSend,
          actionType: actionType || null,
        }),
      });

      setInputText('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = async (actionKey, defaultText, targetTimelineState) => {
    await handleSendMessage(defaultText, actionKey);

    if (targetTimelineState && targetTimelineState !== currentTimeline) {
      try {
        await fetch(`http://localhost:5000/api/donations/${donationId}/timeline`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timelineStatus: targetTimelineState,
            senderRole: isHotel ? 'HOTEL' : 'NGO',
            senderUserId: userUid,
            actionType: actionKey,
            text: defaultText,
          }),
        });
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleHandoverPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setHandoverPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitHandoverProof = async (e) => {
    e.preventDefault();
    setSubmittingHandover(true);

    try {
      const res = await fetch(`http://localhost:5000/api/donations/${donationId}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handoverPhotoUrl: handoverPhoto,
        }),
      });

      if (res.ok) {
        setHandoverModalOpen(false);
        if (onRefresh) onRefresh();
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingHandover(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container-lg" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '7px 16px', fontSize: 13, marginBottom: 0, fontWeight: 700 }} onClick={onClose}>
            ← Back to Command Center
          </button>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-info" style={{ fontSize: 12 }}>
              Active Coordination &bull; {otherRoleName}
            </span>
          </div>
        </div>

        {/* Donation Info Card & Timeline */}
        <div className="card" style={{ marginBottom: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: 19, color: 'var(--text)' }}>
                {donation?.foodDescription || donation?.foodType || 'Food Donation'}
              </span>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0 0' }}>
                Quantity: <b>{donation?.quantity}</b> &bull; Prepared: {donation?.preparedAt || 'Fresh'} &bull; Consume By: <b>{donation?.bestBefore || 'Tonight'}</b>
              </p>
            </div>
            {donation?.photoUrl && (
              <img src={donation.photoUrl} alt="Food Photo" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />
            )}
          </div>

          {/* 8-Stage Timeline Progress Bar */}
          <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              📋 Donation Status Timeline
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              {TIMELINE_STAGES.map((st, idx) => {
                const isPassed = idx <= activeStageIdx;
                const isCurrent = idx === activeStageIdx;
                return (
                  <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        background: isCurrent ? 'var(--primary)' : isPassed ? 'var(--success)' : '#e2e8f0',
                        color: isPassed ? '#ffffff' : 'var(--muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 800,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {st.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? 'var(--primary)' : isPassed ? 'var(--text)' : 'var(--muted)',
                        marginTop: 4,
                        textAlign: 'center',
                      }}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick-Action Buttons Bar */}
        <div className="card" style={{ marginBottom: 16, padding: 16, background: 'linear-gradient(135deg, #f8fcf9 0%, #f1f8f4 100%)' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            ⚡ Useful Quick-Action Buttons ({isHotel ? 'Hotel Actions' : 'NGO Actions'})
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {isHotel ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                  onClick={() => handleQuickAction('FOOD_READY', '🍱 Food is packed and ready for pickup!', 'FOOD_READY')}
                >
                  🍱 Food Ready
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                  onClick={() => handleQuickAction('LOCATION', `📍 Address: ${donation?.hotelUser?.hotelProfile?.address || 'Hotel Reception'}`, null)}
                >
                  📍 Share Location
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                  onClick={() => handleQuickAction('TIMING', `⏰ Pickup Window: ${donation?.pickupWindowStart} - ${donation?.pickupWindowEnd}`, null)}
                >
                  ⏰ Change Pickup Time
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                  onClick={() => handleQuickAction('ARRIVED_CHECK', '🚗 Has your volunteer arrived at hotel reception?', null)}
                >
                  🚗 Volunteer Arrived?
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-food"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0, fontWeight: 800 }}
                  onClick={() => handleQuickAction('HANDOVER', '✅ Handover completed! Thank you for rescuing food.', 'HANDOVER_COMPLETED')}
                >
                  ✅ Handover Completed
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                  onClick={() => handleQuickAction('VOLUNTEER_ON_THE_WAY', '🚗 Our NGO volunteer is on the way for pickup.', 'VOLUNTEER_ON_THE_WAY')}
                >
                  🚗 Volunteer On The Way
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                  onClick={() => handleQuickAction('ARRIVED', '🟢 We have arrived at the hotel reception!', 'ARRIVED')}
                >
                  🟢 We\'ve Arrived
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                  onClick={() => handleQuickAction('TIMING', '⏰ Updated volunteer arrival time: 15-20 mins.', null)}
                >
                  ⏰ Change Arrival Time
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-ngo"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0, fontWeight: 800 }}
                  onClick={() => setHandoverModalOpen(true)}
                >
                  ✅ Food Received (Upload Photo Proof)
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="card" style={{ padding: 20, height: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', margin: 'auto', fontSize: 13 }}>
                💬 No messages yet. Send a message or tap a quick-action button to coordinate!
              </div>
            ) : (
              messages.map((m) => {
                const isSystem = m.senderRole === 'SYSTEM';
                const isMine = m.senderRole === (isHotel ? 'HOTEL' : 'NGO');

                if (isSystem) {
                  return (
                    <div key={m.id} style={{ textAlign: 'center', margin: '6px 0' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, padding: '4px 12px', borderRadius: 14, border: '1px solid #cbd5e1', fontWeight: 600 }}>
                        {m.messageText}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isMine ? (isHotel ? 'var(--food-accent-dark)' : 'var(--ngo-accent-dark)') : 'var(--bg)',
                        color: isMine ? '#ffffff' : 'var(--text)',
                        border: isMine ? 'none' : '1px solid var(--border)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 700, marginBottom: 2 }}>
                        {m.senderRole} &bull; {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>{m.messageText}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Text Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}
          >
            <input
              type="text"
              className="input-field"
              placeholder={`Message ${otherRoleName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button
              type="submit"
              className={`btn ${isHotel ? 'btn-food' : 'btn-ngo'}`}
              style={{ width: 'auto', padding: '0 20px', marginBottom: 0, fontWeight: 800 }}
              disabled={sending || !inputText.trim()}
            >
              Send 🚀
            </button>
          </form>
        </div>

        {/* HANDOVER PHOTO PROOF MODAL */}
        <AnimatePresence>
          {handoverModalOpen && (
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
                style={{ maxWidth: 500, width: '100%', padding: 24, textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>Confirm Handover & Photo Proof</h3>
                  <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 12px', fontSize: 12, marginBottom: 0 }} onClick={() => setHandoverModalOpen(false)}>
                    ✕ Close
                  </button>
                </div>

                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                  Attach an optional photo of the received food boxes to complete the donation audit trail.
                </p>

                <form onSubmit={handleSubmitHandoverProof}>
                  <div className="form-group">
                    <label className="form-label">Handover Proof Photo</label>
                    <label className="upload-box" style={{ padding: 16, background: 'var(--ngo-accent-light)', borderColor: 'var(--ngo-accent-border)' }}>
                      <input type="file" accept="image/*" onChange={handleHandoverPhotoUpload} style={{ display: 'none' }} />
                      {handoverPhoto ? '📸 Photo Attached (Tap to Change)' : '📷 Tap to Upload Handover Photo'}
                    </label>
                    {handoverPhoto && (
                      <img src={handoverPhoto} alt="Handover Proof" className="preview-img" style={{ maxHeight: 150, marginTop: 8 }} />
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="btn btn-ngo"
                    disabled={submittingHandover}
                    style={{ fontWeight: 800 }}
                  >
                    {submittingHandover ? 'Verifying Handover...' : '✅ Confirm Food Received'}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ChatBox;
