import React, { useMemo } from 'react';
import { 
  mockComponents, 
  mockRequests, 
  mockBorrowed, 
  mockReservations, 
  mockNotifications 
} from '../mockData';
import './DashboardOverview.css';

const DashboardOverview = ({ setActiveTab, setIsDamageOpen }) => {
  // Calculations
  const availableComponentsCount = useMemo(() => {
    return mockComponents.reduce((acc, comp) => acc + (comp.availableQuantity || 0), 0);
  }, []);

  const myRequestsCount = mockRequests.length;

  const currentlyBorrowed = useMemo(() => {
    return mockBorrowed.filter(b => b.status === 'Issued' || b.status === 'Overdue'); // Overdue is also actively borrowed
  }, []);
  
  const activeReservations = useMemo(() => {
    return mockReservations.filter(r => ['Pending', 'Confirmed', 'Available'].includes(r.status));
  }, []);

  const pendingRequests = useMemo(() => {
    return mockRequests.filter(r => r.status === 'Pending');
  }, []);

  const recentActivity = useMemo(() => {
    const activities = [];
    
    mockRequests.forEach(r => {
      activities.push({
        id: `req-${r.id}`,
        title: 'Component Requested',
        desc: `Requested ${r.componentName}`,
        date: new Date(r.requestDate),
        type: 'Request'
      });
    });

    mockBorrowed.forEach(b => {
      activities.push({
        id: `bor-${b.id}`,
        title: 'Component Borrowed',
        desc: `Issued ${b.componentName}`,
        date: new Date(b.issueDate),
        type: 'Borrowed'
      });
      if (b.returnDate) {
        activities.push({
          id: `ret-${b.id}`,
          title: 'Component Returned',
          desc: `Returned ${b.componentName}`,
          date: new Date(b.returnDate),
          type: 'Returned'
        });
      }
    });

    mockReservations.forEach(r => {
      activities.push({
        id: `res-${r.id}`,
        title: 'Component Reserved',
        desc: `Reserved ${r.componentName}`,
        date: new Date(r.reservationDate),
        type: 'Reservation'
      });
    });

    return activities
      .filter(a => !isNaN(a.date.getTime()))
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  }, []);

  const recentNotifications = useMemo(() => {
    return [...mockNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, []);

  const formatDate = (dateInput) => {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Request': return '📝';
      case 'Borrowed': return '📦';
      case 'Returned': return '✅';
      case 'Reservation': return '🕒';
      default: return '📌';
    }
  };

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'status-pending';
    if (s === 'confirmed' || s === 'resolved') return 'status-confirmed';
    if (s === 'available' || s === 'returned') return 'status-available';
    if (s === 'issued' || s === 'open') return 'status-issued';
    if (s === 'overdue' || s === 'cancelled') return 'status-error';
    return '';
  };

  return (
    <div className="dashboard-overview">
      {/* 2. SUMMARY CARDS */}
      <section className="overview-summary-cards">
        <div className="overview-card">
          <h3>Available Components</h3>
          <p className="card-value">{availableComponentsCount}</p>
        </div>
        <div className="overview-card">
          <h3>My Requests</h3>
          <p className="card-value">{myRequestsCount}</p>
        </div>
        <div className="overview-card">
          <h3>Currently Borrowed</h3>
          <p className="card-value">{currentlyBorrowed.length}</p>
        </div>
        <div className="overview-card">
          <h3>Reservations</h3>
          <p className="card-value">{activeReservations.length}</p>
        </div>
      </section>

      <div className="overview-grid">
        {/* Main Column */}
        <div className="overview-main-col">
          {/* 3. RECENT ACTIVITY */}
          <section className="overview-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            {recentActivity.length === 0 ? (
              <div className="empty-state">No recent activity.</div>
            ) : (
              <div className="activity-list">
                {recentActivity.map(act => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-icon">{getActivityIcon(act.type)}</div>
                    <div className="activity-content">
                      <h4>{act.title}</h4>
                      <p>{act.desc}</p>
                    </div>
                    <div className="activity-time">{formatDate(act.date)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. CURRENTLY BORROWED & 5. PENDING REQUESTS */}
          <div className="overview-row">
            <section className="overview-section half">
              <div className="section-header">
                <h2>Currently Borrowed</h2>
                {currentlyBorrowed.length > 3 && (
                  <button className="view-all-btn" onClick={() => setActiveTab('Borrowed')}>View All &rarr;</button>
                )}
              </div>
              {currentlyBorrowed.length === 0 ? (
                <div className="empty-state">No components currently borrowed.</div>
              ) : (
                <div className="compact-list">
                  {currentlyBorrowed.slice(0, 3).map(b => (
                    <div key={b.id} className="compact-card">
                      <div className="compact-info">
                        <h4>{b.componentName}</h4>
                        <p className="compact-code">{b.componentCode}</p>
                        <p className="compact-meta">Due: {formatDate(b.dueDate)}</p>
                      </div>
                      <span className={`status-badge ${getStatusClass(b.status)}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="overview-section half">
              <div className="section-header">
                <h2>Pending Requests</h2>
                {pendingRequests.length > 3 && (
                  <button className="view-all-btn" onClick={() => setActiveTab('My Requests')}>View All &rarr;</button>
                )}
              </div>
              {pendingRequests.length === 0 ? (
                <div className="empty-state">No pending requests.</div>
              ) : (
                <div className="compact-list">
                  {pendingRequests.slice(0, 3).map(r => (
                    <div key={r.id} className="compact-card">
                      <div className="compact-info">
                        <h4>{r.componentName}</h4>
                        <p className="compact-code">{r.componentCode}</p>
                        <p className="compact-meta">Req: {formatDate(r.requestDate)}</p>
                      </div>
                      <span className={`status-badge ${getStatusClass(r.status)}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 6. UPCOMING RESERVATIONS & 7. RECENT NOTIFICATIONS */}
          <div className="overview-row">
            <section className="overview-section half">
              <div className="section-header">
                <h2>Upcoming Reservations</h2>
                {activeReservations.length > 3 && (
                  <button className="view-all-btn" onClick={() => setActiveTab('Reservations')}>View All &rarr;</button>
                )}
              </div>
              {activeReservations.length === 0 ? (
                <div className="empty-state">No upcoming reservations.</div>
              ) : (
                <div className="compact-list">
                  {activeReservations.slice(0, 3).map(r => (
                    <div key={r.id} className="compact-card">
                      <div className="compact-info">
                        <h4>{r.componentName}</h4>
                        <p className="compact-meta">From: {formatDate(r.requiredFrom)}</p>
                        <p className="compact-meta">Until: {formatDate(r.requiredUntil)}</p>
                      </div>
                      <span className={`status-badge ${getStatusClass(r.status)}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="overview-section half">
              <div className="section-header">
                <h2>Recent Notifications</h2>
                {mockNotifications.length > 3 && (
                  <button className="view-all-btn" onClick={() => setActiveTab('Notifications')}>View All &rarr;</button>
                )}
              </div>
              {recentNotifications.length === 0 ? (
                <div className="empty-state">No recent notifications.</div>
              ) : (
                <div className="compact-list">
                  {recentNotifications.map(n => (
                    <div key={n.id} className={`compact-card notif-card-compact ${!n.isRead ? 'unread' : ''}`}>
                      <div className="compact-info">
                        <h4>{n.title}</h4>
                        <p className="compact-msg">{n.message}</p>
                        <p className="compact-meta">{formatDate(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <span className="notif-dot"></span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="overview-side-col">
          {/* 8. QUICK ACTIONS */}
          <section className="overview-section quick-actions-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => setActiveTab('Components')}>
                <span className="qa-icon">🔍</span>
                <span className="qa-text">Browse Components</span>
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab('My Requests')}>
                <span className="qa-icon">📋</span>
                <span className="qa-text">My Requests</span>
              </button>
              <button className="quick-action-btn" onClick={() => setActiveTab('Reservations')}>
                <span className="qa-icon">📅</span>
                <span className="qa-text">Reservations</span>
              </button>
              <button className="quick-action-btn" onClick={() => {
                setActiveTab('Complaints');
                if (setIsDamageOpen) setIsDamageOpen(true);
              }}>
                <span className="qa-icon">⚠️</span>
                <span className="qa-text">Raise Complaint</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
