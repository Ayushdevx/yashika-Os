import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppProps, FileSystemItem } from '../../types';
import { useOS } from '../../contexts/OSContext';
import { Files, Search, GitGraph, Play, Box, Settings, X, ChevronRight, ChevronDown, Terminal as TerminalIcon, Layout, Plus, Save } from 'lucide-react';

const VSCode: React.FC<AppProps> = () => {
    const { fs } = useOS();
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [sidebarView, setSidebarView] = useState('files');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root-home', 'home-yashika']));
    const [fileContents, setFileContents] = useState<Record<string, string>>({});
    const [terminalOutput, setTerminalOutput] = useState<string[]>(['> Ready to execute code...']);
    const [showTerminal, setShowTerminal] = useState(true);

    const handleFileClick = (item: FileSystemItem) => {
        if (item.type === 'directory') {
            const newSet = new Set(expandedFolders);
            if (newSet.has(item.id)) newSet.delete(item.id);
            else newSet.add(item.id);
            setExpandedFolders(newSet);
        } else {
            if (!openFiles.includes(item.id)) {
                setOpenFiles([...openFiles, item.id]);
                // Load content if not already loaded
                if (!fileContents[item.id]) {
                    setFileContents(prev => ({ ...prev, [item.id]: item.content || '' }));
                }
            }
            setActiveTab(item.id);
        }
    };

    const closeFile = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newFiles = openFiles.filter(f => f !== id);
        setOpenFiles(newFiles);
        if (activeTab === id) {
            setActiveTab(newFiles[newFiles.length - 1] || null);
        }
    };

    const createNewFile = () => {
        const id = `new-file-${Date.now()}`;
        setOpenFiles([...openFiles, id]);
        setFileContents(prev => ({ ...prev, [id]: '// New File\nconsole.log("Hello World");' }));
        setActiveTab(id);
    };

    const runCode = () => {
        if (!activeTab) return;
        const code = fileContents[activeTab];

        setTerminalOutput(prev => [...prev, `> Running...`]);

        try {
            // Capture console.log
            const logs: string[] = [];
            const originalLog = console.log;
            console.log = (...args) => {
                logs.push(args.join(' '));
                originalLog(...args);
            };

            // Safe-ish execution for demo
            // eslint-disable-next-line no-new-func
            new Function(code)();

            console.log = originalLog;

            if (logs.length > 0) {
                setTerminalOutput(prev => [...prev, ...logs]);
            }
            setTerminalOutput(prev => [...prev, `> Done.`]);
        } catch (e: any) {
            setTerminalOutput(prev => [...prev, `Error: ${e.message}`]);
        }
    };

    const getFileIcon = (name: string) => {
        if (name.endsWith('.js') || name.endsWith('.ts')) return <span className="text-yellow-400 text-[10px] font-bold">JS</span>;
        if (name.endsWith('.css')) return <span className="text-blue-400 text-[10px] font-bold">#</span>;
        if (name.endsWith('.html')) return <span className="text-orange-400 text-[10px] font-bold">&lt;&gt;</span>;
        if (name.endsWith('.py')) return <span className="text-blue-300 text-[10px] font-bold">py</span>;
        return <span className="text-gray-400 text-[10px] font-bold">txt</span>;
    };

    const renderTree = (items: FileSystemItem[], depth = 0) => {
        return items.map(item => (
            <div key={item.id}>
                <div
                    className={`flex items-center gap-1 py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-sm ${activeTab === item.id ? 'bg-[#37373d] text-white' : 'text-gray-400'}`}
                    style={{ paddingLeft: `${depth * 12 + 10}px` }}
                    onClick={() => handleFileClick(item)}
                >
                    <span className="w-4 flex justify-center">
                        {item.type === 'directory' && (
                            expandedFolders.has(item.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                        )}
                    </span>
                    {item.type === 'directory' ? (
                        <span className="font-bold text-blue-300 text-[10px] mr-1">DIR</span>
                    ) : (
                        <span className="mr-1">{getFileIcon(item.name)}</span>
                    )}
                    <span className="truncate">{item.name}</span>
                </div>
                {item.type === 'directory' && expandedFolders.has(item.id) && item.children && (
                    renderTree(item.children, depth + 1)
                )}
            </div>
        ));
    };

    const activeFileName = useMemo(() => {
        if (!activeTab) return '';
        if (activeTab.startsWith('new-file')) return 'Untitled.js';

        const findName = (items: FileSystemItem[]): string => {
            for (const i of items) {
                if (i.id === activeTab) return i.name;
                if (i.children) { const res = findName(i.children); if (res) return res; }
            }
            return 'File';
        };
        return findName(fs.root);
    }, [activeTab, fs.root]);

    return (
        <div className="h-full flex bg-[#1e1e1e] text-[#cccccc] font-sans select-none">
            {/* Activity Bar */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-4 border-r border-[#1e1e1e]">
                <Files size={24} className={`cursor-pointer ${sidebarView === 'files' ? 'text-white' : 'text-gray-500'}`} onClick={() => setSidebarView('files')} />
                <Search size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <GitGraph size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <Play size={24} className="text-gray-500 cursor-pointer hover:text-white" onClick={runCode} title="Run Code" />
                <Box size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <div className="mt-auto flex flex-col gap-4 mb-2">
                    <Settings size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                </div>
            </div>

            {/* Sidebar */}
            {sidebarView === 'files' && (
                <div className="w-60 bg-[#252526] flex flex-col border-r border-[#1e1e1e]">
                    <div className="h-9 flex items-center justify-between px-4 text-xs font-bold uppercase tracking-wide text-gray-400 bg-[#252526]">
                        <span>Explorer</span>
                        <div className="flex gap-2">
                            <Plus size={14} className="cursor-pointer hover:text-white" onClick={createNewFile} title="New File" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="font-bold text-xs px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-[#2a2d2e] text-blue-400">
                            <ChevronDown size={12} /> YASHIKA-OS
                        </div>
                        {renderTree(fs.root)}
                    </div>
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                {/* Tabs */}
                {openFiles.length > 0 ? (
                    <>
                        <div className="flex bg-[#252526] overflow-x-auto no-scrollbar h-9">
                            {openFiles.map(fid => {
                                const isNew = fid.startsWith('new-file');
                                let name = 'Untitled.js';
                                if (!isNew) {
                                    // Find name again
                                    const findName = (items: FileSystemItem[]): string => {
                                        for (const i of items) {
                                            if (i.id === fid) return i.name;
                                            if (i.children) { const res = findName(i.children); if (res) return res; }
                                        }
                                        return 'File';
                                    };
                                    name = findName(fs.root);
                                }

                                return (
                                    <div
                                        key={fid}
                                        onClick={() => setActiveTab(fid)}
                                        className={`
                                            group flex items-center gap-2 px-3 text-sm cursor-pointer border-r border-[#1e1e1e] min-w-[120px] max-w-[200px] h-full
                                            ${activeTab === fid ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d2d] text-gray-400'}
                                        `}
                                    >
                                        <span className="mr-1">{getFileIcon(name)}</span>
                                        <span className="truncate flex-1">{name}</span>
                                        <X
                                            size={14}
                                            className={`hover:bg-white/20 rounded ${activeTab === fid ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                            onClick={(e) => closeFile(e, fid)}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 relative font-mono text-sm flex flex-col">
                            <div className="flex-1 relative">
                                {/* Line Numbers */}
                                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] text-gray-600 text-right pr-3 pt-4 select-none leading-6 font-mono text-[13px]">
                                    {Array.from({ length: 50 }, (_, i) => <div key={i}>{i + 1}</div>)}
                                </div>

                                {/* Code Area */}
                                <textarea
                                    className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] p-4 pl-14 outline-none resize-none leading-6 font-mono text-[13px]"
                                    value={activeTab ? fileContents[activeTab] : ''}
                                    onChange={(e) => activeTab && setFileContents({ ...fileContents, [activeTab]: e.target.value })}
                                    spellCheck={false}
                                />
                            </div>

                            {/* Terminal Panel */}
                            {showTerminal && (
                                <div className="h-48 bg-[#1e1e1e] border-t border-[#333] flex flex-col">
                                    <div className="flex items-center justify-between px-4 py-1 bg-[#252526] text-xs text-gray-400 uppercase">
                                        <div className="flex gap-4">
                                            <span className="text-white border-b border-white cursor-pointer">Terminal</span>
                                            <span className="cursor-pointer hover:text-white">Output</span>
                                            <span className="cursor-pointer hover:text-white">Problems</span>
                                        </div>
                                        <X size={14} className="cursor-pointer hover:text-white" onClick={() => setShowTerminal(false)} />
                                    </div>
                                    <div className="flex-1 p-2 font-mono text-xs overflow-y-auto custom-scrollbar">
                                        {terminalOutput.map((line, i) => (
                                            <div key={i} className="text-gray-300">{line}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-32 h-32 bg-[#252526] rounded-full flex items-center justify-center mb-4 opacity-20">
                            <Layout size={64} />
                        </div>
                        <p className="mb-2 text-lg">VS Code</p>
                        <p className="text-sm mb-6">Editing evolved</p>

                        <div className="flex flex-col gap-2 text-sm">
                            <button onClick={createNewFile} className="text-blue-400 hover:underline text-left">New File...</button>
                            <button className="text-blue-400 hover:underline text-left">Open File...</button>
                        </div>
                    </div>
                )}

                {/* Status Bar */}
                <div className="h-6 bg-[#007acc] flex items-center px-3 text-xs text-white justify-between select-none z-10">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
                            <div className="w-3 h-3 rounded-full border border-white"></div> master*
                        </div>
                        <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
                            <RefreshCw size={10} className="" /> 0 <ArrowUp size={10} /> 0 <ArrowDown size={10} />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <span className="hover:bg-white/20 px-1 rounded cursor-pointer" onClick={() => setShowTerminal(!showTerminal)}>
                            <TerminalIcon size={12} className="inline mr-1" /> Terminal
                        </span>
                        <span className="hover:bg-white/20 px-1 rounded cursor-pointer">Ln {activeTab ? '1' : '0'}, Col {activeTab ? '1' : '0'}</span>
                        <span className="hover:bg-white/20 px-1 rounded cursor-pointer">UTF-8</span>
                        <span className="hover:bg-white/20 px-1 rounded cursor-pointer">{activeFileName.endsWith('ts') ? 'TypeScript' : activeFileName.endsWith('py') ? 'Python' : 'JavaScript'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper icon needed for bottom bar
const ArrowUp = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
const ArrowDown = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
const RefreshCw = ({ size, className }: any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>

export default VSCode;
