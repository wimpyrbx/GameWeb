import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const AddGameManual = ({ onGameAdded }) => {
  const [formData, setFormData] = useState({
    consoleId: null,
    title: '',
    regionId: null,
    rating: null,
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

  useEffect(() => {
    if (formData.regionId) {
      const region = regions.find(r => r.value === formData.regionId.value);
      if (region) {
        const regionRatings = ratings.filter(rating => {
          if (region.label === 'PAL') {
            return ['PEGI', 'ACB', 'USK', 'BBFC'].includes(rating.system);
          } else if (region.label === 'NTSC-U') {
            return rating.system === 'ESRB';
          } else if (region.label === 'NTSC-J') {
            return rating.system === 'CERO';
          }
          return false;
        });

        const groupedRatings = regionRatings.reduce((acc, rating) => {
          if (!acc[rating.system]) {
            acc[rating.system] = [];
          }
          acc[rating.system].push({
            value: rating.name,
            label: `${rating.name} - ${rating.description}`,
            system: rating.system
          });
          return acc;
        }, {});

        const ratingOptions = [
          { 
            label: 'No Rating',
            options: [{ value: '', label: 'No Rating Selected' }]
          },
          ...Object.entries(groupedRatings).map(([system, options]) => ({
            label: system,
            options: options
          }))
        ];

        setAvailableRatings(ratingOptions);
        
        if (!formData.rating || !regionRatings.some(r => r.name === formData.rating.value)) {
          setFormData(prev => ({ 
            ...prev, 
            rating: { value: '', label: 'No Rating Selected' }
          }));
        }
      }
    } else {
      setAvailableRatings([]);
    }
  }, [formData.regionId, ratings, regions]);

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
      setRegions(data.map(r => ({ value: r.id, label: r.name })));
    } catch (error) {
      setError('Failed to load regions');
    }
  };

  const loadAllRatings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ratings');
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      const allRatings = Object.values(data).flat();
      setRatings(allRatings);
    } catch (error) {
      setError('Failed to load ratings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First check if game already exists
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

      // If check passes, proceed with adding the game
      const addResponse = await fetch('http://localhost:3001/api/gamesdatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          consoleId: formData.consoleId?.value,
          regionId: formData.regionId?.value,
          rating: formData.rating?.value
        })
      });

      if (!addResponse.ok) throw new Error('Failed to add game');

      setFormData({
        consoleId: null,
        title: '',
        regionId: null,
        rating: null,
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
            <div className="col-md-6">
              <Select
                placeholder="Select Console"
                options={consoles}
                value={formData.consoleId}
                onChange={option => setFormData(prev => ({ ...prev, consoleId: option }))}
                isSearchable
                required
              />
            </div>
            <div className="col-md-6">
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
              <Select
                placeholder="Select Region"
                options={regions}
                value={formData.regionId}
                onChange={option => setFormData(prev => ({ ...prev, regionId: option }))}
                isSearchable
                required
              />
            </div>
            <div className="col-md-6">
              <Select
                placeholder="Select Rating"
                options={availableRatings}
                value={formData.rating}
                onChange={option => setFormData(prev => ({ ...prev, rating: option }))}
                isSearchable
                isDisabled={!formData.regionId}
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