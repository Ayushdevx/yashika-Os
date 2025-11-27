
import React, { useState, useEffect } from 'react';
import { Menu, Wifi, Volume2, Battery, Calendar as CalendarIcon, Search, Power, Settings as SettingsIcon, ChevronRight, ChevronLeft, Check, Lock } from 'lucide-react';
import { WindowState, AppID } from '../../types';
import { APP_REGISTRY, KALI_CATEGORIES } from '../../constants';
import { playSystemSound } from '../../utils/soundEffects';

interface TaskbarProps {
    windows: WindowState[];
    activeWindowId: string | null;
    onAppLaunch: (appId: AppID, params?: any) => void;
    onWindowClick: (id: string) => void;
    onToggleStart: () => void;
    onPowerClick: () => void;
    isStartOpen: boolean;
}

const NetworkWidget: React.FC = () => {
    const [downloadSpeed, setDownloadSpeed] = useState(840);
    const [uploadSpeed, setUploadSpeed] = useState(420);

    useEffect(() => {
        const interval = setInterval(() => {
            setDownloadSpeed(prev => Math.min(950, Math.max(100, prev + Math.floor(Math.random() * 50 - 25))));
            setUploadSpeed(prev => Math.min(500, Math.max(50, prev + Math.floor(Math.random() * 30 - 15))));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute bottom-12 -left-10 w-72 glass-panel rounded-xl shadow-2xl z-[60] p-4 text-gray-200 animate-slide-in-from-bottom cursor-default border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <Wifi size={16} className="text-blue-400" /> Networks
                </h3>
                <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                    Wi-Fi On
                </div>
            </div>

            {/* Current Network */}
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mb-3 transition-colors hover:bg-blue-600/30">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-white text-sm">Made by Ayush Upadhyay</div>
                        <div className="text-[10px] text-blue-200 mt-0.5">Connected • 5GHz</div>
                    </div>
                    <Check size={16} className="text-blue-400" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-black/20 rounded p-1.5">
                        <div className="text-[10px] text-gray-400 mb-0.5 font-bold">DOWNLOAD</div>
                        <div className="font-mono text-green-400 text-xs">{downloadSpeed} Mbps</div>
                    </div>
                    <div className="bg-black/20 rounded p-1.5">
                        <div className="text-[10px] text-gray-400 mb-0.5 font-bold">UPLOAD</div>
                        <div className="font-mono text-purple-400 text-xs">{uploadSpeed} Mbps</div>
                    </div>
                </div>
            </div>

            {/* Available Networks */}
            <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">Available</div>
                {[
                    { name: 'Kali-Linux-5G', secure: true },
                    { name: 'FBI Surveillance Van', secure: true },
                    { name: 'Virus_Distribution_Point', secure: false },
                    { name: 'Skynet Global', secure: true },
                ].map((net, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <Wifi size={14} className="text-gray-500 group-hover:text-gray-300" />
                            <span className="text-sm text-gray-300 group-hover:text-white">{net.name}</span>
                        </div>
                        {net.secure && <Lock size={12} className="text-gray-600" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CalendarWidget: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const prevMonth = () => {
        playSystemSound('click');
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        playSystemSound('click');
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        playSystemSound('click');
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
    };

    const isToday = (day: number) => {
        const now = new Date();
        return day === now.getDate() &&
            currentDate.getMonth() === now.getMonth() &&
            currentDate.getFullYear() === now.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear();
    };

    return (
        <div className="absolute bottom-14 right-2 w-80 glass-panel rounded-xl shadow-2xl z-50 p-5 text-gray-200 animate-slide-in-from-bottom origin-bottom-right border border-white/10 bg-[#1a1b26]/95 backdrop-blur-xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-bold text-lg text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <p className="text-xs text-blue-400 font-medium cursor-pointer hover:underline" onClick={goToToday}>
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white" onClick={prevMonth}>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white" onClick={goToToday} title="Go to Today">
                        <CalendarIcon size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white" onClick={nextMonth}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs mb-3 font-medium text-gray-500 uppercase tracking-wider">
                {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(d => {
                    const today = isToday(d);
                    const selected = isSelected(d);
                    return (
                        <div
                            key={d}
                            onClick={() => {
                                playSystemSound('click');
                                setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
                            }}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 relative group
                                ${today ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30' : ''}
                                ${selected && !today ? 'bg-white/20 text-white font-bold ring-1 ring-white/30' : ''}
                                ${!today && !selected ? 'hover:bg-white/10 text-gray-300 hover:text-white' : ''}
                            `}
                        >
                            {d}
                            {today && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>}
                        </div>
                    )
                })}
            </div>

            {/* Events Placeholder */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-xs font-bold text-gray-500 uppercase mb-3">Upcoming Events</div>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                            <div className="text-sm font-medium text-gray-300 group-hover:text-white">System Update</div>
                            <div className="text-[10px] text-gray-500">10:00 PM - Automatic</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                        <div>
                            <div className="text-sm font-medium text-gray-300 group-hover:text-white">Security Scan</div>
                            <div className="text-[10px] text-gray-500">Tomorrow, 09:00 AM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const VolumeWidget: React.FC = () => {
    const [volume, setVolume] = useState(75);
    return (
        <div className="absolute bottom-14 right-24 w-48 glass-panel rounded-lg shadow-2xl z-50 p-4 text-gray-200 animate-slide-in-from-bottom origin-bottom">
            <div className="flex items-center gap-3 mb-2">
                <Volume2 size={20} className={volume === 0 ? 'text-gray-500' : 'text-blue-400'} />
                <span className="font-bold text-sm">System Volume</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
            <div className="text-right text-xs text-gray-400 mt-1">{volume}%</div>
        </div>
    );
}

const Taskbar: React.FC<TaskbarProps> = ({
    windows,
    activeWindowId,
    onAppLaunch,
    onWindowClick,
    onToggleStart,
    onPowerClick,
    isStartOpen,
}) => {
    const [time, setTime] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showVolume, setShowVolume] = useState(false);
    const [showNetworkInfo, setShowNetworkInfo] = useState(false);
    const [hoveredApp, setHoveredApp] = useState<AppID | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Group windows by App ID for the dock
    const pinnedApps = [AppID.TERMINAL, AppID.BROWSER, AppID.FILE_EXPLORER, AppID.NETWORK_ANALYZER, AppID.SETTINGS];

    const handleToggleCalendar = () => {
        playSystemSound('click');
        setShowCalendar(!showCalendar);
        setShowVolume(false);
    }

    const handleToggleVolume = () => {
        playSystemSound('click');
        setShowVolume(!showVolume);
        setShowCalendar(false);
    }

    const handleKaliToolLaunch = (toolCommand: string) => {
        onAppLaunch(AppID.TERMINAL, {
            title: 'Terminal - Kali Tool',
            startPath: '/home/yashika',
            autoRun: toolCommand
        });
        onToggleStart();
    };

    const filteredApps = Object.values(APP_REGISTRY).filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Start Menu */}
            {isStartOpen && (
                <div className="absolute bottom-14 left-2 w-[600px] h-[500px] glass-panel border-gray-700/50 rounded-lg shadow-2xl z-50 overflow-hidden flex text-gray-200 animate-slide-in-from-bottom origin-bottom-left">

                    {/* Categories Sidebar */}
                    <div className="w-1/3 bg-[#111218]/95 border-r border-gray-700 p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                        <div className="relative mb-2 px-1">
                            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search apps..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-full py-1.5 pl-8 pr-2 text-xs text-white focus:border-blue-500 outline-none placeholder-gray-500"
                                autoFocus
                            />
                        </div>

                        {!searchTerm && (
                            <>
                                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kali Applications</div>
                                {KALI_CATEGORIES.map((cat, idx) => (
                                    <div key={idx} className="group relative">
                                        <div className="px-3 py-2 rounded hover:bg-white/10 cursor-pointer flex justify-between items-center text-sm font-medium transition-colors">
                                            <span>{cat.name}</span>
                                            <ChevronRight size={14} className="text-gray-500 group-hover:text-white" />
                                        </div>
                                        {/* Hover Submenu for Tools */}
                                        <div className="hidden group-hover:block absolute left-full top-0 ml-1 w-56 bg-[#1a1b26] border border-gray-700 rounded shadow-xl p-1 z-[60] animate-in fade-in slide-in-from-left-2 duration-150">
                                            {cat.tools.map(tool => (
                                                <div
                                                    key={tool.name}
                                                    onClick={() => handleKaliToolLaunch(tool.command)}
                                                    className="px-3 py-2 hover:bg-blue-600/50 hover:text-white cursor-pointer rounded text-sm text-gray-300"
                                                >
                                                    <div className="font-bold">{tool.name}</div>
                                                    <div className="text-[10px] text-gray-500 truncate">{tool.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="h-[1px] bg-gray-700 my-2"></div>
                                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">System</div>
                            </>
                        )}

                        {filteredApps.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => {
                                    onAppLaunch(app.id);
                                    onToggleStart();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md transition-all text-sm group text-left animate-in slide-in-from-left-2 duration-200"
                            >
                                <div className="w-4 h-4 text-gray-400 group-hover:text-yashika-accent transition-colors">{app.icon}</div>
                                <span className="group-hover:translate-x-1 transition-transform">{app.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Panel (User/Favorites) */}
                    <div className="flex-1 bg-black/40 flex flex-col">
                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100 transition-opacity">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yashika-terminal to-blue-600 flex items-center justify-center font-bold text-black text-4xl shadow-2xl ring-4 ring-white/5 mb-4">
                                Y
                            </div>
                            <h2 className="text-2xl font-light tracking-widest text-white">YASHIKA OS</h2>
                            <p className="text-sm text-gray-400 font-mono mt-1">Kali Linux Rolling 2026</p>
                        </div>

                        <div className="p-4 bg-[#111218] border-t border-gray-700 flex justify-between items-center">
                            <button
                                onClick={() => { onAppLaunch(AppID.SETTINGS); onToggleStart(); }}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                <SettingsIcon size={16} />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={() => { onToggleStart(); onPowerClick(); }}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/20 rounded-md text-red-400 hover:text-red-300 transition-colors text-sm"
                            >
                                <Power size={16} />
                                <span>Power</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCalendar && <CalendarWidget />}
            {showVolume && <VolumeWidget />}

            {/* Bar */}
            <div className="h-12 bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-3 z-50 absolute bottom-0 w-full select-none shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">

                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleStart}
                        className={`
                p-2 rounded-md transition-all duration-300 hover:bg-white/10 active:scale-95
                ${isStartOpen ? 'bg-white/10 text-yashika-accent shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-gray-300'}
            `}
                    >
                        <Menu size={22} />
                    </button>

                    <div className="h-6 w-[1px] bg-gray-700/50 mx-2"></div>

                    {/* App Icons (Pinned + Open) */}
                    <div className="flex items-center gap-2 ml-1">
                        {pinnedApps.map((appId) => {
                            const app = APP_REGISTRY[appId];
                            const instance = windows.find(w => w.appId === appId);
                            const isOpen = !!instance;
                            const isActive = instance && instance.id === activeWindowId && !instance.isMinimized;
                            const isHovered = hoveredApp === appId;

                            return (
                                <div key={appId} className="relative group flex flex-col items-center">
                                    {/* Tooltip */}
                                    <div
                                        className={`
                            absolute -top-12 bg-[#1a1b26] text-white text-xs px-3 py-1.5 rounded-md border border-gray-700 shadow-xl
                            transition-all duration-200 pointer-events-none whitespace-nowrap z-50 transform
                            ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
                        `}
                                    >
                                        {app.name}
                                        {/* Triangle arrow */}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1b26] border-r border-b border-gray-700 transform rotate-45"></div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (isOpen && instance) {
                                                if (isActive) {
                                                    onWindowClick(instance.id);
                                                } else {
                                                    onWindowClick(instance.id);
                                                }
                                            } else {
                                                onAppLaunch(appId);
                                            }
                                        }}
                                        onMouseEnter={() => setHoveredApp(appId)}
                                        onMouseLeave={() => setHoveredApp(null)}
                                        className={`
                            p-2 rounded-xl relative dock-icon transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)
                            ${isActive ? 'bg-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.3)] scale-105 border border-white/5' : 'hover:bg-white/5 hover:scale-110 hover:-translate-y-1'}
                        `}
                                    >
                                        <div className="w-6 h-6 text-gray-100 drop-shadow-md">
                                            {app.icon}
                                        </div>

                                        {/* Status Indicators */}
                                        {isOpen && (
                                            <div className={`
                                absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300
                                ${isActive ? 'bg-yashika-accent w-5 h-1 shadow-[0_0_8px_#0ea5e9]' : 'bg-gray-500 w-1 h-1'}
                            `}></div>
                                        )}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* System Tray */}
                <div className="flex items-center gap-4 text-gray-400 text-xs px-2">
                    {/* Split Tray for interactions */}
                    <div className="flex items-center bg-white/5 rounded-full border border-white/5 relative">

                        {/* Wifi Hover Area */}
                        <div
                            className="px-3 py-1.5 rounded-l-full hover:bg-white/10 cursor-pointer transition-colors relative group"
                            onMouseEnter={() => setShowNetworkInfo(true)}
                            onMouseLeave={() => setShowNetworkInfo(false)}
                        >
                            <Wifi size={16} className="group-hover:text-white transition-colors" />
                            {showNetworkInfo && <NetworkWidget />}
                        </div>

                        <div className="w-[1px] h-4 bg-gray-600"></div>

                        {/* Volume/Battery Area */}
                        <div
                            className="flex items-center gap-3 px-3 py-1.5 rounded-r-full hover:bg-white/10 cursor-pointer transition-colors hover:text-white"
                            onClick={handleToggleVolume}
                        >
                            <Volume2 size={16} />
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-green-400">69%</span>
                                <Battery size={16} className="text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Clock */}
                    <div
                        className="flex flex-col items-end px-3 py-1 rounded-md hover:bg-white/5 cursor-pointer leading-tight transition-colors active:bg-white/10 hover:shadow-sm border border-transparent hover:border-white/5"
                        onClick={handleToggleCalendar}
                    >
                        <span className="font-bold text-gray-200">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] text-gray-500">{time.toLocaleDateString()}</span>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Taskbar;
