import { useEffect } from 'react';

const useExamProtection = () => {
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert('Right-click is disabled during the exam.');
    };

    const handleKeyDown = (e) => {
      // Disable Ctrl+C, Ctrl+V, Ctrl+U, etc.
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'i' || e.key === 'j')) {
        e.preventDefault();
        alert('Copy/Paste and DevTools are disabled.');
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

export default useExamProtection;
