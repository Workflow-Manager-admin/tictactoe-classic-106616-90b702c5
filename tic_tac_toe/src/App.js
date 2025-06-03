import React from 'react';
import './App.css';
import TicTacToeClassic from './TicTacToeClassic';

// PUBLIC_INTERFACE
/**
 * Main App component: renders the TicTacToeClassic container as the primary view.
 */
function App() {
  return (
    <div className="app" style={{ minHeight: '100vh', background: 'var(--base-dark)' }}>
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TicTacToeClassic />
      </main>
    </div>
  );
}

export default App;