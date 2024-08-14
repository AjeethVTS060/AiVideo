import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './PreviewModal.css';

const PreviewModal = ({ isOpen, onClose, questions, transcripts }) => {
  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay">
      <div className="preview-modal">
        <div className="modal-header">
          <h2>Interview Preview</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-content">
          {questions.map((q, index) => (
            <div key={index} className="preview-question">
              <h3>{q.question}</h3>
              <p>{transcripts[index]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
