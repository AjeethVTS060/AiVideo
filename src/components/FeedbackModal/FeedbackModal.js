import React, { useState } from 'react';
// import './FeedbackModal.css'; // Make sure to style the modal appropriately

const feedbackQuestions = [
  "How was the overall experience?",
  "Were the instructions clear?",
  "Do you have any suggestions for improvement?"
];

const FeedbackModal = ({ onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < feedbackQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit feedback or handle end of feedback process
      console.log("Feedback responses:", responses);
      onClose();
    }
  };

  const handleResponseChange = (event) => {
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = event.target.value;
    setResponses(newResponses);
  };

  return (
    <div style={modalStyles}>
      <div style={modalContentStyles}>
        <h2 style={feedbackModalContent}>Feedback</h2>
        <p style={feedbackModalContent}>{feedbackQuestions[currentQuestionIndex]}</p>
        <br/>
        <textarea
          rows="5"
          cols="50"
          onChange={handleResponseChange}
          value={responses[currentQuestionIndex] || ''}
          style={textareaStyles}
        />
        <div style={buttonContainerStyles}>
        <button onClick={handleNextQuestion} style={buttonStyles}>
          {currentQuestionIndex < feedbackQuestions.length - 1 ? 'Next' : 'Submit'}
        </button>
        <button onClick={onClose} style={buttonStyles}>Close</button>
        </div>
      </div>
    </div>
  );
};


const modalStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyles = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '400px',
  textAlign: 'center',
};

const feedbackModalContent = {
    background: "#fff",
    color: "red",
    // padding: "20px",
    borderRadius: "5px",
    // maxWidth: "500px",
    width: "100%",
  };

const textareaStyles = {
  width: '100%',
  marginBottom: '10px',
};

const buttonContainerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
};

const buttonStyles = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default FeedbackModal;
