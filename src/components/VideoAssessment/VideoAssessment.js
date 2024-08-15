import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./VideoAssessment.css"
// Ensure the SpeechRecognition API is available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

const VideoAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions] = useState([
    "Tell me about yourself.",
    "Why do you want this job?",
    "What are your strengths?",
    "Describe a challenging situation and how you handled it.",
  ]);
  const [answers, setAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);

  // Memoized moveToNextQuestion function
  const moveToNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prevQuestion) => prevQuestion + 1);
    } else {
      alert("Assessment complete. Thank you!");
    }
  }, [currentQuestion, questions.length]);

  useEffect(() => {
    // Set up speech recognition result handling
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestion]: speechToText,
      }));

      setTimeout(() => {
        moveToNextQuestion();
      }, 10000); // Move to the next question 10 seconds after the user finishes speaking
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error detected: " + event.error);
    };

    // Access the user's webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error("Error accessing webcam: " + error);
      });
  }, [currentQuestion, moveToNextQuestion]);

  const startRecording = () => {
    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognition.stop();
  };

  return (
    <div className="video-assessment-container">
      <div className="video-section">
        <video ref={videoRef} autoPlay playsInline muted></video>
      </div>
      <div className="chat-section">
        <h1 className="assessment-title">Video Assessment</h1>
        <div className="current-question">
          <div className="question-box">
            <div className="ai-icon">🤖</div>
            <div className="question-text">
              {questions[currentQuestion]}
            </div>
          </div>
          <div className="answer-box">
            <div className="user-icon">👤</div>
            <div className="answer-text">
              {answers[currentQuestion] || "Your answer will appear here..."}
            </div>
          </div>
        </div>
        {isRecording ? (
          <button className="stop-recording-button" onClick={stopRecording}>
            Stop Recording
          </button>
        ) : (
          <button className="start-recording-button" onClick={startRecording}>
            Start Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoAssessment;
