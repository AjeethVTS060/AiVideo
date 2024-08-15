import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaStopCircle, FaPlay, FaClock, FaRobot, FaUser } from 'react-icons/fa';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import './VideoAssessment.css';

const questions = [
  { question: "What is your name?" },
  { question: "Why do you want this job?" },
  { question: "What are your strengths?" },
];

const VideoAssessment = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);
  const [hasQuestionBeenDisplayed, setHasQuestionBeenDisplayed] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  const speakText = (text, callback) => {
    if (typeof window.speechSynthesis !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = callback;
      utterance.onerror = (event) => console.error('Speech synthesis error:', event.error);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis API not supported.');
    }
  };

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setDisplayedAnswer('');
      setWaitingForNextQuestion(false);
      setHasQuestionBeenDisplayed(false);
      
      // Start speech recognition for the next question
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } else {
      handleStopRecording();
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
      };

      recognitionRef.current.onresult = event => {
        console.log("Speech recognition result received");
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setDisplayedAnswer(transcript);
        setWaitingForNextQuestion(true);

        // Move to the next question after a delay
        setTimeout(() => {
          if (waitingForNextQuestion) {
            handleNextQuestion();
          }
        }, 5000); // Adjust wait time as needed
      };

      recognitionRef.current.onspeechend = () => {
        recognitionRef.current.stop();
      };

      recognitionRef.current.onerror = event => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.warn('No speech detected. Please speak into the microphone.');
        }
      };
    } else {
      console.warn('Speech Recognition API not supported.');
    }
  }, [currentQuestionIndex, handleNextQuestion, waitingForNextQuestion]);

  useEffect(() => {
    if (questions.length > 0 && isRecording) {
      const fullQuestion = questions[currentQuestionIndex].question;
      setDisplayedQuestion(fullQuestion);
      setHasQuestionBeenDisplayed(true);
    }
  }, [currentQuestionIndex, isRecording]);

  useEffect(() => {
    if (hasQuestionBeenDisplayed) {
      speakText(displayedQuestion, () => {
        speakText('Now tell me your answer.');
      });
    }
  }, [hasQuestionBeenDisplayed, displayedQuestion]);

  useEffect(() => {
    if (displayedAnswer) {
      const fullAnswer = displayedAnswer;
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < fullAnswer.length) {
          setDisplayedAnswer(fullAnswer.slice(0, index + 1));
          index += 1;
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // Adjust speed here
    }
  }, [displayedAnswer]);

  const handleStartRecording = () => {
    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
      const stream = webcamRef.current.video.srcObject;
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'video/webm',
        });
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.start();
        setIsRecording(true);
        
        // Start speech recognition only if it's not already running
        if (recognitionRef.current && !waitingForNextQuestion) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    } else {
      console.error("Webcam stream not available");
    }
  };

  const handleStopRecording = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmEndExam = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsFeedbackModalOpen(true);
    setIsConfirmationModalOpen(false);
  };

  const handleCancelEndExam = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      // Implement this function if you decide to use recordedChunks
    }
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackCompleted(true);
  };

  return (
    <div className="video-assessment-container">
      <div className="video-section">
        <div className="webcam-container">
          <Webcam audio={true} ref={webcamRef} />
        </div>
      </div>
      <div className="chat-section">
        <h1>AI Video Assessment</h1>

        {isRecording && (
          <div className="current-question">
            <div className="question-box">
              <FaRobot className="ai-icon" />
              <h2 className="question-text">{displayedQuestion}</h2>
            </div>
            <div className="answer-box">
              <FaUser className="user-icon" />
              <p className="answer-text">{displayedAnswer}</p>
            </div>
            {waitingForNextQuestion && (
              <div className="timer">
                <FaClock /> Waiting for next question...
              </div>
            )}
            <button className="stop-recording-button" onClick={handleStopRecording}>
              <FaStopCircle /> Stop Recording
            </button>
          </div>
        )}

        {!isRecording && !feedbackCompleted && (
          <button className="start-recording-button" onClick={handleStartRecording}>
            <FaPlay /> Start Recording
          </button>
        )}

        {isFeedbackModalOpen && (
          <FeedbackModal onClose={closeFeedbackModal} />
        )}

        {isConfirmationModalOpen && (
          <ConfirmationModal 
            onConfirm={handleConfirmEndExam} 
            onCancel={handleCancelEndExam} 
          />
        )}

        {feedbackCompleted && (
          <div className="thank-you-message">
            <h2>Thank you for attending the interview!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAssessment;