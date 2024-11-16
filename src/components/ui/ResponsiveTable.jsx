import React from 'react';
import { ChevronRight } from 'lucide-react';

const ResponsiveTable = ({ 
  columns, 
  data, 
  isMobile,
  mobileColumns = ['title', 'console'],
  onRowClick,
  emptyMessage = 'No data available',
  style = {}
}) => {
  if (isMobile) {
    return (
      <div className="mobile-table">
        {data.length === 0 ? (
          <div className="text-center p-3 text-muted">{emptyMessage}</div>
        ) : (
          data.map((item, index) => (
            <div 
              key={item.id || index} 
              className="mobile-table-row"
              onClick={() => onRowClick && onRowClick(item)}
            >
              <div className="mobile-table-content">
                <div className="mobile-table-main">
                  <div className="mobile-table-title">{item[mobileColumns[0]]}</div>
                  <div className="mobile-table-subtitle">{item[mobileColumns[1]]}</div>
                </div>
                <div className="mobile-table-action">
                  <ChevronRight size={20} className="text-muted" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped" style={style}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                style={{
                  width: column.width || 'auto',
                  padding: column.padding || '0.75rem',
                  maxWidth: column.width || 'none',
                  minWidth: column.width || 'auto',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex}
                    style={{
                      width: column.width || 'auto',
                      padding: column.padding || '0.75rem',
                      maxWidth: column.width || 'none',
                      minWidth: column.width || 'auto',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    className={column.className}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable; 