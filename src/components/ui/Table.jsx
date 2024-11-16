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
            <th key={index}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={colIndex}>
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="text-center">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default Table; 