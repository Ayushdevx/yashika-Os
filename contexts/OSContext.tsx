
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppID, WindowState, FileSystemItem, OSContextState } from '../types';
import { APP_REGISTRY, INITIAL_FILE_SYSTEM } from '../constants';
import { normalizePath, resolvePath, findNode, cloneFS } from '../utils/fsHelpers';
import { playSystemSound } from '../utils/soundEffects';

const OSContext = createContext<OSContextState | undefined>(undefined);

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [zIndexCounter, setZIndexCounter] = useState(10);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(INITIAL_FILE_SYSTEM);
  const [wallpaper, setWallpaper] = useState("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop");

  // --- Window Management ---

  const launchApp = useCallback((appId: AppID, params?: any) => {
    playSystemSound('open');
    const newId = `${appId}-${Date.now()}`;
    const appConfig = APP_REGISTRY[appId];

    // Check if single instance app is already open (optional, but good for settings/task manager)
    // We skip this check if params are provided (e.g., opening multiple text files)
    const existing = windows.find(w => w.appId === appId);
    if (!params && (appId === AppID.SETTINGS || appId === AppID.TASK_MANAGER) && existing) {
        focusWindow(existing.id);
        return;
    }

    const newWindow: WindowState = {
      id: newId,
      appId,
      title: params?.title || appConfig.name, // Allow overriding title
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: zIndexCounter + 1,
      position: { x: 50 + (windows.length * 20), y: 50 + (windows.length * 20) },
      size: { width: appConfig.defaultWidth, height: appConfig.defaultHeight },
      launchParams: params
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newId);
    setZIndexCounter(prev => prev + 1);
    setIsStartOpen(false);
  }, [zIndexCounter, windows]);

  const closeWindow = (id: string) => {
    playSystemSound('close');
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const minimizeWindow = (id: string) => {
    playSystemSound('minimize');
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindowId(null);
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  };

  const focusWindow = (id: string) => {
    if (activeWindowId === id) return;
    setZIndexCounter(prev => prev + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter + 1, isMinimized: false } : w));
    setActiveWindowId(id);
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: { x, y } } : w));
  };

  const resizeWindow = (id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, size: { width, height }, isMaximized: false } : w));
  };

  const toggleStart = () => {
    playSystemSound('click');
    setIsStartOpen(prev => !prev);
  }

  const playSound = (type: 'click' | 'open' | 'close' | 'minimize' | 'error' | 'login') => {
      playSystemSound(type);
  };

  // --- File System Actions ---

  // Helper to mutate FS
  const mutateFS = (operation: (root: FileSystemItem[]) => void) => {
    setFileSystem(prev => {
      const newFS = cloneFS(prev);
      operation(newFS);
      return newFS;
    });
  };

  const readDirectory = (path: string): FileSystemItem[] | null => {
    const node = findNode(fileSystem, path);
    if (node && node.type === 'directory') {
      return node.children || [];
    }
    return null;
  };

  const readFile = (path: string): string | null => {
    const node = findNode(fileSystem, path);
    if (node && node.type === 'file') {
      return node.content || '';
    }
    return null;
  };

  const writeFile = (path: string, content: string): boolean => {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) return false;
    const dirPath = '/' + parts.join('/');
    
    let success = false;

    mutateFS((root) => {
      const parent = findNode(root, dirPath);
      if (parent && parent.type === 'directory' && parent.children) {
        const existing = parent.children.find(c => c.name === fileName);
        if (existing) {
          if (existing.type === 'file') {
            existing.content = content;
            success = true;
          }
        } else {
          parent.children.push({
            id: `file-${Date.now()}`,
            name: fileName,
            type: 'file',
            content,
            createdAt: Date.now(),
            permissions: '-rw-r--r--',
            owner: 'yashika',
            group: 'yashika'
          });
          success = true;
        }
      }
    });
    return success;
  };

  const makeDirectory = (path: string): boolean => {
    const parts = path.split('/').filter(Boolean);
    const dirName = parts.pop();
    if (!dirName) return false;
    const parentPath = '/' + parts.join('/');

    let success = false;
    mutateFS((root) => {
      const parent = findNode(root, parentPath);
      if (parent && parent.type === 'directory' && parent.children) {
        if (!parent.children.find(c => c.name === dirName)) {
            parent.children.push({
                id: `dir-${Date.now()}`,
                name: dirName,
                type: 'directory',
                children: [],
                createdAt: Date.now(),
                permissions: 'drwxr-xr-x',
                owner: 'yashika',
                group: 'yashika'
            });
            success = true;
        }
      }
    });
    return success;
  };

  const deleteItem = (path: string): boolean => {
    const parts = path.split('/').filter(Boolean);
    const targetName = parts.pop();
    if (!targetName) return false;
    const parentPath = '/' + parts.join('/');

    let success = false;
    mutateFS((root) => {
       const parent = findNode(root, parentPath);
       if (parent && parent.type === 'directory' && parent.children) {
           const idx = parent.children.findIndex(c => c.name === targetName);
           if (idx !== -1) {
               parent.children.splice(idx, 1);
               success = true;
           }
       }
    });
    return success;
  };

  const copyItem = (source: string, dest: string): boolean => {
    let success = false;
    mutateFS((root) => {
      const sourceNode = findNode(root, source);
      if (!sourceNode) return;

      const parts = dest.split('/').filter(Boolean);
      const destName = parts.pop();
      if (!destName) return;
      const destParentPath = '/' + parts.join('/');
      
      const destNode = findNode(root, dest);
      let targetParentNode: FileSystemItem | null = null;
      let finalName = destName;

      if (destNode && destNode.type === 'directory') {
          targetParentNode = destNode;
          finalName = sourceNode.name;
      } else {
          targetParentNode = findNode(root, destParentPath);
      }

      if (targetParentNode && targetParentNode.type === 'directory' && targetParentNode.children) {
          // Clone source node
          const newNode = cloneFS([sourceNode])[0];
          newNode.name = finalName;
          newNode.id = `${newNode.type}-${Date.now()}-${Math.random()}`;
          
          // Overwrite logic
          const existingIdx = targetParentNode.children.findIndex(c => c.name === finalName);
          if (existingIdx !== -1) {
              targetParentNode.children.splice(existingIdx, 1);
          }
          targetParentNode.children.push(newNode);
          success = true;
      }
    });
    return success;
  };

  const moveItem = (source: string, dest: string): boolean => {
      // Basic check to prevent moving parent into child
      if (dest.startsWith(source) && dest[source.length] === '/') return false;
      
      const copied = copyItem(source, dest);
      if (copied) {
          return deleteItem(source);
      }
      return false;
  };

  const chmod = (path: string, mode: string): boolean => {
      let success = false;
      mutateFS((root) => {
          const node = findNode(root, path);
          if (node) {
              // Octal mode support (e.g., 777)
              if (/^[0-7]{3}$/.test(mode)) {
                  const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
                  const parts = mode.split('').map(d => parseInt(d));
                  const prefix = node.type === 'directory' ? 'd' : '-';
                  node.permissions = prefix + map[parts[0]] + map[parts[1]] + map[parts[2]];
                  success = true;
              }
              // Basic +x / -x support
              else if (mode === '+x') {
                  const p = node.permissions.split('');
                  if (p[3] === '-') p[3] = 'x';
                  if (p[6] === '-') p[6] = 'x';
                  if (p[9] === '-') p[9] = 'x';
                  node.permissions = p.join('');
                  success = true;
              }
              else if (mode === '-x') {
                  const p = node.permissions.split('');
                  if (p[3] === 'x') p[3] = '-';
                  if (p[6] === 'x') p[6] = '-';
                  if (p[9] === 'x') p[9] = '-';
                  node.permissions = p.join('');
                  success = true;
              }
          }
      });
      return success;
  };

  const fsContext = {
    root: fileSystem,
    resolvePath,
    readDirectory,
    readFile,
    writeFile,
    makeDirectory,
    deleteItem,
    copyItem,
    moveItem,
    chmod
  };

  return (
    <OSContext.Provider value={{
      windows,
      activeWindowId,
      fileSystem,
      isStartOpen,
      wallpaper,
      setWallpaper,
      launchApp,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
      toggleStart,
      playSound,
      fs: fsContext
    }}>
      {children}
    </OSContext.Provider>
  );
};
