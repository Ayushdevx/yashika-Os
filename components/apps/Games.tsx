import React, { useState, useEffect, useRef } from 'react';
import { AppProps } from '../../types';
import { RefreshCw, Play, Trophy, ArrowLeft, Gamepad2, Rocket, Circle } from 'lucide-react';

// --- Types ---
type GameType = 'launcher' | 'tictactoe' | 'pong' | 'space';

// --- Tic Tac Toe Component ---
const TicTacToe: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
        <div className="h-full flex flex-col items-center justify-center bg-[#111] text-white p-4 font-mono relative">
            <button onClick={onBack} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
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

// --- Cyber Pong Component ---
const CyberPong: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState({ player: 0, ai: 0 });
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Game State
        const ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, radius: 6 };
        const paddleHeight = 80;
        const paddleWidth = 10;
        const player = { x: 0, y: canvas.height / 2 - paddleHeight / 2, score: 0 };
        const ai = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, score: 0 };

        let animationId: number;

        const draw = () => {
            // Clear
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Net
            ctx.strokeStyle = '#333';
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            // Ball
            ctx.fillStyle = '#00ffcc';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffcc';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Player Paddle
            ctx.fillStyle = '#3b82f6';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#3b82f6';
            ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);

            // AI Paddle
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);
            ctx.shadowBlur = 0;

            if (isPlaying) {
                // Ball Movement
                ball.x += ball.dx;
                ball.y += ball.dy;

                // Wall Collision (Top/Bottom)
                if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
                    ball.dy = -ball.dy;
                }

                // Paddle Collision
                // Player
                if (ball.x - ball.radius < player.x + paddleWidth && ball.y > player.y && ball.y < player.y + paddleHeight) {
                    ball.dx = -ball.dx;
                    ball.dx *= 1.05; // Speed up
                }
                // AI
                if (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + paddleHeight) {
                    ball.dx = -ball.dx;
                    ball.dx *= 1.05;
                }

                // AI Movement
                const aiCenter = ai.y + paddleHeight / 2;
                if (aiCenter < ball.y - 35) ai.y += 3; // Simple AI speed
                else if (aiCenter > ball.y + 35) ai.y -= 3;

                // Scoring
                if (ball.x < 0) {
                    ai.score++;
                    setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
                    resetBall();
                } else if (ball.x > canvas.width) {
                    player.score++;
                    setScore(prev => ({ ...prev, player: prev.player + 1 }));
                    resetBall();
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        const resetBall = () => {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
            ball.dy = (Math.random() > 0.5 ? 1 : -1) * 4;
        };

        // Mouse Control
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            player.y = mouseY - paddleHeight / 2;
            // Clamp
            if (player.y < 0) player.y = 0;
            if (player.y + paddleHeight > canvas.height) player.y = canvas.height - paddleHeight;
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        draw();

        return () => {
            cancelAnimationFrame(animationId);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isPlaying]);

    return (
        <div className="h-full flex flex-col items-center bg-black text-white relative">
            <button onClick={onBack} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10">
                <ArrowLeft size={24} />
            </button>

            <div className="absolute top-4 flex gap-12 text-4xl font-bold font-mono z-0">
                <div className="text-blue-500">{score.player}</div>
                <div className="text-red-500">{score.ai}</div>
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="bg-black border-2 border-gray-800 rounded-lg shadow-[0_0_50px_rgba(0,255,204,0.1)] cursor-none"
                />
            </div>

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <button
                        onClick={() => setIsPlaying(true)}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-105"
                    >
                        START GAME
                    </button>
                </div>
            )}

            <div className="pb-4 text-gray-500 text-xs">Use mouse to control paddle</div>
        </div>
    );
};

