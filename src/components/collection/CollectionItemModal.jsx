import React, { useState, useEffect } from 'react';
import { X, DollarSign, Box as BoxIcon, Book as ManualIcon, Disc as DiscIcon, Image, Check } from 'lucide-react';
import Select from 'react-select';
import Switch from 'react-switch';

const conditionOptions = [
  { value: '5', label: '5 - Mint' },
  { value: '4', label: '4 - Very Good' },
  { value: '3', label: '3 - Good' },
  { value: '2', label: '2 - Fair' },
  { value: '1', label: '1 - Poor' },
  { value: 'missing', label: 'Missing' }
];

const CollectionItemModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  game, 
  existingItem = null, 
  isAdd = false 
}) => {
  const [formData, setFormData] = useState({
    boxCondition: '3',
    manualCondition: '3',
    discCondition: '3',
    price_override: '',
    isCib: true,
    isNew: false,
    isPromo: false,
    isSpecial: false,
    isKinect: game?.title?.toLowerCase().includes('kinect') || false
  });

  useEffect(() => {
    if (existingItem) {
      setFormData({
        boxCondition: existingItem.boxCondition || '3',
        manualCondition: existingItem.manualCondition || '3',
        discCondition: existingItem.discCondition || '3',
        price_override: existingItem.price_override || '',
        isCib: !['missing', '0'].includes(existingItem.boxCondition) && 
               !['missing', '0'].includes(existingItem.manualCondition) && 
               !['missing', '0'].includes(existingItem.discCondition),
        isNew: existingItem.isNew || false,
        isPromo: existingItem.isPromo || false,
        isSpecial: existingItem.isSpecial || false,
        isKinect: existingItem.isKinect || game?.title?.toLowerCase().includes('kinect') || false
      });
    }
  }, [existingItem, game]);

  const handleConditionChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Update CIB status
      newData.isCib = !['missing', '0'].includes(newData.boxCondition) && 
                      !['missing', '0'].includes(newData.manualCondition) && 
                      !['missing', '0'].includes(newData.discCondition);
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      gameId: game.id,
      consoleId: game.consoleId,
      regionId: game.regionId,
      addedDate: existingItem?.addedDate || new Date().toISOString()
    });
  };

  const getFinalPrice = () => {
    if (formData.price_override) {
      return `kr ${formData.price_override} (Override)`;
    }

    if (formData.isNew && game.NEW_NOK2) {
      return `kr ${game.NEW_NOK2} (New)`;
    }

    const isCib = !['missing', '0'].includes(formData.boxCondition) && 
                  !['missing', '0'].includes(formData.manualCondition) && 
                  !['missing', '0'].includes(formData.discCondition);

    if (isCib && game.CIB_NOK2) {
      return `kr ${game.CIB_NOK2} (CIB)`;
    }

    if (game.LOOSE_NOK2) {
      return `kr ${game.LOOSE_NOK2} (Loose)`;
    }

    return 'No Price Available';
  };

  // Add click outside handler
  const handleClickOutside = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  // Add handler for NEW switch
  const handleNewChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      isNew: checked,
      // If NEW is turned on, set all conditions to 5
      ...(checked ? {
        boxCondition: '5',
        manualCondition: '5',
        discCondition: '5'
      } : {})
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClickOutside}>
      <div className="modal-content collection-item-modal">
        <div className="modal-header" style={{
          backgroundColor: '#1e2531',
          color: '#fff',
          borderBottom: '1px solid #2d3446'
        }}>
          <h5 className="modal-title m-0">
            {isAdd ? 'Add' : 'Edit Collection Item'} » <i>{game.title}</i>
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            style={{ color: '#fff' }}
            aria-label="Close"
          />
        </div>
        
        <div className="modal-body">
          <div className="collection-item-details">
            <div className="cover-section">
              {game.coverUrl ? (
                <img 
                  src={game.coverUrl} 
                  alt={game.title} 
                  className="game-cover"
                />
              ) : (
                <div className="placeholder-cover">
                  <Image size={100} className="text-muted" />
                  <span>No Cover Available</span>
                </div>
              )}
            </div>

            <div className="info-section">
              {/* Group 1: Condition and CIB Status */}
              <div className="condition-group">
                <div className="condition-grid">
                  <div className="condition-item">
                    <label>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="me-3"
                      >
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        <path d="m3.3 7 8.7 5 8.7-5"></path>
                        <path d="M12 22V12"></path>
                      </svg>
                      Box
                    </label>
                    <Select
                      options={conditionOptions}
                      value={conditionOptions.find(opt => opt.value === formData.boxCondition)}
                      onChange={(option) => handleConditionChange('boxCondition', option.value)}
                      className="condition-select"
                    />
                  </div>

                  <div className="condition-item">
                    <label>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="me-3"
                      >
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        <path d="m3.3 7 8.7 5 8.7-5"></path>
                        <path d="M12 22V12"></path>
                      </svg>
                      Manual
                    </label>
                    <Select
                      options={conditionOptions}
                      value={conditionOptions.find(opt => opt.value === formData.manualCondition)}
                      onChange={(option) => handleConditionChange('manualCondition', option.value)}
                      className="condition-select"
                    />
                  </div>

                  <div className="condition-item">
                    <label>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="me-3"
                      >
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        <path d="m3.3 7 8.7 5 8.7-5"></path>
                        <path d="M12 22V12"></path>
                      </svg>
                      Disc
                    </label>
                    <Select
                      options={conditionOptions}
                      value={conditionOptions.find(opt => opt.value === formData.discCondition)}
                      onChange={(option) => handleConditionChange('discCondition', option.value)}
                      className="condition-select"
                    />
                  </div>
                </div>

                <div className={`cib-status ${formData.isCib ? 'is-cib' : 'not-cib'}`}>
                  {formData.isCib ? 'Complete In Box (CIB)' : 'Not Complete In Box'}
                </div>
              </div>

              {/* Group 2: PriceCharting and Prices */}
              <div className="price-group">
                {game.pricechartingUrl && (
                  <>
                    <a 
                      href={game.pricechartingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="pricecharting-link"
                    >
                      <img 
                        src="/logos/pricecharting.png" 
                        alt="PriceCharting" 
                        height="20"
                      />
                    </a>

                    <table className="price-table">
                      <tbody>
                        <tr>
                          <td>Loose:</td>
                          <td>kr {game.LOOSE_NOK2 || '-'}</td>
                        </tr>
                        <tr>
                          <td>CIB:</td>
                          <td>kr {game.CIB_NOK2 || '-'}</td>
                        </tr>
                        <tr>
                          <td>New:</td>
                          <td>kr {game.NEW_NOK2 || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                <div className="price-override">
                  <div className="input-group">
                    <span className="input-group-text">
                      <DollarSign size={16} />
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.price_override}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_override: e.target.value }))}
                      placeholder="Enter override price"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="final-price">
                  Final Price: {getFinalPrice()}
                </div>
              </div>

              {/* Group 3: Switches */}
              <div className="flags-group">
                <div className="flags-grid">
                  <div className="flag-item">
                    <span>Kinect</span>
                    <Switch
                      checked={formData.isKinect}
                      onChange={(checked) => setFormData(prev => ({ ...prev, isKinect: checked }))}
                      onColor="#86d3ff"
                      onHandleColor="#2693e6"
                      handleDiameter={24}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={20}
                      width={48}
                      className="react-switch"
                      disabled={game?.title?.toLowerCase().includes('kinect')}
                    />
                  </div>
                  <div className="flag-item">
                    <span>Special</span>
                    <Switch
                      checked={formData.isSpecial}
                      onChange={(checked) => setFormData(prev => ({ ...prev, isSpecial: checked }))}
                      onColor="#86d3ff"
                      onHandleColor="#2693e6"
                      handleDiameter={24}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={20}
                      width={48}
                      className="react-switch"
                    />
                  </div>
                  <div className="flag-item">
                    <span>New</span>
                    <Switch
                      checked={formData.isNew}
                      onChange={handleNewChange}
                      onColor="#86d3ff"
                      onHandleColor="#2693e6"
                      handleDiameter={24}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={20}
                      width={48}
                      className="react-switch"
                    />
                  </div>
                  <div className="flag-item">
                    <span>Promo</span>
                    <Switch
                      checked={formData.isPromo}
                      onChange={(checked) => setFormData(prev => ({ ...prev, isPromo: checked }))}
                      onColor="#86d3ff"
                      onHandleColor="#2693e6"
                      handleDiameter={24}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={20}
                      width={48}
                      className="react-switch"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {isAdd ? 'Add to Collection' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 800px;
          position: relative;
          margin: 1rem;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: #fff;
          opacity: 0.8;
        }

        .btn-close:hover {
          opacity: 1;
        }

        .collection-item-details {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 2rem;
          padding: 1rem;
        }

        .cover-section {
          width: 200px;
        }

        .info-section {
          flex: 1;
          min-width: 0;
        }

        .game-cover {
          width: 100%;
          height: auto;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .placeholder-cover {
          width: 100%;
          aspect-ratio: 3/4;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: #6c757d;
        }

        .price-grid {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .price-row {
          display: grid;
          grid-template-columns: auto 1fr auto 1fr auto 1fr;
          gap: 1rem;
          align-items: center;
        }

        .flags-section {
          border-top: 1px solid #dee2e6;
          padding-top: 1rem;
        }

        .flags-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .flag-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: white;
          border-radius: 4px;
        }

        .pricecharting-header {
          text-align: center;
          padding: 0.5rem 0;
          margin-bottom: 0.5rem;
        }

        .pricecharting-link:hover {
          opacity: 0.8;
        }

        .price-grid {
          background: #f8f9fa;
          padding: 0.5rem;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .price-row {
          display: grid;
          grid-template-columns: auto 1fr auto 1fr auto 1fr;
          gap: 0.5rem;
          align-items: center;
        }

        .price-override {
          margin: 0.5rem 0;
        }

        .flags-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 0.5rem;
        }

        @media (max-width: 768px) {
          .flags-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .condition-group {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
        }

        .condition-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .condition-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .condition-item label {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #495057;
          font-size: 0.9rem;
        }

        .cib-status {
          text-align: center;
          padding: 0.35rem;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .is-cib {
          background-color: #d1fae5;
          color: #065f46;
        }

        .not-cib {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .price-group {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
        }

        .pricecharting-link {
          display: block;
          text-align: center;
          margin-bottom: 0.25rem;
        }

        .price-grid {
          background: white;
          padding: 0.5rem;
          border-radius: 4px;
          margin: 0.25rem 0;
        }

        .price-row {
          display: grid;
          grid-template-columns: auto 1fr auto 1fr auto 1fr;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.9rem;
        }

        .price-override {
          margin-top: 0.5rem;
        }

        .price-override small {
          font-size: 0.8rem;
        }

        .flags-group {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 6px;
        }

        .flags-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .flag-item {
          display: flex;
          align-items: center;
        }

        .flag-item label {
          margin: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-weight: normal;
          color: #495057;
          font-size: 0.9rem;
        }

        .modal-body {
          padding: 1rem;
        }

        .collection-item-details {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 1rem;
        }

        .cover-section {
          width: 200px;
        }

        .game-cover {
          width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .placeholder-cover {
          width: 100%;
          aspect-ratio: 3/4;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: #6c757d;
        }

        .price-table {
          width: 100%;
          background: white;
          border-radius: 4px;
          margin: 0.5rem 0;
        }

        .price-table td {
          padding: 0.35rem 0.75rem;
        }

        .price-table td:first-child {
          font-weight: 500;
          width: 80px;
        }

        .price-table td:last-child {
          text-align: right;
        }

        .final-price {
          text-align: right;
          font-weight: 500;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .flags-grid {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.5rem;
        }

        .flag-item {
          flex: 1;
        }

        .flag-item label {
          width: 100%;
          justify-content: space-between;
        }

        .condition-group,
        .price-group,
        .flags-group {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
          border: 1px solid #dee2e6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .condition-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .flags-grid {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem;
        }

        .flag-item {
          flex: 1;
          min-width: 0; /* Prevent flex items from overflowing */
        }

        .flag-item label {
          margin: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-weight: normal;
          color: #495057;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .flag-item span {
          margin-right: 0.5rem;
        }

        .price-table {
          width: 100%;
          background: white;
          border-radius: 4px;
          margin: 0.5rem 0;
        }

        .price-table td {
          padding: 0.35rem 0.75rem;
        }

        .price-table td:first-child {
          font-weight: 500;
          width: 80px;
        }

        .price-table td:last-child {
          text-align: right;
        }

        .final-price {
          text-align: right;
          font-weight: 500;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: white;
          border-radius: 4px;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 800px;
          position: relative;
          margin: 1rem;
        }

        .info-section {
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CollectionItemModal; 