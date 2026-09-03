import { useState } from 'react';
import { motion } from 'framer-motion';

function RoleRegistration({ role, userEmail, firebaseUid, onSubmitComplete }) {
  const [formData, setFormData] = useState({
    // Shared
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    // Hotel
    hotelName: '',
    managerName: '',
    gstNumber: '',
    photoUrl: '',
    category: 'Restaurant & Fine Dining',
    foodTypesProvided: 'Cooked Meals, Rice & Curry, Breads, Desserts',
    dailyCapacity: '50-150 meals',
    operatingTimings: '11:00 AM - 11:00 PM',
    description: '',
    documentUrl: '',
    // NGO
    ngoName: '',
    contactPerson: '',
    registrationNumber: '',
    websiteUrl: '',
    causes: 'Food Rescue & Surplus Distribution',
    description: '',
    logoUrl: '',
    certificateUrl: '',
    // Recycler
    centerName: '',
    licenseNumber: '',
    specialties: [],
  });

  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const SPECIALTY_OPTIONS = [
    'General E-Waste',
    'Lithium Batteries',
    'Large Appliances',
    'Mobile & Laptops',
    'Solar Panels & Inverters',
    'Hazardous Waste',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      return setError('Geolocation is not supported by your browser.');
    }
    setLoadingGps(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGpsCaptured(true);
        setLoadingGps(false);
      },
      (err) => {
        setLoadingGps(false);
        setError('Failed to capture GPS location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
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

  const toggleSpecialty = (spec) => {
    setFormData((prev) => {
      const exists = prev.specialties.includes(spec);
      if (exists) {
        return { ...prev, specialties: prev.specialties.filter((s) => s !== spec) };
      } else {
        return { ...prev, specialties: [...prev.specialties, spec] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let endpoint = '';
    let payload = { firebaseUid, email: userEmail, ...formData };

    if (role === 'hotel') endpoint = '/api/register/hotel';
    else if (role === 'ngo') endpoint = '/api/register/ngo';
    else if (role === 'recycler') endpoint = '/api/register/recycler';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration.');
      }

      onSubmitComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cardRoleClass = role === 'hotel' ? 'card-hotel' : role === 'ngo' ? 'card-ngo' : role === 'recycler' ? 'card-recycler' : '';

  return (
    <div className="page fade-in">
      <div className="container">
        <div className={`card ${cardRoleClass}`}>
          <div style={{ marginBottom: 12 }}>
            <span className="badge badge-warning">Verification Required</span>
          </div>

          <p className="title">Organization Verification</p>
          <p className="subtitle">
            Provide details to verify your <b>{role?.toUpperCase()}</b> account ({userEmail}).
          </p>

          <form onSubmit={handleSubmit}>
            {/* HOTEL FIELDS */}
            {role === 'hotel' && (
              <>
                <div className="form-group">
                  <label className="form-label">Hotel / Restaurant Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Grand Palace Hotel"
                    value={formData.hotelName}
                    onChange={(e) => handleInputChange('hotelName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Manager / Contact Person</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Full Name"
                    value={formData.managerName}
                    onChange={(e) => handleInputChange('managerName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GST / FSSAI License Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Establishment Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="5-Star Luxury Hotel & Buffet">5-Star Luxury Hotel & Buffet</option>
                    <option value="Restaurant & Fine Dining">Restaurant & Fine Dining</option>
                    <option value="Catering Service & Event Hall">Catering Service & Event Hall</option>
                    <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                    <option value="Institutional / Corporate Cafeteria">Institutional / Corporate Cafeteria</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Food Types Provided</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Cooked Meals, Rice & Curry, Breads, Desserts"
                    value={formData.foodTypesProvided}
                    onChange={(e) => handleInputChange('foodTypesProvided', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Surplus Food Capacity</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 50-150 meals daily"
                    value={formData.dailyCapacity}
                    onChange={(e) => handleInputChange('dailyCapacity', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Operating / Food Availability Hours</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 11:00 AM - 11:00 PM"
                    value={formData.operatingTimings}
                    onChange={(e) => handleInputChange('operatingTimings', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hotel / Restaurant Description</label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: 70, resize: 'vertical' }}
                    placeholder="Describe your hospitality business, daily food management, and sustainability goals..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hotel Facade or Establishment Photo</label>
                  <label className="upload-box" style={{ padding: 16, background: 'var(--hotel-accent-light)', borderColor: 'var(--hotel-accent-border)' }}>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    {formData.photoUrl ? '📸 Photo Attached (Tap to Change)' : '📷 Tap to Upload Photo'}
                  </label>
                  {formData.photoUrl && (
                    <img src={formData.photoUrl} alt="Preview" className="preview-img" style={{ maxHeight: 140, marginTop: 8 }} />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">FSSAI License / GST Registration Document</label>
                  <label className="upload-box" style={{ padding: 16, background: 'var(--hotel-accent-light)', borderColor: 'var(--hotel-accent-border)' }}>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('documentUrl', e)} style={{ display: 'none' }} />
                    {formData.documentUrl ? '📄 License Document Attached (Tap to Change)' : '📂 Upload FSSAI / Business License Document'}
                  </label>
                  {formData.documentUrl && formData.documentUrl.startsWith('data:image') && (
                    <img src={formData.documentUrl} alt="License Preview" className="preview-img" style={{ maxHeight: 140, marginTop: 8 }} />
                  )}
                </div>
              </>
            )}

            {/* NGO FIELDS */}
            {role === 'ngo' && (
              <>
                <div className="form-group">
                  <label className="form-label">NGO / Shelter Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Hope Food & Community Trust"
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
                    placeholder="Full Name"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Society / Trust Registration No.</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. REG-88291-NGO"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Causes / Focus Area</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Food Rescue, Child Welfare, Disaster Relief"
                    value={formData.causes}
                    onChange={(e) => handleInputChange('causes', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website / Social Media Link (Optional)</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://www.hopefoodtrust.org"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">About the NGO / Mission Statement</label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: 80, resize: 'vertical' }}
                    placeholder="Describe your organization's work, beneficiaries served, and daily operations..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NGO Logo / Organization Photo</label>
                  <label className="upload-box" style={{ padding: 16, background: 'var(--ngo-accent-light)', borderColor: 'var(--ngo-accent-border)' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload('logoUrl', e)} style={{ display: 'none' }} />
                    {formData.logoUrl ? '🖼️ Logo Attached (Tap to Change)' : '📷 Upload Logo / Organization Image'}
                  </label>
                  {formData.logoUrl && (
                    <img src={formData.logoUrl} alt="NGO Logo Preview" className="preview-img" style={{ maxHeight: 120, marginTop: 8 }} />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Certificate / Verification Document</label>
                  <label className="upload-box" style={{ padding: 16, background: 'var(--ngo-accent-light)', borderColor: 'var(--ngo-accent-border)' }}>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('certificateUrl', e)} style={{ display: 'none' }} />
                    {formData.certificateUrl ? '📄 Registration Certificate Attached (Tap to Change)' : '📂 Upload Registration Certificate / Document'}
                  </label>
                  {formData.certificateUrl && formData.certificateUrl.startsWith('data:image') && (
                    <img src={formData.certificateUrl} alt="Certificate Preview" className="preview-img" style={{ maxHeight: 140, marginTop: 8 }} />
                  )}
                </div>
              </>
            )}

            {/* RECYCLING CENTER FIELDS */}
            {role === 'recycler' && (
              <>
                <div className="form-group">
                  <label className="form-label">Recycling Center Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. GreenTech E-Waste Plant"
                    value={formData.centerName}
                    onChange={(e) => handleInputChange('centerName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Full Name"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State PCB Authorization License</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. PCB-AUTH-2026-99"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Facility Processing Specialties</label>
                  <div className="specialty-grid">
                    {SPECIALTY_OPTIONS.map((spec) => (
                      <div
                        key={spec}
                        className={`specialty-pill ${formData.specialties.includes(spec) ? 'selected' : ''}`}
                        onClick={() => toggleSpecialty(spec)}
                      >
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Operating Hours</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 8:00 AM - 7:00 PM"
                    value={formData.operatingTimings || ''}
                    onChange={(e) => handleInputChange('operatingTimings', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">🖼️ Recycling Center Facility Photo</label>
                  <label className="upload-box" style={{ padding: 16, background: 'var(--ewaste-accent-light)', borderColor: 'var(--ewaste-accent-border)' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload('photoUrl', e)} style={{ display: 'none' }} />
                    {formData.photoUrl ? '📸 Center Photo Attached (Tap to Change)' : '📷 Upload Facility Photo (Building / Reception / Collection Area)'}
                  </label>
                  {formData.photoUrl && (
                    <img src={formData.photoUrl} alt="Facility Preview" className="preview-img" style={{ maxHeight: 140, marginTop: 8, objectFit: 'cover' }} />
                  )}
                </div>
              </>
            )}

            {/* SHARED FIELDS */}
            <div className="form-group">
              <label className="form-label">Official Contact Phone</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+1 555-0199"
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
                placeholder="Street address, City, Pin/Zip"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">GPS Geolocation</label>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-secondary"
                onClick={handleCaptureGps}
                disabled={loadingGps}
              >
                {loadingGps
                  ? 'Capturing Coordinates...'
                  : gpsCaptured
                  ? `✓ Location Set (${formData.latitude}, ${formData.longitude})`
                  : '📍 Capture Precise GPS Location'}
              </motion.button>
              {gpsCaptured && (
                <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 6, fontWeight: 600 }}>
                  ✓ Geofencing verified ({formData.latitude}, {formData.longitude})
                </p>
              )}
            </div>

            {error && <p style={{ color: 'var(--danger)', marginBottom: 16, fontSize: 13 }}>⚠️ {error}</p>}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`btn ${role === 'hotel' ? 'btn-hotel' : role === 'ngo' ? 'btn-ngo' : role === 'recycler' ? 'btn-recycler' : 'btn-primary'}`}
              disabled={submitting}
            >
              {submitting ? 'Submitting Registration...' : 'Submit Profile for Admin Verification'}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoleRegistration;
