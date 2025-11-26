
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOS } from '../../contexts/OSContext';
import { FileSystemItem, AppID, AppProps } from '../../types';
import { Folder, HardDrive, ChevronRight, ChevronDown, Search, ArrowLeft, ArrowUp, Home, Download, Trash2, Monitor, FileText, MoreHorizontal, FilePlus, FolderPlus, Edit2, ExternalLink } from 'lucide-react';

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
            flex items-center gap-2 py-0.5 pr-2 hover:bg-white/5 cursor-pointer select-none transition-colors text-sm 
            ${isSelected ? 'bg-blue-600/20 text-blue-100' : 'text-gray-400 hover:text-gray-200'}
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
        <div>
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
  
  // Interaction State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, item?: FileSystemItem, type: 'item' | 'background'} | null>(null);

  const displayItems = useMemo(() => {
    if (searchQuery.trim()) {
        const results: { item: FileSystemItem, fullPath: string }[] = [];
        const traverse = (nodes: FileSystemItem[], currentDir: string) => {
            nodes.forEach(node => {
                const nodePath = currentDir === '/' ? `/${node.name}` : `${currentDir}/${node.name}`;
                if (isMatch(node.name, searchQuery)) {
                    results.push({ item: node, fullPath: nodePath });
                }
                if (node.type === 'directory' && node.children) {
                    traverse(node.children, nodePath);
                }
            });
        };
        traverse(fs.root, ''); 
        return results;
    }
    const items = fs.readDirectory(currentPath) || [];
    return items.map(item => ({
        item,
        fullPath: currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`
    }));
  }, [fs, currentPath, searchQuery]);

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
          
          if (['txt', 'md', 'py', 'js', 'json', 'css', 'html', 'conf', 'sh'].includes(ext || '')) {
              launchApp(AppID.TEXT_EDITOR, { filePath: fullPath, title: item.name });
          } 
          else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) {
              // Just use text editor for now as a fallback or placeholder for image viewer
              // launchApp(AppID.IMAGE_VIEWER, { filePath: fullPath });
              launchApp(AppID.TEXT_EDITOR, { filePath: fullPath, title: item.name }); 
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
              // Construct new path
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
          playSound('minimize'); // reuse sound
      }
  };

  const handleCreateNew = (type: 'file' | 'directory') => {
      const baseName = type === 'directory' ? 'New Folder' : 'New File.txt';
      let name = baseName;
      let counter = 1;
      
      // Simple collision check (not perfect due to async react state but works for single user)
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
      <div className="h-10 border-b border-gray-800 flex items-center px-2 bg-[#1f2335] gap-2 select-none">
        <div className="flex gap-1">
            <button 
                onClick={handleBack}
                disabled={historyIndex === 0}
                className={`p-1 rounded ${historyIndex === 0 ? 'text-gray-600' : 'text-gray-300 hover:bg-white/10'}`}
            >
                <ArrowLeft size={16} />
            </button>
            <button 
                onClick={handleUp}
                className="p-1 rounded text-gray-300 hover:bg-white/10"
                title="Up one level"
            >
                <ArrowUp size={16} />
            </button>
        </div>
        
        <div className="flex-1 bg-[#16161e] rounded px-3 py-1 text-sm text-gray-400 font-mono border border-gray-700 flex items-center overflow-hidden whitespace-nowrap">
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

        <div className="relative w-40 sm:w-56">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#16161e] border border-gray-700 rounded-full pl-7 pr-2 py-1 text-xs text-gray-200 focus:border-yashika-accent outline-none placeholder-gray-600"
            />
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 bg-[#16161e] border-r border-gray-800 flex flex-col flex-shrink-0 select-none">
           <div className="py-2 flex-shrink-0">
               <div className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Places</div>
               <SidebarItem icon={<Home size={14} />} label="Home" path="/home/yashika" onClick={handleNavigate} active={currentPath === '/home/yashika' && !searchQuery} />
               <SidebarItem icon={<Monitor size={14} />} label="Desktop" path="/home/yashika/Desktop" onClick={handleNavigate} active={currentPath === '/home/yashika/Desktop' && !searchQuery} />
               <SidebarItem icon={<Download size={14} />} label="Downloads" path="/home/yashika/Downloads" onClick={handleNavigate} active={currentPath === '/home/yashika/Downloads' && !searchQuery} />
           </div>
           
           <div className="h-[1px] bg-gray-800 mx-2 my-1 flex-shrink-0"></div>

           <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
               <div className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">File System</div>
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
        
        {/* Main Grid View */}
        <div className="flex-1 overflow-auto bg-[#1a1b26] p-2 relative">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {displayItems.map(({ item, fullPath }) => (
                    <div 
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); setRenamingId(null); }}
                        onDoubleClick={() => handleFileOpen(item, fullPath)}
                        onContextMenu={(e) => handleItemContextMenu(e, item)}
                        className={`
                            flex flex-col items-center justify-start p-2 rounded 
                            border cursor-pointer group transition-all text-center h-28 relative
                            ${selectedId === item.id ? 'bg-blue-600/20 border-blue-500/50' : 'hover:bg-white/5 border-transparent hover:border-white/10'}
                        `}
                        title={fullPath}
                    >
                        <div className="mb-2 transition-transform group-hover:scale-105 relative pointer-events-none">
                            {item.type === 'directory' ? 
                                <Folder size={40} className="text-blue-400 fill-blue-500/20" strokeWidth={1.5} /> : 
                                <FileText size={40} className="text-gray-400 fill-gray-500/10" strokeWidth={1.5} />
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
                                className="w-full text-xs bg-black border border-blue-500 text-white text-center rounded px-1 outline-none z-10"
                            />
                        ) : (
                            <span className="text-xs text-gray-300 break-all line-clamp-2 px-1 rounded select-none">
                                {item.name}
                            </span>
                        )}
                    </div>
                ))}
                {displayItems.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-gray-600 mt-10 select-none pointer-events-none">
                        <Folder size={48} className="opacity-20 mb-2" />
                        <span className="text-sm">
                            {searchQuery ? `No results for "${searchQuery}"` : 'Empty Directory'}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Local Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed z-[100] w-48 bg-[#1f2937] border border-gray-700 rounded-md shadow-2xl py-1 text-gray-200 text-sm"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.type === 'item' ? (
                        <>
                            <div onClick={() => handleFileOpen(contextMenu.item!, currentPath + '/' + contextMenu.item!.name)} className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer">
                                <ExternalLink size={14} /> <span>Open</span>
                            </div>
                            <div onClick={handleRename} className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer">
                                <Edit2 size={14} /> <span>Rename</span>
                            </div>
                            <div className="h-[1px] bg-gray-700 my-1 mx-2"></div>
                            <div onClick={handleDelete} className="flex items-center gap-3 px-4 py-2 hover:bg-red-600/80 cursor-pointer text-red-400 hover:text-white">
                                <Trash2 size={14} /> <span>Delete</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div onClick={() => handleCreateNew('directory')} className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer">
                                <FolderPlus size={14} /> <span>New Folder</span>
                            </div>
                            <div onClick={() => handleCreateNew('file')} className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer">
                                <FilePlus size={14} /> <span>New File</span>
                            </div>
                            <div className="h-[1px] bg-gray-700 my-1 mx-2"></div>
                            <div className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer">
                                <MoreHorizontal size={14} /> <span>Properties</span>
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

const SidebarItem: React.FC<{icon: any, label: string, path: string, onClick: (p:string) => void, active: boolean}> = ({icon, label, path, onClick, active}) => (
    <div 
        onClick={() => onClick(path)}
        className={`flex items-center gap-3 px-3 py-1.5 mx-1 rounded cursor-pointer transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </div>
);

export default FileExplorer;
