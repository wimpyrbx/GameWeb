import React from 'react';
import Switch from 'react-switch';

const ToggleSwitch = ({ id, checked, onChange, label }) => {
  return (
    <div className="d-flex align-items-center justify-content-between p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <label 
        htmlFor={id}
        style={{
          userSelect: 'none',
          marginBottom: 0,
          fontSize: '0.9rem',
          color: '#495057'
        }}
      >
        {label}
      </label>
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
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
  );
};

export default ToggleSwitch; 