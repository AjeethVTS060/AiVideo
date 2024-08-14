// ThankYouModal.js
import React, { useEffect } from 'react';
import './ThankYouModal.css'; // Create appropriate CSS

const ThankYouModal = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Close modal and trigger redirect
    }, 10000); // Redirect after 10 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="thank-you-modal">
      <div className="modal-content">
        <h2>Thank You for Attending the Assessment!</h2>
        <p>You will be redirected to the feedback page shortly.</p>
      </div>
    </div>
  );
};

export default ThankYouModal;
