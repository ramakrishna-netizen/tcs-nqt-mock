import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ExamPortal from './pages/ExamPortal';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/exam" element={<ExamPortal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
