import React, { useState } from 'react';
import { Search, Power, Settings as SettingsIcon, ChevronRight, Grid } from 'lucide-react';
import { AppID } from '../../types';
import { APP_REGISTRY, KALI_CATEGORIES } from '../../constants';

interface StartMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onAppLaunch: (appId: AppID, params?: any) => void;
    onToggleDrawer: () => void;
    onPowerClick: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({
    isOpen,
    onClose,
    onAppLaunch,
    onToggleDrawer,
    onPowerClick
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleKaliToolLaunch = (toolCommand: string) => {
        const toolName = toolCommand.split(' ')[0].toLowerCase();
        onAppLaunch(AppID.KALI_TOOLS, {
            title: `Kali Linux - ${toolName}`,
            initialTool: toolName
        });
        onClose();
    };

    const filteredApps = Object.values(APP_REGISTRY).filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-14 left-2 w-[600px] h-[500px] glass-panel border-gray-700/50 rounded-lg shadow-2xl z-50 overflow-hidden flex text-gray-200 animate-slide-in-from-bottom origin-bottom-left">
            {/* Categories Sidebar */}
            <div className="w-1/3 bg-[#111218]/95 border-r border-gray-700 p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                <div className="relative mb-2 px-1">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-full py-1.5 pl-8 pr-2 text-xs text-white focus:border-blue-500 outline-none placeholder-gray-500"
                        autoFocus
                    />
                </div>

                {/* All Apps Button */}
                {!searchTerm && (
                    <button
                        onClick={() => {
                            onClose();
                            onToggleDrawer();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-md transition-all text-sm group text-left mb-2"
                    >
                        <Grid size={16} className="text-blue-400 group-hover:text-blue-300" />
                        <span className="font-bold text-blue-100">All Apps</span>
                        <ChevronRight size={14} className="ml-auto text-blue-400/50" />
                    </button>
                )}

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
                            onClose();
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
                        onClick={() => { onAppLaunch(AppID.SETTINGS); onClose(); }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        <SettingsIcon size={16} />
                        <span>Settings</span>
                    </button>
                    <button
                        onClick={() => { onClose(); onPowerClick(); }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/20 rounded-md text-red-400 hover:text-red-300 transition-colors text-sm"
                    >
                        <Power size={16} />
                        <span>Power</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartMenu;
