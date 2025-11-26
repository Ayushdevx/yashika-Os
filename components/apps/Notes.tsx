
import React, { useState, useEffect, useMemo } from 'react';
import { useOS } from '../../contexts/OSContext';
import { Plus, Search, Trash2, FileText, Eye, Edit2, Save, MoreVertical } from 'lucide-react';
import { AppProps } from '../../types';

interface Note {
  filename: string;
  title: string;
  content: string;
  lastModified: number;
}

const NOTES_DIR = '/home/yashika/Documents/Notes';

const Notes: React.FC<AppProps> = () => {
  const { fs } = useOS();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteFile, setActiveNoteFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize directory and load notes
  useEffect(() => {
    const init = () => {
      // Ensure directory exists
      const existing = fs.readDirectory(NOTES_DIR);
      if (!existing) {
        fs.makeDirectory(NOTES_DIR);
      }
      loadNotes();
    };
    init();
  }, []); // Run once on mount

  // Reload notes when active file changes or fs updates (though we handle local state updates optimistically)
  const loadNotes = () => {
    const items = fs.readDirectory(NOTES_DIR);
    if (items) {
      const loadedNotes: Note[] = items
        .filter(i => i.type === 'file')
        .map(item => {
          const fileContent = fs.readFile(`${NOTES_DIR}/${item.name}`) || '';
          // Title is first line of content, or filename if empty
          const firstLine = fileContent.split('\n')[0].replace(/^#+\s*/, '').trim();
          return {
            filename: item.name,
            title: firstLine || 'Untitled Note',
            content: fileContent,
            lastModified: item.createdAt // Using creation time as proxy for now, ideally fs has mtime
          };
        })
        .sort((a, b) => b.lastModified - a.lastModified);
      setNotes(loadedNotes);
      
      // Select first note if none selected
      if (!activeNoteFile && loadedNotes.length > 0) {
          setActiveNoteFile(loadedNotes[0].filename);
          setContent(loadedNotes[0].content);
      }
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!activeNoteFile) return;

    const timeout = setTimeout(() => {
      if (activeNoteFile) {
        setIsSaving(true);
        fs.writeFile(`${NOTES_DIR}/${activeNoteFile}`, content);
        
        // Update local list state to reflect changes (e.g. title change)
        setNotes(prev => prev.map(n => {
            if (n.filename === activeNoteFile) {
                const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
                return { ...n, content, title: firstLine || 'Untitled Note' };
            }
            return n;
        }));
        
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [content, activeNoteFile]);

  const handleCreateNote = () => {
    const timestamp = Date.now();
    const filename = `note-${timestamp}.txt`;
    const defaultContent = '# New Note\n\nStart typing...';
    
    fs.writeFile(`${NOTES_DIR}/${filename}`, defaultContent);
    
    const newNote = {
        filename,
        title: 'New Note',
        content: defaultContent,
        lastModified: timestamp
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteFile(filename);
    setContent(defaultContent);
    setIsPreviewMode(false);
  };

  const handleDeleteNote = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    fs.deleteItem(`${NOTES_DIR}/${filename}`);
    
    const newNotes = notes.filter(n => n.filename !== filename);
    setNotes(newNotes);
    
    if (activeNoteFile === filename) {
        if (newNotes.length > 0) {
            setActiveNoteFile(newNotes[0].filename);
            setContent(newNotes[0].content);
        } else {
            setActiveNoteFile(null);
            setContent('');
        }
    }
  };

  const handleSelectNote = (note: Note) => {
      setActiveNoteFile(note.filename);
      setContent(note.content);
      setIsPreviewMode(false);
  };

  const filteredNotes = useMemo(() => {
      if (!searchQuery) return notes;
      const lowerQ = searchQuery.toLowerCase();
      return notes.filter(n => 
          n.title.toLowerCase().includes(lowerQ) || 
          n.content.toLowerCase().includes(lowerQ)
      );
  }, [notes, searchQuery]);

  // Simple Markdown Renderer
  const renderMarkdown = (text: string) => {
      return text.split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-4 mt-2 text-white">{line.replace('# ', '')}</h1>;
          if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-3 mt-2 text-gray-200">{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mb-2 mt-1 text-gray-300">{line.replace('### ', '')}</h3>;
          if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-gray-300">{line.replace('- ', '')}</li>;
          if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-yellow-500 pl-4 italic text-gray-400 my-2">{line.replace('> ', '')}</blockquote>;
          if (line.trim() === '') return <br key={i}/>;
          return <p key={i} className="mb-1 text-gray-300 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="h-full flex bg-[#1e1e1e] text-gray-200 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#18181b] border-r border-[#27272a] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-200 flex items-center gap-2">
                    <FileText className="text-yellow-500" size={18} />
                    Notes
                </h2>
                <button 
                    onClick={handleCreateNote}
                    className="p-1.5 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 rounded transition-colors"
                    title="New Note"
                >
                    <Plus size={16} />
                </button>
            </div>
            
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes..."
                    className="w-full bg-[#27272a] text-sm text-gray-200 pl-9 pr-3 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-yellow-500/50 placeholder-gray-600"
                />
            </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto">
            {filteredNotes.map(note => (
                <div 
                    key={note.filename}
                    onClick={() => handleSelectNote(note)}
                    className={`
                        group p-4 border-b border-[#27272a] cursor-pointer transition-all
                        ${activeNoteFile === note.filename ? 'bg-[#27272a]' : 'hover:bg-[#27272a]/50'}
                    `}
                >
                    <h3 className={`font-semibold text-sm mb-1 truncate ${activeNoteFile === note.filename ? 'text-white' : 'text-gray-300'}`}>
                        {note.title}
                    </h3>
                    <div className="flex items-center justify-between">
                         <p className="text-xs text-gray-500 truncate max-w-[140px]">
                             {note.content.substring(note.title.length).trim().substring(0, 50) || 'No additional text'}
                         </p>
                         <button 
                            onClick={(e) => handleDeleteNote(note.filename, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-gray-500 transition-opacity"
                         >
                             <Trash2 size={12} />
                         </button>
                    </div>
                </div>
            ))}
            {filteredNotes.length === 0 && (
                <div className="p-8 text-center text-gray-600 text-xs">
                    No notes found
                </div>
            )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e]">
         {activeNoteFile ? (
             <>
                {/* Toolbar */}
                <div className="h-12 border-b border-[#27272a] flex items-center justify-between px-6 bg-[#1e1e1e]">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{activeNoteFile}</span>
                        {isSaving && <span className="text-yellow-500 flex items-center gap-1"><Save size={10} /> Saving...</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors
                                ${isPreviewMode ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-400 hover:bg-[#27272a]'}
                            `}
                        >
                            {isPreviewMode ? <><Edit2 size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#27272a] rounded">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {isPreviewMode ? (
                        <div className="max-w-3xl mx-auto p-8 prose prose-invert prose-sm">
                            {renderMarkdown(content)}
                        </div>
                    ) : (
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full bg-[#1e1e1e] text-gray-300 p-8 outline-none resize-none leading-relaxed font-mono text-sm"
                            placeholder="Write something..."
                            spellCheck={false}
                        />
                    )}
                </div>
             </>
         ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                 <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center mb-4">
                     <FileText size={32} className="opacity-50" />
                 </div>
                 <p>Select a note or create a new one</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default Notes;
