import React, { useState, useMemo } from 'react';
import { mockComponents, mockRequests } from '../mockData';
import './ComponentsModule.css';

// SVG Icons for categories inside the modal (optional, but requested to keep previous visuals if possible)
const CategoryIcon = ({ category }) => {
  switch(category) {
    case 'Batteries':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-icon battery-icon">
          <rect x="5" y="8" width="14" height="8" rx="2" ry="2"></rect>
          <line x1="22" y1="10" x2="22" y2="14"></line>
          <line x1="12" y1="8" x2="12" y2="16"></line>
        </svg>
      );
    case 'Microcontrollers':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-icon mcu-icon">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="14" x2="23" y2="14"></line>
          <line x1="1" y1="9" x2="4" y2="9"></line>
          <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
      );
    case 'Motors':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-icon motor-icon">
          <circle cx="12" cy="12" r="8"></circle>
          <circle cx="12" cy="12" r="3"></circle>
          <line x1="12" y1="1" x2="12" y2="4"></line>
          <line x1="12" y1="20" x2="12" y2="23"></line>
          <line x1="1" y1="12" x2="4" y2="12"></line>
          <line x1="20" y1="12" x2="23" y2="12"></line>
        </svg>
      );
    case 'Sensors':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-icon sensor-icon">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
          <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-icon default-icon">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      );
  }
};

const ComponentsModule = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  
  const handleSelectComponent = (comp) => {
    setSelectedComponent(comp);
    setRequestMessage('');
    setRequestError('');
  };

  const handleRequest = () => {
    setRequestMessage('');
    setRequestError('');

    // Check for duplicate pending request
    const existingRequest = mockRequests.find(
      r => r.componentId === selectedComponent.id && r.status === 'Pending'
    );

    if (existingRequest) {
      setRequestError('You already have a pending request for this component.');
      return;
    }

    // Create new mock request
    const newRequest = {
      id: `REQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      componentId: selectedComponent.id,
      componentName: selectedComponent.name,
      componentCode: selectedComponent.code,
      category: selectedComponent.category,
      requestDate: new Date().toISOString(),
      queuePosition: null,
      availableFrom: null,
      status: 'Pending',
      description: 'Requested from Components module.'
    };

    // Add to shared mockRequests array
    mockRequests.unshift(newRequest);
    
    setRequestMessage('Request submitted successfully.');
  };
  
  // Get unique categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(mockComponents.map(c => c.category));
    return Array.from(cats);
  }, []);

  // Get components for the selected category
  const categoryComponents = useMemo(() => {
    if (!selectedCategory) return [];
    return mockComponents.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  const getStatusClass = (status) => {
    if (status === 'Available') return 'status-available';
    if (status === 'Low Stock') return 'status-low';
    return 'status-out';
  };

  return (
    <div className="components-module">
      {/* 
        STEP 1: COMPONENTS MAIN PAGE (Category List)
      */}
      {!selectedCategory && (
        <>
          <header className="module-header">
            <div>
              <h1 className="module-title">Components</h1>
            </div>
          </header>
          
          <div className="module-content">
            <h2 className="section-subtitle">Category</h2>
            <ol className="clean-numbered-list">
              {categories.map((category, index) => (
                <li 
                  key={category} 
                  className="list-item clickable"
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="list-number">{index + 1}.</span>
                  <span className="list-text">{category}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* 
        STEP 2: CATEGORY PAGE (Component List)
      */}
      {selectedCategory && (
        <div className="selected-category-view">
          <div className="header-with-back" style={{ marginBottom: '24px' }}>
            <button 
              className="back-btn" 
              onClick={() => setSelectedCategory(null)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Back to Categories
            </button>
          </div>
          
          <div className="category-header">
            <h1 className="module-title">{selectedCategory}</h1>
            <p className="module-subtitle">Explore components available in this category.</p>
          </div>
          
          <div className="category-content">
            <div className="component-cards-grid">
              {categoryComponents.map(comp => (
                <div 
                  key={comp.id} 
                  className="component-card clickable"
                  onClick={() => handleSelectComponent(comp)}
                >
                  <div className="comp-card-image">
                    <CategoryIcon category={comp.category} />
                  </div>
                  <div className="comp-card-body">
                    <h3 className="comp-card-title">{comp.name}</h3>
                    <p className="comp-card-desc">{comp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 
        STEP 3: COMPONENT DETAILS POPUP
      */}
      {selectedComponent && (
        <div className="modal-overlay" onClick={() => setSelectedComponent(null)}>
          <div className="modal-content component-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedComponent(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-visual">
              <CategoryIcon category={selectedComponent.category} />
            </div>
            
            <div className="modal-info">
              <div className="modal-header-row">
                <span className="modal-category">Category: {selectedComponent.category}</span>
              </div>
              
              <h2 className="modal-title">{selectedComponent.name}</h2>
              <p className="modal-code">Code: {selectedComponent.code}</p>
              
              <div className="modal-stats-list">
                <div className="stat-row">
                  <span className="stat-label">Total Quantity:</span>
                  <span className="stat-value">{selectedComponent.totalQuantity}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Available Quantity:</span>
                  <span className="stat-value">{selectedComponent.availableQuantity}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Status:</span>
                  <span className={`comp-status ${getStatusClass(selectedComponent.status)}`}>
                    {selectedComponent.status}
                  </span>
                </div>
              </div>
              
              <div className="modal-description">
                <h4>Description</h4>
                <p>{selectedComponent.description}</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="request-btn" 
                  disabled={selectedComponent.status === 'Out of Stock'}
                  onClick={handleRequest}
                >
                  {selectedComponent.status === 'Out of Stock' ? 'Currently Unavailable' : 'Request this Component'}
                </button>
                {requestMessage && <div className="request-msg success-msg">{requestMessage}</div>}
                {requestError && <div className="request-msg error-msg">{requestError}</div>}
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentsModule;
