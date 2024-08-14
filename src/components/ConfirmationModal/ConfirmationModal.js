// ConfirmationModal.js
import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h2 style={{color:"red"}}>Are you sure you want to end the exam?</h2>
        <div className="confirmation-buttons">
          <button className="confirm-button" onClick={onConfirm}>Yes</button>
          <button className="cancel-button" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
