import React, { useState } from 'react';
import ProfileSetup from './ProfileSetup';
import './StudentDashboard.css';

const StudentDashboard = ({ user, profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    if (activeTab === 'Profile') {
      return (
        <section className="components-section">
          <ProfileSetup user={user} profile={profile} onSave={() => {}} isEmbedded={true} />
        </section>
      );
    }
    
    return (
      <>
        {/* Summary Cards */}
        <section className="summary-cards">
          <div className="card">
            <h3>Available Components</h3>
            <p className="card-value">124</p>
          </div>
          <div className="card">
            <h3>My Requests</h3>
            <p className="card-value">3</p>
          </div>
          <div className="card">
            <h3>Currently Issued</h3>
            <p className="card-value">1</p>
          </div>
          <div className="card">
            <h3>Pending Requests</h3>
            <p className="card-value">2</p>
          </div>
        </section>

        {/* Main Section */}
        <section className="components-section">
          <h2>Available Lab Components</h2>
          <div className="components-placeholder">
            <p className="placeholder-text">Component list will be displayed here...</p>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Lab Hub</h2>
        </div>
        
        <div className="sidebar-nav-sections">
          <div className="nav-section">
            <h3 className="nav-section-title">MAIN MENU</h3>
            <button className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('Dashboard')}>Dashboard</button>
            <button className={`nav-item ${activeTab === 'Components' ? 'active' : ''}`} onClick={() => setActiveTab('Components')}>Components</button>
            <button className={`nav-item ${activeTab === 'Categories' ? 'active' : ''}`} onClick={() => setActiveTab('Categories')}>Categories</button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">MY ACTIVITY</h3>
            <button className="nav-item">My Requests</button>
            <button className="nav-item">Borrowed</button>
            <button className="nav-item">Reservations</button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">ACCOUNT</h3>
            <button className="nav-item">Notifications</button>
            <button className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>Profile</button>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
             <div className="profile-avatar">
               {profile?.name ? profile.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'S')}
             </div>
             <div className="sidebar-user-details">
                <span className="user-name">{profile?.name || 'Student'}</span>
                <span className="user-dept-year">
                  {profile?.department || 'Dept'} &middot; {profile?.year || 'Year'}
                </span>
             </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="welcome-msg">
            <h1>Welcome back, {profile?.name || user?.email || 'Student'}!</h1>
            <p>Here is your lab components overview.</p>
          </div>
          <div className="profile-area">
            <div className="profile-avatar">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'S')}
            </div>
            <div className="profile-info">
              <span className="profile-role">Student</span>
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;
