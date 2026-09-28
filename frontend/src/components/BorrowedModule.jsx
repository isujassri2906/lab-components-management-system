import React, { useState, useMemo } from 'react';
import { mockBorrowed } from '../mockData';
import './BorrowedModule.css';

const BorrowedModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  // Summary counts
  const summary = useMemo(() => {
    const now = new Date();
    let currentlyBorrowed = 0;
    let dueSoon = 0;
    let overdue = 0;
    let returned = 0;

    mockBorrowed.forEach(item => {
      if (item.status === 'Issued') {
        currentlyBorrowed++;
        
        // Simple due soon logic (within 3 days)
        if (item.dueDate) {
          const due = new Date(item.dueDate);
          const diffTime = due - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 3) {
            dueSoon++;
          }
        }
      } else if (item.status === 'Overdue') {
        overdue++;
      } else if (item.status === 'Returned') {
        returned++;
      }
    });

    return { currentlyBorrowed, dueSoon, overdue, returned };
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return mockBorrowed.filter(item => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
                            item.componentName.toLowerCase().includes(query) || 
                            item.componentCode.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const getStatusClass = (status) => {
    if (status === 'Issued') return 'status-issued';
    if (status === 'Returned') return 'status-returned';
    if (status === 'Overdue') return 'status-overdue';
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="borrowed-module">
      <header className="module-header">
        <div>
          <h1 className="module-title">Borrowed Components</h1>
          <p className="module-subtitle">View the components currently issued to you and their return details.</p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="borrowed-summary">
        <div className="summary-card">
          <h4>Currently Borrowed</h4>
          <span className="summary-val text-issued">{summary.currentlyBorrowed}</span>
        </div>
        <div className="summary-card">
          <h4>Due Soon</h4>
          <span className="summary-val text-warning">{summary.dueSoon}</span>
        </div>
        <div className="summary-card">
          <h4>Overdue</h4>
          <span className="summary-val text-overdue">{summary.overdue}</span>
        </div>
        <div className="summary-card">
          <h4>Returned</h4>
          <span className="summary-val text-returned">{summary.returned}</span>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="borrowed-controls">
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
              <option value="Issued">Issued</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </section>

      {/* Borrowed List */}
      <section className="borrowed-list-container">
        {mockBorrowed.length === 0 ? (
          <div className="empty-state">
            <h3>No borrowed components</h3>
            <p>You haven't been issued any components yet.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <h3>No matching borrowed components found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="borrowed-table-wrapper">
            <table className="borrowed-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Category</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Fine</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} onClick={() => setSelectedItem(item)} className="borrowed-row">
                    <td>
                      <div className="td-comp-name">{item.componentName}</div>
                      <div className="td-comp-code">{item.componentCode}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>{formatDate(item.issueDate)}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td>
                      {item.returnDate ? formatDate(item.returnDate) : 
                       (item.status === 'Issued' || item.status === 'Overdue' ? <span className="not-returned">Not returned yet</span> : '-')}
                    </td>
                    <td>{item.fineAmount > 0 ? <span className="fine-amount">Rs. {item.fineAmount}</span> : '-'}</td>
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
          <div className="modal-content borrowed-details-modal" onClick={e => e.stopPropagation()}>
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
              
              <div className="borrowed-stats-grid">
                <div className="borrowed-stat-box">
                  <span className="stat-label">Issue Date</span>
                  <span className="stat-value">{formatDate(selectedItem.issueDate)}</span>
                </div>
                <div className="borrowed-stat-box">
                  <span className="stat-label">Due Date</span>
                  <span className="stat-value">{formatDate(selectedItem.dueDate)}</span>
                </div>
                <div className="borrowed-stat-box">
                  <span className="stat-label">Return Date</span>
                  <span className="stat-value">
                    {selectedItem.returnDate ? formatDate(selectedItem.returnDate) : 'Not returned yet'}
                  </span>
                </div>
                <div className={`borrowed-stat-box ${selectedItem.fineAmount > 0 ? 'has-fine' : ''}`}>
                  <span className="stat-label">Fine Amount</span>
                  <span className="stat-value">
                    {selectedItem.fineAmount > 0 ? `Rs. ${selectedItem.fineAmount}` : 'None'}
                  </span>
                </div>
              </div>
              
              {selectedItem.description && (
                <div className="modal-description">
                  <h4>Component Notes</h4>
                  <p>{selectedItem.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowedModule;
