import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import RegionSelect from '../ui/RegionSelect';
import RatingSelect from '../ui/RatingSelect';

const AddGameManual = ({ onGameAdded }) => {
  const [formData, setFormData] = useState({
    consoleId: null,
    title: '',
    regionId: null,
    ratingId: null,
    pricechartingUrl: '',
    coverUrl: '',
    developer: '',
    publisher: '',
    releaseDate: '',
    genre: ''
  });

  const [consoles, setConsoles] = useState([]);
  const [regions, setRegions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConsoles();
    loadRegions();
    loadAllRatings();
  }, []);

  const loadConsoles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/consoles');
      if (!response.ok) throw new Error('Failed to fetch consoles');
      const data = await response.json();
      setConsoles(data.map(c => ({ value: c.id, label: c.name })));
    } catch (error) {
      setError('Failed to load consoles');
    }
  };

  const loadRegions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/regions');
      if (!response.ok) throw new Error('Failed to fetch regions');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      setError('Failed to load regions');
    }
  };

  const loadAllRatings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ratings');
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      setError('Failed to load ratings');
    }
  };

  const handleRegionChange = (selectedOption) => {
    setFormData(prev => ({ 
      ...prev, 
      regionId: selectedOption?.id || null,
      ratingId: null 
    }));

    if (selectedOption) {
      const regionName = selectedOption.name;
      const regionRatings = ratings.filter(rating => rating.region === regionName);
      setAvailableRatings(regionRatings);
    } else {
      setAvailableRatings([]);
    }
  };

  const handleRatingChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      ratingId: selectedOption ? selectedOption.id : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/gamesdatabase/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          consoleId: formData.consoleId?.value,
          pricechartingUrl: formData.pricechartingUrl
        })
      });

      const checkResult = await response.json();
      
      if (checkResult.exists) {
        throw new Error(checkResult.message || 'Game already exists in database');
      }

      const addResponse = await fetch('http://localhost:3001/api/gamesdatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          consoleId: formData.consoleId?.value,
          ratingId: formData.ratingId
        })
      });

      if (!addResponse.ok) throw new Error('Failed to add game');

      setFormData({
        consoleId: null,
        title: '',
        regionId: null,
        ratingId: null,
        pricechartingUrl: '',
        coverUrl: '',
        developer: '',
        publisher: '',
        releaseDate: '',
        genre: ''
      });

      if (onGameAdded) onGameAdded();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Add Game Manually</h3>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6 pe-4">
              <Select
                placeholder="Select Console"
                options={consoles}
                value={formData.consoleId}
                onChange={option => setFormData(prev => ({ ...prev, consoleId: option }))}
                isSearchable
                required
                className="w-100"
              />
            </div>
            <div className="col-md-6 ps-4">
              <input
                type="text"
                className="form-control"
                placeholder="Game Title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <RegionSelect
                value={regions.find(r => r.id === formData.regionId)}
                onChange={handleRegionChange}
                regions={regions}
              />
            </div>
            <div className="col-md-6">
              <RatingSelect
                value={ratings.find(r => r.id === formData.ratingId)}
                onChange={handleRatingChange}
                ratings={availableRatings}
                isDisabled={!formData.regionId}
                noOptionsMessage={formData.regionId ? "No ratings available" : "Select a region first"}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="url"
                className="form-control"
                placeholder="PriceCharting URL"
                value={formData.pricechartingUrl}
                onChange={e => setFormData(prev => ({ ...prev, pricechartingUrl: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <input
                type="url"
                className="form-control"
                placeholder="Cover Image URL"
                value={formData.coverUrl}
                onChange={e => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Game'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGameManual; 