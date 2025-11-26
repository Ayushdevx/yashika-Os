
import React, { useState, useEffect } from 'react';
import { AppID, WindowState } from './types';
import { APP_REGISTRY } from './constants';
import { OSProvider, useOS } from './contexts/OSContext';
import Taskbar from './components/os/Taskbar';
import Window from './components/os/Window';
import Terminal from './components/apps/Terminal';
import FileExplorer from './components/apps/FileExplorer';
import NetworkMonitor from './components/apps/NetworkMonitor';
import Browser from './components/apps/Browser';
import TextEditor from './components/apps/TextEditor';
import TaskManager from './components/apps/TaskManager';
import Settings from './components/apps/Settings';
import Notes from './components/apps/Notes';
import Paint from './components/apps/Paint';
import TicTacToe from './components/apps/TicTacToe';
import Clock from './components/apps/Clock';
import Camera from './components/apps/Camera';
import { Word, Excel, PowerPoint } from './components/apps/Office';
import YouTube from './components/apps/YouTube';
import VSCode from './components/apps/VSCode';
import Spotify from './components/apps/Spotify';
import ContextMenu from './components/os/ContextMenu';
import { Power, User, ArrowRight, Lock, RefreshCw, Moon, LogOut, XCircle } from 'lucide-react';
import { playSystemSound } from './utils/soundEffects';

// --- Types ---
type SystemState = 'OFF' | 'BOOTING' | 'LOGIN' | 'DESKTOP' | 'POWER_MENU' | 'SHUTTING_DOWN' | 'RESTARTING';

// --- Components ---

const BlackScreen = ({ blink }: { blink?: boolean }) => (
    <div className="fixed inset-0 bg-black z-[10000] flex items-start p-4 font-mono text-white cursor-none">
        {blink && <span className="animate-pulse">_</span>}
    </div>
);

const MatrixRain = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);
        return () => clearInterval(interval);
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-20" />;
};

