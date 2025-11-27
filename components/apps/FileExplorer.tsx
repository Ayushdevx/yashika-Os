import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOS } from '../../contexts/OSContext';
import { FileSystemItem, AppID, AppProps } from '../../types';
import { Folder, HardDrive, ChevronRight, ChevronDown, Search, ArrowLeft, ArrowUp, Home, Download, Trash2, Monitor, FileText, MoreHorizontal, FilePlus, FolderPlus, Edit2, ExternalLink, Grid, List, Clock, AlignLeft } from 'lucide-react';

// Helper for wildcard matching
const isMatch = (name: string, query: string) => {
    if (!query) return false;
    if (query.includes('*') || query.includes('?')) {
        const escaped = query.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        const pattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp(`^${pattern}$`, 'i').test(name);
    }
    return name.toLowerCase().includes(query.toLowerCase());
};

const FileNode: React.FC<{
    item: FileSystemItem;
    depth: number;
    path: string;
    onNavigate: (path: string) => void;
    currentPath: string;
}> = ({ item, depth, path, onNavigate, currentPath }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (currentPath.startsWith(path)) {
            setIsOpen(true);
        }
    }, [currentPath, path]);

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleClick = () => {
        onNavigate(path);
    };

    if (item.type !== 'directory') return null;

    const paddingLeft = depth * 12 + 12;
    const isSelected = currentPath === path;

    const directoryChildren = item.children?.filter(c => c.type === 'directory') || [];
    const hasChildren = directoryChildren.length > 0;

    return (
        <div>
            <div
                className={`
            flex items-center gap-2 py-1 pr-2 hover:bg-white/5 cursor-pointer select-none transition-colors text-sm rounded-r-md
            ${isSelected ? 'bg-blue-600/20 text-blue-100 border-l-2 border-blue-500' : 'text-gray-400 hover:text-gray-200 border-l-2 border-transparent'}
        `}
                style={{ paddingLeft: `${paddingLeft}px` }}
                onClick={handleClick}
            >
                <span
                    className={`w-4 h-4 flex items-center justify-center rounded hover:bg-white/10 ${hasChildren ? 'opacity-100' : 'opacity-0'}`}
                    onClick={hasChildren ? toggleOpen : undefined}
                >
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
                <Folder size={14} className={isSelected ? 'text-blue-400 fill-blue-400/20' : 'text-gray-500'} />
                <span className="truncate">{item.name}</span>
            </div>
            {isOpen && hasChildren && (
                <div className="animate-in slide-in-from-left-2 duration-200">
                    {directoryChildren.map((child) => (
                        <FileNode
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            path={`${path === '/' ? '' : path}/${child.name}`}
                            onNavigate={onNavigate}
                            currentPath={currentPath}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer: React.FC<AppProps> = ({ params }) => {
    const { fs, launchApp, playSound } = useOS();
    const [currentPath, setCurrentPath] = useState(params?.startPath || '/home/yashika');
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<string[]>([params?.startPath || '/home/yashika']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

    // Interaction State
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item?: FileSystemItem, type: 'item' | 'background' } | null>(null);

    const displayItems = useMemo(() => {
        let items: { item: FileSystemItem, fullPath: string }[] = [];

        if (searchQuery.trim()) {
            const traverse = (nodes: FileSystemItem[], currentDir: string) => {
                nodes.forEach(node => {
                    const nodePath = currentDir === '/' ? `/${node.name}` : `${currentDir}/${node.name}`;
                    if (isMatch(node.name, searchQuery)) {
                        items.push({ item: node, fullPath: nodePath });
                    }
                    if (node.type === 'directory' && node.children) {
                        traverse(node.children, nodePath);
                    }
                });
            };
            traverse(fs.root, '');
        } else {
            const dirItems = fs.readDirectory(currentPath) || [];
            items = dirItems.map(item => ({
                item,
                fullPath: currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`
            }));
        }

        return items.sort((a, b) => {
            if (sortBy === 'name') return a.item.name.localeCompare(b.item.name);
            if (sortBy === 'date') return b.item.createdAt - a.item.createdAt;
            return 0;
        });
    }, [fs, currentPath, searchQuery, sortBy]);

    // Generate breadcrumbs
    const breadcrumbs = useMemo(() => {
        const parts = currentPath.split('/').filter(Boolean);
        return parts.map((part, index) => {
            const path = '/' + parts.slice(0, index + 1).join('/');
            return { name: part, path };
        });
    }, [currentPath]);

    // --- Navigation ---
    const handleNavigate = (path: string) => {
        if (path === currentPath) return;
        if (searchQuery) setSearchQuery('');
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(path);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setCurrentPath(path);
        setSelectedId(null);
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setCurrentPath(history[historyIndex - 1]);
            setSearchQuery('');
            setSelectedId(null);
        }
    };

    const handleUp = () => {
        const parts = currentPath.split('/').filter(Boolean);
        if (parts.length > 0) {
            parts.pop();
            const parent = '/' + parts.join('/');
            handleNavigate(parent);
        }
    };

    // --- Actions ---
    const handleFileOpen = (item: FileSystemItem, fullPath: string) => {
        if (item.type === 'directory') {
            handleNavigate(fullPath);
        } else {
            // File Association Logic
            const ext = item.name.split('.').pop()?.toLowerCase();

            if (['txt', 'md', 'py', 'js', 'json', 'css', 'html', 'conf', 'sh', 'todo'].includes(ext || '')) {
                launchApp(AppID.NOTES, { filePath: fullPath, title: item.name }); // Use Notes for text files now
            }
            else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) {
                launchApp(AppID.PAINT, { filePath: fullPath }); // Open in Paint
            }
            else {
                launchApp(AppID.TEXT_EDITOR, { filePath: fullPath, title: item.name });
            }
        }
    };

    const handleRename = () => {
        if (!selectedId) return;
        const itemData = displayItems.find(d => d.item.id === selectedId);
        if (itemData) {
            setRenamingId(selectedId);
            setRenameValue(itemData.item.name);
            setContextMenu(null);
        }
    };

    const submitRename = () => {
        if (renamingId && renameValue.trim()) {
            const itemData = displayItems.find(d => d.item.id === renamingId);
            if (itemData) {
                const oldPath = itemData.fullPath;
                const parts = oldPath.split('/');
                parts.pop();
                const newPath = `${parts.join('/')}/${renameValue.trim()}`;

                if (oldPath !== newPath) {
                    fs.moveItem(oldPath, newPath);
                }
            }
        }
        setRenamingId(null);
    };

    const handleDelete = () => {
        if (!selectedId) return;
        const itemData = displayItems.find(d => d.item.id === selectedId);
        if (itemData) {
            fs.deleteItem(itemData.fullPath);
            setContextMenu(null);
            setSelectedId(null);
            playSound('minimize');
        }
    };

    const handleCreateNew = (type: 'file' | 'directory') => {
        const baseName = type === 'directory' ? 'New Folder' : 'New File.txt';
        let name = baseName;
        let counter = 1;

        const existing = fs.readDirectory(currentPath)?.map(i => i.name) || [];
        while (existing.includes(name)) {
            name = type === 'directory' ? `New Folder (${counter})` : `New File (${counter}).txt`;
            counter++;
        }

        const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;

        if (type === 'directory') {
            fs.makeDirectory(fullPath);
        } else {
            fs.writeFile(fullPath, '');
        }
        setContextMenu(null);
    };

    // --- Event Handlers ---
    const handleItemContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(item.id);
        setContextMenu({ x: e.clientX, y: e.clientY, item, type: 'item' });
    };

    const handleBackgroundContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'background' });
        setSelectedId(null);
    };

    const handleClickOutside = () => {
        setContextMenu(null);
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1b26] text-gray-200 font-sans" onClick={handleClickOutside} onContextMenu={handleBackgroundContextMenu}>
            {/* Toolbar */}
            <div className="h-12 border-b border-gray-800 flex items-center px-3 bg-[#1f2335] gap-3 select-none shadow-sm z-10">
                <div className="flex gap-1">
                    <button
                        onClick={handleBack}
                        disabled={historyIndex === 0}
                        className={`p-1.5 rounded-md transition-colors ${historyIndex === 0 ? 'text-gray-600' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <button
                        onClick={handleUp}
                        className="p-1.5 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        title="Up one level"
                    >
                        <ArrowUp size={18} />
                    </button>
                </div>

                <div className="flex-1 bg-[#16161e] rounded-md px-3 py-1.5 text-sm text-gray-400 font-mono border border-gray-700 flex items-center overflow-hidden whitespace-nowrap shadow-inner">
                    {searchQuery ? `Search results for "${searchQuery}"` : (
                        <div className="flex items-center">
                            <span
                                onClick={() => handleNavigate('/')}
                                className="hover:text-white hover:bg-white/10 px-1.5 rounded cursor-pointer transition-colors text-blue-400 font-bold"
                                title="Go to root"
                            >
                                /
                            </span>
                            {breadcrumbs.map((crumb, i) => (
                                <React.Fragment key={crumb.path}>
                                    <span
                                        onClick={() => handleNavigate(crumb.path)}
                                        className={`hover:text-white hover:bg-white/10 px-1.5 rounded cursor-pointer transition-colors ${i === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-gray-400'}`}
                                    >
                                        {crumb.name}
                                    </span>
                                    {i < breadcrumbs.length - 1 && <span className="text-gray-600">/</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title={viewMode === 'grid' ? "Switch to List View" : "Switch to Grid View"}
                    >
                        {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                    </button>
                    <button
                        onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}
                        className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title={`Sort by ${sortBy === 'name' ? 'Date' : 'Name'}`}
                    >
                        {sortBy === 'name' ? <AlignLeft size={18} /> : <Clock size={18} />}
                    </button>
                </div>

                <div className="relative w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-[#16161e] border border-gray-700 rounded-full pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-600 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-56 bg-[#16161e] border-r border-gray-800 flex flex-col flex-shrink-0 select-none">
                    <div className="py-4 flex-shrink-0 space-y-1">
                        <div className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Places</div>
                        <SidebarItem icon={<Home size={16} />} label="Home" path="/home/yashika" onClick={handleNavigate} active={currentPath === '/home/yashika' && !searchQuery} />
                        <SidebarItem icon={<Monitor size={16} />} label="Desktop" path="/home/yashika/Desktop" onClick={handleNavigate} active={currentPath === '/home/yashika/Desktop' && !searchQuery} />
                        <SidebarItem icon={<Download size={16} />} label="Downloads" path="/home/yashika/Downloads" onClick={handleNavigate} active={currentPath === '/home/yashika/Downloads' && !searchQuery} />
                        <SidebarItem icon={<FileText size={16} />} label="Documents" path="/home/yashika/Documents" onClick={handleNavigate} active={currentPath === '/home/yashika/Documents' && !searchQuery} />
                    </div>

                    <div className="h-[1px] bg-gray-800 mx-4 my-2 flex-shrink-0"></div>

                    <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                        <div className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">File System</div>
                        {fs.root.map((node) => (
                            <FileNode
                                key={node.id}
                                item={node}
                                depth={0}
                                path={`/${node.name}`}
                                onNavigate={handleNavigate}
                                currentPath={currentPath}
                            />
                        ))}
                    </div>
                </div>

                {/* Main View */}
                <div className="flex-1 overflow-auto bg-[#1a1b26] p-4 relative custom-scrollbar">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 animate-in fade-in duration-300">
                            {displayItems.map(({ item, fullPath }) => (
                                <div
                                    key={item.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); setRenamingId(null); }}
                                    onDoubleClick={() => handleFileOpen(item, fullPath)}
                                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                                    className={`
                                flex flex-col items-center justify-start p-3 rounded-lg
                                border cursor-pointer group transition-all text-center h-32 relative
                                ${selectedId === item.id ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:bg-white/5 border-transparent hover:border-white/10'}
                            `}
                                    title={fullPath}
                                >
                                    <div className="mb-3 transition-transform group-hover:scale-110 duration-200 relative pointer-events-none">
                                        {item.type === 'directory' ?
                                            <Folder size={48} className="text-blue-400 fill-blue-500/20 drop-shadow-lg" strokeWidth={1.5} /> :
                                            <FileText size={48} className="text-gray-400 fill-gray-500/10 drop-shadow-lg" strokeWidth={1.5} />
                                        }
                                    </div>

                                    {renamingId === item.id ? (
                                        <input
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onBlur={submitRename}
                                            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full text-xs bg-black border border-blue-500 text-white text-center rounded px-1 outline-none z-10 shadow-lg"
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-300 break-all line-clamp-2 px-1 rounded select-none font-medium group-hover:text-white transition-colors">
                                            {item.name}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col animate-in fade-in duration-300">
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-[#1a1b26] z-10">
                                <div className="col-span-6">Name</div>
                                <div className="col-span-3">Date Modified</div>
                                <div className="col-span-3">Type</div>
                            </div>
                            {displayItems.map(({ item, fullPath }) => (
                                <div
                                    key={item.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); setRenamingId(null); }}
                                    onDoubleClick={() => handleFileOpen(item, fullPath)}
                                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                                    className={`
                                grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800/50 cursor-pointer transition-colors items-center text-sm
                                ${selectedId === item.id ? 'bg-blue-600/20' : 'hover:bg-white/5'}
                            `}
                                >
                                    <div className="col-span-6 flex items-center gap-3">
                                        {item.type === 'directory' ?
                                            <Folder size={18} className="text-blue-400 fill-blue-500/20" /> :
                                            <FileText size={18} className="text-gray-400" />
                                        }
                                        {renamingId === item.id ? (
                                            <input
                                                type="text"
                                                value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                onBlur={submitRename}
                                                onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full bg-black border border-blue-500 text-white rounded px-1 outline-none"
                                            />
                                        ) : (
                                            <span className="truncate text-gray-300">{item.name}</span>
                                        )}
                                    </div>
                                    <div className="col-span-3 text-gray-500 text-xs font-mono">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="col-span-3 text-gray-500 text-xs uppercase">
                                        {item.type === 'directory' ? 'Folder' : item.name.split('.').pop() || 'File'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {displayItems.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 select-none pointer-events-none">
                            <Folder size={64} className="opacity-20 mb-4" />
                            <span className="text-lg font-medium">
                                {searchQuery ? `No results found for "${searchQuery}"` : 'This folder is empty'}
                            </span>
                        </div>
                    )}

                    {/* Local Context Menu */}
                    {contextMenu && (
                        <div
                            className="fixed z-[100] w-56 bg-[#1f2937] border border-gray-700 rounded-lg shadow-2xl py-1 text-gray-200 text-sm animate-in fade-in zoom-in-95 duration-100"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {contextMenu.type === 'item' ? (
                                <>
                                    <div onClick={() => handleFileOpen(contextMenu.item!, currentPath + '/' + contextMenu.item!.name)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600 cursor-pointer transition-colors">
                                        <ExternalLink size={16} /> <span>Open</span>
                                    </div>
                                    <div onClick={handleRename} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600 cursor-pointer transition-colors">
                                        <Edit2 size={16} /> <span>Rename</span>
                                    </div>
                                    <div className="h-[1px] bg-gray-700 my-1 mx-2"></div>
                                    <div onClick={handleDelete} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-600/80 cursor-pointer text-red-400 hover:text-white transition-colors">
                                        <Trash2 size={16} /> <span>Delete</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div onClick={() => handleCreateNew('directory')} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600 cursor-pointer transition-colors">
                                        <FolderPlus size={16} /> <span>New Folder</span>
                                    </div>
                                    <div onClick={() => handleCreateNew('file')} className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600 cursor-pointer transition-colors">
                                        <FilePlus size={16} /> <span>New File</span>
                                    </div>
                                    <div className="h-[1px] bg-gray-700 my-1 mx-2"></div>
                                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600 cursor-pointer transition-colors">
                                        <MoreHorizontal size={16} /> <span>Properties</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SidebarItem: React.FC<{ icon: any, label: string, path: string, onClick: (p: string) => void, active: boolean }> = ({ icon, label, path, onClick, active }) => (
    <div
        onClick={() => onClick(path)}
        className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md cursor-pointer transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </div>
);

export default FileExplorer;
