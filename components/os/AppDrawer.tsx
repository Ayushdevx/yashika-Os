import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, Command } from 'lucide-react';
import { AppID } from '../../types';
import { APP_REGISTRY, KALI_CATEGORIES } from '../../constants';
import { playSystemSound } from '../../utils/soundEffects';

interface AppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onAppLaunch: (appId: AppID, params?: any) => void;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ isOpen, onClose, onAppLaunch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Handle animation state
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setSearchTerm('');
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const filteredApps = useMemo(() => {
        if (!searchTerm) return Object.values(APP_REGISTRY);
        return Object.values(APP_REGISTRY).filter(app =>
            app.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleKaliToolLaunch = (toolCommand: string, toolName: string) => {
        onAppLaunch(AppID.KALI_TOOLS, {
            title: `Kali Linux - ${toolName}`,
            initialTool: toolName.toLowerCase()
        });
        onClose();
    };

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`
                fixed inset-0 z-[100] flex flex-col items-center justify-start pt-20
                transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]
                ${isOpen ? 'opacity-100 backdrop-blur-2xl bg-black/40' : 'opacity-0 backdrop-blur-none pointer-events-none'}
            `}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Search Bar */}
            <div
                className={`
                    w-full max-w-2xl relative mb-12 transition-all duration-500 delay-100
                    ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
                `}
            >
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="relative bg-[#1a1b26]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center p-4 shadow-2xl">
                        <Search className="text-gray-400 ml-2" size={24} />
                        <input
                            type="text"
                            placeholder="Search Applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xl text-white px-4 placeholder-gray-500 font-light"
                            autoFocus
                        />
                        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 border border-white/10 rounded px-2 py-1">
                            <Command size={12} /> <span>ESC to close</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div
                className={`
                    w-full max-w-6xl px-8 h-[70vh] overflow-y-auto custom-scrollbar
                    transition-all duration-500 delay-200
                    ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
                `}
            >
                {searchTerm ? (
                    // Search Results
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {filteredApps.map((app, i) => (
                            <button
                                key={app.id}
                                onClick={() => { onAppLaunch(app.id); onClose(); }}
                                className="flex flex-col items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all duration-200 group animate-in zoom-in-50 fill-mode-both"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="w-16 h-16 text-gray-200 group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">
                                    {app.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white text-center">{app.name}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    // Categories View
                    <div className="space-y-12 pb-20">
                        {/* System Apps */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 pl-2 border-l-4 border-blue-500">System Applications</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Object.values(APP_REGISTRY).filter(app => ![AppID.KALI_TOOLS].includes(app.id)).map((app, i) => (
                                    <button
                                        key={app.id}
                                        onClick={() => { onAppLaunch(app.id); onClose(); }}
                                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 group"
                                    >
                                        <div className="w-12 h-12 text-gray-300 group-hover:scale-110 group-hover:text-white transition-all duration-300 drop-shadow-lg">
                                            {app.icon}
                                        </div>
                                        <span className="text-xs font-medium text-gray-400 group-hover:text-white text-center line-clamp-1">{app.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Kali Tools Categories */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 pl-2 border-l-4 border-red-500">Kali Linux Tools</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {KALI_CATEGORIES.map((cat, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#1a1b26]/60 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors group"
                                    >
                                        <div className="p-4 bg-white/5 font-bold text-sm text-gray-300 flex justify-between items-center">
                                            {cat.name}
                                            <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {cat.tools.map((tool, j) => (
                                                <button
                                                    key={j}
                                                    onClick={() => handleKaliToolLaunch(tool.command, tool.name)}
                                                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors flex justify-between items-center group/tool"
                                                >
                                                    <span className="font-medium">{tool.name}</span>
                                                    <span className="opacity-0 group-hover/tool:opacity-100 text-[10px] text-gray-500 uppercase tracking-wider transition-opacity">Launch</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppDrawer;
