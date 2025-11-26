
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Save, FolderOpen, Search, X, ChevronDown, Check, Loader2, FilePlus, Copy, Scissors, Clipboard, FileText } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { AppProps } from '../../types';

interface FileOption {
  path: string;
  name: string;
}

interface LanguageDef {
  name: string;
  keywords: RegExp;
  comments: RegExp;
  strings: RegExp;
  numbers: RegExp;
  meta?: RegExp; // decorators, etc
}

const LANGUAGES: Record<string, LanguageDef> = {
  javascript: {
    name: 'JavaScript',
    keywords: /\b(const|let|var|function|return|import|from|export|default|class|if|else|switch|case|break|for|while|do|try|catch|async|await|new|this|typeof|void|delete|in|instanceof|extends|super)\b/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    strings: /('.*?'|".*?"|`[\s\S]*?`)/g,
    numbers: /\b(\d+)\b/g,
  },
  typescript: {
    name: 'TypeScript',
    keywords: /\b(const|let|var|function|return|import|from|export|default|class|if|else|switch|case|break|for|while|do|try|catch|async|await|new|this|typeof|void|delete|in|instanceof|extends|super|interface|type|enum|implements|public|private|protected|readonly|declare|namespace)\b/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    strings: /('.*?'|".*?"|`[\s\S]*?`)/g,
    numbers: /\b(\d+)\b/g,
  },
  python: {
    name: 'Python',
    keywords: /\b(def|class|import|from|return|if|else|elif|for|while|try|except|finally|with|as|pass|break|continue|global|lambda|yield|print|None|True|False|and|or|not|is|in)\b/g,
    comments: /((#.*$)|("""[\s\S]*?"""))/gm,
    strings: /('.*?'|".*?")/g,
    numbers: /\b(\d+)\b/g,
    meta: /(@[a-zA-Z0-9_]+)/g,
  },
  shell: {
    name: 'Shell Script',
    keywords: /\b(echo|cd|ls|pwd|mkdir|rm|cp|mv|touch|cat|grep|head|tail|chmod|chown|sudo|if|fi|then|else|elif|for|do|done|while|case|esac|function|exit|source|export|alias)\b/g,
    comments: /(#.*$)/gm,
    strings: /('.*?'|".*?")/g,
    numbers: /\b(\d+)\b/g,
    meta: /(\$[a-zA-Z0-9_]+)/g,
  },
  html: {
    name: 'HTML',
    keywords: /(<\/?[a-zA-Z0-9]+)/g, // tags
    comments: /(<!--[\s\S]*?-->)/g,
    strings: /('.*?'|".*?")/g, // attributes
    numbers: /\b(\d+)\b/g,
  },
  css: {
    name: 'CSS',
    keywords: /([a-zA-Z-]+)(?=:)/g, // properties
    comments: /(\/\*[\s\S]*?\*\/)/gm,
    strings: /('.*?'|".*?")/g,
    numbers: /\b(\d+(?:px|em|rem|%|vh|vw)?)\b/g,
    meta: /(\.|#)[a-zA-Z0-9_-]+/g, // selectors
  },
  json: {
    name: 'JSON',
    keywords: /\b(true|false|null)\b/g,
    comments: /$/gi, // No comments in JSON
    strings: /(".*?")/g,
    numbers: /\b(\d+)\b/g,
  },
  plaintext: {
    name: 'Plain Text',
    keywords: /$/gi,
    comments: /$/gi,
    strings: /$/gi,
    numbers: /$/gi,
  }
};

const TextEditor: React.FC<AppProps> = ({ params }) => {
  const { fs } = useOS();
  const [content, setContent] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsPath, setSaveAsPath] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Find Feature State
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  
  // Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setActiveMenu(null);
        }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-detect language
  const detectLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'js': return 'javascript';
        case 'jsx': return 'javascript';
        case 'ts': return 'typescript';
        case 'tsx': return 'typescript';
        case 'py': return 'python';
        case 'sh': 
        case 'bash': return 'shell';
        case 'html': return 'html';
        case 'css': return 'css';
        case 'json': return 'json';
        default: return 'plaintext';
    }
  };

  const loadFileContent = (path: string) => {
    setIsLoading(true);
    setStatusMsg(`Opening ${path}...`);
    
    setTimeout(() => {
        const data = fs.readFile(path);
        if (data !== null) {
            setContent(data);
            setCurrentPath(path);
            setLanguage(detectLanguage(path));
            setStatusMsg(`Opened ${path}`);
        } else {
            setStatusMsg(`Could not find ${path}`);
        }
        setIsLoading(false);
    }, 600); // Simulated delay
  };

  // Load file if passed via params
  useEffect(() => {
    if (params?.filePath) {
      loadFileContent(params.filePath);
    }
  }, [params]);

  const getAllFiles = (path: string = '/'): FileOption[] => {
    let files: FileOption[] = [];
    const items = fs.readDirectory(path);
    if (!items) return [];

    items.forEach(item => {
        const itemPath = path === '/' ? `/${item.name}` : `${path}/${item.name}`;
        if (item.type === 'file') {
            files.push({ path: itemPath, name: item.name });
        } else if (item.type === 'directory') {
            files = [...files, ...getAllFiles(itemPath)];
        }
    });
    return files;
  };

  const handleOpen = (file: FileOption) => {
    setShowOpenDialog(false);
    loadFileContent(file.path);
  };

  const handleSave = () => {
    if (!currentPath) {
      handleSaveAsInit();
      return;
    }
    const success = fs.writeFile(currentPath, content);
    if (success) {
        setStatusMsg(`Saved to ${currentPath}`);
        setLanguage(detectLanguage(currentPath));
    } else {
        setStatusMsg('Error saving file.');
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSaveAsInit = () => {
      setSaveAsPath(currentPath || '/home/yashika/untitled.txt');
      setShowSaveAsDialog(true);
      setActiveMenu(null);
  };

  const handleSaveAsConfirm = () => {
      if (!saveAsPath) return;
      
      const success = fs.writeFile(saveAsPath, content);
      if (success) {
          setCurrentPath(saveAsPath);
          setLanguage(detectLanguage(saveAsPath));
          setStatusMsg(`Saved as ${saveAsPath}`);
          setShowSaveAsDialog(false);
      } else {
          setStatusMsg('Error saving file. Check directory path.');
      }
  };

  const handleScroll = () => {
    if (preRef.current && textareaRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop;
        preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleSelectAll = () => {
      if (textareaRef.current) {
          textareaRef.current.select();
      }
      setActiveMenu(null);
  };

  const handleFindToggle = () => {
      setShowFind(true);
      setActiveMenu(null);
  };

  // --- Syntax Highlighter ---
  const highlightedContent = useMemo(() => {
    const lang = LANGUAGES[language];
    
    // If we have a find query, we need to inject it into the tokenizer or post-process
    // Complex regex composition to handle standard tokens AND the search query
    
    // Escape search query for regex
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    
    let tokens: (string | React.ReactElement)[] = [content];
    
    // Helper to tokenize a string array based on a regex and apply a class or keep string
    const applyToken = (input: (string | React.ReactElement)[], regex: RegExp, className: string, isSearch: boolean = false) => {
        const output: (string | React.ReactElement)[] = [];
        input.forEach(part => {
            if (typeof part !== 'string') {
                output.push(part);
                return;
            }
            // If empty regex (e.g. no comments), just push string
            if (regex.source === '(?:)') {
                 output.push(part);
                 return;
            }
            
            const split = part.split(regex);
            split.forEach((s) => {
                if (!s) return;
                // Check if it matches the regex
                if (s.match(regex)) {
                    // Specific check for Find Query to allow case-insensitive styling if needed, or just standard
                    output.push(
                        <span 
                            key={Math.random()} 
                            className={className}
                        >
                            {s}
                        </span>
                    );
                } else {
                    output.push(s);
                }
            });
        });
        return output;
    };

    if (!lang) return content;

    // 1. Strings (Highest priority usually, except search)
    tokens = applyToken(tokens, lang.strings, 'text-green-400');
    
    // 2. Comments 
    tokens = applyToken(tokens, lang.comments, 'text-gray-500');

    // 3. Search Query (High priority, overrides code color if we want, but might be inside strings/comments)
    // To make search highlight visible OVER strings/comments, we would need to parse inside them.
    // For simplicity in this lightweight editor, we will apply search highlighting LAST on string parts, 
    // but React elements (already tokenized strings/comments) won't be re-scanned. 
    // This means Find won't highlight inside comments/strings with this simple stack.
    // To fix: We should prioritize Search.
    
    // Reset tokens for correct order: Search -> Comments -> Strings -> Keywords
    tokens = [content];
    
    if (findQuery) {
        const searchRegex = new RegExp(`(${escapeRegExp(findQuery)})`, 'gi');
        tokens = applyToken(tokens, searchRegex, 'bg-yellow-500/50 text-white rounded-[1px]');
    }

    // Now apply syntax to remaining strings
    tokens = applyToken(tokens, lang.strings, 'text-green-400');
    tokens = applyToken(tokens, lang.comments, 'text-gray-500');
    
    if (lang.meta) tokens = applyToken(tokens, lang.meta, 'text-yellow-400');
    if (language === 'html') tokens = applyToken(tokens, lang.keywords, 'text-blue-400');
    else tokens = applyToken(tokens, lang.keywords, 'text-purple-400');
    
    if (language === 'css') tokens = applyToken(tokens, lang.keywords, 'text-blue-300');
    
    tokens = applyToken(tokens, lang.numbers, 'text-orange-400');

    return tokens;

  }, [content, language, findQuery]);

  const availableFiles = showOpenDialog ? getAllFiles() : [];

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-mono relative" onClick={() => setShowLangMenu(false)}>
      
      {/* Menu Bar */}
      <div ref={menuRef} className="h-8 bg-[#2d2d2d] flex items-center px-2 text-xs select-none border-b border-[#111] shrink-0 relative z-20">
          <div className="flex gap-1 mr-4">
              <div className="relative">
                  <span 
                    onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                    className={`cursor-pointer px-3 py-1 rounded hover:bg-[#3e3e42] ${activeMenu === 'file' ? 'bg-[#3e3e42] text-white' : ''}`}
                  >
                      File
                  </span>
                  {activeMenu === 'file' && (
                      <div className="absolute top-full left-0 w-48 bg-[#252526] border border-[#454545] shadow-xl py-1 rounded-b-md text-[#cccccc] animate-in fade-in duration-100">
                          <div onClick={() => { setShowOpenDialog(true); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex justify-between">
                              <span>Open...</span> <span className="text-xs opacity-50">Ctrl+O</span>
                          </div>
                          <div onClick={() => { handleSave(); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex justify-between">
                              <span>Save</span> <span className="text-xs opacity-50">Ctrl+S</span>
                          </div>
                          <div onClick={handleSaveAsInit} className="px-4 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer">
                              <span>Save As...</span>
                          </div>
                          <div className="h-[1px] bg-[#454545] my-1"></div>
                          <div onClick={() => setActiveMenu(null)} className="px-4 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer">
                              <span>Exit</span>
                          </div>
                      </div>
                  )}
              </div>

              <div className="relative">
                  <span 
                    onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                    className={`cursor-pointer px-3 py-1 rounded hover:bg-[#3e3e42] ${activeMenu === 'edit' ? 'bg-[#3e3e42] text-white' : ''}`}
                  >
                      Edit
                  </span>
                  {activeMenu === 'edit' && (
                      <div className="absolute top-full left-0 w-48 bg-[#252526] border border-[#454545] shadow-xl py-1 rounded-b-md text-[#cccccc] animate-in fade-in duration-100">
                           <div onClick={handleFindToggle} className="px-4 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex justify-between">
                              <span>Find</span> <span className="text-xs opacity-50">Ctrl+F</span>
                          </div>
                          <div onClick={handleSelectAll} className="px-4 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer flex justify-between">
                              <span>Select All</span> <span className="text-xs opacity-50">Ctrl+A</span>
                          </div>
                      </div>
                  )}
              </div>

              <span className="cursor-pointer px-3 py-1 rounded hover:bg-[#3e3e42]">View</span>
          </div>
          <div className="flex-1 text-center opacity-50 truncate px-4">{currentPath || 'Untitled'}</div>
      </div>

      {/* Toolbar */}
      <div className="h-10 bg-[#252526] flex items-center px-2 gap-2 shrink-0 border-b border-[#111]">
        <button onClick={() => setShowOpenDialog(true)} className="p-1.5 hover:bg-[#3e3e42] rounded text-gray-300" title="Open">
          <FolderOpen size={16} />
        </button>
        <button onClick={handleSave} className="p-1.5 hover:bg-[#3e3e42] rounded text-gray-300" title="Save">
          <Save size={16} />
        </button>
        <button onClick={handleSaveAsInit} className="p-1.5 hover:bg-[#3e3e42] rounded text-gray-300" title="Save As">
          <FilePlus size={16} />
        </button>
        <div className="w-[1px] h-4 bg-[#3e3e42] mx-1"></div>
        <button onClick={handleFindToggle} className={`p-1.5 rounded text-gray-300 ${showFind ? 'bg-[#3e3e42] text-white' : 'hover:bg-[#3e3e42]'}`} title="Find">
          <Search size={16} />
        </button>
        
        {/* Find Bar */}
        {showFind && (
            <div className="flex items-center gap-1 ml-2 bg-[#1e1e1e] border border-[#007fd4] rounded px-1 animate-in slide-in-from-left-2 duration-200">
                <input 
                    type="text" 
                    value={findQuery}
                    onChange={(e) => setFindQuery(e.target.value)}
                    placeholder="Find..."
                    className="bg-transparent border-none outline-none text-white text-xs py-1 px-1 w-32"
                    autoFocus
                />
                <button onClick={() => { setShowFind(false); setFindQuery(''); }} className="p-0.5 hover:bg-white/10 rounded">
                    <X size={12} />
                </button>
            </div>
        )}

        <div className="w-[1px] h-4 bg-[#3e3e42] mx-1 ml-auto"></div>
        <span className="text-xs text-green-500 truncate max-w-[150px]">{statusMsg}</span>
      </div>

      {/* Editor Area with Overlay */}
      <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
        {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#1e1e1e]">
                <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
                <span className="text-gray-400 text-xs">Loading file content...</span>
            </div>
        ) : (
            <>
                {/* Highlight Layer */}
                <pre 
                    ref={preRef}
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full p-4 m-0 font-mono text-sm leading-6 whitespace-pre pointer-events-none overflow-hidden"
                >
                    {highlightedContent}
                    <br />
                </pre>
                
                {/* Interactive Layer */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onScroll={handleScroll}
                    className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 whitespace-pre bg-transparent text-transparent caret-white resize-none outline-none selection:bg-white/20"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                />
            </>
        )}
      </div>

      {/* Open Dialog */}
      {showOpenDialog && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-[#252526] w-96 max-h-[80%] flex flex-col shadow-2xl border border-[#007fd4]">
                <div className="p-2 border-b border-[#3e3e42] flex justify-between items-center text-sm font-bold text-white">
                    <span>Open File</span>
                    <button onClick={() => setShowOpenDialog(false)}><X size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                    {availableFiles.map(f => (
                        <div key={f.path} onClick={() => handleOpen(f)} className="p-1.5 px-3 text-sm hover:bg-[#2a2d2e] cursor-pointer flex items-center gap-2 text-gray-300">
                             <FileText size={12} className="opacity-50" />
                             <span className="truncate flex-1">{f.name}</span>
                             <span className="text-xs text-gray-600 truncate max-w-[100px]">{f.path}</span>
                        </div>
                    ))}
                    {availableFiles.length === 0 && <div className="p-4 text-center text-gray-500 text-xs">No files found</div>}
                </div>
            </div>
          </div>
      )}

      {/* Save As Dialog */}
      {showSaveAsDialog && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-[#252526] w-96 flex flex-col shadow-2xl border border-[#007fd4] p-4 gap-4">
                <h3 className="text-sm font-bold text-white">Save As</h3>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">File Path</label>
                    <input 
                        type="text"
                        value={saveAsPath}
                        onChange={(e) => setSaveAsPath(e.target.value)}
                        className="w-full bg-[#3c3c3c] border border-[#555] focus:border-[#007fd4] text-white text-sm px-2 py-1 outline-none"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowSaveAsDialog(false)} className="px-3 py-1 bg-[#3e3e42] hover:bg-[#4e4e52] text-white text-xs rounded">Cancel</button>
                    <button onClick={handleSaveAsConfirm} className="px-3 py-1 bg-[#007fd4] hover:bg-[#0060a0] text-white text-xs rounded">Save</button>
                </div>
            </div>
          </div>
      )}
      
      {/* Status Bar */}
      <div className="h-6 bg-[#007fd4] flex items-center px-3 text-xs text-white justify-between select-none shrink-0 relative z-10">
          <div className="flex gap-4">
              <span>Ln {content.substring(0, textareaRef.current?.selectionStart || 0).split('\n').length}, Col {(textareaRef.current?.selectionStart || 0) - content.lastIndexOf('\n', (textareaRef.current?.selectionStart || 0) - 1) - 1}</span>
              <span>UTF-8</span>
          </div>
          
          <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }}
                className="hover:bg-white/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
              >
                  {LANGUAGES[language]?.name || 'Plain Text'}
                  <ChevronDown size={10} />
              </button>

              {/* Language Selector Menu */}
              {showLangMenu && (
                  <div className="absolute bottom-full right-0 mb-1 w-40 bg-[#252526] border border-[#3e3e42] shadow-xl py-1 rounded max-h-60 overflow-y-auto custom-scrollbar">
                      {Object.keys(LANGUAGES).map(key => (
                          <div 
                            key={key}
                            onClick={() => { setLanguage(key); setShowLangMenu(false); }}
                            className="px-3 py-1.5 hover:bg-[#094771] cursor-pointer flex items-center justify-between group"
                          >
                              <span>{LANGUAGES[key].name}</span>
                              {language === key && <Check size={12} />}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default TextEditor;
