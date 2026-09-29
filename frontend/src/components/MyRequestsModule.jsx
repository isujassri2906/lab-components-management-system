import React, { useState, useMemo } from 'react';
import { mockRequests } from '../mockData';
import './MyRequestsModule.css';

const MyRequestsModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Derived categories from mockRequests
  const categories = useMemo(() => {
    const cats = new Set(mockRequests.map(r => r.category));
    return ['All', ...Array.from(cats)];
  }, []);

  // Summary counts
  const summary = useMemo(() => {
    return {
      total: mockRequests.length,
      pending: mockRequests.filter(r => r.status === 'Pending').length,
      approved: mockRequests.filter(r => r.status === 'Approved').length,
      rejected: mockRequests.filter(r => r.status === 'Rejected').length
    };
  }, []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return mockRequests.filter(req => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        req.componentName.toLowerCase().includes(query) ||
        req.componentCode.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const getStatusClass = (status) => {
    if (status === 'Approved') return 'status-approved';
    if (status === 'Pending') return 'status-pending';
    if (status === 'Rejected') return 'status-rejected';
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="requests-module">
      <header className="module-header">
        <div>
          <h1 className="module-title">My Requests</h1>
          <p className="module-subtitle">Track the component requests you have submitted and their current status.</p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="requests-summary">
        <div className="summary-card">
          <h4>Total Requests</h4>
          <span className="summary-val">{summary.total}</span>
        </div>
        <div className="summary-card">
          <h4>Pending</h4>
          <span className="summary-val text-pending">{summary.pending}</span>
        </div>
        <div className="summary-card">
          <h4>Approved</h4>
          <span className="summary-val text-approved">{summary.approved}</span>
        </div>
        <div className="summary-card">
          <h4>Rejected</h4>
          <span className="summary-val text-rejected">{summary.rejected}</span>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="requests-controls">
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
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-select">
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Request List */}
      <section className="requests-list-container">
        {mockRequests.length === 0 ? (
          <div className="empty-state">
            <h3>No requests yet</h3>
            <p>You haven't submitted any component requests.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <h3>No matching requests found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="requests-table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Category</th>
                  <th>Request Date</th>
                  <th>Queue Pos.</th>
                  <th>Available From</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id} onClick={() => setSelectedRequest(req)} className="request-row">
                    <td>
                      <div className="td-comp-name">{req.componentName}</div>
                      <div className="td-comp-code">{req.componentCode}</div>
                    </td>
                    <td>{req.category}</td>
                    <td>{formatDate(req.requestDate)}</td>
                    <td>{req.queuePosition ? `#${req.queuePosition}` : '-'}</td>
                    <td>{req.availableFrom ? formatDate(req.availableFrom) : '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content request-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedRequest(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="modal-info">
              <div className="modal-header-row">
                <span className="modal-category">Category: {selectedRequest.category}</span>
                <span className={`status-badge ${getStatusClass(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>

              <h2 className="modal-title">{selectedRequest.componentName}</h2>
              <p className="modal-code">Code: {selectedRequest.componentCode}</p>

              <div className="req-stats-list">
                <div className="req-stat-row">
                  <span className="req-stat-label">Request Date:</span>
                  <span className="req-stat-value">{formatDate(selectedRequest.requestDate)}</span>
                </div>
                <div className="req-stat-row">
                  <span className="req-stat-label">Queue Position:</span>
                  <span className="req-stat-value">{selectedRequest.queuePosition || 'N/A'}</span>
                </div>
                <div className="req-stat-row">
                  <span className="req-stat-label">Available From:</span>
                  <span className="req-stat-value">{selectedRequest.availableFrom ? formatDate(selectedRequest.availableFrom) : 'N/A'}</span>
                </div>
              </div>

              {selectedRequest.description && (
                <div className="modal-description">
                  <h4>Request Description / Notes</h4>
                  <p>{selectedRequest.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequestsModule;
