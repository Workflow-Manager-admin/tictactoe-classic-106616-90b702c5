import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * Main Container for TicTacToe Classic.
 * Features: two player and AI mode with difficulty, win/draw detection, game reset.
 * Theme uses #f41f7b (primary), #FFFFFF (secondary), #04ff00 (accent), light mode.
 */
function TicTacToeClassic() {
  // State
  const emptyBoard = Array(9).fill("");
  const [board, setBoard] = useState(emptyBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState("ongoing"); // 'ongoing', 'win', 'draw'
  const [winner, setWinner] = useState("");
  const [gameMode, setGameMode] = useState("2player"); // '2player', 'ai'
  const [aiLevel, setAiLevel] = useState("easy"); // 'easy', 'hard'
  const [aiMark, setAiMark] = useState("O"); // AI plays as O by default
  const [startingPlayer, setStartingPlayer] = useState("X"); // Who starts each game

  const COLORS = {
    primary: "#f41f7b",      // Pink
    secondary: "#FFFFFF",    // White
    accent: "#04ff00",       // Neon Green
    x: "#f41f7b",
    o: "#04ff00",
    boardBg: "#fff",
    cellBorder: "#f41f7b",
    overlayBg: "rgba(255,255,255,0.97)"
  };

  // Helper functions
  function calculateWinner(squares) {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // cols
      [0,4,8], [2,4,6]           // diags
    ];
    for (const [a,b,c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }

  function isDraw(squares) {
    return squares.every((cell) => cell) && !calculateWinner(squares);
  }

  // AI Logic
  function getAvailableMoves(squares) {
    return squares
      .map((v, idx) => (!v ? idx : null))
      .filter((v) => v !== null);
  }

  function aiMove(squares, mark, level) {
    // Level "easy" = random move
    if (level === "easy") {
      const moves = getAvailableMoves(squares);
      if (!moves.length) return null;
      const choice = moves[Math.floor(Math.random() * moves.length)];
      return choice;
    }
    // Level "hard" = minimax for perfect play
    if (level === "hard") {
      return minimaxRoot(squares, mark);
    }
    return null;
  }

  function minimaxRoot(squares, mark) {
    // Returns index of the best move for 'mark'
    let bestScore = -Infinity;
    let move = null;
    const maximizing = mark;
    getAvailableMoves(squares).forEach(idx => {
      let newBoard = squares.slice();
      newBoard[idx] = mark;
      let score = minimax(newBoard, switchMark(mark), false, maximizing);
      if (score > bestScore) {
        bestScore = score;
        move = idx;
      }
    });
    return move;
  }

  function minimax(squares, turn, isMaximizing, aiMark) {
    const oppMark = switchMark(aiMark);
    const winnerNow = calculateWinner(squares);
    if (winnerNow === aiMark) return 1;
    if (winnerNow === oppMark) return -1;
    if (isDraw(squares)) return 0;

    const moves = getAvailableMoves(squares);
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let idx of moves) {
        const newBoard = squares.slice();
        newBoard[idx] = aiMark;
        bestScore = Math.max(
          bestScore,
          minimax(newBoard, switchMark(aiMark), false, aiMark)
        );
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let idx of moves) {
        const newBoard = squares.slice();
        newBoard[idx] = oppMark;
        bestScore = Math.min(
          bestScore,
          minimax(newBoard, aiMark, true, aiMark)
        );
      }
      return bestScore;
    }
  }

  function switchMark(mark) {
    return mark === "X" ? "O" : "X";
  }

  // Handle click on board cell
  function handleClick(idx) {
    if (board[idx] || status !== "ongoing") return; // Ignore click if taken or game done
    if (
      gameMode === "ai" &&
      ((isXNext && aiMark === "X") || (!isXNext && aiMark === "O"))
    ) {
      // Player clicked during AI turn
      return;
    }
    const mark = isXNext ? "X" : "O";
    const nextBoard = [...board];
    nextBoard[idx] = mark;
    finishMove(nextBoard, mark);
  }

  // Executes win/draw check and prepares next turn (or finish)
  function finishMove(nextBoard, mark) {
    const winnerFound = calculateWinner(nextBoard);
    if (winnerFound) {
      setBoard(nextBoard);
      setWinner(winnerFound);
      setStatus("win");
      return;
    }
    if (isDraw(nextBoard)) {
      setBoard(nextBoard);
      setWinner("");
      setStatus("draw");
      return;
    }
    setBoard(nextBoard);
    setIsXNext((prev) => !prev);
  }

  // AI Turn effect
  useEffect(() => {
    if (gameMode !== "ai" || status !== "ongoing") return;
    // Is it AI's turn?
    if (
      (isXNext && aiMark === "X") ||
      (!isXNext && aiMark === "O")
    ) {
      // Delay to appear human & for UX
      const timeout = setTimeout(() => {
        const idx = aiMove(board, aiMark, aiLevel);
        if (idx != null) {
          const nextBoard = [...board];
          nextBoard[idx] = aiMark;
          finishMove(nextBoard, aiMark);
        }
      }, 450);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [isXNext, board, status, gameMode, aiMark, aiLevel]);

  // On game start/reset: randomize starter in AI mode
  useEffect(() => {
    if (gameMode === "ai") {
      // Randomize who is X and who is O, so user sometimes starts
      // We'll keep: startingPlayer = "X" or "O"
      // If AI starts, set isXNext accordingly.
      // Default: user is always X, AI is O.
      if (aiMark === "X") setIsXNext(true);
      else if (aiMark === "O") setIsXNext(false);
    } else {
      setIsXNext(startingPlayer === "X");
    }
    // eslint-disable-next-line
  }, [gameMode, aiMark, startingPlayer]);

  function getStatusText() {
    if (status === "win") {
      const color =
        winner === "X" ? COLORS.x : COLORS.o;
      return (
        <span style={{ color }}>
          {winner} wins!
        </span>
      );
    } else if (status === "draw") {
      return (
        <span style={{ color: COLORS.primary }}>It's a draw!</span>
      );
    }
    const turn =
      (isXNext ? "X" : "O");
    const color = turn === "X" ? COLORS.x : COLORS.o;
    return (
      <span>
        Next turn: <span style={{ color }}>{turn}</span>
      </span>
    );
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setBoard(emptyBoard);
    setStatus("ongoing");
    setWinner("");
    // Alternate starting player each time for fairness
    if (gameMode === "2player") {
      setStartingPlayer(prev => (prev === "X" ? "O" : "X"));
      setIsXNext(startingPlayer === "O");
    } else {
      setIsXNext(aiMark === "X");
    }
  }

  // PUBLIC_INTERFACE
  function handleModeChange(mode) {
    if (mode === gameMode) return;
    setGameMode(mode);
    setStatus("ongoing");
    setWinner("");
    setBoard(emptyBoard);
    setStartingPlayer("X");
    setAiMark("O"); // Default AI as O
    setIsXNext(true);
  }

  // PUBLIC_INTERFACE
  function handleLevelChange(e) {
    setAiLevel(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleAiMarkChange(e) {
    setAiMark(e.target.value);
  }

  // UI Components (local)
  function renderCell(idx) {
    const cell = board[idx];
    return (
      <button
        className="ttt-cell"
        key={idx}
        onClick={() => handleClick(idx)}
        disabled={
          !!cell ||
          status !== "ongoing" ||
          (gameMode === "ai" &&
            ((isXNext && aiMark === "X") ||
              (!isXNext && aiMark === "O")))
        }
        style={{
          color:
            cell === "X"
              ? COLORS.x
              : cell === "O"
              ? COLORS.o
              : COLORS.primary,
          background: COLORS.boardBg,
          borderColor: COLORS.cellBorder,
        }}
        aria-label={`cell ${idx} ${cell ? cell : ""}`}
      >
        {cell}
      </button>
    );
  }

  // Main Render
  return (
    <div className="ttt-root" style={containerStyle(COLORS)}>
      <div className="ttt-config" style={configStyle(COLORS)}>
        <div>
          <label style={{ fontWeight: 500, color: COLORS.primary }}>
            Game Mode:{" "}
          </label>
          <select
            value={gameMode}
            onChange={(e) => handleModeChange(e.target.value)}
            style={selectStyle(COLORS)}
          >
            <option value="2player">Two Player</option>
            <option value="ai">AI Opponent</option>
          </select>
        </div>
        {gameMode === "ai" && (
          <div style={{ display: "flex", gap: "1em" }}>
            <div>
              <label style={{ fontWeight: 500, color: COLORS.x }}>Your Mark: </label>
              <select value={aiMark === "X" ? "O" : "X"} onChange={(e) => handleAiMarkChange({target: {value: e.target.value === "X" ? "O" : "X"}})} style={selectStyle(COLORS)}>
                <option value="X">X</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 500, color: COLORS.accent }}>
                AI Level:{" "}
              </label>
              <select
                value={aiLevel}
                onChange={handleLevelChange}
                style={selectStyle(COLORS)}
              >
                <option value="easy">Easy</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="ttt-info" style={infoStyle(COLORS)}>
        {getStatusText()}
      </div>
      <div className="ttt-board" style={boardStyle(COLORS)}>
        {Array(9)
          .fill(null)
          .map((_, idx) => renderCell(idx))}
      </div>
      <div className="ttt-bottom" style={bottomStyle(COLORS)}>
        <button
          className="btn"
          style={resetBtnStyle(COLORS)}
          onClick={handleReset}
        >
          Reset Game
        </button>
      </div>
      {/* Embedded styles to localize component without polluting globals */}
      <style>{cssForTicTacToe(COLORS)}</style>
    </div>
  );
}

// Helpers for inline/local CSS styling (no external .css modifications required)
function containerStyle(COLORS) {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "40px auto",
    padding: "24px",
    maxWidth: 380,
    background: COLORS.overlayBg,
    borderRadius: "22px",
    boxShadow: "0 6px 32px rgba(244,31,123,0.10)",
    border: `2px solid ${COLORS.primary}`,
  };
}
function configStyle(COLORS) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "2em",
    marginBottom: 10,
  };
}
function infoStyle(COLORS) {
  return {
    fontSize: "1.15em",
    color: COLORS.primary,
    fontWeight: 500,
    marginBottom: 18,
    minHeight: "2em",
  };
}
function boardStyle(COLORS) {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(3, 64px)",
    gridTemplateRows: "repeat(3, 64px)",
    gap: "0.5em",
    background: COLORS.boardBg,
    border: `2.5px solid ${COLORS.primary}`,
    borderRadius: "14px",
    margin: "0.5em auto 0.6em auto",
    boxShadow: "0 1.5px 16px rgba(4,255,0,0.07)",
  };
}
function bottomStyle(COLORS) {
  return {
    marginTop: 10,
    textAlign: "center"
  };
}
function selectStyle(COLORS) {
  return {
    background: COLORS.secondary,
    border: `2px solid ${COLORS.accent}`,
    color: COLORS.primary,
    borderRadius: "6px",
    padding: "4px 10px",
    fontWeight: "500"
  };
}
function resetBtnStyle(COLORS) {
  return {
    background: COLORS.primary,
    color: COLORS.secondary,
    border: "none",
    borderRadius: "4px",
    padding: "10px 28px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: `0 2px 10px ${COLORS.primary}20`,
  };
}

// Embedded CSS for TicTacToe container
function cssForTicTacToe(COLORS) {
  return `
  .ttt-board {
    user-select: none;
    margin: 0 auto;
  }
  .ttt-cell {
    width: 64px;
    height: 64px;
    font-size: 2.3rem;
    line-height: 1.2;
    font-weight: bold;
    background: ${COLORS.boardBg};
    border: 2.5px solid ${COLORS.cellBorder};
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    transition: background 0.15s, color 0.11s, box-shadow 0.22s;
    margin: 0;
    outline: none;
    box-shadow: 0 1px 6px #f41f7b23;
  }
  .ttt-cell:disabled {
    opacity: 0.69;
    cursor: not-allowed;
    background: #fefefe;
    color: #b4b4b4;
    box-shadow: none;
  }
  .ttt-cell:not(:disabled):hover {
    background: #ffe8f6;
    box-shadow: 0 0 0 2px ${COLORS.accent}55;
    color: ${COLORS.accent};
  }
  .ttt-info {
    min-height: 2em;
    text-align: center;
    margin-top: 0.5em;
    margin-bottom: 0.8em;
  }
  ::selection {
    background: ${COLORS.primary}25;
  }
  `;
}

export default TicTacToeClassic;