// --- Space Defender Component ---
const SpaceDefender: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Game Objects
        const player = { x: canvas.width / 2, y: canvas.height - 50, width: 30, height: 30, speed: 5 };
        const bullets: { x: number, y: number }[] = [];
        const enemies: { x: number, y: number, size: number, speed: number }[] = [];
        const stars: { x: number, y: number, size: number, speed: number }[] = [];

        // Init Stars
        for (let i = 0; i < 50; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 3 + 0.5
            });
        }

        let keys: Record<string, boolean> = {};
        let frame = 0;
        let animationId: number;
        let scoreLocal = 0;

        const handleKeyDown = (e: KeyboardEvent) => keys[e.key] = true;
        const handleKeyUp = (e: KeyboardEvent) => keys[e.key] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const draw = () => {
            if (gameOver) return;

            // Clear
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            ctx.fillStyle = '#ffffff';
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            });

            // Player
            if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
            if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
            if (keys[' '] && frame % 10 === 0) { // Shoot
                bullets.push({ x: player.x + player.width / 2, y: player.y });
            }

            // Draw Player
            ctx.fillStyle = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ff00';
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2, player.y);
            ctx.lineTo(player.x + player.width, player.y + player.height);
            ctx.lineTo(player.x, player.y + player.height);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Bullets
            ctx.fillStyle = '#ffff00';
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.y -= 7;
                ctx.fillRect(b.x - 2, b.y, 4, 10);
                if (b.y < 0) bullets.splice(i, 1);
            }

            // Enemies
            if (frame % 60 === 0) {
                enemies.push({
                    x: Math.random() * (canvas.width - 30),
                    y: -30,
                    size: 30,
                    speed: Math.random() * 2 + 1
                });
            }

            ctx.fillStyle = '#ff0000';
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                e.y += e.speed;
                ctx.fillRect(e.x, e.y, e.size, e.size);

                // Collision Player
                if (
                    player.x < e.x + e.size &&
                    player.x + player.width > e.x &&
                    player.y < e.y + e.size &&
                    player.y + player.height > e.y
                ) {
                    setGameOver(true);
                    setIsPlaying(false);
                }

                // Collision Bullet
                for (let j = bullets.length - 1; j >= 0; j--) {
                    const b = bullets[j];
                    if (
                        b.x > e.x &&
                        b.x < e.x + e.size &&
                        b.y > e.y &&
                        b.y < e.y + e.size
                    ) {
                        enemies.splice(i, 1);
                        bullets.splice(j, 1);
                        scoreLocal += 10;
                        setScore(scoreLocal);
                        break;
                    }
                }

                if (e.y > canvas.height) enemies.splice(i, 1);
            }

            frame++;
            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isPlaying, gameOver]);

    return (
        <div className="h-full flex flex-col items-center bg-black text-white relative">
            <button onClick={onBack} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10">
                <ArrowLeft size={24} />
            </button>

            <div className="absolute top-4 right-4 text-xl font-mono text-yellow-400 z-10">
                SCORE: {score}
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={500}
                    className="bg-[#050505] border border-gray-800 shadow-2xl"
                />
            </div>

            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-4 text-green-400 tracking-widest">SPACE DEFENDER</h2>
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xl transition-all hover:scale-105"
                        >
                            LAUNCH MISSION
                        </button>
                        <p className="mt-4 text-gray-400 text-sm">Arrows to Move • Space to Shoot</p>
                    </div>
                </div>
            )}

            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 backdrop-blur-sm z-20">
                    <div className="text-center animate-in zoom-in duration-300">
                        <h2 className="text-5xl font-bold mb-2 text-white">GAME OVER</h2>
                        <p className="text-2xl mb-6 text-red-200">Final Score: {score}</p>
                        <button
                            onClick={() => {
                                setGameOver(false);
                                setScore(0);
                                setIsPlaying(true);
                            }}
                            className="px-8 py-3 bg-white text-red-900 font-bold rounded-lg text-xl transition-all hover:scale-105"
                        >
                            RETRY
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Games Launcher ---
const Games: React.FC<AppProps> = () => {
    const [activeGame, setActiveGame] = useState<GameType>('launcher');

    const GAMES_LIST = [
        { id: 'tictactoe', name: 'Tic Tac Toe', icon: <Circle size={40} />, color: 'from-purple-500 to-pink-500', desc: 'Classic strategy game vs AI' },
        { id: 'pong', name: 'Cyber Pong', icon: <Trophy size={40} />, color: 'from-cyan-500 to-blue-500', desc: 'Neon-style arcade tennis' },
        { id: 'space', name: 'Space Defender', icon: <Rocket size={40} />, color: 'from-green-500 to-emerald-700', desc: 'Retro vertical shooter' },
    ];

    if (activeGame === 'tictactoe') return <TicTacToe onBack={() => setActiveGame('launcher')} />;
    if (activeGame === 'pong') return <CyberPong onBack={() => setActiveGame('launcher')} />;
    if (activeGame === 'space') return <SpaceDefender onBack={() => setActiveGame('launcher')} />;

    return (
        <div className="h-full bg-[#0f172a] text-white p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-6 animate-bounce-slow">
                        <Gamepad2 size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
                        Yashika Arcade
                    </h1>
                    <p className="text-gray-400 text-lg">Select a game to start playing</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {GAMES_LIST.map((game) => (
                        <div
                            key={game.id}
                            onClick={() => setActiveGame(game.id as GameType)}
                            className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                {game.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">{game.name}</h3>
                            <p className="text-gray-400 text-sm mb-6">{game.desc}</p>

                            <div className="flex items-center gap-2 text-sm font-bold text-white/50 group-hover:text-white transition-colors">
                                <Play size={16} className="fill-current" />
                                PLAY NOW
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Games;
