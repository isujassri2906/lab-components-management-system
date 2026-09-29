import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  // State to track whether we are in "Student" or "Faculty" mode
  const [userType, setUserType] = useState('student');

  // State to track whether the student is on the "Login" or "Set Password" screen
  const [isSetupMode, setIsSetupMode] = useState(false);

  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State for showing messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // A helper function to check if email format is basic valid
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Common validations: check if email and password are provided
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address (e.g., btech240753@smvec.ac.in).');
      return;
    }

    // Specific validations for Student First-Time Password Setup
    if (userType === 'student' && isSetupMode) {
      if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:5000/api/setup-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            new_password: password,
            confirm_password: confirmPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to setup password');
          return;
        }

        setSuccess(data.message || 'Password successfully set! You can now login.');

        // Reset to login mode after a short delay
        setTimeout(() => {
          setIsSetupMode(false);
          setPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 3000);
      } catch (err) {
        setError('Network error connecting to backend.');
      }
      return;
    }

    // If it's a regular login attempt
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          role: userType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setSuccess(data.message || `Successfully logged in as ${userType}.`);
      
      if (onLogin && data.user) {
        setTimeout(() => {
          onLogin(data.user);
        }, 1000);
      }
    } catch (err) {
      setError('Network error connecting to backend.');
    }
  };

  // When switching tabs, reset the form completely
  const switchUserType = (type) => {
    setUserType(type);
    setIsSetupMode(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  return (
    <div className="login-container">
      <div className="brand-section">
        <div className="brand-name">Lab Hub</div>
        <h1 className="main-title">Lab Components Management System</h1>
        <p className="subtitle">
          Manage and track college laboratory components efficiently.
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${userType === 'student' ? 'active' : ''}`}
          onClick={() => switchUserType('student')}
        >
          Student Login
        </button>
        <button
          className={`tab-btn ${userType === 'faculty' ? 'active' : ''}`}
          onClick={() => switchUserType('faculty')}
        >
          Faculty Login
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            {userType === 'faculty' ? 'Faculty Email ID' : 'College Email ID'}
          </label>
          <input
            type="email"
            placeholder={userType === 'faculty' ? "faculty@smvec.ac.in" : "btech240753@smvec.ac.in"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{isSetupMode ? 'New Password' : 'Password'}</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={isSetupMode ? "Enter new password" : "Enter password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Only show Confirm Password if it is a Student setting up their password */}
        {userType === 'student' && isSetupMode && (
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="submit-btn">
          {isSetupMode ? 'Set Password' : 'Login'}
        </button>
      </form>

      {/* Show the First Time setup link only for students who are on the regular login screen */}
      {userType === 'student' && !isSetupMode && (
        <div className="toggle-link">
          <button type="button" onClick={() => {
            setIsSetupMode(true);
            setError('');
            setSuccess('');
          }}>
            First time? Set your password
          </button>
        </div>
      )}

      {/* Show a "Back to Login" link if the student is currently on the setup screen */}
      {userType === 'student' && isSetupMode && (
        <div className="toggle-link">
          <button type="button" onClick={() => {
            setIsSetupMode(false);
            setError('');
            setSuccess('');
          }}>
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
