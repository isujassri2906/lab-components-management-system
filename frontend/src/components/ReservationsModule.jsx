import React, { useState, useMemo } from 'react';
import { mockReservations } from '../mockData';
import './ReservationsModule.css';

const ReservationsModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [cancelMessage, setCancelMessage] = useState('');

  // Summary counts
  const summary = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let available = 0;

    mockReservations.forEach(item => {
      if (item.status === 'Pending') pending++;
      else if (item.status === 'Confirmed') confirmed++;
      else if (item.status === 'Available') available++;
    });

    return { 
      total: mockReservations.length, 
      pending, 
      confirmed, 
      available 
    };
  }, [mockReservations]); // using mockReservations to re-evaluate on local changes if any, though it's technically a constant array reference, React won't re-render unless state changes. But we will force re-render upon cancellation.

  // To force re-render when a reservation is cancelled locally
  const [refresh, setRefresh] = useState(0);

  // Filtered items
  const filteredItems = useMemo(() => {
    return mockReservations.filter(item => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
                            item.componentName.toLowerCase().includes(query) || 
                            item.componentCode.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, refresh]);

  const getStatusClass = (status) => {
    if (status === 'Pending') return 'status-pending';
    if (status === 'Confirmed') return 'status-confirmed';
    if (status === 'Available') return 'status-available';
    if (status === 'Cancelled') return 'status-cancelled';
    if (status === 'Completed') return 'status-completed';
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setCancelMessage('');
  };

  const handleCancelReservation = () => {
    if (selectedItem) {
      // Find the object in mockData and mutate its status
      const target = mockReservations.find(r => r.id === selectedItem.id);
      if (target) {
        target.status = 'Cancelled';
        setSelectedItem({ ...target }); // update modal view
        setCancelMessage('Reservation cancelled successfully.');
        setRefresh(prev => prev + 1); // trigger re-render of list and summary
      }
    }
  };

  return (
    <div className="reservations-module">
      <header className="module-header">
        <div>
          <h1 className="module-title">Reservations</h1>
          <p className="module-subtitle">View and manage components reserved for future use.</p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="reservations-summary">
        <div className="summary-card">
          <h4>Total Reservations</h4>
          <span className="summary-val">{summary.total}</span>
        </div>
        <div className="summary-card">
          <h4>Pending</h4>
          <span className="summary-val text-pending">{summary.pending}</span>
        </div>
        <div className="summary-card">
          <h4>Confirmed</h4>
          <span className="summary-val text-confirmed">{summary.confirmed}</span>
        </div>
        <div className="summary-card">
          <h4>Available</h4>
          <span className="summary-val text-available">{summary.available}</span>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="reservations-controls">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search by component name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-select">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Available">Available</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Reservations List */}
      <section className="reservations-list-container">
        {mockReservations.length === 0 ? (
          <div className="empty-state">
            <h3>No reservations yet</h3>
            <p>You haven't made any component reservations.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <h3>No matching reservations found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="reservations-table-wrapper">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Category</th>
                  <th>Reservation Date</th>
                  <th>Required From</th>
                  <th>Required Until</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} onClick={() => handleSelect(item)} className="reservation-row">
                    <td>
                      <div className="td-comp-name">{item.componentName}</div>
                      <div className="td-comp-code">{item.componentCode}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>{formatDate(item.reservationDate)}</td>
                    <td>{formatDate(item.requiredFrom)}</td>
                    <td>{formatDate(item.requiredUntil)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Details Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content reservation-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedItem(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-info">
              <div className="modal-header-row">
                <span className="modal-category">Category: {selectedItem.category}</span>
                <span className={`status-badge ${getStatusClass(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>
              
              <h2 className="modal-title">{selectedItem.componentName}</h2>
              <p className="modal-code">Code: {selectedItem.componentCode}</p>
              
              <div className="reservation-stats-grid">
                <div className="reservation-stat-box">
                  <span className="stat-label">Reservation Date</span>
                  <span className="stat-value">{formatDate(selectedItem.reservationDate)}</span>
                </div>
                <div className="reservation-stat-box">
                  <span className="stat-label">Required From</span>
                  <span className="stat-value">{formatDate(selectedItem.requiredFrom)}</span>
                </div>
                <div className="reservation-stat-box">
                  <span className="stat-label">Required Until</span>
                  <span className="stat-value">{formatDate(selectedItem.requiredUntil)}</span>
                </div>
              </div>
              
              {selectedItem.description && (
                <div className="modal-description">
                  <h4>Notes</h4>
                  <p>{selectedItem.description}</p>
                </div>
              )}
              
              {/* Cancel Button */}
              <div className="modal-actions">
                {(selectedItem.status === 'Pending' || selectedItem.status === 'Confirmed') && (
                  <button className="cancel-res-btn" onClick={handleCancelReservation}>
                    Cancel Reservation
                  </button>
                )}
                
                {cancelMessage && <div className="cancel-success-msg">{cancelMessage}</div>}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsModule;
