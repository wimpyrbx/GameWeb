import React from 'react';
import Select from 'react-select';

const RegionSelect = ({ 
  value, 
  onChange, 
  regions, 
  isDisabled, 
  placeholder = "Select Region...",
  noOptionsMessage = () => "No regions available"
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={regions}
      getOptionLabel={option => option.name}
      getOptionValue={option => option.id}
      isDisabled={isDisabled}
      isClearable
      placeholder={placeholder}
      noOptionsMessage={() => noOptionsMessage}
      className="flex-grow-1"
      formatOptionLabel={(option) => (
        <div className="d-flex align-items-center">
          <img
            src={`/regions/${option.name.toLowerCase()}.webp`}
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
        })
      }}
    />
  );
};

export default RegionSelect; 