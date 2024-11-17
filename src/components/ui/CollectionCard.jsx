import React from 'react';
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
              {item.gameDetails.title}
            </h4>
          </div>
          <div className="d-flex gap-2">
            <Edit2 
              size={14} 
              className="text-primary cursor-pointer" 
              onClick={() => onEdit(item)}
              style={{ 
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            />
            <Trash2 
              size={14} 
              className="text-danger cursor-pointer" 
              onClick={() => onDelete(item.id)}
              style={{ 
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            />
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
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.png';
              }}
            />
          ) : (
            <div className="placeholder-cover">
              <Image size={100} className="text-muted" />
              <span>No Cover Available</span>
            </div>
          )}
        </div>

        <div className="collection-card-info p-0">
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
              <div className="price-value">
                {item.gameDetails.CIB_NOK2 ? `kr ${item.gameDetails.CIB_NOK2}` : '-'}
              </div>
            </div>
            <div className="price-item me-3">
              <div className="price-label">Override:</div>
              <div className="price-value">{item.PriceOverride ? `kr ${item.PriceOverride}` : '-'}</div>
            </div>
            <div className="price-item">
              <div className="price-label">Final:</div>
              <div className="price-value">
                {item.PriceOverride ? 
                  `kr ${item.PriceOverride} (Override)` : 
                  item.isCib ? 
                    (item.gameDetails.CIB_NOK2 ? `kr ${item.gameDetails.CIB_NOK2} (CIB)` : '-') :
                    (item.gameDetails.LOOSE_NOK2 ? `kr ${item.gameDetails.LOOSE_NOK2} (Loose)` : '-')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard; 