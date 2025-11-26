
import React, { ReactNode } from 'react';

export enum AppID {
  TERMINAL = 'terminal',
  FILE_EXPLORER = 'files',
  BROWSER = 'browser',
  NETWORK_ANALYZER = 'net_analyzer',
  SETTINGS = 'settings',
  NOTES = 'notes',
  TRASH = 'trash',
  TEXT_EDITOR = 'text_editor',
  TASK_MANAGER = 'task_manager',
  PAINT = 'paint',
  TICTACTOE = 'tictactoe',
  WORD = 'word',
  EXCEL = 'excel',
  POWERPOINT = 'powerpoint',
  LINKEDIN = 'linkedin',
  INSTAGRAM = 'instagram',
  CHATGPT = 'chatgpt',
  CLOCK = 'clock',
  CAMERA = 'camera',
  YOUTUBE = 'youtube',
  VSCODE = 'vscode',
  SPOTIFY = 'spotify'
}

export interface WindowState {
  id: string;
  appId: AppID;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  launchParams?: any; // Params passed to the app on launch
}

export interface FileSystemItem {
  id: string; // Unique ID for keys
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileSystemItem[];
  parentId?: string;
  createdAt: number;
  permissions: string; // e.g., "drwxr-xr-x"
  owner: string; // e.g., "root"
  group: string; // e.g., "root"
}

export interface AppConfig {
  id: AppID;
  name: string;
  icon: ReactNode;
  component: React.FC<AppProps>; 
  defaultWidth: number;
  defaultHeight: number;
}

export interface AppProps {
  windowId: string;
  params?: any;
}

export interface OSContextState {
  windows: WindowState[];
  activeWindowId: string | null;
  fileSystem: FileSystemItem[];
  isStartOpen: boolean;
  wallpaper: string;
  setWallpaper: (url: string) => void;
  launchApp: (appId: AppID, params?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  toggleStart: () => void;
  playSound: (type: 'click' | 'open' | 'close' | 'minimize' | 'error' | 'login') => void;
  
  // File System Actions
  fs: {
    root: FileSystemItem[];
    resolvePath: (cwd: string, target: string) => string;
    readDirectory: (path: string) => FileSystemItem[] | null;
    readFile: (path: string) => string | null;
    writeFile: (path: string, content: string) => boolean;
    makeDirectory: (path: string) => boolean;
    deleteItem: (path: string) => boolean;
    copyItem: (source: string, dest: string) => boolean;
    moveItem: (source: string, dest: string) => boolean;
    chmod: (path: string, mode: string) => boolean;
  };
}
