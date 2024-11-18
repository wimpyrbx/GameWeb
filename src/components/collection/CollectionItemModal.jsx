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
    if (formData.PriceOverride) {
      return `kr ${formData.PriceOverride} (Override)`;
    }
    if (formData.isCib && game.CIB_NOK2) {
      return `kr ${game.CIB_NOK2} (CIB)`;
    }
    return game.LOOSE_NOK2 ? `kr ${game.LOOSE_NOK2} (Loose)` : '-';
  };

  // Add click outside handler
  const handleClickOutside = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
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
              <div className="condition-grid">
                <div className="condition-item">
                  <label>
                    <BoxIcon size={16} className="me-2" />
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
                    <ManualIcon size={16} className="me-2" />
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
                    <DiscIcon size={16} className="me-2" />
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

              <div className="price-section">
                <div className="price-grid">
                  <div className="price-row">
                    <span>Loose:</span>
                    <span>kr {game.LOOSE_NOK2 || '-'}</span>
                    <span>CIB:</span>
                    <span>kr {game.CIB_NOK2 || '-'}</span>
                    <span>New:</span>
                    <span>kr {game.NEW_NOK2 || '-'}</span>
                  </div>
                </div>

                <div className="price-override mt-3">
                  <label>Price Override</label>
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
                  <small className="text-muted">
                    Leave empty to use PriceCharting values
                  </small>
                </div>

                <div className="final-price mt-3">
                  <h5>Final Price: {getFinalPrice()}</h5>
                </div>
              </div>

              <div className="flags-section mt-4">
                <div className="flags-grid">
                  <div className="flag-item">
                    <label className="d-flex align-items-center gap-2">
                      <span>Kinect Required</span>
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
                    </label>
                  </div>
                  <div className="flag-item">
                    <label className="d-flex align-items-center gap-2">
                      <span>Special Edition</span>
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
                    </label>
                  </div>
                  <div className="flag-item">
                    <label className="d-flex align-items-center gap-2">
                      <span>New</span>
                      <Switch
                        checked={formData.isNew}
                        onChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked }))}
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
                    </label>
                  </div>
                  <div className="flag-item">
                    <label className="d-flex align-items-center gap-2">
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
                    </label>
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
          display: flex;
          flex-direction: column;
          gap: 1rem;
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
        }

        .flag-item span {
          font-size: 0.9rem;
        }

        .pricecharting-header {
          display: flex;
          justify-content: center;
          padding: 1rem 0;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 1rem;
        }

        .pricecharting-logo {
          height: 30px;
          transition: opacity 0.2s;
        }

        .pricecharting-link:hover .pricecharting-logo {
          opacity: 0.8;
        }

        .flags-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 1rem 0;
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
        }

        .flag-item span {
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .flags-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default CollectionItemModal; 