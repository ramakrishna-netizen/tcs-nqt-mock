import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [sectionTimer, setSectionTimer] = useState(30); // minutes
  const [questionTimer, setQuestionTimer] = useState(60); // seconds
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus(`Selected: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('Uploading file...');
      const response = await axios.post('http://localhost:5000/api/upload', formData);
      
      setStatus(response.data.message + '. Initializing...');
      setTimeout(() => {
        setLoading(false);
        navigate('/exam', { 
          state: { 
            sectionTime: sectionTimer * 60, 
            questionTime: questionTimer 
          } 
        });
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('Upload failed. Using fallback data.');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #002c5c 0%, #004a99 100%)',
      color: 'white'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          width: '450px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <h1 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>TCS NQT Portal</h1>
        <p style={{ marginBottom: '1rem', opacity: 0.8 }}>Upload your test file and configure timers.</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '0.4rem' }}>Section Timer (min)</label>
            <input 
              type="number" 
              value={sectionTimer} 
              onChange={(e) => setSectionTimer(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block', marginBottom: '0.4rem' }}>Question Timer (sec)</label>
            <input 
              type="number" 
              value={questionTimer} 
              onChange={(e) => setQuestionTimer(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div 
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            border: '2px dashed rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '2rem',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'all 0.3s ease',
            background: file ? 'rgba(40, 167, 69, 0.1)' : 'transparent'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
        >
          {file ? <FileText size={48} color="#28a745" /> : <Upload size={48} />}
          <p style={{ marginTop: '1rem' }}>{status || 'Click or drag file here'}</p>
          <input 
            id="fileInput" 
            type="file" 
            accept=".pdf,.docx,.doc,.txt,.csv" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            border: 'none',
            background: file ? '#ff9800' : '#cccccc',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: file ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? 'Initializing...' : <>Start Test <CheckCircle size={20} /></>}
        </button>
      </motion.div>
    </div>
  );
};

export default UploadPage;
