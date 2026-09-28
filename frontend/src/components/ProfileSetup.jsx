import React, { useState, useEffect } from 'react';
import './ProfileSetup.css';

const ProfileSetup = ({ user, profile, onSave, isEmbedded = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    register_number: '',
    enrollment_number: '',
    department: '',
    year: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile && !profile.error) {
      setFormData({
        name: profile.name || '',
        register_number: profile.register_number || '',
        enrollment_number: profile.enrollment_number || '',
        department: profile.department || '',
        year: profile.year || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name || !formData.register_number || !formData.enrollment_number || !formData.department || !formData.year) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save profile');
        setIsSaving(false);
        return;
      }

      setSuccess('Profile saved successfully!');
      
      // Update parent component state with new profile data
      setTimeout(() => {
        if (onSave) {
          onSave({ ...profile, ...formData });
        }
        setIsSaving(false);
        setSuccess('');
      }, 1500);

    } catch (err) {
      setError('Network error connecting to backend.');
      setIsSaving(false);
    }
  };

  const content = (
    <div className={`profile-setup-container ${isEmbedded ? 'embedded' : ''}`}>
      {!isEmbedded && (
        <div className="brand-section">
          <div className="brand-name">Lab Hub</div>
          <h1 className="main-title">Complete Your Profile</h1>
          <p className="subtitle">Please provide your details to continue.</p>
        </div>
      )}
      
      {isEmbedded && <h2>My Profile</h2>}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Email ID (Read Only)</label>
          <input 
            type="email" 
            value={profile?.email || user?.email || ''} 
            disabled 
            className="read-only-input"
          />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Register Number</label>
            <input 
              type="text" 
              name="register_number"
              placeholder="e.g. 1114240..."
              value={formData.register_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group half">
            <label>Enrollment Number</label>
            <input 
              type="text" 
              name="enrollment_number"
              placeholder="Enter enrollment no."
              value={formData.enrollment_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Department</label>
            <input 
              type="text" 
              name="department"
              placeholder="e.g. IT, CSE"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="form-group half">
            <label>Year</label>
            <input 
              type="text" 
              name="year"
              placeholder="e.g. I Year, II Year"
              value={formData.year}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  // Standalone mode wrapper
  return (
    <div className="app-layout">
       {content}
    </div>
  );
};

export default ProfileSetup;
