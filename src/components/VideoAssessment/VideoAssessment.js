import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { FaStopCircle, FaPlay, FaClock, FaExclamationCircle } from 'react-icons/fa';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import WarningModal from '../WarningModal/WarningModal';
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
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = event => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setTranscripts(prevTranscripts => {
          const newTranscripts = [...prevTranscripts];
          newTranscripts[currentQuestionIndex] = transcript;
          return newTranscripts;
        });
        setWaitingForNextQuestion(true);
        setTimeout(handleNextQuestion, 10000); // 10 seconds wait time
      };
      recognitionRef.current.onspeechend = () => {
        recognitionRef.current.stop();
      };
    } else {
      console.warn('Speech Recognition API not supported.');
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (questions.length > 0) {
      const fullQuestion = questions[currentQuestionIndex].question;
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < fullQuestion.length) {
          setDisplayedQuestion(fullQuestion.slice(0, index + 1));
          index += 1;
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // Adjust speed here
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (transcripts[currentQuestionIndex]) {
      const fullAnswer = transcripts[currentQuestionIndex];
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
  }, [transcripts, currentQuestionIndex]);

  useEffect(() => {
    if (questions.length > 0) {
      const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex].question);
      speechSynthesis.speak(utterance);
    }
  }, [currentQuestionIndex]);

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
        if (recognitionRef.current) recognitionRef.current.start();
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
      setRecordedChunks(prev => prev.concat(data));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setDisplayedAnswer('');
      setWaitingForNextQuestion(false);
      if (recognitionRef.current) recognitionRef.current.start();
    } else {
      handleStopRecording();
    }
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackCompleted(true);
  };

  return (
    <div className="video-assessment-container">
      <h1>AI Video Assessment</h1>
      <div className="webcam-container">
        <Webcam audio={true} ref={webcamRef} />
      </div>

      {isRecording && (
        <div className="current-question">
          <h2 className="typing">{displayedQuestion}</h2>
          <div className="answer-container">
            <p className="typing">{displayedAnswer}</p>
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
  );
};

export default VideoAssessment;
