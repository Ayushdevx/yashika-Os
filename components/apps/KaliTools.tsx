import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Shield, Search, Database, Terminal, Play, Pause, RefreshCw, Lock,
    AlertTriangle, Check, X, Server, Globe, Activity, Wifi, Radio,
    Cpu, HardDrive, Network, Command, Zap, Eye, Code
} from 'lucide-react';
import { AppProps } from '../../types';

// --- Types ---

type ToolType = 'dashboard' | 'nmap' | 'hydra' | 'sqlmap' | 'metasploit' | 'wireshark' | 'aircrack';

interface LogEntry {
    text: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'raw';
    timestamp: string;
}

// --- Constants ---

const TOOLS = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity, color: 'text-gray-400' },
    { id: 'nmap', name: 'Nmap', icon: Globe, color: 'text-blue-400' },
    { id: 'metasploit', name: 'Metasploit', icon: Terminal, color: 'text-purple-400' },
    { id: 'hydra', name: 'Hydra', icon: Lock, color: 'text-red-400' },
    { id: 'sqlmap', name: 'SQLMap', icon: Database, color: 'text-yellow-400' },
    { id: 'wireshark', name: 'Wireshark', icon: Network, color: 'text-cyan-400' },
    { id: 'aircrack', name: 'Aircrack-ng', icon: Wifi, color: 'text-green-400' },
];

// --- Sub-Components ---

const CRTOverlay = () => (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden h-full w-full">
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
        {/* Flicker */}
        <div className="absolute inset-0 bg-white opacity-[0.02] animate-[flicker_0.15s_infinite] pointer-events-none" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        <style>{`
            @keyframes flicker {
                0% { opacity: 0.02; }
                50% { opacity: 0.05; }
                100% { opacity: 0.02; }
            }
        `}</style>
    </div>
);

