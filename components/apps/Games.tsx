import React, { useState, useEffect, useRef } from 'react';
import { AppProps } from '../../types';
import { RefreshCw, Play, Trophy, ArrowLeft, Gamepad2, Rocket, Circle, Car, Zap, Shield, AlertTriangle } from 'lucide-react';

// --- Types ---
type GameType = 'launcher' | 'tictactoe' | 'pong' | 'space' | 'racer';

// --- Tic Tac Toe Component (Unchanged) ---
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
                        className={`w-20 h-20 text-4xl font-bold flex items-center justify-center rounded bg-[#222] hover:bg-[#333] transition-all ${val === 'X' ? 'text-blue-400' : 'text-red-400'}`}
                    >
                        {val}
                    </button>
                ))}
            </div>
            <div className="mt-8 h-12 flex flex-col items-center">
                {winner ? (
                    <div className="text-xl font-bold text-green-400 animate-bounce">{winner === 'X' ? 'You Won!' : 'AI Won!'}</div>
                ) : (
                    <div className="text-gray-400">{xIsNext ? 'Your Turn (X)' : 'AI Thinking...'}</div>
                )}
                {winner || !board.includes(null) ? (
                    <button onClick={reset} className="mt-2 flex items-center gap-2 text-sm text-gray-300 hover:text-white"><RefreshCw size={14} /> Play Again</button>
                ) : null}
            </div>
        </div>
    );
};

// --- Cyber Pong Component (Unchanged) ---
const CyberPong: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState({ player: 0, ai: 0 });
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, radius: 6 };
        const paddleHeight = 80;
        const paddleWidth = 10;
        const player = { x: 0, y: canvas.height / 2 - paddleHeight / 2 };
        const ai = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2 };
        let animationId: number;

        const draw = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#333';
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            ctx.fillStyle = '#00ffcc';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffcc';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#3b82f6';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#3b82f6';
            ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);

            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);
            ctx.shadowBlur = 0;

            if (isPlaying) {
                ball.x += ball.dx;
                ball.y += ball.dy;

                if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.dy = -ball.dy;

                if (ball.x - ball.radius < player.x + paddleWidth && ball.y > player.y && ball.y < player.y + paddleHeight) {
                    ball.dx = -ball.dx * 1.05;
                }
                if (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + paddleHeight) {
                    ball.dx = -ball.dx * 1.05;
                }

                const aiCenter = ai.y + paddleHeight / 2;
                if (aiCenter < ball.y - 35) ai.y += 3;
                else if (aiCenter > ball.y + 35) ai.y -= 3;

                if (ball.x < 0) {
                    setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
                    resetBall();
                } else if (ball.x > canvas.width) {
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

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            player.y = mouseY - paddleHeight / 2;
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
            <button onClick={onBack} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"><ArrowLeft size={24} /></button>
            <div className="absolute top-4 flex gap-12 text-4xl font-bold font-mono z-0">
                <div className="text-blue-500">{score.player}</div>
                <div className="text-red-500">{score.ai}</div>
            </div>
            <div className="flex-1 flex items-center justify-center w-full">
                <canvas ref={canvasRef} width={600} height={400} className="bg-black border-2 border-gray-800 rounded-lg shadow-[0_0_50px_rgba(0,255,204,0.1)] cursor-none" />
            </div>
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <button onClick={() => setIsPlaying(true)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-105">START GAME</button>
                </div>
            )}
            <div className="pb-4 text-gray-500 text-xs">Use mouse to control paddle</div>
        </div>
    );
};

