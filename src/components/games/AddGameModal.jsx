import React, { useState } from 'react';
import { X } from 'lucide-react';
import Select from 'react-select';

const AddGameModal = ({ 
  onClose, 
  onAdd, 
  games, 
  consoles, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    gameId: '',
    boxCondition: '3',
    manualCondition: '3',
    discCondition: '3'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleConditionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Game to Collection</h3>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label htmlFor="gameId">Select Game</label>
              <select 
                id="gameId"
                className="form-control" 
                value={formData.gameId}
                onChange={(e) => setFormData(prev => ({ ...prev, gameId: e.target.value }))}
                required
              >
                <option value="">Select Game</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.title} ({consoles.find(c => c.id === game.consoleId)?.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-4">
              <label>Condition Ratings</label>
              <div className="d-flex gap-3">
                <div>
                  <label className="small text-muted">Box</label>
                  <Select 
                    id="boxCondition" 
                    name="boxCondition" 
                    options={[1, 2, 3, 4, 5].map(value => ({
                      value,
                      label: value,
                      color: value === 1 ? 'red' : value === 5 ? 'green' : '#d4edda'
                    }))}
                    onChange={(option) => handleConditionChange('boxCondition', option.value)}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        width: '60px',
                        backgroundColor: '#d4edda',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#d4edda' : state.isFocused ? '#f0f0f0' : '#fff',
                        color: state.data.color,
                      }),
                    }}
                    value={{ 
                      value: formData.boxCondition, 
                      label: formData.boxCondition, 
                      color: formData.boxCondition === 1 ? 'red' : formData.boxCondition === 5 ? 'green' : '#d4edda' 
                    }}
                  />
                </div>
                <div>
                  <label className="small text-muted">Manual</label>
                  <Select 
                    id="manualCondition" 
                    name="manualCondition" 
                    options={[1, 2, 3, 4, 5].map(value => ({
                      value,
                      label: value,
                      color: value === 1 ? 'red' : value === 5 ? 'green' : '#d4edda'
                    }))}
                    onChange={(option) => handleConditionChange('manualCondition', option.value)}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        width: '60px',
                        backgroundColor: '#d4edda',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#d4edda' : state.isFocused ? '#f0f0f0' : '#fff',
                        color: state.data.color,
                      }),
                    }}
                    value={{ 
                      value: formData.manualCondition, 
                      label: formData.manualCondition, 
                      color: formData.manualCondition === 1 ? 'red' : formData.manualCondition === 5 ? 'green' : '#d4edda' 
                    }}
                  />
                </div>
                <div>
                  <label className="small text-muted">Disc</label>
                  <Select 
                    id="discCondition" 
                    name="discCondition" 
                    options={[1, 2, 3, 4, 5].map(value => ({
                      value,
                      label: value,
                      color: value === 1 ? 'red' : value === 5 ? 'green' : '#d4edda'
                    }))}
                    onChange={(option) => handleConditionChange('discCondition', option.value)}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        width: '60px',
                        backgroundColor: '#d4edda',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#d4edda' : state.isFocused ? '#f0f0f0' : '#fff',
                        color: state.data.color,
                      }),
                    }}
                    value={{ 
                      value: formData.discCondition, 
                      label: formData.discCondition, 
                      color: formData.discCondition === 1 ? 'red' : formData.discCondition === 5 ? 'green' : '#d4edda' 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !formData.gameId}
              >
                {loading ? 'Adding...' : 'Add to Collection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGameModal; 