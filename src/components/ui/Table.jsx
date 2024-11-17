import React from 'react';

const Table = ({ columns, data }) => (
  <div className="table-responsive">
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