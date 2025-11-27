
import React, { useState, useEffect, useRef } from 'react';
import { getTerminalResponse } from '../../services/geminiService';
import { useOS } from '../../contexts/OSContext';
import { APP_REGISTRY } from '../../constants';
import { Copy, Clipboard as PasteIcon, Trash2, Loader2, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppProps } from '../../types';

interface LogEntry {
    type: 'command' | 'output';
    content: string;
    cwd?: string;
}

const KNOWN_COMMANDS = [
    'cat', 'cd', 'clear', 'cp', 'date', 'echo', 'grep', 'head', 'help',
    'history', 'kill', 'ls', 'mkdir', 'mv', 'ps', 'pwd', 'rm', 'tail',
    'touch', 'uname', 'whoami', 'nmap', 'hydra', 'sqlmap', 'python', 'ssh', 'chmod'
];

const COMMAND_FLAGS: Record<string, string[]> = {
    'ls': ['-a', '-l', '-la', '-al', '-R', '-h', '-t', '-S', '-r'],
    'grep': ['-i', '-r', '-v', '-n', '-E', '-c'],
    'rm': ['-r', '-f', '-rf', '-i'],
    'cp': ['-r', '-f', '-i', '-v'],
    'mv': ['-f', '-i', '-v', '-n'],
    'mkdir': ['-p', '-v'],
    'ps': ['-e', '-f', '-ef', 'aux'],
    'nmap': ['-sS', '-sV', '-A', '-p', '-O', '-T4', '-Pn', '-v', '-sC'],
    'uname': ['-a', '-r', '-m', '-s', '-n'],
    'chmod': ['+x', '-R', '777', '755', '644', '600', '-x'],
    'tar': ['-czvf', '-xzvf', '-tf', '-cf', '-xf'],
    'ssh': ['-p', '-i', '-L', '-R'],
    'head': ['-n', '-c', '-q'],
    'tail': ['-n', '-f', '-q'],
    'python': ['-m', '-c', '-V'],
};

