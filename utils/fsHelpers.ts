import { FileSystemItem } from '../types';

// Helper to clean paths
export const normalizePath = (path: string): string => {
  if (!path) return '/';
  // Remove duplicate slashes
  const clean = path.replace(/\/+/g, '/');
  // Remove trailing slash unless it's root
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean;
};

// Resolve a relative path against a CWD to an absolute path
export const resolvePath = (cwd: string, target: string): string => {
  if (target.startsWith('/')) return normalizePath(target);

  const parts = cwd.split('/').filter(Boolean);
  const targetParts = target.split('/').filter(Boolean);

  for (const part of targetParts) {
    if (part === '.') continue;
    if (part === '..') {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  return normalizePath('/' + parts.join('/'));
};

// Find a node in the tree
export const findNode = (root: FileSystemItem[], path: string): FileSystemItem | null => {
  if (path === '/') {
    return { 
      id: 'root', 
      name: '', 
      type: 'directory', 
      children: root, 
      createdAt: 0, 
      permissions: 'drwxr-xr-x', 
      owner: 'root', 
      group: 'root' 
    };
  }

  const parts = path.split('/').filter(Boolean);
  let current: FileSystemItem[] = root;
  let targetNode: FileSystemItem | null = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const found = current.find(n => n.name === part);
    
    if (!found) return null;
    
    if (i === parts.length - 1) {
      targetNode = found;
    } else {
      if (found.type !== 'directory' || !found.children) return null;
      current = found.children;
    }
  }

  return targetNode;
};

// Deep clone to ensure immutability
export const cloneFS = (items: FileSystemItem[]): FileSystemItem[] => {
  return JSON.parse(JSON.stringify(items));
};