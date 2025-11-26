import React, { useEffect, useRef } from 'react';
import { RefreshCw, FolderPlus, FilePlus, Terminal, Image, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, visible, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div 
        ref={menuRef}
        className="fixed z-[9999] w-56 bg-[#1f2937] border border-gray-700 rounded-md shadow-2xl py-1 text-gray-200 text-sm animate-in fade-in zoom-in-95 duration-100"
        style={{ top: y, left: x }}
        onContextMenu={(e) => e.preventDefault()}
    >
        <div 
            onClick={() => onAction('new_folder')}
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer"
        >
            <FolderPlus size={16} className="text-blue-400" />
            <span>Create Folder</span>
        </div>
        <div 
            onClick={() => onAction('new_file')}
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer"
        >
            <FilePlus size={16} className="text-gray-400" />
            <span>Create Document</span>
        </div>
        <div className="h-[1px] bg-gray-700 my-1 mx-2"></div>
        <div 
            onClick={() => onAction('open_terminal')}
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer"
        >
            <Terminal size={16} className="text-green-500" />
            <span>Open Terminal Here</span>
        </div>
        <div className="h-[1px] bg-gray-700 my-1 mx-2"></div>
        <div 
            onClick={() => onAction('change_bg')}
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer"
        >
            <Image size={16} className="text-purple-400" />
            <span>Change Desktop Background</span>
        </div>
         <div 
            onClick={() => onAction('refresh')}
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 cursor-pointer"
        >
            <RefreshCw size={16} className="text-yellow-400" />
            <span>Refresh</span>
        </div>
    </div>
  );
};

export default ContextMenu;