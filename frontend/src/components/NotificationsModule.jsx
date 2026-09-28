import React, { useState, useMemo } from 'react';
import { mockNotifications } from '../mockData';
import './NotificationsModule.css';

const TypeIcon = ({ type }) => {
  switch (type) {
    case 'Request':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notif-icon type-request">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    case 'Reservation':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notif-icon type-reservation">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      );
    case 'Borrowed':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notif-icon type-borrowed">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    case 'Return':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notif-icon type-return">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    case 'System':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notif-icon type-system">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      );
  }
};

const NotificationsModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [refresh, setRefresh] = useState(0);

  // Summary counts
  const { total, unread } = useMemo(() => {
    let unreadCount = 0;
    mockNotifications.forEach(n => {
      if (!n.isRead) unreadCount++;
    });
    return { total: mockNotifications.length, unread: unreadCount };
  }, [mockNotifications, refresh]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return mockNotifications.filter(n => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
                            n.title.toLowerCase().includes(query) || 
                            n.message.toLowerCase().includes(query);
      
      const matchesRead = readFilter === 'All' || 
                          (readFilter === 'Unread' && !n.isRead) || 
                          (readFilter === 'Read' && n.isRead);
                          
      const matchesType = typeFilter === 'All' || n.type === typeFilter;
      
      return matchesSearch && matchesRead && matchesType;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [searchQuery, readFilter, typeFilter, refresh]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleSelect = (notif) => {
    // Mark as read locally if unread
    if (!notif.isRead) {
      const target = mockNotifications.find(n => n.id === notif.id);
      if (target) {
        target.isRead = true;
        setRefresh(prev => prev + 1);
      }
    }
    // Deep copy for modal display to reflect immediate read status
    setSelectedNotification({ ...notif, isRead: true });
  };

  const handleMarkAllAsRead = () => {
    mockNotifications.forEach(n => n.isRead = true);
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="notifications-module">
      <header className="module-header">
        <div>
          <h1 className="module-title">Notifications</h1>
          <p className="module-subtitle">Stay updated about your component requests, reservations, borrowed components, and important lab activities.</p>
        </div>
      </header>

      {/* Summary Section */}
      <section className="notif-summary">
        <div className="summary-card">
          <h4>Total Notifications</h4>
          <span className="summary-val">{total}</span>
        </div>
        <div className="summary-card">
          <h4>Unread</h4>
          <span className={`summary-val ${unread > 0 ? 'text-unread' : ''}`}>{unread}</span>
        </div>
        <div className="mark-all-wrapper">
          <button 
            className="mark-all-btn" 
            onClick={handleMarkAllAsRead}
            disabled={unread === 0}
          >
            Mark all as read
          </button>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="notif-controls">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-select">
            <label>Status:</label>
            <select value={readFilter} onChange={(e) => setReadFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
          <div className="filter-select">
            <label>Type:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Request">Request</option>
              <option value="Reservation">Reservation</option>
              <option value="Borrowed">Borrowed</option>
              <option value="Return">Return</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="notif-list-container">
        {mockNotifications.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications yet</h3>
            <p>You will receive updates here regarding your lab activity.</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            {readFilter === 'Unread' && typeFilter === 'All' && !searchQuery ? (
              <>
                <h3>You're all caught up!</h3>
                <p>No unread notifications.</p>
              </>
            ) : (
              <>
                <h3>No matching notifications found</h3>
                <p>Try adjusting your search or filters.</p>
              </>
            )}
          </div>
        ) : (
          <div className="notif-list">
            {filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-card ${!notif.isRead ? 'unread' : 'read'}`}
                onClick={() => handleSelect(notif)}
              >
                <div className="notif-icon-wrapper">
                  <TypeIcon type={notif.type} />
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h3 className="notif-title">{notif.title}</h3>
                    <span className="notif-date">{formatDate(notif.createdAt)}</span>
                  </div>
                  <p className="notif-message">{notif.message}</p>
                  <div className="notif-footer">
                    <span className={`notif-type-badge type-${notif.type.toLowerCase()}`}>
                      {notif.type}
                    </span>
                    {!notif.isRead && <span className="unread-dot">New</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Details Modal */}
      {selectedNotification && (
        <div className="modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="modal-content notif-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedNotification(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="notif-modal-icon">
              <TypeIcon type={selectedNotification.type} />
            </div>
            
            <div className="modal-info">
              <div className="modal-header-row">
                <span className={`notif-type-badge type-${selectedNotification.type.toLowerCase()}`}>
                  {selectedNotification.type}
                </span>
                <span className="notif-date">{formatDate(selectedNotification.createdAt)}</span>
              </div>
              
              <h2 className="modal-title">{selectedNotification.title}</h2>
              
              <div className="notif-full-message">
                <p>{selectedNotification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsModule;
