import React from 'react';
import Select from 'react-select';
import { 
  Trash2, 
  Image, 
  Edit2, 
  Box as BoxIcon, 
  Disc as DiscIcon, 
  Book as ManualIcon,
  DollarSign 
} from 'lucide-react';

const CollectionCard = ({ 
  item, 
  onDelete,
  onEdit,
  loading 
}) => {
  if (!item || !item.gameDetails) {
    return (
      <div className="collection-card">
        <div className="card-body">
          <p className="text-muted">Invalid game data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-card">
      <div className="collection-card-header">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h4 className="collection-card-title">
              <span dangerouslySetInnerHTML={{ __html: item.gameDetails.displayName }} />
            </h4>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={() => onEdit(item)}
              title="Edit Game"
            >
              <Edit2 size={14} />
            </button>
            <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={() => onDelete(item.id)}
              title="Delete Game"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="mt-2 text-muted small">
          Added: {item.addedDate ? new Date(item.addedDate).toLocaleString() : '-'}
        </div>
      </div>
      
      <div className="collection-card-body">
        <div className="collection-card-cover">
          {item.gameDetails.coverUrl ? (
            <img 
              src={item.gameDetails.coverUrl} 
              alt={item.gameDetails.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="placeholder-cover">
              <Image size={100} className="text-muted" />
              <span>No Cover Available</span>
            </div>
          )}
        </div>

        <div className="collection-card-info">
          <div className="collection-card-conditions">
            <div className="condition-item">
              <BoxIcon size={16} className="me-1" />
              <span className="condition-value">{item.boxCondition || '-'}</span>
            </div>
            <div className="condition-item">
              <ManualIcon size={16} className="me-1" />
              <span className="condition-value">{item.manualCondition || '-'}</span>
            </div>
            <div className="condition-item">
              <DiscIcon size={16} className="me-1" />
              <span className="condition-value">{item.discCondition || '-'}</span>
            </div>
          </div>

          <div className="collection-card-prices d-flex">
            <div className="price-item me-3">
              <div className="price-label">
                <DollarSign size={16} className="me-1" />
              </div>
              <div className="price-value">{item.cibPrice !== null ? `$${item.cibPrice}` : '-'}</div>
            </div>
            <div className="price-item me-3">
              <div className="price-label">Override:</div>
              <div className="price-value">{item.price_override || '-'}</div>
            </div>
            <div className="price-item">
              <div className="price-label">Final:</div>
              <div className="price-value">
                {item.price_override ? 
                  `$${item.price_override} (Override)` : 
                  item.cibPrice ? `$${item.cibPrice} (CIB)` : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard; 