import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AppProps, FileSystemItem } from '../../types';
import { useOS } from '../../contexts/OSContext';
import {
    Files, Search, GitGraph, Play, Box, Settings, X, ChevronRight, ChevronDown,
    Terminal as TerminalIcon, Layout, Plus, Save, MoreVertical, FolderPlus, FilePlus, Trash2, Edit2, Globe
} from 'lucide-react';

// --- Syntax Highlighting Helper ---
const highlightCode = (code: string, language: string) => {
    if (!code) return '';
    let highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    if (language === 'javascript' || language === 'typescript') {
        // Keywords
        highlighted = highlighted.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|this|try|catch|async|await)\b/g, '<span class="text-pink-500">$1</span>');
        // Built-ins
        highlighted = highlighted.replace(/\b(console|window|document|Math|JSON|Promise)\b/g, '<span class="text-yellow-400">$1</span>');
        // Strings
        highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="text-orange-400">$&</span>');
        // Comments
        highlighted = highlighted.replace(/(\/\/.*)/g, '<span class="text-green-600">$1</span>');
        // Functions
        highlighted = highlighted.replace(/(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>');
    } else if (language === 'html') {
        // Tags
        highlighted = highlighted.replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, '$1<span class="text-blue-500">$2</span>$3$4');
        // Attributes
        highlighted = highlighted.replace(/\b([a-zA-Z-]+)(=)/g, '<span class="text-sky-300">$1</span>$2');
        // Strings
        highlighted = highlighted.replace(/(['"])(.*?)\1/g, '<span class="text-orange-400">$&</span>');
    }
    return highlighted;
};

const VSCode: React.FC<AppProps> = () => {
    const { fs } = useOS();
    const [activeTab, setActiveTab] = useState<string | null>(null); // Path
    const [openFiles, setOpenFiles] = useState<string[]>([]); // Paths
    const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({}); // Path -> Content
    const [sidebarView, setSidebarView] = useState('files');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/home/yashika']));
    const [terminalOutput, setTerminalOutput] = useState<string[]>(['> Ready to execute code...']);
    const [showTerminal, setShowTerminal] = useState(true);
    const [terminalMode, setTerminalMode] = useState<'TERMINAL' | 'PREVIEW'>('TERMINAL');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, path: string, type: 'file' | 'directory' } | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    // --- File System Helpers ---
    const getFileContent = useCallback((path: string) => {
        if (unsavedChanges[path] !== undefined) return unsavedChanges[path];
        return fs.readFile(path) || '';
    }, [fs, unsavedChanges]);

    const saveFile = useCallback((path: string) => {
        const content = unsavedChanges[path];
        if (content !== undefined) {
            fs.writeFile(path, content);
            const newUnsaved = { ...unsavedChanges };
            delete newUnsaved[path];
            setUnsavedChanges(newUnsaved);
            setTerminalOutput(prev => [...prev, `> Saved ${path}`]);
        }
    }, [fs, unsavedChanges]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (activeTab) saveFile(activeTab);
        }
    }, [activeTab, saveFile]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // --- Actions ---
    const handleFileClick = (item: FileSystemItem, path: string) => {
        if (item.type === 'directory') {
            const newSet = new Set(expandedFolders);
            if (newSet.has(path)) newSet.delete(path);
            else newSet.add(path);
            setExpandedFolders(newSet);
        } else {
            if (!openFiles.includes(path)) {
                setOpenFiles([...openFiles, path]);
            }
            setActiveTab(path);
        }
    };

    const closeFile = (e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        const newFiles = openFiles.filter(f => f !== path);
        setOpenFiles(newFiles);
        if (activeTab === path) {
            setActiveTab(newFiles[newFiles.length - 1] || null);
        }
        // Optional: Prompt for save if unsaved
    };

    const runCode = () => {
        if (!activeTab) return;
        const code = getFileContent(activeTab);

        if (activeTab.endsWith('.html')) {
            setTerminalMode('PREVIEW');
            setShowTerminal(true);
            // Create a blob URL for preview
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setTerminalOutput(prev => [...prev, `> Rendering preview for ${activeTab}...`]);
        } else if (activeTab.endsWith('.js') || activeTab.endsWith('.ts')) {
            setTerminalMode('TERMINAL');
            setShowTerminal(true);
            setTerminalOutput(prev => [...prev, `> Running ${activeTab}...`]);

            try {
                const logs: string[] = [];
                const originalLog = console.log;
                console.log = (...args) => {
                    logs.push(args.join(' '));
                    originalLog(...args);
                };

                // eslint-disable-next-line no-new-func
                new Function(code)();

                console.log = originalLog;
                if (logs.length > 0) setTerminalOutput(prev => [...prev, ...logs]);
                setTerminalOutput(prev => [...prev, `> Done.`]);
            } catch (e: any) {
                setTerminalOutput(prev => [...prev, `Error: ${e.message}`]);
            }
        } else {
            setTerminalOutput(prev => [...prev, `> Cannot run this file type.`]);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, path: string, type: 'file' | 'directory') => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, path, type });
    };

    const handleContextAction = (action: string) => {
        if (!contextMenu) return;
        const { path, type } = contextMenu;

        switch (action) {
            case 'new_file':
                const fileName = prompt('Enter file name:');
                if (fileName) fs.writeFile(`${path}/${fileName}`, '');
                break;
            case 'new_folder':
                const folderName = prompt('Enter folder name:');
                if (folderName) fs.makeDirectory(`${path}/${folderName}`);
                break;
            case 'delete':
                if (confirm(`Delete ${path}?`)) {
                    fs.deleteItem(path);
                    if (openFiles.includes(path)) closeFile({ stopPropagation: () => { } } as any, path);
                }
                break;
            case 'rename':
                setRenamingId(path);
                setRenameValue(path.split('/').pop() || '');
                break;
        }
        setContextMenu(null);
    };

    // --- Renderers ---
    const getFileIcon = (name: string) => {
        if (name.endsWith('.js') || name.endsWith('.ts')) return <span className="text-yellow-400 text-[10px] font-bold">JS</span>;
        if (name.endsWith('.css')) return <span className="text-blue-400 text-[10px] font-bold">#</span>;
        if (name.endsWith('.html')) return <span className="text-orange-400 text-[10px] font-bold">&lt;&gt;</span>;
        if (name.endsWith('.py')) return <span className="text-blue-300 text-[10px] font-bold">py</span>;
        if (name.endsWith('.json')) return <span className="text-yellow-200 text-[10px] font-bold">{ }</span>;
        return <span className="text-gray-400 text-[10px] font-bold">txt</span>;
    };

    const renderTree = (items: FileSystemItem[], currentPath: string) => {
        return items.map(item => {
            const fullPath = `${currentPath === '/' ? '' : currentPath}/${item.name}`;
            const isExpanded = expandedFolders.has(fullPath);
            const isRenaming = renamingId === fullPath;

            return (
                <div key={item.id}>
                    <div
                        className={`flex items-center gap-1 py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-sm group ${activeTab === fullPath ? 'bg-[#37373d] text-white' : 'text-gray-400'}`}
                        style={{ paddingLeft: `${(fullPath.split('/').length - 2) * 12 + 10}px` }}
                        onClick={() => handleFileClick(item, fullPath)}
                        onContextMenu={(e) => handleContextMenu(e, fullPath, item.type)}
                    >
                        <span className="w-4 flex justify-center shrink-0">
                            {item.type === 'directory' && (
                                isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                            )}
                        </span>

                        {isRenaming ? (
                            <input
                                autoFocus
                                className="bg-[#3c3c3c] text-white border border-blue-500 outline-none px-1 h-5 w-full text-xs"
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        fs.moveItem(fullPath, `${fullPath.substring(0, fullPath.lastIndexOf('/'))}/${renameValue}`);
                                        setRenamingId(null);
                                    }
                                    if (e.key === 'Escape') setRenamingId(null);
                                }}
                                onClick={e => e.stopPropagation()}
                                onBlur={() => setRenamingId(null)}
                            />
                        ) : (
                            <>
                                {item.type === 'directory' ? (
                                    <span className="font-bold text-blue-300 text-[10px] mr-1 shrink-0">DIR</span>
                                ) : (
                                    <span className="mr-1 shrink-0">{getFileIcon(item.name)}</span>
                                )}
                                <span className="truncate">{item.name}</span>
                            </>
                        )}
                    </div>
                    {item.type === 'directory' && isExpanded && item.children && (
                        renderTree(item.children, fullPath)
                    )}
                </div>
            );
        });
    };

    const activeLanguage = useMemo(() => {
        if (!activeTab) return 'text';
        if (activeTab.endsWith('.js') || activeTab.endsWith('.ts')) return 'javascript';
        if (activeTab.endsWith('.html')) return 'html';
        return 'text';
    }, [activeTab]);

    return (
        <div className="h-full flex bg-[#1e1e1e] text-[#cccccc] font-sans select-none" onClick={() => setContextMenu(null)}>
            {/* Activity Bar */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-4 border-r border-[#1e1e1e] shrink-0">
                <Files size={24} className={`cursor-pointer ${sidebarView === 'files' ? 'text-white' : 'text-gray-500'}`} onClick={() => setSidebarView('files')} />
                <Search size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <GitGraph size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                <Play size={24} className="text-green-500 cursor-pointer hover:text-green-400" onClick={runCode} title="Run Code" />
                <div className="mt-auto flex flex-col gap-4 mb-2">
                    <Settings size={24} className="text-gray-500 cursor-pointer hover:text-white" />
                </div>
            </div>

            {/* Sidebar */}
            {sidebarView === 'files' && (
                <div className="w-60 bg-[#252526] flex flex-col border-r border-[#1e1e1e] shrink-0">
                    <div className="h-9 flex items-center justify-between px-4 text-xs font-bold uppercase tracking-wide text-gray-400 bg-[#252526]">
                        <span>Explorer</span>
                        <div className="flex gap-2">
                            <FolderPlus size={14} className="cursor-pointer hover:text-white" onClick={() => fs.makeDirectory('/home/yashika/New Folder')} title="New Folder" />
                            <FilePlus size={14} className="cursor-pointer hover:text-white" onClick={() => fs.writeFile('/home/yashika/New File.txt', '')} title="New File" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="font-bold text-xs px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-[#2a2d2e] text-blue-400">
                            <ChevronDown size={12} /> YASHIKA-OS
                        </div>
                        {renderTree(fs.root, '')}
                    </div>
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden min-w-0">
                {/* Tabs */}
                {openFiles.length > 0 ? (
                    <>
                        <div className="flex bg-[#252526] overflow-x-auto no-scrollbar h-9 shrink-0">
                            {openFiles.map(path => {
                                const name = path.split('/').pop() || 'Untitled';
                                const isUnsaved = unsavedChanges[path] !== undefined;

                                return (
                                    <div
                                        key={path}
                                        onClick={() => setActiveTab(path)}
                                        className={`
                                            group flex items-center gap-2 px-3 text-sm cursor-pointer border-r border-[#1e1e1e] min-w-[120px] max-w-[200px] h-full
                                            ${activeTab === path ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d2d] text-gray-400'}
                                        `}
                                    >
                                        <span className="mr-1 shrink-0">{getFileIcon(name)}</span>
                                        <span className="truncate flex-1">{name}</span>
                                        {isUnsaved ? (
                                            <div className="w-2 h-2 rounded-full bg-white group-hover:hidden" />
                                        ) : null}
                                        <X
                                            size={14}
                                            className={`hover:bg-white/20 rounded ${isUnsaved ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'}`}
                                            onClick={(e) => closeFile(e, path)}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 relative font-mono text-sm flex flex-col min-h-0">
                            <div className="flex-1 relative overflow-hidden">
                                {/* Line Numbers */}
                                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] text-gray-600 text-right pr-3 pt-4 select-none leading-6 font-mono text-[13px] z-10">
                                    {Array.from({ length: 100 }, (_, i) => <div key={i}>{i + 1}</div>)}
                                </div>

                                {/* Syntax Highlighting Overlay */}
                                <pre
                                    className="absolute inset-0 pl-14 pt-4 pr-4 pointer-events-none font-mono text-[13px] leading-6 whitespace-pre-wrap break-all z-0"
                                    dangerouslySetInnerHTML={{
                                        __html: highlightCode(activeTab ? getFileContent(activeTab) : '', activeLanguage)
                                    }}
                                />

                                {/* Transparent Textarea for Input */}
                                <textarea
                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-4 pl-14 outline-none resize-none leading-6 font-mono text-[13px] z-1 whitespace-pre-wrap break-all"
                                    value={activeTab ? getFileContent(activeTab) : ''}
                                    onChange={(e) => activeTab && setUnsavedChanges({ ...unsavedChanges, [activeTab]: e.target.value })}
                                    spellCheck={false}
                                    autoCapitalize="off"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Terminal / Preview Panel */}
                            {showTerminal && (
                                <div className="h-1/3 bg-[#1e1e1e] border-t border-[#333] flex flex-col shrink-0">
                                    <div className="flex items-center justify-between px-4 py-1 bg-[#252526] text-xs text-gray-400 uppercase">
                                        <div className="flex gap-4">
                                            <span
                                                className={`cursor-pointer hover:text-white ${terminalMode === 'TERMINAL' ? 'text-white border-b border-white' : ''}`}
                                                onClick={() => setTerminalMode('TERMINAL')}
                                            >
                                                Terminal
                                            </span>
                                            <span
                                                className={`cursor-pointer hover:text-white ${terminalMode === 'PREVIEW' ? 'text-white border-b border-white' : ''}`}
                                                onClick={() => setTerminalMode('PREVIEW')}
                                            >
                                                Preview
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <X size={14} className="cursor-pointer hover:text-white" onClick={() => setShowTerminal(false)} />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden relative">
                                        {terminalMode === 'TERMINAL' ? (
                                            <div className="h-full p-2 font-mono text-xs overflow-y-auto custom-scrollbar">
                                                {terminalOutput.map((line, i) => (
                                                    <div key={i} className="text-gray-300 border-b border-white/5 pb-0.5 mb-0.5">{line}</div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full bg-white">
                                                {previewUrl ? (
                                                    <iframe src={previewUrl} className="w-full h-full border-none" title="Preview" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500">No preview available</div>
                                                )}
                                            </div>
                                        )}
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
                            <button className="text-blue-400 hover:underline text-left">New File (Ctrl+N)</button>
                            <button className="text-blue-400 hover:underline text-left">Open File (Ctrl+O)</button>
                        </div>
                    </div>
                )}

                {/* Status Bar */}
                <div className="h-6 bg-[#007acc] flex items-center px-3 text-xs text-white justify-between select-none z-10 shrink-0">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
                            <div className="w-3 h-3 rounded-full border border-white"></div> master*
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <span className="hover:bg-white/20 px-1 rounded cursor-pointer" onClick={() => setShowTerminal(!showTerminal)}>
                            <TerminalIcon size={12} className="inline mr-1" /> {showTerminal ? 'Close Panel' : 'Open Panel'}
                        </span>
                        <span className="hover:bg-white/20 px-1 rounded cursor-pointer">{activeLanguage.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-[#252526] border border-[#454545] shadow-xl rounded-md py-1 min-w-[160px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    {contextMenu.type === 'directory' && (
                        <>
                            <div className="px-3 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex items-center gap-2 text-sm" onClick={() => handleContextAction('new_file')}>
                                <FilePlus size={14} /> New File
                            </div>
                            <div className="px-3 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex items-center gap-2 text-sm" onClick={() => handleContextAction('new_folder')}>
                                <FolderPlus size={14} /> New Folder
                            </div>
                            <div className="h-[1px] bg-[#454545] my-1" />
                        </>
                    )}
                    <div className="px-3 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex items-center gap-2 text-sm" onClick={() => handleContextAction('rename')}>
                        <Edit2 size={14} /> Rename
                    </div>
                    <div className="px-3 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex items-center gap-2 text-sm text-red-400" onClick={() => handleContextAction('delete')}>
                        <Trash2 size={14} /> Delete
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper icon needed for bottom bar
const ArrowUp = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
const ArrowDown = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
const RefreshCw = ({ size, className }: any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>

export default VSCode;
