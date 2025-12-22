import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

function App() {
  return (
    <div className="popup">
      <h1>Bias Mate</h1>
      <p>Analyze YouTube videos for political bias</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
