import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ToggleSwitch from '../ui/ToggleSwitch';
import { Image, Search, ExternalLink } from 'lucide-react';

const EditGameModal = ({ game, regions, ratings, consoles, onSave, onClose, show }) => {
  const [formData, setFormData] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);

  // Helper function to get region name from ID
  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : null;
  };

  useEffect(() => {
    if (game && show) {
      const initialFormData = {
        id: game.id,
        title: game.title || '',
        regionId: game.regionId,
        ratingId: game.ratingId,
        isKinect: Boolean(game.isKinect),
        isSpecial: Boolean(game.isSpecial),
        releaseYear: game.releaseYear || '',
        developer: game.developer || '',
        publisher: game.publisher || '',
        genre: game.genre || '',
        consoleId: game.consoleId || '',
        pricechartingUrl: game.pricechartingUrl || '',
        coverUrl: game.coverUrl || ''
      };
      setFormData(initialFormData);
      setInitialData(initialFormData);

      if (game.regionId) {
        const regionName = getRegionName(game.regionId);
        const regionRatings = ratings.filter(r => r.region === regionName);
        setAvailableRatings(regionRatings);
      }
    }
  }, [game, show, ratings, regions]);

  const handleRegionChange = async (selectedOption) => {
    const newRegionId = selectedOption ? selectedOption.id : null;
    
    // First, update formData with new region and clear rating
    setFormData(prev => ({
      ...prev,
      regionId: newRegionId,
      ratingId: null
    }));

    // Then immediately clear available ratings
    setAvailableRatings([]);

    // If we have a new region selected, get its ratings
    if (newRegionId) {
      const regionName = getRegionName(newRegionId);
      const newRatings = ratings.filter(r => r.region === regionName);
      console.log('New ratings for region:', regionName, newRatings);
      setAvailableRatings(newRatings);
    }
  };

  // Handle rating change separately
  const handleRatingChange = (selectedOption) => {
    const newRatingId = selectedOption ? selectedOption.value : null;
    console.log('Setting new rating:', newRatingId);
    
    setFormData(prev => ({
      ...prev,
      ratingId: newRatingId
    }));
  };

  // Find the current rating in the formatted options
  const getCurrentRatingOption = () => {
    if (!formData.ratingId || !availableRatings.length) return null;
    
    const rating = availableRatings.find(r => r.id === formData.ratingId);
    if (!rating) return null;

    return {
      ...rating,
      label: rating.name,
      value: rating.id
    };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'releaseYear') {
      if (value === '' || (/^\d{0,4}$/.test(value) && value.length <= 4)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = async () => {
    const errors = {};

    // Title validation
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }

    // Console validation
    if (!formData.consoleId) {
      errors.consoleId = 'Console is required';
    }

    // Year validation
    if (formData.releaseYear) {
      const yearPattern = /^(19|20)\d{2}$/;
      if (!yearPattern.test(formData.releaseYear)) {
        errors.releaseYear = 'Year must be a 4-digit number starting with 19 or 20';
      }
    }

    // Check if PriceCharting URL already exists
    if (formData.pricechartingUrl && formData.pricechartingUrl !== game.pricechartingUrl) {
      setIsChecking(true);
      try {
        const response = await fetch(`http://localhost:3001/api/gamesdatabase/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            consoleId: formData.consoleId,
            pricechartingUrl: formData.pricechartingUrl
          })
        });
        const data = await response.json();
        if (data.exists) {
          errors.pricechartingUrl = 'This PriceCharting URL is already registered to another game';
        }
      } catch (error) {
        errors.pricechartingUrl = 'Error checking PriceCharting URL';
      } finally {
        setIsChecking(false);
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) return;
    onSave(formData);
  };

  // Add function to format ratings options
  const formatRatingOptions = (ratings) => {
    if (!ratings.length) return [{ 
      label: 'NO RATING',
      options: [{ label: 'No Rating Selected', value: null }]
    }];

    const groupedRatings = ratings.reduce((acc, rating) => {
      if (!acc[rating.system]) {
        acc[rating.system] = [];
      }
      acc[rating.system].push(rating);
      return acc;
    }, {});

    return Object.entries(groupedRatings).map(([system, ratings]) => ({
      label: system,
      options: ratings.map(rating => ({
        ...rating,
        label: rating.name,
        value: rating.id
      }))
    }));
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Add function to check if form has changes
  const hasChanges = () => {
    if (!initialData || !formData) return false;
    
    return Object.keys(initialData).some(key => {
      // Handle special cases for boolean values
      if (typeof initialData[key] === 'boolean') {
        return Boolean(initialData[key]) !== Boolean(formData[key]);
      }
      // Handle null/undefined cases
      if (!initialData[key] && !formData[key]) return false;
      // Compare values
      return initialData[key] !== formData[key];
    });
  };

  const handleGoogleImageSearch = () => {
    const consoleName = consoles.find(c => c.id === formData.consoleId)?.name || '';
    const searchQuery = encodeURIComponent(`${consoleName} ${formData.title} cover`);
    window.open(`https://www.google.com/search?q=${searchQuery}&tbm=isch`, '_blank');
  };

  if (!show || !formData) return null;

  return (
    <div 
      className="modal" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
        overflow: 'auto'
      }}
      onClick={handleOverlayClick}
    >
      <div style={{ 
        position: 'relative',
        width: '80%',
        maxWidth: '1200px',
        margin: '1.75rem auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div className="modal-header" style={{
          backgroundColor: '#1e2531',
          color: '#fff',
          borderBottom: '1px solid #2d3446'
        }}>
          <h5 className="modal-title">
            Editing <i>{consoles.find(c => c.id === formData.consoleId)?.name}</i> » <i>{formData.title}</i>
          </h5>
          <button 
            type="button" 
            className="close" 
            onClick={onClose}
            style={{ color: '#fff' }}
          >
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-2">
                {formData.coverUrl ? (
                  <>
                    <img 
                      src={formData.coverUrl} 
                      alt={formData.title}
                      style={{ 
                        width: '100%',
                        height: 'auto',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                        borderRadius: '8px'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                      onClick={handleGoogleImageSearch}
                      title="Search Google Images"
                    >
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
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                      Find Cover
                    </button>
                  </>
                ) : (
                  <>
                    <div 
                      className="text-muted" 
                      style={{
                        border: '2px dashed #dee2e6',
                        borderRadius: '8px',
                        padding: '2rem',
                        backgroundColor: '#f8f9fa',
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      <Image size={48} className="text-muted" />
                      <span>No cover image available</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                      onClick={handleGoogleImageSearch}
                      title="Search Google Images"
                    >
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
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                      Find Cover
                    </button>
                  </>
                )}
              </div>
              <div className="col-md-10">
                <div className="row mb-3" style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '1rem' }}>
                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '60px', minWidth: '60px' }}>Title</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-3" style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '1rem' }}>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '70px', minWidth: '70px' }}>Console</label>
                      <Select
                        value={consoles.find(c => c.id === formData.consoleId)}
                        onChange={(option) => setFormData(prev => ({
                          ...prev,
                          consoleId: option ? option.id : null
                        }))}
                        options={consoles}
                        getOptionLabel={option => option.name}
                        getOptionValue={option => option.id}
                        placeholder="Select Console..."
                        className="flex-grow-1"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            borderColor: validationErrors.consoleId ? '#dc3545' : base.borderColor,
                            '&:hover': {
                              borderColor: validationErrors.consoleId ? '#dc3545' : base['&:hover'].borderColor
                            }
                          })
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '45px', minWidth: '45px' }}>Year</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.releaseYear ? 'is-invalid' : ''}`}
                        name="releaseYear"
                        value={formData.releaseYear}
                        onChange={handleInputChange}
                        placeholder="YYYY"
                        maxLength="4"
                        style={{ backgroundImage: 'none' }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '60px', minWidth: '60px' }}>Region</label>
                      <Select
                        value={regions.find(r => r.id === formData.regionId)}
                        onChange={handleRegionChange}
                        options={regions}
                        getOptionLabel={option => option.name}
                        getOptionValue={option => option.id}
                        isClearable
                        placeholder="Select Region..."
                        className="flex-grow-1"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '60px', minWidth: '60px' }}>Rating</label>
                      <Select
                        value={getCurrentRatingOption()}
                        onChange={handleRatingChange}
                        options={formatRatingOptions(availableRatings)}
                        isDisabled={!formData.regionId}
                        isClearable
                        placeholder="Select Rating..."
                        noOptionsMessage={() => formData.regionId ? "No ratings available" : "Select a region first"}
                        className="flex-grow-1"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '38px'
                          }),
                          groupHeading: (base) => ({
                            ...base,
                            color: '#666',
                            fontSize: '0.85em',
                            fontWeight: 600,
                            textTransform: 'none',
                            padding: '4px 12px',
                            backgroundColor: '#f8f9fa'
                          }),
                          option: (base, state) => ({
                            ...base,
                            fontSize: '0.9em',
                            padding: '4px 12px',
                            backgroundColor: state.isFocused ? '#e9ecef' : base.backgroundColor,
                            color: '#333'
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '80px', minWidth: '80px' }}>Developer</label>
                      <input
                        type="text"
                        className="form-control"
                        name="developer"
                        value={formData.developer}
                        onChange={handleInputChange}
                        placeholder="Developer"
                      />
                    </div>
                    <div className="mb-3 d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '80px', minWidth: '80px' }}>Publisher</label>
                      <input
                        type="text"
                        className="form-control"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleInputChange}
                        placeholder="Publisher"
                      />
                    </div>
                    <div className="d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '80px', minWidth: '80px' }}>Genre</label>
                      <input
                        type="text"
                        className="form-control"
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        placeholder="Genre"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex flex-column gap-3">
                      <ToggleSwitch
                        id="isKinect"
                        checked={formData.isKinect}
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          isKinect: checked
                        }))}
                        label="Kinect Required"
                      />
                      <ToggleSwitch
                        id="isSpecial"
                        checked={formData.isSpecial}
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          isSpecial: checked
                        }))}
                        label="Special Edition"
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <div className="mb-3 d-flex align-items-center">
                      <label 
                        className="form-label mb-0 me-4" 
                        style={{ 
                          width: '100px', 
                          minWidth: '100px',
                          cursor: formData.pricechartingUrl ? 'pointer' : 'default'
                        }}
                        onClick={() => formData.pricechartingUrl && window.open(formData.pricechartingUrl, '_blank')}
                      >
                        Pricecharting
                      </label>
                      <input
                        type="url"
                        className={`form-control ${validationErrors.pricechartingUrl ? 'is-invalid' : ''}`}
                        name="pricechartingUrl"
                        value={formData.pricechartingUrl || ''}
                        onChange={handleInputChange}
                        placeholder="https://www.pricecharting.com/game/..."
                        style={{ backgroundImage: 'none' }}
                      />
                    </div>
                    <div className="d-flex align-items-center">
                      <label className="form-label mb-0 me-4" style={{ width: '100px', minWidth: '100px' }}>Cover</label>
                      <input
                        type="url"
                        className="form-control"
                        name="coverUrl"
                        value={formData.coverUrl || ''}
                        onChange={handleInputChange}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer px-0 pt-3 pb-0">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn ${hasChanges() ? 'btn-primary' : 'btn-secondary opacity-50'}`}
                    disabled={isChecking || !hasChanges()}
                  >
                    {isChecking ? 'Checking...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGameModal; 