const SystemSequence = ({ type, onComplete }: { type: 'BOOT' | 'SHUTDOWN' | 'RESTART', onComplete: () => void }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bootLogs = [
            "[  OK  ] Started Network Manager.",
            "[  OK  ] Reached target Graphical Interface.",
            "[  OK  ] Started GNOME Display Manager.",
            "[  OK  ] Started User Manager for UID 1000.",
            "[  OK  ] Started Disk Manager.",
            "[  OK  ] Found device /dev/sda1.",
            "[  OK  ] Mounted /boot/efi.",
            "[  OK  ] Started Audio Service.",
            "[  OK  ] Started Bluetooth Service.",
            "[  OK  ] Started Power Profiles Daemon.",
            "[  OK  ] Started Accounts Service.",
            "[  OK  ] Started System Logging Service.",
            "[  OK  ] Started Docker Application Container Engine.",
            "[  OK  ] Started Kubernetes Kubelet.",
            "[  OK  ] Started PostgreSQL Database Server.",
            "[  OK  ] Started Apache Web Server.",
            "[  OK  ] Started OpenSSH Daemon.",
            "Starting Yashika OS Kernel v6.9.0-kali3-amd64...",
            "Loading modules...",
            "Initializing graphics...",
            "Mounting filesystems...",
            "Checking file system integrity...",
            "/dev/sda2: clean, 4512/123456 files, 54321/987654 blocks",
            "Setting up swap space...",
            "Enabling /etc/fstab swaps...",
            "System ready."
        ];

        const shutdownLogs = [
            "Stopping Session 2 of user yashika.",
            "[  OK  ] Stopped User Manager for UID 1000.",
            "[  OK  ] Stopped Network Manager.",
            "[  OK  ] Stopped Docker Application Container Engine.",
            "[  OK  ] Stopped PostgreSQL Database Server.",
            "[  OK  ] Stopped Apache Web Server.",
            "Unmounting /home...",
            "Unmounting /...",
            "Reaching target Shutdown.",
            "System Halted."
        ];

        const targetLogs = type === 'SHUTDOWN' ? shutdownLogs : bootLogs;
        let delay = 0;

        targetLogs.forEach((log, i) => {
            delay += Math.random() * 100 + 50; // Faster logs
            setTimeout(() => {
                setLogs(prev => [...prev, log]);
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
                if (i === targetLogs.length - 1) {
                    setTimeout(onComplete, 1500);
                }
            }, delay);
        });
    }, [type, onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-[10000] flex flex-col items-center justify-center text-white font-mono overflow-hidden">
            <MatrixRain />

            <div className="relative mb-12 z-10">
                {/* Glitchy Logo Animation */}
                <div className="w-32 h-32 relative animate-[spin_10s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-[spin_3s_linear_infinite_reverse]" style={{ transform: 'rotateX(60deg)' }}></div>
                    <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-[spin_3s_linear_infinite]" style={{ transform: 'rotateY(60deg)' }}></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-[spin_5s_linear_infinite]" style={{ transform: 'rotateX(90deg)' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_white] animate-pulse"></div>
                </div>
            </div>

            <div className="text-3xl font-bold tracking-[0.5em] mb-8 animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 z-10 glitch-text">
                {type === 'BOOT' ? 'SYSTEM INITIALIZATION' : (type === 'RESTART' ? 'REBOOT SEQUENCE' : 'SYSTEM HALT')}
            </div>

            <div className="w-full max-w-3xl h-64 overflow-hidden relative z-10 bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-lg p-4">
                <div ref={scrollRef} className="h-full overflow-y-auto custom-scrollbar flex flex-col justify-end">
                    {logs.map((log, i) => (
                        <div key={i} className="text-sm font-mono mb-1 flex gap-3">
                            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                            <span className={log.includes('OK') ? 'text-green-400' : 'text-blue-300'}>
                                {log}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .glitch-text {
                    text-shadow: 2px 0 #ff00c1, -2px 0 #00fff9;
                    animation: glitch 1s infinite linear alternate-reverse;
                }
                @keyframes glitch {
                    0% { transform: skew(0deg); }
                    20% { transform: skew(-2deg); }
                    40% { transform: skew(2deg); }
                    60% { transform: skew(-1deg); }
                    80% { transform: skew(1deg); }
                    100% { transform: skew(0deg); }
                }
            `}</style>
        </div>
    );
};

const PowerMenu: React.FC<{ onAction: (action: 'shutdown' | 'restart' | 'sleep' | 'logout' | 'cancel') => void }> = ({ onAction }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-[#1a1b26] border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-md w-full transform scale-100 animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-light text-white mb-8 text-center tracking-widest">POWER OPTIONS</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => onAction('shutdown')}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-black text-red-400 transition-all duration-300 group"
                    >
                        <Power size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm">Power Off</span>
                    </button>

                    <button
                        onClick={() => onAction('restart')}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black text-yellow-400 transition-all duration-300 group"
                    >
                        <RefreshCw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="font-bold text-sm">Restart</span>
                    </button>

                    <button
                        onClick={() => onAction('sleep')}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-black text-blue-400 transition-all duration-300 group"
                    >
                        <Moon size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm">Sleep</span>
                    </button>

                    <button
                        onClick={() => onAction('logout')}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500 hover:text-black text-gray-400 transition-all duration-300 group"
                    >
                        <LogOut size={32} className="group-hover:translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Log Out</span>
                    </button>
                </div>

                <button
                    onClick={() => onAction('cancel')}
                    className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <XCircle size={18} /> Cancel
                </button>
            </div>
        </div>
    );
};

const LoginScreen: React.FC<{ onLogin: () => void, onPowerClick: () => void }> = ({ onLogin, onPowerClick }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        setTimeout(() => {
            if (['toor', 'kali', 'password', '1234', 'admin'].includes(password.toLowerCase()) || password === '') {
                playSystemSound('login');
                setIsExiting(true);
                setTimeout(onLogin, 1000);
            } else {
                playSystemSound('error');
                setError(true);
                setLoading(false);
                setPassword('');
                setTimeout(() => setError(false), 500);
            }
        }, 800);
    };

    return (
        <div className={`fixed inset-0 z-[9999] overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-110 blur-2xl' : 'opacity-100'}`}>
            <div
                className="absolute inset-0 bg-cover bg-center z-0 animate-[pulse-slow_15s_infinite_alternate]"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                <div className="mb-16 text-center text-white drop-shadow-2xl animate-in slide-in-from-top-10 duration-1000 fade-in">
                    <div className="text-7xl md:text-9xl font-thin tracking-tighter font-mono">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                    <div className="text-xl md:text-2xl font-light mt-2 tracking-widest opacity-80 uppercase">
                        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <div className="w-full max-w-sm animate-in zoom-in-95 duration-700 fade-in delay-200">
                    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center transition-all hover:border-white/20">
                        <div className="relative mb-6">
                            <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 shadow-lg shadow-blue-500/20">
                                <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center overflow-hidden relative group">
                                    <User size={56} className="text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-black/50 flex items-center justify-center">
                                <Lock size={10} className="text-black" />
                            </div>
                        </div>

                        <h2 className="text-2xl text-white font-light tracking-wide mb-1">Yashika</h2>
                        <p className="text-xs text-gray-400 mb-8 font-mono">Administrator</p>

                        <form onSubmit={handleSubmit} className="w-full">
                            <div className={`relative group transition-transform duration-300 ${error ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                    placeholder="Enter Password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-center tracking-widest shadow-inner"
                                    autoFocus
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    className={`
                                        absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300
                                        ${password ? 'text-white bg-blue-600 hover:bg-blue-500 shadow-lg' : 'text-gray-500 opacity-0 pointer-events-none'}
                                    `}
                                    disabled={loading}
                                >
                                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={18} />}
                                </button>
                            </div>

                            <div className="h-6 mt-3 text-center">
                                {error && <span className="text-red-400 text-xs animate-pulse font-mono bg-red-500/10 px-2 py-1 rounded">Authentication Failed</span>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 flex gap-4 z-10 opacity-50 hover:opacity-100 transition-opacity">
                <button
                    onClick={onPowerClick}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/5"
                >
                    <Power size={24} className="text-white" />
                </button>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    );
};

// Main Desktop Component
const Desktop: React.FC<{ onPowerClick: () => void }> = ({ onPowerClick }) => {
    const {
        windows,
        activeWindowId,
        isStartOpen,
        wallpaper,
        launchApp,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        moveWindow,
        resizeWindow,
        toggleStart,
        fs
    } = useOS();

    const [bgLoaded, setBgLoaded] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean }>({ x: 0, y: 0, visible: false });

    useEffect(() => {
        const img = new Image();
        img.src = wallpaper;
        img.onload = () => setBgLoaded(true);
    }, [wallpaper]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
    };

    const handleContextAction = (action: string) => {
        setContextMenu({ ...contextMenu, visible: false });
        switch (action) {
            case 'new_folder':
                fs.makeDirectory('/home/yashika/Desktop/New Folder');
                break;
            case 'new_file':
                fs.writeFile('/home/yashika/Desktop/New Document.txt', '');
                break;
            case 'open_terminal':
                launchApp(AppID.TERMINAL);
                break;
            case 'change_bg':
                launchApp(AppID.SETTINGS);
                break;
        }
    };

    const renderAppContent = (window: WindowState) => {
        const commonProps = {
            windowId: window.id,
            params: window.launchParams
        };

        switch (window.appId) {
            case AppID.TERMINAL: return <Terminal {...commonProps} />;
            case AppID.FILE_EXPLORER: return <FileExplorer {...commonProps} />;
            case AppID.TEXT_EDITOR: return <TextEditor {...commonProps} />;
            case AppID.NETWORK_ANALYZER: return <NetworkMonitor {...commonProps} />;
            case AppID.BROWSER: return <Browser {...commonProps} />;
            case AppID.TASK_MANAGER: return <TaskManager {...commonProps} />;
            case AppID.SETTINGS: return <Settings {...commonProps} />;
            case AppID.NOTES: return <Notes {...commonProps} />;
            case AppID.PAINT: return <Paint {...commonProps} />;
            case AppID.TICTACTOE: return <TicTacToe {...commonProps} />;
            case AppID.WORD: return <Word {...commonProps} />;
            case AppID.EXCEL: return <Excel {...commonProps} />;
            case AppID.POWERPOINT: return <PowerPoint {...commonProps} />;
            case AppID.CLOCK: return <Clock {...commonProps} />;
            case AppID.CAMERA: return <Camera {...commonProps} />;
            case AppID.YOUTUBE: return <YouTube {...commonProps} />;
            case AppID.VSCODE: return <VSCode {...commonProps} />;
            case AppID.SPOTIFY: return <Spotify {...commonProps} />;
            case AppID.LINKEDIN: return <Browser {...commonProps} params={{ url: 'https://www.linkedin.com/in/yashika-kainth-69a0b1284/?originalSubdomain=in' }} />;
            case AppID.INSTAGRAM: return <Browser {...commonProps} params={{ url: 'https://www.instagram.com' }} />;
            case AppID.CHATGPT: return <Browser {...commonProps} params={{ url: 'https://chatgpt.com' }} />;
            default: return <div className="p-4 text-gray-500">Not Implemented</div>;
        }
    };

    return (
        <div
            className="relative w-screen h-screen overflow-hidden font-sans bg-black selection:bg-yashika-accent selection:text-white"
            onClick={() => {
                if (isStartOpen) toggleStart();
                setContextMenu({ ...contextMenu, visible: false });
            }}
            onContextMenu={handleContextMenu}
        >
            {/* Wallpaper */}
            <div
                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${bgLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
                style={{
                    backgroundImage: `url("${wallpaper}")`,
                }}
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-[1]" />

            {/* Desktop Icons */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-0 animate-fade-in-up">
                {Object.values(APP_REGISTRY).filter(a => [AppID.TERMINAL, AppID.FILE_EXPLORER, AppID.TRASH, AppID.BROWSER].includes(a.id)).map(app => (
                    <div
                        key={app.id}
                        onDoubleClick={() => launchApp(app.id)}
                        className="w-24 flex flex-col items-center gap-1 group cursor-pointer p-2 rounded hover:bg-white/10 hover:backdrop-blur-sm transition-all border border-transparent hover:border-white/5 active:scale-95 duration-200"
                    >
                        <div className="w-12 h-12 text-gray-100 drop-shadow-lg group-hover:scale-110 transition-transform duration-200 filter drop-shadow-2xl">
                            {app.icon}
                        </div>
                        <span className="text-xs text-white text-center font-medium drop-shadow-md shadow-black line-clamp-2 px-1 rounded group-hover:bg-black/40">
                            {app.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Window Manager */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {windows.map(win => (
                    <div key={win.id} className="pointer-events-auto">
                        <Window
                            windowState={win}
                            isActive={activeWindowId === win.id}
                            onClose={closeWindow}
                            onMinimize={minimizeWindow}
                            onMaximize={maximizeWindow}
                            onFocus={focusWindow}
                            onMove={moveWindow}
                            onResize={resizeWindow}
                        >
                            {renderAppContent(win)}
                        </Window>
                    </div>
                ))}
            </div>

            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                visible={contextMenu.visible}
                onClose={() => setContextMenu({ ...contextMenu, visible: false })}
                onAction={handleContextAction}
            />

            <Taskbar
                windows={windows}
                activeWindowId={activeWindowId}
                onAppLaunch={launchApp}
                onWindowClick={focusWindow}
                onToggleStart={toggleStart}
                onPowerClick={onPowerClick}
                isStartOpen={isStartOpen}
            />
        </div>
    );
};

const App: React.FC = () => {
    const [systemState, setSystemState] = useState<SystemState>('LOGIN');

    const handlePowerAction = (action: 'shutdown' | 'restart' | 'sleep' | 'logout' | 'cancel') => {
        if (action === 'cancel') {
            setSystemState(prev => prev === 'POWER_MENU' ? 'DESKTOP' : 'LOGIN'); // simplified return
            return;
        }
        if (action === 'shutdown') setSystemState('SHUTTING_DOWN');
        if (action === 'restart') setSystemState('RESTARTING');
        if (action === 'logout') {
            playSystemSound('close');
            setSystemState('LOGIN');
        }
        if (action === 'sleep') setSystemState('LOGIN'); // Just go back to lock screen for sleep sim
    };

    return (
        <OSProvider>
            {systemState === 'OFF' && <BlackScreen />}

            {systemState === 'BOOTING' && (
                <SystemSequence type="BOOT" onComplete={() => setSystemState('LOGIN')} />
            )}

            {systemState === 'LOGIN' && (
                <>
                    <LoginScreen onLogin={() => setSystemState('DESKTOP')} onPowerClick={() => setSystemState('POWER_MENU')} />
                    {/* Special case: If we are in LOGIN and click power, we want to show menu over it or handle it. 
                    Currently LoginScreen calls onPowerClick which sets state to POWER_MENU.
                    But we need to render POWER_MENU conditionally.
                */}
                </>
            )}

            {systemState === 'DESKTOP' && (
                <Desktop onPowerClick={() => setSystemState('POWER_MENU')} />
            )}

            {systemState === 'POWER_MENU' && (
                <>
                    {/* Background could be desktop or login depending on where we came from. 
                    For simplicity, we'll re-render Desktop if previous was Desktop-like interactions 
                    or just a blur overlay if we track 'lastState'.
                    A simpler approach is to conditionally render Desktop/Login underneath.
                */}
                    <Desktop onPowerClick={() => { }} />
                    <PowerMenu onAction={handlePowerAction} />
                </>
            )}

            {systemState === 'SHUTTING_DOWN' && (
                <SystemSequence type="SHUTDOWN" onComplete={() => setSystemState('OFF')} />
            )}

            {systemState === 'RESTARTING' && (
                <SystemSequence type="SHUTDOWN" onComplete={() => setSystemState('BOOTING')} />
            )}
        </OSProvider>
    );
};

export default App;
