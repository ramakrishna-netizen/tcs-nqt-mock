import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, HelpCircle, ChevronRight, ChevronLeft, RotateCcw, Bookmark, Save } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useExamProtection from '../hooks/useExamProtection';

const ExamPortal = () => {
  useExamProtection();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default values or values from UploadPage
  const initialSectionTime = location.state?.sectionTime || 1800;
  const initialQuestionTime = location.state?.questionTime || 60;

  // State for Test data
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  
  // Timers
  const [sectionTimeLeft, setSectionTimeLeft] = useState(initialSectionTime);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(initialQuestionTime);
  
  const mainTimerRef = useRef(null);
  const questionTimerRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        try {
          const res = await axios.get('http://localhost:5000/api/test');
          if (res.data && res.data.length > 0) {
            setQuestions(res.data);
          } else {
            throw new Error('No questions');
          }
        } catch (e) {
          console.warn("API failed, using mock data", e);
          setQuestions([
            { id: 1, text: "Which of the following numbers is prime?", options: ["12", "15", "17", "21"], correct: 2, status: 'not-visited' },
            { id: 2, text: "Simplify: (25 * 4) / (5 + 5)", options: ["5", "10", "20", "25"], correct: 1, status: 'not-visited' }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Section Timer Effect
  useEffect(() => {
    mainTimerRef.current = setInterval(() => {
      setSectionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(mainTimerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(mainTimerRef.current);
  }, []);

  // Question Timer Effect
  useEffect(() => {
    setQuestionTimeLeft(initialQuestionTime); 
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    
    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          handleSaveAndNext(); 
          return initialQuestionTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(questionTimerRef.current);
  }, [currentIndex, initialQuestionTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOptions({ ...selectedOptions, [currentIndex]: optionIndex });
  };

  const handleSaveAndNext = () => {
    const updatedQuestions = [...questions];
    if (selectedOptions[currentIndex] !== undefined) {
      updatedQuestions[currentIndex].status = 'answered';
    } else {
      updatedQuestions[currentIndex].status = 'visited';
    }
    setQuestions(updatedQuestions);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkForReview = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex].status = 'marked';
    setQuestions(updatedQuestions);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    const newSelected = { ...selectedOptions };
    delete newSelected[currentIndex];
    setSelectedOptions(newSelected);
  };

  const handleAutoSubmit = () => {
    alert("Time's up! Your section is being submitted automatically.");
    // Submit logic: POST to /api/submit
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'answered': return 'var(--success)';
      case 'marked': return 'var(--review)';
      case 'visited': return '#e74c3c';
      default: return 'var(--not-visited)';
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>Loading Test Questions...</div>;
  }

  if (questions.length === 0) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>No questions available. Please upload a file.</div>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="portal-container">
      {/* Header */}
      <header style={{
        height: 'var(--header-height)',
        background: 'var(--primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        boxShadow: 'var(--shadow-md)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>TCS NQT Portal</h2>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            <Clock size={18} />
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatTime(sectionTimeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-content">
        {/* Left: Question Area */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'white' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--primary)' }}>Question {currentIndex + 1}</h3>
            <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
              Time Left for Question: {formatTime(questionTimeLeft)}s
            </div>
          </div>
          <hr style={{ marginBottom: '2rem', opacity: 0.1 }} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{currentQuestion.text}</p>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {currentQuestion.options.map((opt, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    style={{
                      padding: '1rem',
                      border: `1px solid ${selectedOptions[currentIndex] === idx ? 'var(--primary)' : '#ddd'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedOptions[currentIndex] === idx ? 'rgba(0, 44, 92, 0.05)' : 'white',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: '2px solid var(--primary)',
                      background: selectedOptions[currentIndex] === idx ? 'var(--primary)' : 'transparent',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {opt}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Sidebar Palette */}
        <aside style={{
          width: 'var(--sidebar-width)',
          background: '#f1f3f5',
          borderLeft: '1px solid #ddd',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ margin: '0 auto 1rem', width: '80px', height: '80px', borderRadius: '4px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={40} color="#666" />
            </div>
            <p style={{ fontWeight: 600 }}>Candidate Profile</p>
          </div>

          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>Question Palette:</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            overflowY: 'auto',
            maxHeight: '300px',
            paddingRight: '0.5rem'
          }}>
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  border: 'none',
                  background: currentIndex === idx ? '#333' : getStatusColor(q.status),
                  color: currentIndex === idx || q.status !== 'not-visited' ? 'white' : 'black',
                  fontWeight: 600,
                  outline: currentIndex === idx ? '2px solid var(--accent)' : 'none'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--success)' }}></div> Answered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--review)' }}></div> Marked
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--not-visited)' }}></div> Not Visited
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '12px', height: '12px', background: '#e74c3c' }}></div> Not Answered
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Controls */}
      <footer style={{
        height: '60px',
        background: '#ffffff',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleMarkForReview}
            className="btn-secondary" 
            style={{ padding: '0.6rem 1.2rem', borderRadius: '4px', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Bookmark size={16} /> Mark for Review
          </button>
          <button 
            onClick={handleClearResponse}
            className="btn-secondary" 
            style={{ padding: '0.6rem 1.2rem', borderRadius: '4px', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCcw size={16} /> Clear Response
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleSaveAndNext}
            style={{ 
              padding: '0.6rem 2rem', 
              borderRadius: '4px', 
              border: 'none', 
              background: 'var(--primary)', 
              color: 'white', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Save & Next <ChevronRight size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ExamPortal;
