import React, { useState, useMemo } from 'react';
import { mockDamageRecords } from '../mockData';
import './DamageRecordsModule.css';

const DamageRecordsModule = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const summary = useMemo(() => {
    let open = 0;
    let totalQty = 0;

    mockDamageRecords.forEach(record => {
      if (record.status === 'Reported') open++;
      totalQty += record.quantityDamaged;
    });

    return {
      total: mockDamageRecords.length,
      open,
      totalQty
    };
  }, []);

  const filteredRecords = useMemo(() => {
    return mockDamageRecords.filter(record => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
                            record.componentName.toLowerCase().includes(query) ||
                            record.componentCode.toLowerCase().includes(query) ||
                            record.damageDescription.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'All' || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.damageDate) - new Date(a.damageDate));
  }, [searchQuery, statusFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    if (status === 'Reported') return 'status-reported';
    if (status === 'Resolved') return 'status-resolved';
    return '';
  };

  return (
    <div className="damage-records-module">
      <header className="module-header">
        <div>
          <h1 className="module-title">Damage Records</h1>
          <p className="module-subtitle">View damage records reported for components issued to you.</p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="damage-summary">
        <div className="summary-card">
          <h4>Total Damage Records</h4>
          <span className="summary-val">{summary.total}</span>
        </div>
        <div className="summary-card">
          <h4>Open / Reported</h4>
          <span className="summary-val text-reported">{summary.open}</span>
        </div>
        <div className="summary-card">
          <h4>Total Quantity Damaged</h4>
          <span className="summary-val">{summary.totalQty}</span>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="damage-controls">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search by component or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-select">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Reported">Reported</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="damage-list-container">
        {mockDamageRecords.length === 0 ? (
          <div className="empty-state">
            <h3>No damage records found</h3>
            <p>You have no damage records for any issued components.</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <h3>No matching damage records found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="damage-table-wrapper">
            <table className="damage-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Damage Date</th>
                  <th>Quantity</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} onClick={() => setSelectedRecord(record)} className="damage-row">
                    <td>
                      <div className="td-comp-name">{record.componentName}</div>
                      <div className="td-comp-code">{record.componentCode}</div>
                    </td>
                    <td>{formatDate(record.damageDate)}</td>
                    <td>{record.quantityDamaged}</td>
                    <td className="td-desc">{record.damageDescription}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        {record.status}
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
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content damage-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedRecord(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-info">
              <div className="modal-header-row">
                <span className="modal-category">Category: {selectedRecord.category}</span>
                <span className={`status-badge ${getStatusClass(selectedRecord.status)}`}>
                  {selectedRecord.status}
                </span>
              </div>
              
              <h2 className="modal-title">{selectedRecord.componentName}</h2>
              <p className="modal-code">Code: {selectedRecord.componentCode}</p>
              
              <div className="damage-stats-grid">
                <div className="damage-stat-box">
                  <span className="stat-label">Damage Date</span>
                  <span className="stat-value">{formatDate(selectedRecord.damageDate)}</span>
                </div>
                <div className="damage-stat-box">
                  <span className="stat-label">Quantity Damaged</span>
                  <span className="stat-value">{selectedRecord.quantityDamaged}</span>
                </div>
                <div className="damage-stat-box">
                  <span className="stat-label">Issue ID</span>
                  <span className="stat-value">#{selectedRecord.issueId}</span>
                </div>
              </div>
              
              <div className="modal-description">
                <h4>Damage Description</h4>
                <p>{selectedRecord.damageDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamageRecordsModule;
