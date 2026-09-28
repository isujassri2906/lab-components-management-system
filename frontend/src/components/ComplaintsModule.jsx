import React, { useState, useMemo } from 'react';
import { mockComplaints, mockComponents } from '../mockData';
import './ComplaintsModule.css';

const ComplaintsModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [refresh, setRefresh] = useState(0); // Force re-render on new complaint

  // Form State
  const [newComplaint, setNewComplaint] = useState({ componentId: '', description: '' });
  const [formSuccess, setFormSuccess] = useState('');

  const summary = useMemo(() => {
    let open = 0;
    let resolved = 0;

    mockComplaints.forEach(comp => {
      if (comp.status === 'open') open++;
      else if (comp.status === 'resolved') resolved++;
    });

    return { total: mockComplaints.length, open, resolved };
  }, [mockComplaints, refresh]);

  const filteredComplaints = useMemo(() => {
    return mockComplaints.filter(comp => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
                            comp.componentName.toLowerCase().includes(query) ||
                            comp.componentCode.toLowerCase().includes(query) ||
                            comp.description.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'All' || comp.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.id - a.id);
  }, [searchQuery, statusFilter, refresh]);

  const handleRaiseSubmit = (e) => {
    e.preventDefault();
    if (!newComplaint.componentId || !newComplaint.description.trim()) return;

    const component = mockComponents.find(c => c.id.toString() === newComplaint.componentId);
    
    if (component) {
      const newMockComplaint = {
        id: Math.floor(Math.random() * 10000),
        componentId: component.id,
        componentName: component.name,
        componentCode: component.code,
        category: component.category,
        description: newComplaint.description.trim(),
        status: 'open'
      };

      mockComplaints.unshift(newMockComplaint);
      setRefresh(prev => prev + 1);
      setFormSuccess('Complaint raised successfully.');
      
      // Reset form
      setNewComplaint({ componentId: '', description: '' });
      setTimeout(() => {
        setFormSuccess('');
        setShowRaiseModal(false);
      }, 2000);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'open') return 'status-open';
    if (status === 'resolved') return 'status-resolved';
    return '';
  };

  return (
    <div className="complaints-module">
      <header className="module-header">
        <div>
          <h1 className="module-title">Complaints</h1>
          <p className="module-subtitle">Raise and track complaints related to lab components.</p>
        </div>
        <button className="raise-btn" onClick={() => setShowRaiseModal(true)}>
          Raise Complaint
        </button>
      </header>

      {/* Summary Cards */}
      <section className="complaints-summary">
        <div className="summary-card">
          <h4>Total Complaints</h4>
          <span className="summary-val">{summary.total}</span>
        </div>
        <div className="summary-card">
          <h4>Open</h4>
          <span className="summary-val text-open">{summary.open}</span>
        </div>
        <div className="summary-card">
          <h4>Resolved</h4>
          <span className="summary-val text-resolved">{summary.resolved}</span>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="complaints-controls">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-select">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="complaints-list-container">
        {mockComplaints.length === 0 ? (
          <div className="empty-state">
            <h3>No complaints yet</h3>
            <p>You haven't raised any component complaints.</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <h3>No matching complaints found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="complaints-table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Component</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(comp => (
                  <tr key={comp.id} onClick={() => setSelectedComplaint(comp)} className="complaint-row">
                    <td>#{comp.id}</td>
                    <td>
                      <div className="td-comp-name">{comp.componentName}</div>
                      <div className="td-comp-code">{comp.componentCode}</div>
                    </td>
                    <td className="td-desc">{comp.description}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(comp.status)}`}>
                        {comp.status}
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
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content complaint-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedComplaint(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-info">
              <div className="modal-header-row">
                <span className="modal-category">Category: {selectedComplaint.category}</span>
                <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              
              <h2 className="modal-title">{selectedComplaint.componentName}</h2>
              <p className="modal-code">Code: {selectedComplaint.componentCode}</p>
              
              <div className="complaint-stats-grid">
                <div className="complaint-stat-box">
                  <span className="stat-label">Complaint ID</span>
                  <span className="stat-value">#{selectedComplaint.id}</span>
                </div>
              </div>
              
              <div className="modal-description">
                <h4>Description</h4>
                <p>{selectedComplaint.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raise Complaint Modal */}
      {showRaiseModal && (
        <div className="modal-overlay" onClick={() => !formSuccess && setShowRaiseModal(false)}>
          <div className="modal-content raise-complaint-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => !formSuccess && setShowRaiseModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="modal-info">
              <h2 className="modal-title">Raise Complaint</h2>
              <p className="modal-subtitle">Submit an issue regarding a specific lab component.</p>
              
              {formSuccess ? (
                <div className="complaint-success-state">
                  <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h3>{formSuccess}</h3>
                </div>
              ) : (
                <form onSubmit={handleRaiseSubmit} className="raise-complaint-form">
                  <div className="form-group">
                    <label>Component</label>
                    <select 
                      value={newComplaint.componentId} 
                      onChange={e => setNewComplaint({...newComplaint, componentId: e.target.value})}
                      required
                    >
                      <option value="">Select a component...</option>
                      {mockComponents.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Describe the issue in detail..."
                      value={newComplaint.description}
                      onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                      required
                      rows={5}
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-btn">Submit Complaint</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintsModule;
