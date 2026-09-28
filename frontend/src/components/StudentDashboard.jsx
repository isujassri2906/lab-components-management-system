import React, { useState } from 'react';
import ProfileSetup from './ProfileSetup';
import ComponentsModule from './ComponentsModule';
import MyRequestsModule from './MyRequestsModule';
import BorrowedModule from './BorrowedModule';
import ReservationsModule from './ReservationsModule';
import NotificationsModule from './NotificationsModule';
import DamageRecordsModule from './DamageRecordsModule';
import ComplaintsModule from './ComplaintsModule';
import DashboardOverview from './DashboardOverview';
import AIAssistantModule from './AIAssistantModule';
import './StudentDashboard.css';

const StudentDashboard = ({ user, profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDamageOpen, setIsDamageOpen] = useState(false);

  const renderContent = () => {
    if (activeTab === 'Profile') {
      return (
        <section className="components-section">
          <ProfileSetup user={user} profile={profile} onSave={() => {}} isEmbedded={true} />
        </section>
      );
    }
    
    if (activeTab === 'Components') {
      return <ComponentsModule />;
    }
    
    if (activeTab === 'My Requests') {
      return <MyRequestsModule />;
    }
    
    if (activeTab === 'Borrowed') {
      return <BorrowedModule />;
    }
    
    if (activeTab === 'Reservations') {
      return <ReservationsModule />;
    }
    
    if (activeTab === 'Notifications') {
      return <NotificationsModule />;
    }
    
    if (activeTab === 'Damage Records') {
      return <DamageRecordsModule />;
    }
    
    if (activeTab === 'Complaints') {
      return <ComplaintsModule />;
    }
    
    if (activeTab === 'AI Assistant') {
      return <AIAssistantModule />;
    }
    
    return <DashboardOverview setActiveTab={setActiveTab} setIsDamageOpen={setIsDamageOpen} />;
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
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">MY ACTIVITY</h3>
            <button className={`nav-item ${activeTab === 'My Requests' ? 'active' : ''}`} onClick={() => setActiveTab('My Requests')}>My Requests</button>
            <button className={`nav-item ${activeTab === 'Borrowed' ? 'active' : ''}`} onClick={() => setActiveTab('Borrowed')}>Borrowed</button>
            <button className={`nav-item ${activeTab === 'Reservations' ? 'active' : ''}`} onClick={() => setActiveTab('Reservations')}>Reservations</button>
            
            <div className="nav-submenu-container">
              <button 
                className={`nav-item ${activeTab === 'Damage Records' || activeTab === 'Complaints' ? 'active' : ''}`} 
                onClick={() => setIsDamageOpen(!isDamageOpen)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>Damage</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ 
                      width: '14px', 
                      height: '14px', 
                      transform: isDamageOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
              
              {isDamageOpen && (
                <div className="nav-submenu">
                  <button 
                    className={`nav-submenu-item ${activeTab === 'Damage Records' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('Damage Records')}
                  >
                    Damage Records
                  </button>
                  <button 
                    className={`nav-submenu-item ${activeTab === 'Complaints' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('Complaints')}
                  >
                    Complaints
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">ACCOUNT</h3>
            <button className={`nav-item ${activeTab === 'Notifications' ? 'active' : ''}`} onClick={() => setActiveTab('Notifications')}>Notifications</button>
            <button className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>Profile</button>
          </div>

          <div style={{ marginTop: 'auto', marginBottom: '8px', padding: '0 12px' }}>
            <button 
              className={`nav-item ${activeTab === 'AI Assistant' ? 'active' : ''}`} 
              onClick={() => setActiveTab('AI Assistant')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', background: activeTab === 'AI Assistant' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.05)', color: activeTab === 'AI Assistant' ? '#a78bfa' : '#c4b5fd', borderLeft: activeTab === 'AI Assistant' ? '3px solid #a78bfa' : 'none', borderRadius: activeTab === 'AI Assistant' ? '0 8px 8px 0' : '8px' }}
            >
              <span>🤖</span>
              <span>AI Assistant</span>
            </button>
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
