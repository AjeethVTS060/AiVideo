// WarningModal.js
import React from 'react';
import './WarningModal.css'; // Ensure you create corresponding CSS for styling

const WarningModal = ({ onClose }) => {
  return (
    <div className="warning-modal-overlay">
      <div className="warning-modal-content">
        <h2>Time is Running Out!</h2>
        <p>You have only 30 seconds left for this question.</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default WarningModal;
