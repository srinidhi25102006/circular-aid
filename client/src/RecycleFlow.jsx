import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Haversine distance formula calculation in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

const MOCK_FALLBACK_CENTERS = [
  {
    id: 'mock-1',
    name: 'GreenTech E-Waste Recycling Hub',
    address: '24 Anna Salai, Chennai, TN',
    latitude: 13.0827,
    longitude: 80.2707,
    rating: 4.8,
    operatingHours: '8:00 AM - 7:30 PM',
    acceptedMaterials: ['Smartphones', 'Laptops', 'Batteries', 'Circuit Boards', 'Appliances'],
    phone: '+91 98765 43210',
    verified: true,
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    description: 'Authorized e-waste processing facility specializing in precious metal extraction and lithium safety handling.',
  },
  {
    id: 'mock-2',
    name: 'EcoRecycle Battery & Solar Plant',
    address: '102 Mount Road, Guindy, Chennai',
    latitude: 13.0067,
    longitude: 80.2206,
    rating: 4.6,
    operatingHours: '9:00 AM - 6:00 PM',
    acceptedMaterials: ['Lithium Batteries', 'Solar Panels', 'Power Modules', 'UPS'],
    phone: '+91 98123 45678',
    verified: true,
    photoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    description: 'Certified hazardous battery recovery unit with zero-landfill eco compliance.',
  },
  {
    id: 'mock-3',
    name: 'ReNew Electronics & PC Processor Plant',
    address: '45 OMR IT Corridor, Perungudi, Chennai',
    latitude: 12.9654,
    longitude: 80.2461,
    rating: 4.9,
    operatingHours: '8:30 AM - 8:00 PM',
    acceptedMaterials: ['Laptops', 'Desktops', 'Monitors', 'Servers', 'Printed Circuit Boards'],
    phone: '+91 97890 12345',
    verified: true,
    photoUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
    description: 'High-capacity industrial e-waste shredder and copper refining center.',
  },
];

