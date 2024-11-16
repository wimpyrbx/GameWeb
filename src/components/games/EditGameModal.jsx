import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditGameModal = ({ game, onClose, onSave }) => {
  const [editedGame, setEditedGame] = useState(game);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedGame);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Game</h3>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Add form fields here */}
            <div className="form-group mb-3">
              <label>Title</label>
              <input
                type="text"
                className="form-control"
                value={editedGame.title}
                onChange={(e) => setEditedGame({ ...editedGame, title: e.target.value })}
              />
            </div>
            {/* Add more fields as needed */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGameModal; 