const Terminal: React.FC<AppProps> = ({ params }) => {
    const { fs, windows, closeWindow } = useOS();
    const [history, setHistory] = useState<LogEntry[]>([
        { type: 'output', content: 'Welcome to Yashika OS v2.1 (GNU/Linux 6.8.9-kali1-amd64)\nType "help" for a list of commands.' }
    ]);
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState(params?.startPath || '/home/yashika');
    const [isProcessing, setIsProcessing] = useState(false);

    // Command History Navigation
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Clipboard History
    const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, view: 'default' | 'history' } | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 10);
        return () => clearTimeout(timeout);
    }, [history, isProcessing]);

    // Handle Auto-Run Commands
    useEffect(() => {
        if (params?.autoRun) {
            handleCommand(params.autoRun);
        }
    }, []); // Run once on mount

    // Capture generic copy events to populate history
    useEffect(() => {
        const handleCopyEvent = () => {
            const selection = window.getSelection()?.toString();
            if (selection) {
                setClipboardHistory(prev => {
                    // Avoid duplicates at the top of the stack
                    if (prev[0] === selection) return prev;
                    return [selection, ...prev].slice(0, 10); // Keep last 10
                });
            }
        };
        document.addEventListener('copy', handleCopyEvent);
        return () => document.removeEventListener('copy', handleCopyEvent);
    }, []);

    // Close context menu on click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // --- core util commands ---

    const executeSingleCommand = async (cmdLine: string, inputData: string): Promise<string> => {
        const args = cmdLine.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();
        const params = args.slice(1);

        switch (cmd) {
            case 'clear':
                return '__CLEAR__';

            case 'echo':
                return params.join(' ');

            case 'pwd':
                return cwd;

            case 'whoami':
                return 'yashika';

            case 'uname':
                return params[0] === '-a'
                    ? 'Linux yashika-kali 6.8.0-kali-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.8.9-1kali1 (2024-05-20) x86_64 GNU/Linux'
                    : 'Linux';

            case 'date':
                return new Date().toString();

            case 'ls': {
                let showHidden = false;
                let showDetails = false;
                let pathArg = '';

                params.forEach(p => {
                    if (p.startsWith('-')) {
                        if (p.includes('a')) showHidden = true;
                        if (p.includes('l')) showDetails = true;
                    } else {
                        pathArg = p;
                    }
                });

                const target = pathArg ? fs.resolvePath(cwd, pathArg) : cwd;
                const items = fs.readDirectory(target);

                if (!items) return `ls: cannot access '${pathArg || cwd}': No such file or directory`;

                const filtered = items.filter(i => showHidden || !i.name.startsWith('.'));

                if (showDetails) {
                    return filtered.map(item => {
                        const perms = item.permissions || (item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
                        const links = 1;
                        const user = item.owner || 'yashika';
                        const group = item.group || 'yashika';
                        const size = item.type === 'directory' ? 4096 : (item.content?.length || 0);
                        const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                        let nameHtml = item.name;
                        if (item.type === 'directory') nameHtml = `<span class="text-blue-400 font-bold">${item.name}</span>`;
                        else if (item.name.endsWith('.tar') || item.name.endsWith('.zip') || item.name.endsWith('.gz')) nameHtml = `<span class="text-red-500 font-bold">${item.name}</span>`;
                        else if (item.permissions.includes('x') || item.name.endsWith('.sh') || item.name.endsWith('.py')) nameHtml = `<span class="text-green-400 font-bold">${item.name}</span>`;
                        else nameHtml = `<span class="text-gray-200">${item.name}</span>`;

                        // simple pad
                        return `${perms} ${links} ${user} ${group} ${size.toString().padStart(6)} ${date} ${nameHtml}`;
                    }).join('\n');
                } else {
                    const formattedItems = filtered.map(i => {
                        if (i.type === 'directory') return `<span class="text-blue-400 font-bold">${i.name}</span>`;
                        if (i.name.endsWith('.tar') || i.name.endsWith('.zip') || i.name.endsWith('.gz')) return `<span class="text-red-500 font-bold">${i.name}</span>`;
                        if (i.permissions.includes('x') || i.name.endsWith('.sh') || i.name.endsWith('.py')) return `<span class="text-green-400 font-bold">${i.name}</span>`;
                        if (i.name.endsWith('.jpg') || i.name.endsWith('.png')) return `<span class="text-purple-400 font-bold">${i.name}</span>`;
                        return `<span class="text-gray-200">${i.name}</span>`;
                    });
                    return formattedItems.join('  ');
                }
            }

            case 'chmod': {
                if (params.length < 2) return 'chmod: missing operand';
                const mode = params[0];
                const file = params[1];
                const target = fs.resolvePath(cwd, file);
                const success = fs.chmod(target, mode);
                return success ? '' : `chmod: cannot access '${file}': No such file or directory`;
            }

            case 'cd': {
                const target = params[0] || '/home/yashika';
                const resolved = fs.resolvePath(cwd, target);
                const dir = fs.readDirectory(resolved);
                if (dir) {
                    setCwd(resolved);
                    return '';
                }
                return `cd: ${params[0]}: No such file or directory`;
            }

            case 'cat': {
                if (params.length === 0) return inputData; // cat stdin
                const target = fs.resolvePath(cwd, params[0]);
                const content = fs.readFile(target);
                return content !== null ? content : `cat: ${params[0]}: No such file or directory`;
            }

            case 'grep': {
                const pattern = params[0]?.replace(/"/g, '');
                const file = params[1];
                if (!pattern) return 'grep: usage: grep PATTERN [FILE]';

                let textToSearch = inputData;
                if (file) {
                    const target = fs.resolvePath(cwd, file);
                    const content = fs.readFile(target);
                    if (content === null) return `grep: ${file}: No such file or directory`;
                    textToSearch = content;
                }

                return textToSearch.split('\n')
                    .filter(line => line.includes(pattern))
                    .map(line => line.replace(pattern, `<span class="text-red-500 font-bold">${pattern}</span>`))
                    .join('\n');
            }

            case 'head': {
                const count = params.includes('-n') ? parseInt(params[params.indexOf('-n') + 1]) : 10;
                const file = params.find(p => !p.startsWith('-') && p !== String(count));

                let content = inputData;
                if (file) {
                    const target = fs.resolvePath(cwd, file);
                    const c = fs.readFile(target);
                    if (c === null) return `head: ${file}: No such file or directory`;
                    content = c;
                }
                return content.split('\n').slice(0, count).join('\n');
            }

            case 'tail': {
                const count = params.includes('-n') ? parseInt(params[params.indexOf('-n') + 1]) : 10;
                const file = params.find(p => !p.startsWith('-') && p !== String(count));

                let content = inputData;
                if (file) {
                    const target = fs.resolvePath(cwd, file);
                    const c = fs.readFile(target);
                    if (c === null) return `tail: ${file}: No such file or directory`;
                    content = c;
                }
                const lines = content.split('\n');
                return lines.slice(Math.max(lines.length - count, 0)).join('\n');
            }

            case 'mkdir': {
                if (!params[0]) return 'mkdir: missing operand';
                const target = fs.resolvePath(cwd, params[0]);
                return fs.makeDirectory(target) ? '' : `mkdir: cannot create directory '${params[0]}'`;
            }

            case 'touch': {
                if (!params[0]) return 'touch: missing operand';
                const target = fs.resolvePath(cwd, params[0]);
                return fs.writeFile(target, '') ? '' : `touch: cannot create file '${params[0]}'`;
            }

            case 'rm': {
                if (!params[0]) return 'rm: missing operand';
                // Naive support for -rf logic by default in context for now (or strictly require args)
                const fileArg = params.find(p => !p.startsWith('-'));
                if (!fileArg) return 'rm: missing operand';
                const target = fs.resolvePath(cwd, fileArg);
                return fs.deleteItem(target) ? '' : `rm: cannot remove '${fileArg}': No such file or directory`;
            }

            case 'cp': {
                if (params.length < 2) return 'cp: missing file operand';
                const src = fs.resolvePath(cwd, params[0]);
                const dest = fs.resolvePath(cwd, params[1]);
                return fs.copyItem(src, dest) ? '' : `cp: cannot copy '${params[0]}' to '${params[1]}'`;
            }

            case 'mv': {
                if (params.length < 2) return 'mv: missing file operand';
                const src = fs.resolvePath(cwd, params[0]);
                const dest = fs.resolvePath(cwd, params[1]);
                return fs.moveItem(src, dest) ? '' : `mv: cannot move '${params[0]}' to '${params[1]}'`;
            }

            case 'ps': {
                // Mock PS based on real windows
                let output = '  PID TTY          TIME CMD\n';
                output += '    1 ?        00:00:01 systemd\n';
                output += '   10 ?        00:00:00 kthreadd\n';
                windows.forEach((win, i) => {
                    const pid = 1000 + i;
                    output += `${pid.toString().padStart(5)} pts/0    00:00:00 ${APP_REGISTRY[win.appId].name.toLowerCase()}\n`;
                });
                output += `${(Math.floor(Math.random() * 20000) + 1000).toString().padStart(5)} pts/0    00:00:00 zsh`;
                return output;
            }

            case 'kill': {
                if (!params[0]) return 'kill: usage: kill PID';
                // Check if PID matches a window (fake PID logic: 1000 + index)
                const pid = parseInt(params[0]);
                if (isNaN(pid)) return 'kill: invalid pid';

                // Reverse lookup window
                // In a real app we'd map this better
                const index = pid - 1000;
                if (index >= 0 && index < windows.length) {
                    closeWindow(windows[index].id);
                    return `[${1}]  + terminated  ${APP_REGISTRY[windows[index].appId].name}`;
                }
                return `kill: (${pid}) - No such process`;
            }

            case 'help':
                return 'Available commands:\n' +
                    'Core: ls, cd, pwd, cat, echo, clear, history, date, uname, whoami\n' +
                    'File Ops: cp, mv, rm, mkdir, touch, chmod\n' +
                    'Process: ps, kill\n' +
                    'Text: grep, head, tail\n' +
                    'Features: Pipes (|), Redirection (>, >>)\n' +
                    'Hacking (Simulated): nmap, hydra, sqlmap (use AI)';

            default:
                return '__AI__';
        }
    };

    const handleCommand = async (fullCmd: string) => {
        if (!fullCmd.trim()) return;

        const originalCmd = fullCmd;
        setHistory(prev => [...prev, { type: 'command', content: originalCmd, cwd }]);
        setCmdHistory(prev => [...prev, originalCmd]);
        setHistoryIndex(-1);
        setInput('');
        setIsProcessing(true);

        try {
            // 1. Handle Output Redirection (>, >>)
            // We split by '>' first. If >> exists, the split will look like [cmd, '>file']

            let commandPart = fullCmd;
            let redirectFile = null;
            let appendMode = false;

            if (fullCmd.includes('>>')) {
                const parts = fullCmd.split('>>');
                commandPart = parts[0];
                redirectFile = parts[1].trim();
                appendMode = true;
            } else if (fullCmd.includes('>')) {
                const parts = fullCmd.split('>');
                commandPart = parts[0];
                redirectFile = parts[1].trim();
                appendMode = false;
            }

            // 2. Handle Pipes (|)
            const segments = commandPart.split('|').map(s => s.trim());
            let currentOutput = '';
            let aiFallbackNeeded = false;

            for (const segment of segments) {
                const result = await executeSingleCommand(segment, currentOutput);
                if (result === '__CLEAR__') {
                    setHistory([]);
                    setIsProcessing(false);
                    return;
                }
                if (result === '__AI__') {
                    aiFallbackNeeded = true;
                    break;
                }
                currentOutput = result;
            }

            if (aiFallbackNeeded) {
                // Fallback to AI for the whole original command if any part fails to be local
                const fsSummary = JSON.stringify(fs.root, (key, value) => {
                    if (key === 'content' || key === 'id' || key === 'createdAt') return undefined;
                    return value;
                });
                const aiResponse = await getTerminalResponse(originalCmd, cwd, fsSummary);

                if (redirectFile) {
                    const target = fs.resolvePath(cwd, redirectFile);
                    if (appendMode) {
                        const existing = fs.readFile(target) || '';
                        fs.writeFile(target, existing + '\n' + aiResponse);
                    } else {
                        fs.writeFile(target, aiResponse);
                    }
                } else {
                    setHistory(prev => [...prev, { type: 'output', content: aiResponse }]);
                }
            } else {
                // Local execution successful
                if (redirectFile) {
                    const target = fs.resolvePath(cwd, redirectFile);
                    if (appendMode) {
                        const existing = fs.readFile(target) || '';
                        // Strip HTML tags for file output? For now keep raw if possible, but our ls returns HTML
                        // Simple strip html regex
                        const cleanOutput = currentOutput.replace(/<[^>]*>?/gm, '');
                        fs.writeFile(target, existing + '\n' + cleanOutput);
                    } else {
                        const cleanOutput = currentOutput.replace(/<[^>]*>?/gm, '');
                        fs.writeFile(target, cleanOutput);
                    }
                } else if (currentOutput) {
                    setHistory(prev => [...prev, { type: 'output', content: currentOutput }]);
                }
            }

        } catch (err) {
            setHistory(prev => [...prev, { type: 'output', content: `Error: ${(err as Error).message}` }]);
        }

        setIsProcessing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl+C Interrupt
        if (e.ctrlKey && e.key === 'c') {
            const selection = window.getSelection()?.toString();
            // Only interrupt if no text is selected (behavior like real terminal)
            // If text is selected, default browser "Copy" behavior prevails
            if (!selection) {
                e.preventDefault();
                setHistory(prev => [...prev, { type: 'command', content: input + '^C', cwd }]);
                setInput('');
                setHistoryIndex(-1);
                return;
            }
        }

        if (e.key === 'Enter') {
            handleCommand(input);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length > 0) {
                const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(cmdHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = historyIndex + 1;
                if (newIndex >= cmdHistory.length) {
                    setHistoryIndex(-1);
                    setInput('');
                } else {
                    setHistoryIndex(newIndex);
                    setInput(cmdHistory[newIndex]);
                }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const args = input.split(' ');
            const lastArg = args[args.length - 1];
            const command = args[0];

            // 1. Command Autocomplete (if it's the first argument)
            if (args.length === 1 && lastArg) {
                const match = KNOWN_COMMANDS.find(c => c.startsWith(lastArg));
                if (match) {
                    setInput(match);
                    return;
                }
            }

            // 2. Flag Autocomplete
            if (args.length > 1 && lastArg.startsWith('-')) {
                const flags = COMMAND_FLAGS[command];
                if (flags) {
                    const match = flags.find(f => f.startsWith(lastArg));
                    if (match) {
                        args[args.length - 1] = match;
                        setInput(args.join(' '));
                        return;
                    }
                }
            }

            // 3. File Autocomplete
            if (lastArg) { // Only if user typed something
                const items = fs.readDirectory(cwd);
                if (items) {
                    const match = items.find(i => i.name.startsWith(lastArg));
                    if (match) {
                        args[args.length - 1] = match.name;
                        setInput(args.join(' '));
                    }
                }
            }
        }
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Keep it within window bounds if possible, simplifed for now to mouse position
        setContextMenu({ x: e.clientX, y: e.clientY, view: 'default' });
    };

    const handleCopy = () => {
        const text = window.getSelection()?.toString();
        if (text) {
            navigator.clipboard.writeText(text);
            // Manually add to history here too in case the global listener missed it
            setClipboardHistory(prev => {
                if (prev[0] === text) return prev;
                return [text, ...prev].slice(0, 10);
            });
        }
        setContextMenu(null);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(prev => prev + text);
            inputRef.current?.focus();
        } catch (err) {
            console.error("Paste failed", err);
        }
        setContextMenu(null);
    };

    const handlePasteFromHistory = (text: string) => {
        setInput(prev => prev + text);
        inputRef.current?.focus();
        setContextMenu(null);
    };

    const handleClear = () => {
        setHistory([]);
        setContextMenu(null);
    };

    const renderContent = (content: string) => {
        if (content.includes('<span')) {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
        return content;
    }

    return (
        <div
            className="h-full bg-[#0a0a0a] p-2 font-mono text-sm text-gray-300 overflow-y-auto selection:bg-yashika-terminal selection:text-black relative"
            onClick={() => inputRef.current?.focus()}
            onContextMenu={handleRightClick}
        >
            {history.map((entry, i) => (
                <div key={i} className="mb-1 whitespace-pre-wrap break-words">
                    {entry.type === 'command' ? (
                        <div className="flex flex-wrap gap-x-2 text-yashika-terminal font-bold">
                            <span>┌──(yashika㉿kali)-[{entry.cwd}]</span>
                        </div>
                    ) : (
                        <div className="text-gray-300 pl-2 leading-relaxed opacity-90">{renderContent(entry.content)}</div>
                    )}
                    {entry.type === 'command' && (
                        <div className="flex gap-2 text-yashika-terminal pl-2 font-bold">
                            <span>└─$</span>
                            <span className="text-white font-normal">{entry.content}</span>
                        </div>
                    )}
                </div>
            ))}

            {/* Active Input Line */}
            <div className="mt-2">
                <div className="flex gap-x-2 text-yashika-terminal font-bold">
                    <span>┌──(yashika㉿kali)-[{cwd}]</span>
                </div>
                <div className="flex gap-2 text-yashika-terminal pl-2 items-center font-bold">
                    <span>└─$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none outline-none text-white flex-1 font-normal caret-white"
                        autoFocus
                        disabled={isProcessing}
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
            </div>

            {/* Loading Indicator */}
            {isProcessing && (
                <div className="pl-4 mt-2 flex items-center gap-2 text-gray-500 font-mono text-xs">
                    <Loader2 size={14} className="animate-spin text-yashika-terminal" />
                    <span className="animate-pulse">Processing...</span>
                </div>
            )}

            <div ref={bottomRef} />

            {/* Context Menu Overlay */}
            {contextMenu && (
                <div
                    className="fixed z-[9999] w-48 bg-[#1f2937] border border-gray-700 rounded-md shadow-2xl py-1 text-gray-200"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.view === 'default' ? (
                        <>
                            <div onClick={handleCopy} className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer">
                                <Copy size={14} />
                                <span>Copy</span>
                            </div>
                            <div onClick={handlePaste} className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer">
                                <PasteIcon size={14} />
                                <span>Paste</span>
                            </div>
                            <div
                                onClick={(e) => { e.stopPropagation(); setContextMenu({ ...contextMenu, view: 'history' }); }}
                                className="flex items-center justify-between px-4 py-2 hover:bg-white/10 cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <ClipboardList size={14} />
                                    <span>Clipboard History</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-500" />
                            </div>
                            <div className="h-[1px] bg-gray-700 my-1"></div>
                            <div onClick={handleClear} className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer text-red-400">
                                <Trash2 size={14} />
                                <span>Clear Screen</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                onClick={(e) => { e.stopPropagation(); setContextMenu({ ...contextMenu, view: 'default' }); }}
                                className="flex items-center gap-2 px-2 py-2 hover:bg-white/10 cursor-pointer text-gray-400 border-b border-gray-700 mb-1"
                            >
                                <ChevronLeft size={14} />
                                <span className="text-xs uppercase font-bold">Back</span>
                            </div>
                            {clipboardHistory.length === 0 ? (
                                <div className="px-4 py-2 text-xs text-gray-500 italic text-center">Empty History</div>
                            ) : (
                                clipboardHistory.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handlePasteFromHistory(item)}
                                        className="px-4 py-2 hover:bg-white/10 cursor-pointer truncate text-xs"
                                        title={item}
                                    >
                                        {item.length > 20 ? item.substring(0, 20) + '...' : item}
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Terminal;
