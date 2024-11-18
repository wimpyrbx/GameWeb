import React from 'react';
import Select from 'react-select';

const RatingSelect = ({ 
  value, 
  onChange, 
  ratings, 
  isDisabled, 
  placeholder = "Select Rating...",
  noOptionsMessage = () => "No ratings available"
}) => {
  // Helper function to format ratings into grouped options
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

  return (
    <Select
      value={value}
      onChange={onChange}
      options={formatRatingOptions(ratings)}
      isDisabled={isDisabled}
      isClearable
      placeholder={placeholder}
      noOptionsMessage={() => noOptionsMessage}
      className="flex-grow-1"
      formatOptionLabel={(option) => (
        <div className="d-flex align-items-center">
          <img
            src={`/ratings/${option.system?.toLowerCase()}/${option.name?.toLowerCase().replace(' ', '_')}.webp`}
            alt={option.name}
            style={{
              height: '16px',
              width: 'auto',
              objectFit: 'contain',
              marginRight: '12px'
            }}
          />
          <span>{option.name}</span>
        </div>
      )}
      styles={{
        control: (base) => ({
          ...base,
          minHeight: '38px'
        }),
        option: (base) => ({
          ...base,
          padding: '8px 12px'
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0 8px'
        }),
        groupHeading: (base) => ({
          ...base,
          color: '#666',
          fontSize: '0.85em',
          fontWeight: 600,
          textTransform: 'none',
          padding: '4px 12px',
          backgroundColor: '#f8f9fa'
        })
      }}
    />
  );
};

export default RatingSelect; 