function cleanJson(raw) {
  if (typeof raw === 'object' && raw !== null) return raw;
  const stripped = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

function RecycleFlow({ firebaseUid, userEmail, onExit, onComplete }) {
  const [step, setStep] = useState('capture'); // capture -> analyzing -> quality_fail -> hazard -> low_confidence -> route -> matching -> schedule -> confirmed
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [choice, setChoice] = useState(null); // 'donate' | 'recycle'
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [inspectCenterModal, setInspectCenterModal] = useState(null);
  const [pickupMethod, setPickupMethod] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // User Location State
  const [userLocation, setUserLocation] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
    addressText: 'Chennai, TN',
    isCustomSearch: false,
    loadingLocation: false,
  });
  const [manualLocationInput, setManualLocationInput] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/recycling-centers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCenters(data);
        } else {
          setCenters(MOCK_FALLBACK_CENTERS);
        }
      })
      .catch(() => setCenters(MOCK_FALLBACK_CENTERS));
  }, []);

  // Geolocation API handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter your location manually.');
      return;
    }
    setUserLocation((prev) => ({ ...prev, loadingLocation: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          addressText: `GPS (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`,
          isCustomSearch: false,
          loadingLocation: false,
        });
      },
      (err) => {
        console.warn('Geolocation access denied or failed:', err.message);
        setUserLocation((prev) => ({ ...prev, loadingLocation: false }));
        setError('Could not access device GPS. Please enter your city or postal address manually below.');
      }
    );
  };

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    if (!manualLocationInput.trim()) return;
    setUserLocation({
      latitude: 13.0827,
      longitude: 80.2707,
      addressText: manualLocationInput,
      isCustomSearch: true,
      loadingLocation: false,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const runAnalysis = () => {
    if (!image) return setError('Please choose or take a photo first.');
    setStep('analyzing');
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await fetch('http://localhost:5000/api/analyze-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        const parsed = data.analysis || cleanJson(data.raw || '');

        if (!parsed) {
          setError('Could not parse device analysis results. Please try again.');
          setStep('capture');
          return;
        }

        setAnalysis(parsed);

        // Step 4 response handling
        if (parsed.image_quality_flag) {
          setStep('quality_fail');
        } else if (parsed.hazard_flags && parsed.hazard_flags.length > 0) {
          setStep('hazard');
        } else if (parsed.confidence_score === 'low') {
          setStep('low_confidence');
        } else {
          setStep('route');
        }
      } catch (err) {
        setError('Could not reach the backend server. Make sure node index.js is running on port 5000.');
        setStep('capture');
      }
    };
    reader.readAsDataURL(image);
  };

  const retake = () => {
    setImage(null);
    setPreview(null);
    setAnalysis(null);
    setStep('capture');
  };

  const proceedAfterCorrection = (correctedCondition) => {
    setAnalysis((a) => ({ ...a, estimated_condition: correctedCondition }));
    setStep('route');
  };

  const handleConfirmPickup = async (method) => {
    setPickupMethod(method);
    setSubmitting(true);
    try {
      await fetch('http://localhost:5000/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid,
          deviceType: analysis?.device_type || 'Electronic Device',
          estimatedCondition: analysis?.estimated_condition || 'damaged',
          visibleComponents: analysis?.visible_components || [],
          hazardFlags: analysis?.hazard_flags || [],
          confidenceScore: analysis?.confidence_score || 'high',
          recyclableMaterialEstimate: analysis?.recyclable_material_estimate || 'Plastics & Metals',
          recyclingCenterId: selectedCenter?.id?.startsWith('mock') ? null : selectedCenter?.id,
          pickupMethod: method,
        }),
      });

      setStep('confirmed');
    } catch (err) {
      console.error('Failed to save device record:', err);
      setStep('confirmed');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render star rating
  const renderStars = (score = 4) => {
    const num = Math.min(Math.max(score, 1), 5);
    return '⭐'.repeat(num) + '☆'.repeat(5 - num);
  };

  // Sort centers by distance
  const sortedCenters = [...centers].map((c) => {
    const dist = calculateDistanceKm(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude);
    return {
      ...c,
      distanceFormatted: dist ? `${dist} km away` : c.distance || '2.5 km away',
      numericDistance: dist ? parseFloat(dist) : 2.5,
    };
  }).sort((a, b) => a.numericDistance - b.numericDistance);

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: 740 }}>
        <button className="back-link" onClick={onExit}>← Back to Command Center</button>

        {/* STEP 1-2: Photo Capture / Upload */}
        {step === 'capture' && (
          <div className="card" style={{ borderTop: '4px solid var(--ewaste-accent)' }}>
            <span className="badge badge-info" style={{ marginBottom: 10 }}>Gemini AI Vision</span>
            <h2 className="title" style={{ fontSize: 24 }}>Scan Electronic Device</h2>
            <p className="subtitle">Take a live photo or upload an image of your old device. The entire uncropped product image will be scanned.</p>

            {/* UNCROPPED IMAGE PREVIEW CONTAINER */}
            <label className="upload-box" style={{ background: 'var(--ewaste-accent-light)', borderColor: 'var(--ewaste-accent-border)', padding: preview ? 12 : 36 }}>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
              {preview ? (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <img src={preview} alt="Uncropped Product Preview" className="preview-img-contain" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ewaste-accent-dark)' }}>📸 Complete Product Photo (Tap to Change)</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'block' }}>Tap to take photo or upload image</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'block' }}>Supports 1:1, 9:16 portrait, 16:9 landscape aspect ratios without cropping</span>
                </div>
              )}
            </label>

            {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 14 }}>⚠️ {error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-ewaste"
              onClick={runAnalysis}
              style={{ fontSize: 16, fontWeight: 800 }}
            >
              🤖 Analyze Complete Device with Gemini AI
            </motion.button>
          </div>
        )}

        {/* STEP 3: Analyzing State */}
        {step === 'analyzing' && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <p className="title" style={{ justifyContent: 'center' }}>Analyzing full product image...</p>
            <div className="spinner"></div>
            <p className="subtitle" style={{ maxWidth: 460, margin: '0 auto' }}>
              Gemini AI vision is detecting brand, device model, material chips, lithium battery hazards, and physical condition.
            </p>
          </div>
        )}

        {/* STEP 4a: Unclear image quality */}
        {step === 'quality_fail' && (
          <div className="card">
            <span className="badge badge-warning">Image Quality Issue</span>
            <h2 className="title" style={{ marginTop: 12 }}>Unclear Photo Quality</h2>
            <p className="subtitle">The photo quality is too dark or blurry to identify component details accurately. Please retake the photo in bright lighting.</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn btn-primary" onClick={retake}>
              Retake Photo
            </motion.button>
          </div>
        )}

        {/* STEP 4b: Hazard detected */}
        {step === 'hazard' && (
          <div className="card">
            <span className="badge badge-danger">Safety Hazard Warning</span>
            <h2 className="title" style={{ marginTop: 12 }}>Special Handling Required</h2>
            <p className="subtitle">
              Safety flags detected: <b>{analysis?.hazard_flags?.join(', ')}</b>. For user safety, this item cannot be donated for direct reuse and will be routed strictly to a specialized hazardous e-waste recycling plant.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-ewaste"
              onClick={() => { setChoice('recycle'); setStep('matching'); }}
            >
              Proceed to Hazardous Waste Plant →
            </motion.button>
          </div>
        )}

        {/* STEP 4c: Low confidence - manual correction */}
        {step === 'low_confidence' && (
          <div className="card">
            <span className="badge badge-warning">Low AI Confidence</span>
            <h2 className="title" style={{ marginTop: 12 }}>Confirm Device Condition</h2>
            <p className="subtitle">AI initial guess: <b>{analysis?.estimated_condition}</b>. Please select the accurate condition below:</p>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {['working', 'damaged', 'non-functional'].map((c) => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-secondary"
                  style={{ textTransform: 'capitalize', fontWeight: 700 }}
                  onClick={() => proceedAfterCorrection(c)}
                >
                  {c}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: DETAILED SCAN ANALYSIS RESULTS & ADVICE */}
        {step === 'route' && (
          <div className="card card-recycler" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="badge badge-success">✓ Complete Scan Analysis</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>Confidence: {analysis?.confidence_score || 'High'}</span>
            </div>

            {/* UNCROPPED PRODUCT IMAGE DISPLAY */}
            {preview && (
              <div style={{ background: '#0b1329', padding: 8, borderRadius: 16, marginBottom: 18 }}>
                <img src={preview} alt="Scanned Product" className="preview-img-contain" style={{ marginBottom: 0, maxHeight: 320 }} />
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', textAlign: 'center', marginTop: 6, fontWeight: 600 }}>
                  📸 Full uncropped product image scanned
                </span>
              </div>
            )}

            {/* BRAND & PRODUCT DETAILS GRID */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, marginBottom: 18, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Brand Detected</span>
                <span className="badge badge-info" style={{ textTransform: 'none' }}>
                  {analysis?.brand || 'Unknown / Unable to determine'}
                </span>
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#17352D', marginBottom: 6 }}>
                {analysis?.device_type || 'Electronic Device'}
              </h3>

              <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>
                <b>Condition:</b> <span style={{ textTransform: 'uppercase', fontWeight: 800, color: analysis?.estimated_condition === 'working' ? 'var(--success)' : 'var(--warning)' }}>{analysis?.estimated_condition || 'Damaged'}</span>
              </p>

              {/* DETECTED MATERIAL CHIPS */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  MATERIALS DETECTED
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(analysis?.visible_components || ['Aluminum', 'Glass', 'Lithium Battery', 'Copper PCB', 'Plastics']).map((m) => (
                    <span key={m} className="material-chip">
                      • {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* DAMAGE / INSPECTION NOTES */}
              {analysis?.damage_notes && analysis.damage_notes.length > 0 && (
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    DAMAGE & CONDITION NOTES
                  </span>
                  <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
                    {analysis.damage_notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* USER-FRIENDLY ADVICE & RATING CARDS */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', border: '1px solid var(--primary-border)', padding: 18, borderRadius: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                💡 WHAT SHOULD YOU DO? (PLAIN LANGUAGE ADVICE)
              </span>

              <p style={{ fontSize: 14, color: '#17352D', lineHeight: 1.5, fontWeight: 600, marginBottom: 14 }}>
                {analysis?.recommendation || '🟢 REUSE: This device appears functional and may be suitable for reuse before recycling.'}
              </p>

              <div className="grid-2" style={{ gap: 10 }}>
                <div style={{ background: '#ffffff', padding: 10, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block' }}>REUSE POTENTIAL</span>
                  <span style={{ fontSize: 16 }}>{renderStars(analysis?.reuse_score || 4)}</span>
                </div>
                <div style={{ background: '#ffffff', padding: 10, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block' }}>RECYCLING NEED</span>
                  <span style={{ fontSize: 16 }}>{renderStars(analysis?.recycling_score || 2)}</span>
                </div>
              </div>
            </div>

            {/* PROMINENT RECYCLING ACTION BUTTON */}
            <div style={{ background: 'var(--ewaste-accent-light)', border: '1.5px dashed var(--ewaste-accent-border)', padding: 18, borderRadius: 16, textAlign: 'center' }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ewaste-accent-dark)', marginBottom: 4 }}>
                ♻️ Ready to recycle this device?
              </h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                Find nearby registered CircularAid recycling facilities based on your location.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="btn btn-ewaste"
                onClick={() => { setChoice('recycle'); setStep('matching'); }}
                style={{ fontSize: 16, fontWeight: 800, padding: '14px 28px', width: 'auto' }}
              >
                ♻️ Request Recycling — Find Nearby Centers →
              </motion.button>
            </div>
          </div>
        )}

        {/* STEP 6: LOCATION SELECTION & GOOGLE-MAPS-STYLE REGISTERED CENTERS */}
        {step === 'matching' && (
          <div className="card card-recycler" style={{ padding: 24 }}>
            <h2 className="title" style={{ fontSize: 22, marginBottom: 2 }}>
              📍 Nearby Registered Recycling Centers
            </h2>
            <p className="subtitle" style={{ marginBottom: 18 }}>
              Sorted by proximity to your location. Only verified CircularAid facilities are displayed.
            </p>

            {/* LOCATION INPUT & GPS CONTROLS */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, marginBottom: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>YOUR CURRENT LOCATION</span>
                  <p style={{ fontWeight: 800, fontSize: 15, color: '#17352D', margin: 0 }}>
                    📍 {userLocation.addressText}
                  </p>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0, fontWeight: 700 }}
                  onClick={handleGetCurrentLocation}
                  disabled={userLocation.loadingLocation}
                >
                  {userLocation.loadingLocation ? 'Fetching GPS...' : '🎯 Use My Current GPS Location'}
                </button>
              </div>

              <form onSubmit={handleManualLocationSubmit} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Or search location / city manually (e.g. Chennai, Bangalore)..."
                  value={manualLocationInput}
                  onChange={(e) => setManualLocationInput(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 16px', marginBottom: 0, fontWeight: 700 }}>
                  Search
                </button>
              </form>
            </div>

            {/* GOOGLE-MAPS-STYLE REGISTERED CENTER CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sortedCenters.map((c) => (
                <div key={c.id || c.name} className="google-center-card">
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {/* CENTER PHOTO */}
                    <img
                      src={c.photoUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'}
                      alt={c.name}
                      style={{ width: 110, height: 110, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                    />

                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 2px 0', color: '#17352D' }}>{c.name}</h3>
                          <span style={{ fontSize: 12, color: 'var(--primary-dark)', fontWeight: 700 }}>✓ Verified CircularAid Facility</span>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: 12 }}>⭐ {c.rating || 4.7}</span>
                      </div>

                      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 6px 0' }}>
                        📍 <b>{c.distanceFormatted}</b> &bull; {c.address}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                        {(c.acceptedMaterials || ['Electronics', 'Mobile', 'Laptop']).map((mat) => (
                          <span key={mat} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                            ♻️ {mat}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>🟢 Open until {c.operatingHours ? c.operatingHours.split('-')[1] : '7:00 PM'}</span>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: 12, marginBottom: 0 }}
                            onClick={() => setInspectCenterModal(c)}
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-ewaste"
                            style={{ width: 'auto', padding: '6px 14px', fontSize: 12, marginBottom: 0, fontWeight: 800 }}
                            onClick={() => {
                              setSelectedCenter(c);
                              setStep('schedule');
                            }}
                          >
                            Select Center →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: SCHEDULE PICKUP OR SELF DROP CONFIRMATION */}
        {step === 'schedule' && (
          <div className="card card-recycler" style={{ padding: 24 }}>
            <h2 className="title" style={{ fontSize: 22, marginBottom: 4 }}>♻️ Confirm Recycling Request</h2>
            <p className="subtitle" style={{ marginBottom: 18 }}>Review selected facility details before submitting your request.</p>

            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, marginBottom: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>SCANNED DEVICE</span>
                  <p style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>{analysis?.device_type || 'Electronic Device'}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>CONDITION</span>
                  <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>{analysis?.estimated_condition || 'Damaged'}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>SELECTED RECYCLING PLANT</span>
                <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--ewaste-accent-dark)', margin: '2px 0 2px 0' }}>{selectedCenter?.name}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>📍 {selectedCenter?.address} ({selectedCenter?.distanceFormatted || '2.3 km away'})</p>
              </div>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Select Handoff Option:</h4>

            <div className="grid-2" style={{ marginBottom: 14 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-ewaste"
                disabled={submitting}
                onClick={() => handleConfirmPickup('pickup')}
                style={{ fontWeight: 800 }}
              >
                🚚 Schedule Home Pickup
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-outline"
                disabled={submitting}
                onClick={() => handleConfirmPickup('drop')}
              >
                📍 Self Drop-Off at Plant
              </motion.button>
            </div>

            <button className="btn btn-secondary" style={{ marginBottom: 0 }} onClick={() => setStep('matching')}>
              ← Choose Another Center
            </button>
          </div>
        )}

        {/* STEP 8: CONFIRMATION SCREEN */}
        {step === 'confirmed' && (
          <div className="card" style={{ textAlign: 'center', padding: '38px 24px' }}>
            <span className="badge badge-success" style={{ fontSize: 14, padding: '8px 20px' }}>✓ Request Confirmed</span>
            <h2 className="title" style={{ marginTop: 18, justifyContent: 'center', fontSize: 24 }}>
              {pickupMethod === 'pickup' ? 'Home Pickup Scheduled!' : 'Self Drop-Off Registered!'}
            </h2>
            <p className="subtitle" style={{ maxWidth: 480, margin: '0 auto 24px' }}>
              Your device recycling request has been routed to <b>{selectedCenter?.name}</b>. Once received at facility, your digital Recycling Certificate will be issued.
            </p>

            <div className="stats-grid" style={{ marginBottom: 28 }}>
              <div className="stat-box">
                <div className="stat-value">+50</div>
                <div className="stat-label">Green Points</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">~1.2 kg</div>
                <div className="stat-label">CO₂ Saved (est.)</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary"
              onClick={() => onComplete({ co2: 1.2 })}
              style={{ fontWeight: 800, padding: '14px 28px' }}
            >
              Return to Command Center 🚀
            </motion.button>
          </div>
        )}

        {/* RECYCLING CENTER DETAILS MODAL */}
        <AnimatePresence>
          {inspectCenterModal && (
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
                style={{ maxWidth: 550, width: '100%', padding: 24, textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#17352D' }}>{inspectCenterModal.name}</h3>
                  <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 12px', fontSize: 12, marginBottom: 0 }} onClick={() => setInspectCenterModal(null)}>
                    ✕ Close
                  </button>
                </div>

                <img
                  src={inspectCenterModal.photoUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'}
                  alt="Center Photo"
                  style={{ width: '100%', height: 200, borderRadius: 14, objectFit: 'cover', marginBottom: 14 }}
                />

                <div style={{ marginBottom: 12 }}>
                  <span className="badge badge-success" style={{ marginBottom: 6 }}>✓ Verified CircularAid Partner</span>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>📍 Address: <b>{inspectCenterModal.address}</b></p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0 0' }}>⏰ Hours: <b>{inspectCenterModal.operatingHours || '8:00 AM - 7:00 PM'}</b></p>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 14 }}>
                  {inspectCenterModal.description || 'Authorized e-waste recovery facility specializing in component sorting and safe battery disposal.'}
                </p>

                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>ACCEPTED MATERIALS</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(inspectCenterModal.acceptedMaterials || ['Smartphones', 'Laptops', 'Batteries']).map((mat) => (
                      <span key={mat} className="material-chip">♻️ {mat}</span>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <button
                    className="btn btn-ewaste"
                    style={{ marginBottom: 0, fontWeight: 800 }}
                    onClick={() => {
                      setSelectedCenter(inspectCenterModal);
                      setInspectCenterModal(null);
                      setStep('schedule');
                    }}
                  >
                    Select This Facility →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default RecycleFlow;