const HackerTerminal: React.FC<{
    logs: LogEntry[];
    onCommand?: (cmd: string) => void;
    prompt?: string;
    typingSpeed?: number;
}> = ({ logs, onCommand, prompt = "root@kali:~#", typingSpeed = 10 }) => {
    const endRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (input.trim()) {
                onCommand?.(input);
                setHistory(prev => [...prev, input]);
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = Math.min(history.length - 1, historyIndex + 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else {
                setInput('');
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-black font-mono text-sm p-4 overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pb-2">
                {logs.map((log, i) => (
                    <div key={i} className="break-words animate-in fade-in duration-300">
                        {log.type !== 'raw' && <span className="text-gray-500 text-xs mr-2">[{log.timestamp}]</span>}
                        <span className={`${log.type === 'error' ? 'text-red-500' :
                                log.type === 'success' ? 'text-green-500' :
                                    log.type === 'warning' ? 'text-yellow-500' :
                                        log.type === 'system' ? 'text-blue-400' :
                                            log.type === 'raw' ? 'text-gray-300' : 'text-gray-300'
                            } drop-shadow-[0_0_2px_rgba(0,255,0,0.2)]`}>
                            {log.text}
                        </span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            {onCommand && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                    <span className="text-green-500 font-bold drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">{prompt}</span>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent outline-none text-gray-200 caret-green-500"
                        autoFocus
                        spellCheck={false}
                    />
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

const KaliTools: React.FC<AppProps> = ({ params }) => {
    const { initialTool = 'dashboard' } = params || {};
    const [activeTool, setActiveTool] = useState<ToolType>(initialTool as ToolType);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // Nmap State
    const [nmapGrid, setNmapGrid] = useState<boolean[]>(Array(100).fill(false));
    const [nmapScanIndex, setNmapScanIndex] = useState(-1);

    // Hydra State
    const [hydraAttempts, setHydraAttempts] = useState<string[]>([]);

    // SQLMap State
    const [sqlData, setSqlData] = useState<string[]>([]);

    // Wireshark State
    const [wsPackets, setWsPackets] = useState<any[]>([]);
    const [wsFilter, setWsFilter] = useState('');

    // Aircrack State
    const [acProgress, setAcProgress] = useState(0);

    // Metasploit State
    const [msfHistory, setMsfHistory] = useState<LogEntry[]>([{ text: 'Metasploit Framework Console 6.3.55', type: 'system', timestamp: '' }]);

    // --- Helpers ---

    const addLog = (text: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev, {
            text,
            type,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    // --- Tool Logic ---

    const runNmap = () => {
        setIsRunning(true);
        setNmapGrid(Array(100).fill(false));
        setNmapScanIndex(0);
        addLog('Starting Nmap 7.94 ( https://nmap.org )', 'system');

        let idx = 0;
        const interval = setInterval(() => {
            idx++;
            setNmapScanIndex(idx);

            // Simulate finding open ports
            if (Math.random() > 0.95) {
                setNmapGrid(prev => {
                    const newGrid = [...prev];
                    newGrid[idx] = true;
                    return newGrid;
                });
                addLog(`Discovered open port ${Math.floor(Math.random() * 65535)}/tcp`, 'success');
            }

            if (idx >= 100) {
                clearInterval(interval);
                setIsRunning(false);
                setNmapScanIndex(-1);
                addLog('Nmap done: 1 IP address (1 host up) scanned in 5.42 seconds', 'system');
            }
        }, 50);
    };

    const runHydra = () => {
        setIsRunning(true);
        setHydraAttempts([]);
        addLog('Hydra v9.5 (c) 2023 by van Hauser/THC - Starting attack...', 'warning');

        const users = ['admin', 'root', 'user', 'test', 'guest'];
        const passes = ['123456', 'password', 'admin123', 'qwerty', 'letmein', 'welcome'];

        const interval = setInterval(() => {
            const u = users[Math.floor(Math.random() * users.length)];
            const p = passes[Math.floor(Math.random() * passes.length)] + Math.floor(Math.random() * 1000);
            const attempt = `[ATTEMPT] login: ${u}   password: ${p}`;

            setHydraAttempts(prev => [attempt, ...prev].slice(0, 15)); // Keep last 15

            if (Math.random() > 0.98) {
                clearInterval(interval);
                setIsRunning(false);
                addLog(`[DATA] login: admin   password: password123`, 'success');
                addLog('1 of 1 target successfully completed, 1 valid password found', 'success');
            }
        }, 80); // Fast updates
    };

    const runSqlmap = () => {
        setIsRunning(true);
        setSqlData([]);
        addLog('sqlmap identified the following injection point(s) with a total of 46 HTTP(s) requests:', 'info');

        const tables = ['users', 'products', 'orders', 'settings', 'logs'];
        let step = 0;

        const interval = setInterval(() => {
            step++;
            if (step < 20) {
                setSqlData(prev => [...prev, `[${new Date().toLocaleTimeString()}] [INFO] testing connection to the target URL`].slice(-10));
            } else if (step === 20) {
                addLog('GET parameter \'id\' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N', 'warning');
            } else if (step > 25 && step < 60) {
                const hex = Array(16).fill(0).map(() => Math.floor(Math.random() * 255).toString(16).padStart(2, '0')).join(' ');
                setSqlData(prev => [...prev, `[DUMP] ${hex}  |  ${Math.random().toString(36).substring(7)}`].slice(-15));
            } else if (step === 60) {
                clearInterval(interval);
                setIsRunning(false);
                addLog('Database dump completed.', 'success');
            }
        }, 100);
    };

    const runMetasploit = (cmd: string) => {
        setMsfHistory(prev => [...prev, { text: `msf6 > ${cmd}`, type: 'raw', timestamp: '' }]);

        if (cmd === 'exploit') {
            setTimeout(() => setMsfHistory(prev => [...prev, { text: '[*] Started reverse TCP handler on 10.0.2.15:4444', type: 'info', timestamp: '' }]), 500);
            setTimeout(() => setMsfHistory(prev => [...prev, { text: '[*] Sending stage (176195 bytes) to 10.10.11.24', type: 'info', timestamp: '' }]), 1500);
            setTimeout(() => setMsfHistory(prev => [...prev, { text: '[+] Meterpreter session 1 opened (10.0.2.15:4444 -> 10.10.11.24:52814)', type: 'success', timestamp: '' }]), 2500);
        } else if (cmd === 'help') {
            setMsfHistory(prev => [...prev, { text: 'Commands: use, search, set, exploit, exit', type: 'raw', timestamp: '' }]);
        } else {
            // Default echo
        }
    };

    const runWireshark = () => {
        setIsRunning(true);
        setWsPackets([]);
        let id = 1;
        const interval = setInterval(() => {
            const protocols = ['TCP', 'UDP', 'HTTP', 'TLSv1.2', 'ARP'];
            const packet = {
                id: id++,
                time: (Date.now() / 1000).toFixed(6),
                source: `192.168.1.${Math.floor(Math.random() * 255)}`,
                destination: `10.0.0.${Math.floor(Math.random() * 255)}`,
                protocol: protocols[Math.floor(Math.random() * protocols.length)],
                length: Math.floor(Math.random() * 1500),
                info: 'Application Data'
            };
            setWsPackets(prev => [...prev.slice(-19), packet]);
        }, 150);
        return () => clearInterval(interval);
    };

    const runAircrack = () => {
        setIsRunning(true);
        setAcProgress(0);
        addLog('Starting airmon-ng...', 'system');

        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setAcProgress(p);
            if (p === 20) addLog('Monitor mode enabled on mon0', 'success');
            if (p === 50) addLog('Capturing IVs...', 'info');
            if (p === 80) addLog('WPA Handshake captured!', 'warning');
            if (p >= 100) {
                clearInterval(interval);
                setIsRunning(false);
                addLog('KEY FOUND! [ 12345678 ]', 'success');
            }
        }, 100);
    };

    // --- Renderers ---

    const renderDashboard = () => (
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {[
                { title: 'CPU Load', val: '12%', icon: Cpu, color: 'text-blue-400' },
                { title: 'Memory', val: '4.2GB', icon: HardDrive, color: 'text-purple-400' },
                { title: 'Network', val: '1.2Mb/s', icon: Activity, color: 'text-green-400' },
            ].map((stat, i) => (
                <div key={i} className="bg-black/40 backdrop-blur border border-gray-800 p-6 rounded-xl flex items-center gap-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}><stat.icon size={24} /></div>
                    <div>
                        <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">{stat.title}</div>
                        <div className="text-2xl font-mono text-white">{stat.val}</div>
                    </div>
                </div>
            ))}

            <div className="col-span-full bg-black/40 backdrop-blur border border-gray-800 p-6 rounded-xl">
                <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-4">Recent Activity</h3>
                <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between text-gray-300 border-b border-gray-800 pb-1"><span>root@kali</span> <span>sudo apt update</span> <span className="text-gray-600">10m ago</span></div>
                    <div className="flex justify-between text-gray-300 border-b border-gray-800 pb-1"><span>root@kali</span> <span>nmap -sS 10.10.11.24</span> <span className="text-gray-600">1h ago</span></div>
                    <div className="flex justify-between text-gray-300 border-b border-gray-800 pb-1"><span>root@kali</span> <span>msfconsole</span> <span className="text-gray-600">2h ago</span></div>
                </div>
            </div>
        </div>
    );

    const renderNmap = () => (
        <div className="flex flex-col h-full p-6 gap-6">
            <div className="flex gap-4">
                <input className="flex-1 bg-black/50 border border-gray-700 rounded p-2 text-white font-mono" defaultValue="10.10.11.24" />
                <button onClick={runNmap} disabled={isRunning} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex items-center gap-2">
                    {isRunning ? <RefreshCw className="animate-spin" /> : <Play />} Scan
                </button>
            </div>

            <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 relative overflow-hidden">
                <div className="grid grid-cols-10 gap-1 h-full content-start">
                    {nmapGrid.map((isOpen, i) => (
                        <div
                            key={i}
                            className={`
                                h-8 rounded transition-all duration-300 flex items-center justify-center text-[10px] font-mono
                                ${isOpen ? 'bg-green-500/20 border border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-900/50 border border-gray-800 text-gray-700'}
                                ${i === nmapScanIndex ? 'bg-blue-500/40 border-blue-400 scale-105 z-10' : ''}
                            `}
                        >
                            {i * 655}
                        </div>
                    ))}
                </div>
                {isRunning && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-[scan_2s_linear_infinite] pointer-events-none" />}
            </div>

            <div className="h-32 bg-black border border-gray-800 rounded-xl overflow-hidden">
                <HackerTerminal logs={logs} />
            </div>
        </div>
    );

    const renderHydra = () => (
        <div className="flex flex-col h-full p-6 gap-6 relative overflow-hidden">
            <div className="flex gap-4 z-10">
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <input className="bg-black/50 border border-gray-700 rounded p-2 text-white font-mono" placeholder="Target IP" defaultValue="10.10.11.24" />
                    <input className="bg-black/50 border border-gray-700 rounded p-2 text-white font-mono" placeholder="Service" defaultValue="ssh" />
                </div>
                <button onClick={runHydra} disabled={isRunning} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold flex items-center gap-2">
                    {isRunning ? <RefreshCw className="animate-spin" /> : <Lock />} Crack
                </button>
            </div>

            <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 font-mono text-sm overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    {Array(20).fill(0).map((_, i) => (
                        <div key={i} className="absolute text-green-500 text-xs animate-[matrix_2s_linear_infinite]" style={{ left: `${i * 5}%`, animationDelay: `${Math.random()}s`, top: -20 }}>
                            {Array(20).fill(0).map(() => String.fromCharCode(33 + Math.random() * 93)).join('\n')}
                        </div>
                    ))}
                </div>

                <div className="relative z-10 space-y-1">
                    {hydraAttempts.map((attempt, i) => (
                        <div key={i} className="text-red-400/80 border-b border-red-900/20 pb-1 animate-in slide-in-from-top-2 duration-100">
                            {attempt}
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-32 bg-black border border-gray-800 rounded-xl overflow-hidden z-10">
                <HackerTerminal logs={logs} />
            </div>
            <style>{`
                @keyframes matrix {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(1000%); }
                }
            `}</style>
        </div>
    );

    const renderSQLMap = () => (
        <div className="flex flex-col h-full p-6 gap-6">
            <div className="flex gap-4">
                <input className="flex-1 bg-black/50 border border-gray-700 rounded p-2 text-white font-mono" defaultValue="http://10.10.11.24/page.php?id=1" />
                <button onClick={runSqlmap} disabled={isRunning} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold flex items-center gap-2">
                    {isRunning ? <RefreshCw className="animate-spin" /> : <Database />} Inject
                </button>
            </div>

            <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 font-mono text-xs overflow-hidden">
                {sqlData.map((line, i) => (
                    <div key={i} className="text-yellow-500/80 whitespace-pre-wrap font-mono">{line}</div>
                ))}
            </div>
        </div>
    );

    const renderMetasploit = () => (
        <div className="h-full flex flex-col bg-black">
            <HackerTerminal
                logs={msfHistory}
                onCommand={runMetasploit}
                prompt="msf6 >"
            />
        </div>
    );

    const renderWireshark = () => (
        <div className="flex flex-col h-full bg-white text-black font-sans text-xs">
            <div className="bg-gray-100 border-b border-gray-300 p-1 flex gap-2">
                <button
                    onClick={() => {
                        if (isRunning) { setIsRunning(false); }
                        else { const cleanup = runWireshark(); setIsRunning(true); return cleanup; }
                    }}
                    className={`p-1 rounded hover:bg-gray-200 ${isRunning ? 'text-red-600' : 'text-blue-600'}`}
                >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <input
                    placeholder="Apply a display filter..."
                    className="flex-1 border border-gray-300 rounded px-2 bg-white"
                    value={wsFilter}
                    onChange={(e) => setWsFilter(e.target.value)}
                />
            </div>
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="border-r border-gray-300 px-2 py-1 font-normal w-16">No.</th>
                            <th className="border-r border-gray-300 px-2 py-1 font-normal w-24">Time</th>
                            <th className="border-r border-gray-300 px-2 py-1 font-normal w-32">Source</th>
                            <th className="border-r border-gray-300 px-2 py-1 font-normal w-32">Destination</th>
                            <th className="border-r border-gray-300 px-2 py-1 font-normal w-16">Protocol</th>
                            <th className="border-r border-gray-300 px-2 py-1 font-normal w-16">Length</th>
                            <th className="px-2 py-1 font-normal">Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wsPackets.map((p, i) => (
                            <tr key={i} className={`hover:bg-blue-100 ${p.protocol === 'TCP' ? 'bg-purple-50' : p.protocol === 'UDP' ? 'bg-blue-50' : p.protocol === 'HTTP' ? 'bg-green-50' : ''}`}>
                                <td className="border-r border-gray-200 px-2 py-0.5">{p.id}</td>
                                <td className="border-r border-gray-200 px-2 py-0.5">{p.time}</td>
                                <td className="border-r border-gray-200 px-2 py-0.5">{p.source}</td>
                                <td className="border-r border-gray-200 px-2 py-0.5">{p.destination}</td>
                                <td className="border-r border-gray-200 px-2 py-0.5">{p.protocol}</td>
                                <td className="border-r border-gray-200 px-2 py-0.5">{p.length}</td>
                                <td className="px-2 py-0.5 truncate">{p.info}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAircrack = () => (
        <div className="flex flex-col h-full p-6 gap-6">
            <div className="flex gap-4">
                <button onClick={runAircrack} disabled={isRunning} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold flex items-center gap-2">
                    {isRunning ? <RefreshCw className="animate-spin" /> : <Wifi />} Start Attack
                </button>
            </div>

            <div className="flex-1 bg-black border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-64 h-64 rounded-full border-4 border-gray-800 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" style={{ animationDuration: '2s' }} />
                    <div className="text-4xl font-bold text-green-500 font-mono">{acProgress}%</div>
                </div>
                <div className="mt-8 text-green-400 font-mono animate-pulse">
                    {acProgress < 20 ? 'Initializing Monitor Mode...' :
                        acProgress < 50 ? 'Scanning for Targets...' :
                            acProgress < 80 ? 'Capturing Packets...' :
                                acProgress < 100 ? 'Cracking Handshake...' : 'Attack Complete'}
                </div>
            </div>

            <div className="h-32 bg-black border border-gray-800 rounded-xl overflow-hidden">
                <HackerTerminal logs={logs} />
            </div>
        </div>
    );

    return (
        <div className="flex h-full bg-[#0d1117] text-gray-200 font-mono overflow-hidden relative selection:bg-green-500/30 selection:text-green-200">
            <CRTOverlay />

            {/* Sidebar */}
            <div className="w-64 border-r border-gray-800 bg-[#161b22] flex flex-col z-10">
                <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)]">K</div>
                    <span className="font-bold text-lg tracking-tight text-gray-100">Kali Linux</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {TOOLS.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as ToolType)}
                            className={`
                                w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200
                                ${activeTool === tool.id
                                    ? 'bg-[#1f6feb]/20 text-white border border-[#1f6feb]/40 shadow-[0_0_15px_rgba(31,111,235,0.2)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                            `}
                        >
                            <tool.icon size={18} className={activeTool === tool.id ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : tool.color} />
                            <span className="font-medium">{tool.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#0d1117] relative z-10">
                {/* Header */}
                <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#161b22]">
                    <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-gray-500" />
                        <span className="text-sm font-bold text-gray-300">root@kali:~/{activeTool}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                    </div>
                </div>

                {/* Tool View */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTool === 'dashboard' && renderDashboard()}
                    {activeTool === 'nmap' && renderNmap()}
                    {activeTool === 'hydra' && renderHydra()}
                    {activeTool === 'sqlmap' && renderSQLMap()}
                    {activeTool === 'metasploit' && renderMetasploit()}
                    {activeTool === 'wireshark' && renderWireshark()}
                    {activeTool === 'aircrack' && renderAircrack()}
                </div>
            </div>
        </div>
    );
};

export default KaliTools;
