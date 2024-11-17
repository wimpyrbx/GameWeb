import React, { useState, useEffect } from 'react';
import { X, DollarSign, Box as BoxIcon, Book as ManualIcon, Disc as DiscIcon, Image, Check } from 'lucide-react';
import Select from 'react-select';

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content collection-item-modal">
        <div className="modal-header">
          <h3>{game.title}</h3>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
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

              <div className="flags-section">
                <div className="flags-grid">
                  <div className="flag-item">
                    <label className="flag-label">
                      <input
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                      />
                      <span>New</span>
                    </label>
                  </div>
                  <div className="flag-item">
                    <label className="flag-label">
                      <input
                        type="checkbox"
                        checked={formData.isPromo}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPromo: e.target.checked }))}
                      />
                      <span>Promo</span>
                    </label>
                  </div>
                  <div className="flag-item">
                    <label className="flag-label">
                      <input
                        type="checkbox"
                        checked={formData.isSpecial}
                        onChange={(e) => setFormData(prev => ({ ...prev, isSpecial: e.target.checked }))}
                      />
                      <span>Special</span>
                    </label>
                  </div>
                  <div className="flag-item">
                    <label className="flag-label">
                      <input
                        type="checkbox"
                        checked={formData.isKinect}
                        onChange={(e) => setFormData(prev => ({ ...prev, isKinect: e.target.checked }))}
                        disabled={game?.title?.toLowerCase().includes('kinect')}
                      />
                      <span>Kinect{game?.title?.toLowerCase().includes('kinect') ? ' (Auto)' : ''}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="price-section">
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

                <div className="price-override">
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
    </div>
  );
};

export default CollectionItemModal; 