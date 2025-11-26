
import React, { useState, useMemo } from 'react';
import { AppProps, FileSystemItem } from '../../types';
import { useOS } from '../../contexts/OSContext';
import { Files, Search, GitGraph, Play, Box, Settings, X, ChevronRight, ChevronDown, Terminal, Layout } from 'lucide-react';

const VSCode: React.FC<AppProps> = () => {
    const { fs } = useOS();
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [sidebarView, setSidebarView] = useState('files');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root-home', 'home-yashika']));
    const [fileContents, setFileContents] = useState<Record<string, string>>({});

    const handleFileClick = (item: FileSystemItem) => {
        if (item.type === 'directory') {
            const newSet = new Set(expandedFolders);
            if (newSet.has(item.id)) newSet.delete(item.id);
            else newSet.add(item.id);
            setExpandedFolders(newSet);
        } else {
            if (!openFiles.includes(item.id)) {
                setOpenFiles([...openFiles, item.id]);
                // Load content
                // Note: In a real app we'd use full path, here we cheat a bit assuming unique IDs or simplistic lookup for demo
                // Constructing path is hard without recursion context in click, so we just use the item.content if available or fetch via helper
                // For simplicity in this mock, we assume item.content is available on the object
                setFileContents(prev => ({ ...prev, [item.id]: item.content || '' }));
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

    const getFileIcon = (name: string) => {
        if (name.endsWith('.js') || name.endsWith('.ts')) return <span className="text-yellow-400 text-[10px]">JS</span>;
        if (name.endsWith('.css')) return <span className="text-blue-400 text-[10px]">#</span>;
        if (name.endsWith('.html')) return <span className="text-orange-400 text-[10px]">&lt;&gt;</span>;
        if (name.endsWith('.py')) return <span className="text-blue-300 text-[10px]">py</span>;
        return <span className="text-gray-400 text-[10px]">txt</span>;
    };

    const renderTree = (items: FileSystemItem[], depth = 0) => {
        return items.map(item => (
            <div key={item.id}>
                <div 
                    className={`flex items-center gap-1 py-0.5 px-2 hover:bg-[#2a2d2e] cursor-pointer text-sm ${activeTab === item.id ? 'bg-[#37373d] text-white' : 'text-gray-400'}`}
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

    const activeFileItem = useMemo(() => {
        // Helper to find item by ID in tree
        const find = (items: FileSystemItem[]): FileSystemItem | undefined => {
            for (const item of items) {
                if (item.id === activeTab) return item;
                if (item.children) {
                    const found = find(item.children);
                    if (found) return found;
                }
            }
        };
        return find(fs.root);
    }, [activeTab, fs.root]);

    return (
        <div className="h-full flex bg-[#1e1e1e] text-[#cccccc] font-sans select-none">
            {/* Activity Bar */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-4 border-r border-[#1e1e1e]">
                <Files size={24} className={`cursor-pointer ${sidebarView === 'files' ? 'text-white' : 'text-gray-500'}`} onClick={() => setSidebarView('files')} />
                <Search size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <GitGraph size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <Play size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <Box size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <div className="mt-auto flex flex-col gap-4 mb-2">
                    <Settings size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                </div>
            </div>

            {/* Sidebar */}
            {sidebarView === 'files' && (
                <div className="w-60 bg-[#252526] flex flex-col border-r border-[#1e1e1e]">
                    <div className="h-9 flex items-center px-4 text-xs font-bold uppercase tracking-wide text-gray-400">Explorer</div>
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
                        <div className="flex bg-[#252526] overflow-x-auto no-scrollbar">
                            {openFiles.map(fid => {
                                // Find name again (inefficient but functional for mockup)
                                const findName = (items: FileSystemItem[]): string => {
                                    for(const i of items) {
                                        if (i.id === fid) return i.name;
                                        if (i.children) { const res = findName(i.children); if(res) return res; }
                                    }
                                    return 'File';
                                };
                                const name = findName(fs.root);
                                return (
                                    <div 
                                        key={fid}
                                        onClick={() => setActiveTab(fid)}
                                        className={`
                                            group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-[#1e1e1e] min-w-[100px] max-w-[200px]
                                            ${activeTab === fid ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d2d] text-gray-400'}
                                        `}
                                    >
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
                        <div className="flex-1 relative font-mono text-sm">
                            {/* Line Numbers */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] text-gray-600 text-right pr-3 pt-4 select-none leading-6">
                                {Array.from({length: 20}, (_, i) => <div key={i}>{i+1}</div>)}
                            </div>
                            
                            {/* Code Area */}
                            <textarea 
                                className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] p-4 pl-14 outline-none resize-none leading-6"
                                value={activeTab ? fileContents[activeTab] : ''}
                                onChange={(e) => activeTab && setFileContents({...fileContents, [activeTab]: e.target.value})}
                                spellCheck={false}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-32 h-32 bg-[#252526] rounded-full flex items-center justify-center mb-4 opacity-20">
                            <Layout size={64} />
                        </div>
                        <p className="mb-2">Select a file to open</p>
                        <div className="text-xs flex gap-4">
                            <span><span className="text-gray-400">Show All Commands</span> <span className="bg-[#333] px-1 rounded">Ctrl+Shift+P</span></span>
                            <span><span className="text-gray-400">Go to File</span> <span className="bg-[#333] px-1 rounded">Ctrl+P</span></span>
                        </div>
                    </div>
                )}

                {/* Terminal / Status Bar */}
                <div className="h-6 bg-[#007acc] flex items-center px-3 text-xs text-white justify-between select-none">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-white"></div> master*</div>
                        <div className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> 0 <ArrowUp size={10}/> 0 <ArrowDown size={10} /></div>
                    </div>
                    <div className="flex gap-4">
                        <span>Ln {activeTab ? '1' : '0'}, Col {activeTab ? '1' : '0'}</span>
                        <span>UTF-8</span>
                        <span>{activeFileItem?.name.endsWith('ts') ? 'TypeScript' : activeFileItem?.name.endsWith('py') ? 'Python' : 'PlainText'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper icon needed for bottom bar
const ArrowUp = ({size}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
const ArrowDown = ({size}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
const RefreshCw = ({size, className}:any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>

export default VSCode;