// --- 3D Space Defender Component (Enhanced) ---
const SpaceDefender: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [health, setHealth] = useState(100);

    useEffect(() => {
        if (!isPlaying) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 3D Projection Constants
        const FOV = 250;

        // Game State
        const player = { x: 0, y: 0, z: 0, width: 40, height: 20, speed: 8, tilt: 0, shield: 0 };
        const bullets: { x: number, y: number, z: number }[] = [];
        const enemies: { x: number, y: number, z: number, type: number, hp: number }[] = [];
        const stars: { x: number, y: number, z: number }[] = [];
        const particles: { x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, color: string }[] = [];
        let cameraShake = { x: 0, y: 0, intensity: 0 };

        // Init Stars
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: (Math.random() - 0.5) * 2000,
                y: (Math.random() - 0.5) * 2000,
                z: Math.random() * 2000
            });
        }

        let keys: Record<string, boolean> = {};
        let frame = 0;
        let animationId: number;
        let scoreLocal = 0;
        let healthLocal = 100;

        const handleKeyDown = (e: KeyboardEvent) => keys[e.key] = true;
        const handleKeyUp = (e: KeyboardEvent) => keys[e.key] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const project = (x: number, y: number, z: number) => {
            const scale = FOV / (z + FOV);
            return {
                x: canvas.width / 2 + (x + cameraShake.x) * scale,
                y: canvas.height / 2 + (y + cameraShake.y) * scale,
                scale: scale
            };
        };

        const draw = () => {
            if (gameOver) return;

            // Camera Shake Decay
            if (cameraShake.intensity > 0) {
                cameraShake.x = (Math.random() - 0.5) * cameraShake.intensity;
                cameraShake.y = (Math.random() - 0.5) * cameraShake.intensity;
                cameraShake.intensity *= 0.9;
                if (cameraShake.intensity < 0.5) cameraShake.intensity = 0;
            } else {
                cameraShake.x = 0;
                cameraShake.y = 0;
            }

            // Clear & Background
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars (Starfield effect)
            stars.forEach(star => {
                star.z -= 10 + (keys['Shift'] ? 20 : 0); // Turbo speed
                if (star.z <= 0) {
                    star.z = 2000;
                    star.x = (Math.random() - 0.5) * 2000;
                    star.y = (Math.random() - 0.5) * 2000;
                }
                const p = project(star.x, star.y, star.z);
                const size = (1 - star.z / 2000) * 3;
                ctx.fillStyle = `rgba(255, 255, 255, ${1 - star.z / 2000})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Player Movement
            if (keys['ArrowLeft']) { player.x -= player.speed; player.tilt = -0.3; }
            else if (keys['ArrowRight']) { player.x += player.speed; player.tilt = 0.3; }
            else { player.tilt *= 0.9; }

            if (keys['ArrowUp']) player.y -= player.speed;
            if (keys['ArrowDown']) player.y += player.speed;

            // Clamp Player
            player.x = Math.max(-300, Math.min(300, player.x));
            player.y = Math.max(-200, Math.min(200, player.y));

            // Shooting
            if (keys[' '] && frame % 6 === 0) {
                bullets.push({ x: player.x - 15, y: player.y, z: 80 });
                bullets.push({ x: player.x + 15, y: player.y, z: 80 });
            }

            // Draw Bullets
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.z += 60; // Move away fast
                const p = project(b.x, b.y, b.z);
                const size = b.z / 80;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
                if (b.z > 2000) bullets.splice(i, 1);
            }
            ctx.shadowBlur = 0;

            // Spawn Enemies
            if (frame % 30 === 0) {
                enemies.push({
                    x: (Math.random() - 0.5) * 800,
                    y: (Math.random() - 0.5) * 600,
                    z: 2000,
                    type: Math.random() > 0.9 ? 3 : (Math.random() > 0.7 ? 2 : 1), // 3=Boss, 2=Big, 1=Small
                    hp: 1
                });
                // Set HP based on type
                enemies[enemies.length - 1].hp = enemies[enemies.length - 1].type === 3 ? 10 : (enemies[enemies.length - 1].type === 2 ? 3 : 1);
            }

            // Draw Enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                e.z -= 15 + (frame / 500); // Get faster over time

                // AI: Move towards player
                e.x += (player.x - e.x) * 0.02;
                e.y += (player.y - e.y) * 0.02;

                const p = project(e.x, e.y, e.z);
                const scale = p.scale * (e.type === 3 ? 120 : (e.type === 2 ? 80 : 40));

                // Draw Enemy Shape
                ctx.strokeStyle = e.type === 3 ? '#ff0000' : (e.type === 2 ? '#ff0055' : '#ffaa00');
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (e.type === 3) { // Boss Shape
                    ctx.moveTo(p.x, p.y - scale);
                    ctx.lineTo(p.x + scale, p.y);
                    ctx.lineTo(p.x, p.y + scale);
                    ctx.lineTo(p.x - scale, p.y);
                } else {
                    ctx.moveTo(p.x, p.y - scale);
                    ctx.lineTo(p.x - scale, p.y + scale);
                    ctx.lineTo(p.x + scale, p.y + scale);
                }
                ctx.closePath();
                ctx.stroke();

                // Inner glow
                ctx.fillStyle = e.type === 3 ? 'rgba(255, 0, 0, 0.3)' : (e.type === 2 ? 'rgba(255, 0, 85, 0.2)' : 'rgba(255, 170, 0, 0.2)');
                ctx.fill();

                // Collision with Bullets
                for (let j = bullets.length - 1; j >= 0; j--) {
                    const b = bullets[j];
                    if (Math.abs(b.z - e.z) < 100 && Math.abs(b.x - e.x) < scale && Math.abs(b.y - e.y) < scale) {
                        // Hit
                        e.hp--;
                        bullets.splice(j, 1);

                        // Particle hit effect
                        for (let k = 0; k < 3; k++) {
                            particles.push({
                                x: e.x, y: e.y, z: e.z,
                                vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, vz: (Math.random() - 0.5) * 30,
                                life: 0.5, color: '#ffffff'
                            });
                        }

                        if (e.hp <= 0) {
                            // Explosion
                            for (let k = 0; k < 15; k++) {
                                particles.push({
                                    x: e.x, y: e.y, z: e.z,
                                    vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50, vz: (Math.random() - 0.5) * 50,
                                    life: 1.0, color: e.type === 3 ? '#ff0000' : (e.type === 2 ? '#ff0055' : '#ffaa00')
                                });
                            }
                            enemies.splice(i, 1);
                            scoreLocal += e.type === 3 ? 500 : (e.type === 2 ? 100 : 50);
                            setScore(scoreLocal);
                            cameraShake.intensity = e.type === 3 ? 20 : 5;
                        }
                        break;
                    }
                }

                // Collision with Player
                if (e.z < 100 && Math.abs(e.x - player.x) < 50 && Math.abs(e.y - player.y) < 30) {
                    healthLocal -= 20;
                    setHealth(healthLocal);
                    cameraShake.intensity = 30;
                    enemies.splice(i, 1);

                    // Screen flash red
                    ctx.fillStyle = 'rgba(255,0,0,0.3)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    if (healthLocal <= 0) {
                        setGameOver(true);
                        setIsPlaying(false);
                    }
                }

                if (e.z < 0) enemies.splice(i, 1);
            }

            // Draw Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy; p.z += p.vz;
                p.life -= 0.05;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                const proj = project(p.x, p.y, p.z);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 2 * proj.scale * 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Draw Player Ship (Wireframe)
            const shipP = project(player.x, player.y, 50); // Fixed Z for player
            const shipScale = shipP.scale * 20;

            ctx.save();
            ctx.translate(shipP.x, shipP.y);
            ctx.rotate(player.tilt);

            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ff00';

            ctx.beginPath();
            ctx.moveTo(0, -shipScale); // Nose
            ctx.lineTo(-shipScale, shipScale); // Left Wing
            ctx.lineTo(0, shipScale * 0.5); // Engine
            ctx.lineTo(shipScale, shipScale); // Right Wing
            ctx.closePath();
            ctx.stroke();

            // Engine flame
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(-shipScale * 0.3, shipScale * 0.6);
            ctx.lineTo(shipScale * 0.3, shipScale * 0.6);
            ctx.lineTo(0, shipScale * 1.5 + Math.random() * 10);
            ctx.fill();

            ctx.restore();

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
        <div className="h-full flex flex-col items-center bg-black text-white relative overflow-hidden">
            <button onClick={onBack} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"><ArrowLeft size={24} /></button>

            {/* HUD */}
            <div className="absolute top-4 right-4 flex flex-col items-end z-10">
                <div className="text-2xl font-mono text-green-400 font-bold tracking-widest">SCORE: {score}</div>
                <div className="w-48 h-4 bg-gray-800 rounded-full mt-2 border border-gray-600 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-300" style={{ width: `${health}%` }} />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <canvas ref={canvasRef} width={800} height={600} className="bg-[#050510] border-2 border-gray-800 rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.1)]" />
            </div>

            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                    <div className="text-center">
                        <h2 className="text-5xl font-bold mb-4 text-green-400 tracking-widest uppercase glitch-text">Star Defender 3D</h2>
                        <button onClick={() => { setHealth(100); setScore(0); setIsPlaying(true); }} className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-none border-2 border-green-400 text-xl transition-all hover:scale-105 uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,0,0.5)]">
                            Initialize
                        </button>
                        <p className="mt-6 text-gray-400 font-mono">Arrows to Fly • Space to Fire</p>
                    </div>
                </div>
            )}

            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 backdrop-blur-sm z-20">
                    <div className="text-center animate-in zoom-in duration-300">
                        <h2 className="text-6xl font-bold mb-4 text-white uppercase tracking-widest">Mission Failed</h2>
                        <p className="text-3xl mb-8 text-red-200 font-mono">Score: {score}</p>
                        <button onClick={() => { setGameOver(false); setHealth(100); setScore(0); setIsPlaying(true); }} className="px-8 py-3 bg-white text-red-900 font-bold rounded text-xl transition-all hover:scale-105 uppercase">
                            Retry Mission
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Cyber Racer Component (Enhanced) ---
const CyberRacer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTurbo, setIsTurbo] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Game Constants
        const SEGMENT_COUNT = 1000;
        const SEGMENT_LENGTH = 200;
        const ROAD_WIDTH = 2000;
        const DRAW_DISTANCE = 300;
        const FOV = 100;
        const CAMERA_HEIGHT = 1000;
        const CAMERA_DEPTH = 1 / Math.tan((FOV / 2) * Math.PI / 180);

        // Game State
        let playerX = 0;
        let position = 0;
        let speed = 0;
        const maxSpeed = 12000; // Max speed
        const turboSpeed = 20000;
        const accel = 100;
        const breaking = -300;
        const decel = -50;

        interface Segment {
            index: number;
            p1: { world: { x: number, y: number, z: number }, screen: { x: number, y: number, w: number }, scale: number };
            p2: { world: { x: number, y: number, z: number }, screen: { x: number, y: number, w: number }, scale: number };
            curve: number;
            color: { road: string, grass: string, rumble: string };
            sprite?: { type: string, offset: number };
        }

        const segments: Segment[] = [];
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            const curve = Math.floor(i / 50) % 2 ? ((i / 50) % 4 === 1 ? 3 : -3) : 0;
            segments.push({
                index: i,
                p1: { world: { x: 0, y: 0, z: i * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 }, scale: 0 },
                p2: { world: { x: 0, y: 0, z: (i + 1) * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 }, scale: 0 },
                curve: curve,
                color: {
                    road: Math.floor(i / 3) % 2 ? '#1f2937' : '#111827',
                    grass: Math.floor(i / 3) % 2 ? '#4b5563' : '#374151',
                    rumble: Math.floor(i / 3) % 2 ? '#ef4444' : '#ffffff'
                },
                sprite: Math.random() > 0.95 ? { type: 'palm', offset: Math.random() > 0.5 ? 2.5 : -2.5 } : undefined
            });
        }

        let keys: Record<string, boolean> = {};
        let animationId: number;

        const handleKeyDown = (e: KeyboardEvent) => keys[e.key] = true;
        const handleKeyUp = (e: KeyboardEvent) => keys[e.key] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const renderSegment = (ctx: CanvasRenderingContext2D, width: number, lanes: number, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: any) => {
            // Grass
            ctx.fillStyle = color.grass;
            ctx.fillRect(0, y2, width, y1 - y2);

            // Rumble
            ctx.fillStyle = color.rumble;
            const r1 = w1 / 10;
            const r2 = w2 / 10;
            ctx.beginPath();
            ctx.moveTo(x1 - w1 - r1, y1);
            ctx.lineTo(x1 - w1, y1);
            ctx.lineTo(x2 - w2, y2);
            ctx.lineTo(x2 - w2 - r2, y2);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x1 + w1 + r1, y1);
            ctx.lineTo(x1 + w1, y1);
            ctx.lineTo(x2 + w2, y2);
            ctx.lineTo(x2 + w2 + r2, y2);
            ctx.closePath();
            ctx.fill();

            // Road
            ctx.fillStyle = color.road;
            ctx.beginPath();
            ctx.moveTo(x1 - w1, y1);
            ctx.lineTo(x1 + w1, y1);
            ctx.lineTo(x2 + w2, y2);
            ctx.lineTo(x2 - w2, y2);
            ctx.closePath();
            ctx.fill();

            // Lanes
            if (color.road === '#1f2937') {
                ctx.fillStyle = '#ffffff';
                const l1 = w1 / 32;
                ctx.fillRect(x1 - l1 / 2, y1, l1, y2 - y1);
            }
        };

        const draw = () => {
            if (gameOver) return;

            // Update
            const currentMaxSpeed = keys['Shift'] ? turboSpeed : maxSpeed;
            setIsTurbo(keys['Shift']);

            if (keys['ArrowUp']) speed += accel * (keys['Shift'] ? 2 : 1);
            else if (keys['ArrowDown']) speed += breaking;
            else speed += decel;

            speed = Math.max(0, Math.min(speed, currentMaxSpeed));

            if (keys['ArrowLeft'] && speed > 0) playerX -= (speed / maxSpeed) * 100;
            if (keys['ArrowRight'] && speed > 0) playerX += (speed / maxSpeed) * 100;

            playerX = Math.max(-2500, Math.min(2500, playerX));

            position += speed;
            while (position >= SEGMENT_COUNT * SEGMENT_LENGTH) position -= SEGMENT_COUNT * SEGMENT_LENGTH;
            while (position < 0) position += SEGMENT_COUNT * SEGMENT_LENGTH;

            // Score
            setScore(prev => prev + Math.floor(speed / 100));

            // Draw Sky
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#3b0764');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Sun
            ctx.fillStyle = '#fbbf24';
            ctx.shadowBlur = 50;
            ctx.shadowColor = '#fbbf24';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 + 50, 100, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Grid floor (Horizon)
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.moveTo(i, canvas.height / 2);
                ctx.lineTo(i - (i - canvas.width / 2) * 2, canvas.height);
            }
            ctx.stroke();

            const startPos = Math.floor(position / SEGMENT_LENGTH);
            let maxy = canvas.height;
            let x = 0, dx = 0;

            for (let n = startPos; n < startPos + DRAW_DISTANCE; n++) {
                const segment = segments[n % SEGMENT_COUNT];

                const z = (n - startPos) * SEGMENT_LENGTH; // Distance from camera
                if (z < 1) continue;

                const scale = CAMERA_DEPTH / z;
                const screenY = (canvas.height / 2) + (scale * CAMERA_HEIGHT * canvas.height / 2);

                // Curve
                x += dx;
                dx += segment.curve;

                const screenX = (canvas.width / 2) - (x - playerX) * scale * canvas.width / 2;
                const screenW = scale * ROAD_WIDTH * canvas.width / 2;

                if (screenY >= maxy) continue;

                renderSegment(ctx, canvas.width, 3,
                    screenX, screenY, screenW,
                    screenX, maxy, screenW * 1.05,
                    segment.color
                );

                maxy = screenY;
            }

            // Speed Lines (Turbo Effect)
            if (isTurbo && speed > 10000) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const lx = Math.random() * canvas.width;
                    const ly = Math.random() * canvas.height;
                    ctx.moveTo(canvas.width / 2, canvas.height / 2);
                    ctx.lineTo(lx, ly);
                }
                ctx.stroke();
            }

            // Draw Player Car
            const carScale = 4;
            const carW = 60 * carScale;
            const carH = 30 * carScale;
            const carX = canvas.width / 2 - carW / 2;
            const carY = canvas.height - carH - 20;

            // Car Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(carX + 10, carY + carH - 5, carW - 20, 10);

            // Car Body
            ctx.fillStyle = '#ef4444';
            if (isTurbo) ctx.shadowBlur = 20;
            if (isTurbo) ctx.shadowColor = '#ef4444';
            ctx.fillRect(carX, carY, carW, carH);

            // Spoiler
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(carX - 5, carY - 10, carW + 10, 10);

            // Window
            ctx.fillStyle = '#000';
            ctx.fillRect(carX + 10, carY + 5, carW - 20, 10);

            // Lights
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(carX + 5, carY + 10, 10, 5);
            ctx.fillRect(carX + carW - 15, carY + 10, 10, 5);

            // Exhaust
            if (isTurbo) {
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.moveTo(carX + 15, carY + carH);
                ctx.lineTo(carX + 25, carY + carH);
                ctx.lineTo(carX + 20, carY + carH + Math.random() * 30);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(carX + carW - 25, carY + carH);
                ctx.lineTo(carX + carW - 15, carY + carH);
                ctx.lineTo(carX + carW - 20, carY + carH + Math.random() * 30);
                ctx.fill();
            }

            ctx.shadowBlur = 0;

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
        <div className="h-full flex flex-col items-center bg-slate-900 text-white relative overflow-hidden">
            <button onClick={onBack} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"><ArrowLeft size={24} /></button>

            <div className="absolute top-4 right-4 flex flex-col items-end z-10">
                <div className="text-2xl font-mono text-yellow-400 font-bold italic">DIST: {score}m</div>
                {isTurbo && <div className="text-blue-400 font-bold animate-pulse">TURBO ACTIVE</div>}
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <canvas ref={canvasRef} width={800} height={600} className="bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl" />
            </div>

            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                    <div className="text-center">
                        <h2 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 italic transform -skew-x-12">CYBER RACER</h2>
                        <button onClick={() => setIsPlaying(true)} className="px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-none text-2xl transition-all hover:scale-110 transform skew-x-12 shadow-[5px_5px_0px_rgba(255,255,255,1)]">
                            IGNITION
                        </button>
                        <p className="mt-8 text-gray-400 font-mono">Arrows to Drive • Shift for Turbo</p>
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
        { id: 'space', name: 'Space Defender 3D', icon: <Rocket size={40} />, color: 'from-green-500 to-emerald-700', desc: '3D Space Shooter' },
        { id: 'racer', name: 'Cyber Racer', icon: <Car size={40} />, color: 'from-yellow-500 to-red-600', desc: 'Retro 3D Racing' },
    ];

    if (activeGame === 'tictactoe') return <TicTacToe onBack={() => setActiveGame('launcher')} />;
    if (activeGame === 'pong') return <CyberPong onBack={() => setActiveGame('launcher')} />;
    if (activeGame === 'space') return <SpaceDefender onBack={() => setActiveGame('launcher')} />;
    if (activeGame === 'racer') return <CyberRacer onBack={() => setActiveGame('launcher')} />;

    return (
        <div className="h-full bg-[#0f172a] text-white p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-6 animate-bounce-slow">
                        <Gamepad2 size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
                        Yashika Arcade
                    </h1>
                    <p className="text-gray-400 text-lg">Select a game to start playing</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{game.name}</h3>
                            <p className="text-gray-400 text-xs mb-6">{game.desc}</p>
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
