
import React, { useState, useEffect } from 'react';
import { AppProps } from '../../types';
import { RefreshCw } from 'lucide-react';

const TicTacToe: React.FC<AppProps> = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const checkWinner = (squares: string[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setXIsNext(false);
  };

  // AI Move
  useEffect(() => {
    if (!xIsNext && !winner) {
        const win = checkWinner(board);
        if (win) {
            setWinner(win);
            return;
        }
        
        // Simple random AI
        const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptyIndices.length > 0) {
            const timeout = setTimeout(() => {
                const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                if (randomIdx !== null) {
                    const newBoard = [...board];
                    newBoard[randomIdx] = 'O';
                    setBoard(newBoard);
                    setXIsNext(true);
                    
                    const w = checkWinner(newBoard);
                    if (w) setWinner(w);
                }
            }, 500);
            return () => clearTimeout(timeout);
        }
    } else {
        const w = checkWinner(board);
        if (w) setWinner(w);
    }
  }, [xIsNext, board, winner]);

  const reset = () => {
      setBoard(Array(9).fill(null));
      setXIsNext(true);
      setWinner(null);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#111] text-white p-4 font-mono">
        <h1 className="text-2xl text-purple-400 mb-6 font-bold tracking-widest uppercase glow-text">Tic Tac Toe</h1>
        
        <div className="grid grid-cols-3 gap-2 bg-gray-800 p-2 rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            {board.map((val, i) => (
                <button 
                    key={i}
                    onClick={() => handleClick(i)}
                    className={`
                        w-20 h-20 text-4xl font-bold flex items-center justify-center rounded bg-[#222] hover:bg-[#333] transition-all
                        ${val === 'X' ? 'text-blue-400' : 'text-red-400'}
                    `}
                >
                    {val}
                </button>
            ))}
        </div>

        <div className="mt-8 h-12 flex flex-col items-center">
            {winner ? (
                <div className="text-xl font-bold text-green-400 animate-bounce">
                    {winner === 'X' ? 'You Won!' : 'AI Won!'}
                </div>
            ) : (
                <div className="text-gray-400">
                    {xIsNext ? 'Your Turn (X)' : 'AI Thinking...'}
                </div>
            )}
            
            {winner || !board.includes(null) ? (
                 <button onClick={reset} className="mt-2 flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                     <RefreshCw size={14} /> Play Again
                 </button>
            ) : null}
        </div>
    </div>
  );
};

export default TicTacToe;
