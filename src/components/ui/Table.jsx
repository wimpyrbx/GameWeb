import React from 'react';

const Table = ({ columns, data }) => (
  <div className="table-responsive">
    <div className="table-controls">
      <div className="entries-control">
        Show <select className="form-control form-control-sm d-inline-block w-auto">
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select> entries
      </div>
      <div className="search-control">
        <input type="text" className="form-control form-control-sm" placeholder="Search" />
      </div>
    </div>
    <table className="table table-striped">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table; 