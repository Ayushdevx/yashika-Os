import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOS } from '../../contexts/OSContext';
import {
    Plus, Search, Trash2, FileText, Eye, Edit2, Save, CheckSquare,
    List, Bold, Italic, MoreHorizontal, Star, ChevronRight, ChevronDown,
    Layout, Image as ImageIcon, Smile, Clock, Calendar
} from 'lucide-react';
import { AppProps } from '../../types';

// --- Types & Constants ---

interface NoteMetadata {
    id: string;
    title: string;
    icon: string;
    cover: string;
    favorite: boolean;
    lastModified: number;
    type: 'text' | 'todo';
}

interface Note extends NoteMetadata {
    content: string;
    filename: string;
}

const DOCS_DIR = '/home/yashika/Documents';
const NOTES_DIR = '/home/yashika/Documents/Notes';

const COVERS = [
    'linear-gradient(to right, #ff7e5f, #feb47b)',
    'linear-gradient(to right, #6a11cb, #2575fc)',
    'linear-gradient(to right, #43e97b, #38f9d7)',
    'linear-gradient(to right, #fa709a, #fee140)',
    'linear-gradient(to right, #30cfd0, #330867)',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80',
];

const ICONS = ['📝', '✅', '💡', '🚀', '🎨', '📅', '📌', '💻', '🔒', '🎉'];

// --- Helper Functions ---

const getRandomCover = () => COVERS[Math.floor(Math.random() * COVERS.length)];
const getRandomIcon = () => ICONS[Math.floor(Math.random() * ICONS.length)];

const parseNoteFile = (filename: string, fileContent: string): Note => {
    // Simple parsing strategy: 
    // If file starts with { "metadata": ... }, parse as JSON
    // Else treat as legacy text file

    try {
        if (fileContent.trim().startsWith('{')) {
            const data = JSON.parse(fileContent);
            if (data.metadata && data.content !== undefined) {
                return {
                    ...data.metadata,
                    content: data.content,
                    filename
                };
            }
        }
    } catch (e) {
        // Fallback to legacy
    }

    // Legacy fallback
    const firstLine = fileContent.split('\n')[0].replace(/^#+\s*/, '').trim();
    const isTodo = filename.endsWith('.todo');

    return {
        id: filename,
        filename,
        title: firstLine || 'Untitled Note',
        content: fileContent,
        lastModified: Date.now(), // We don't have real file stats here easily without extra FS calls
        type: isTodo ? 'todo' : 'text',
        icon: isTodo ? '✅' : '📝',
        cover: getRandomCover(),
        favorite: false
    };
};

const serializeNote = (note: Note): string => {
    const { content, filename, ...metadata } = note;
    return JSON.stringify({ metadata, content }, null, 2);
};

// --- Components ---

const Notes: React.FC<AppProps> = () => {
    const { fs } = useOS();
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({ favorites: true, all: true });

    // Derived state
    const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId), [notes, activeNoteId]);

    const filteredNotes = useMemo(() => {
        if (!searchQuery) return notes;
        const q = searchQuery.toLowerCase();
        return notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }, [notes, searchQuery]);

    const favoriteNotes = useMemo(() => filteredNotes.filter(n => n.favorite), [filteredNotes]);
    const otherNotes = useMemo(() => filteredNotes.filter(n => !n.favorite), [filteredNotes]);

    // --- Effects ---

    useEffect(() => {
        const init = () => {
            if (!fs.readDirectory(DOCS_DIR)) fs.makeDirectory(DOCS_DIR);
            if (!fs.readDirectory(NOTES_DIR)) fs.makeDirectory(NOTES_DIR);
            loadNotes();
        };
        init();
    }, []);

    // Auto-save
    useEffect(() => {
        if (!activeNote) return;

        const timeout = setTimeout(() => {
            setIsSaving(true);
            try {
                const contentToSave = serializeNote(activeNote);
                fs.writeFile(`${NOTES_DIR}/${activeNote.filename}`, contentToSave);
                setTimeout(() => setIsSaving(false), 500);
            } catch (e) {
                console.error("Save failed", e);
            }
        }, 800);

        return () => clearTimeout(timeout);
    }, [activeNote]);

    // --- Actions ---

    const loadNotes = () => {
        const items = fs.readDirectory(NOTES_DIR);
        if (items) {
            const loaded = items
                .filter(i => i.type === 'file')
                .map(item => {
                    const content = fs.readFile(`${NOTES_DIR}/${item.name}`) || '';
                    const note = parseNoteFile(item.name, content);
                    note.lastModified = item.createdAt; // Use FS timestamp if available
                    return note;
                })
                .sort((a, b) => b.lastModified - a.lastModified);
            setNotes(loaded);
        }
    };

    const createNote = (type: 'text' | 'todo' = 'text') => {
        const id = `note-${Date.now()}`;
        const filename = `${id}.json`; // Use .json for new format
        const newNote: Note = {
            id,
            filename,
            title: '',
            content: '',
            type,
            icon: type === 'todo' ? '✅' : getRandomIcon(),
            cover: getRandomCover(),
            favorite: false,
            lastModified: Date.now()
        };

        setNotes([newNote, ...notes]);
        setActiveNoteId(id);

        // Initial save
        fs.writeFile(`${NOTES_DIR}/${filename}`, serializeNote(newNote));
    };

    const updateActiveNote = (updates: Partial<Note>) => {
        if (!activeNoteId) return;
        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, ...updates, lastModified: Date.now() } : n));
    };

    const deleteNote = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const note = notes.find(n => n.id === id);
        if (note) {
            fs.deleteItem(`${NOTES_DIR}/${note.filename}`);
            setNotes(prev => prev.filter(n => n.id !== id));
            if (activeNoteId === id) setActiveNoteId(null);
        }
    };

    const toggleFavorite = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n));
    };

    // --- Render Helpers ---

    const renderNoteItem = (note: Note) => (
        <div
            key={note.id}
            onClick={() => setActiveNoteId(note.id)}
            className={`
                group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all mb-1
                ${activeNoteId === note.id ? 'bg-[#2c2c30] text-white' : 'text-gray-400 hover:bg-[#2c2c30]/50 hover:text-gray-200'}
            `}
        >
            <span className="text-lg">{note.icon}</span>
            <span className="flex-1 truncate text-sm font-medium">{note.title || 'Untitled'}</span>
            {activeNoteId === note.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => toggleFavorite(note.id, e)} className="p-1 hover:bg-gray-600 rounded">
                        <Star size={12} className={note.favorite ? "fill-yellow-500 text-yellow-500" : ""} />
                    </button>
                    <button onClick={(e) => deleteNote(note.id, e)} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded">
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full flex bg-[#191919] text-gray-200 font-sans overflow-hidden">
            {/* Sidebar */}
            <div
                className={`
                    flex-shrink-0 bg-[#202020] border-r border-[#2c2c30] flex flex-col transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'w-64' : 'w-0 opacity-0 overflow-hidden'}
                `}
            >
                {/* Sidebar Header */}
                <div className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-2 font-bold text-gray-300">
                        <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center text-xs font-bold">N</div>
                        <span>Yashika Notes</span>
                    </div>
                    <button onClick={() => createNote()} className="p-1 hover:bg-[#2c2c30] rounded text-gray-400 hover:text-white transition-colors">
                        <Plus size={18} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-3 mb-4">
                    <div className="relative group">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-[#2c2c30] text-sm text-gray-200 pl-8 pr-3 py-1.5 rounded-md outline-none border border-transparent focus:border-blue-500/50 transition-all placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
                    {/* Favorites Section */}
                    {favoriteNotes.length > 0 && (
                        <div className="mb-4">
                            <button
                                onClick={() => setExpandedSections(p => ({ ...p, favorites: !p.favorites }))}
                                className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 hover:text-gray-300 w-full text-left"
                            >
                                {expandedSections.favorites ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                Favorites
                            </button>
                            {expandedSections.favorites && (
                                <div className="space-y-0.5 animate-in slide-in-from-left-2 duration-200">
                                    {favoriteNotes.map(renderNoteItem)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Notes Section */}
                    <div>
                        <button
                            onClick={() => setExpandedSections(p => ({ ...p, all: !p.all }))}
                            className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 hover:text-gray-300 w-full text-left"
                        >
                            {expandedSections.all ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            Private
                        </button>
                        {expandedSections.all && (
                            <div className="space-y-0.5 animate-in slide-in-from-left-2 duration-200">
                                {otherNotes.map(renderNoteItem)}
                                {otherNotes.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-gray-600 italic">No notes yet</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-[#2c2c30]">
                    <button onClick={() => createNote('todo')} className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#2c2c30] text-gray-400 hover:text-white text-sm transition-colors">
                        <CheckSquare size={16} />
                        <span>New Todo List</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Top Bar */}
                <div className="h-12 flex items-center justify-between px-4 absolute top-0 left-0 right-0 z-10 bg-transparent hover:bg-[#191919] transition-colors group">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-[#2c2c30] rounded text-gray-400">
                                <Layout size={18} />
                            </button>
                        )}
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            {activeNote && (
                                <>
                                    <span>Last edited {new Date(activeNote.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isSaving && <span className="text-gray-400">Saving...</span>}
                                </>
                            )}
                        </div>
                    </div>

                    {activeNote && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleFavorite(activeNote.id)} className={`p-1.5 rounded hover:bg-[#2c2c30] ${activeNote.favorite ? 'text-yellow-500' : 'text-gray-400'}`}>
                                <Star size={16} className={activeNote.favorite ? "fill-current" : ""} />
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#2c2c30] text-gray-400">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {activeNote ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Cover Image */}
                        <div className="h-48 w-full relative group">
                            {activeNote.cover.startsWith('http') ? (
                                <img src={activeNote.cover} className="w-full h-full object-cover" alt="cover" />
                            ) : (
                                <div className="w-full h-full" style={{ background: activeNote.cover }} />
                            )}
                            <button
                                onClick={() => updateActiveNote({ cover: getRandomCover() })}
                                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2"
                            >
                                <ImageIcon size={12} /> Change Cover
                            </button>
                        </div>

                        {/* Note Content Container */}
                        <div className="max-w-3xl mx-auto px-12 -mt-12 relative pb-20">
                            {/* Icon */}
                            <div className="group relative w-24 h-24 mb-8">
                                <div className="text-[72px] leading-none select-none cursor-pointer hover:opacity-80 transition-opacity" onClick={() => updateActiveNote({ icon: getRandomIcon() })}>
                                    {activeNote.icon}
                                </div>
                                <button
                                    onClick={() => updateActiveNote({ icon: getRandomIcon() })}
                                    className="absolute -top-2 -right-2 bg-[#2c2c30] text-gray-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <Smile size={14} />
                                </button>
                            </div>

                            {/* Title */}
                            <input
                                value={activeNote.title}
                                onChange={(e) => updateActiveNote({ title: e.target.value })}
                                placeholder="Untitled"
                                className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 outline-none mb-8"
                            />

                            {/* Editor Body */}
                            <div className="min-h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {activeNote.type === 'todo' ? (
                                    <TodoList
                                        content={activeNote.content}
                                        onChange={(newContent) => updateActiveNote({ content: newContent })}
                                    />
                                ) : (
                                    <textarea
                                        value={activeNote.content}
                                        onChange={(e) => updateActiveNote({ content: e.target.value })}
                                        placeholder="Type '/' for commands..."
                                        className="w-full h-full bg-transparent text-gray-300 text-lg leading-relaxed outline-none resize-none font-sans"
                                        style={{ minHeight: '60vh' }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-[#2c2c30] rounded-xl flex items-center justify-center mb-4 shadow-xl">
                            <FileText size={32} className="opacity-50" />
                        </div>
                        <p className="text-lg font-medium text-gray-400">Select a note to view</p>
                        <p className="text-sm opacity-60">or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-components ---

const TodoList: React.FC<{ content: string; onChange: (c: string) => void }> = ({ content, onChange }) => {
    const items = useMemo(() => {
        return content.split('\n').filter(l => l.trim()).map(line => ({
            checked: line.startsWith('- [x]'),
            text: line.replace(/^- \[[ x]\] /, '')
        }));
    }, [content]);

    const toggleItem = (index: number) => {
        const newItems = [...items];
        newItems[index].checked = !newItems[index].checked;
        onChange(newItems.map(i => `- [${i.checked ? 'x' : ' '}] ${i.text}`).join('\n'));
    };

    const updateText = (index: number, text: string) => {
        const newItems = [...items];
        newItems[index].text = text;
        onChange(newItems.map(i => `- [${i.checked ? 'x' : ' '}] ${i.text}`).join('\n'));
    };

    const addItem = () => {
        onChange(content + '\n- [ ] ');
    };

    const deleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems.map(i => `- [${i.checked ? 'x' : ' '}] ${i.text}`).join('\n'));
    };

    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                    <button
                        onClick={() => toggleItem(i)}
                        className={`
                            mt-1.5 w-5 h-5 rounded border flex items-center justify-center transition-all
                            ${item.checked ? 'bg-blue-500 border-blue-500' : 'border-gray-600 hover:border-gray-400'}
                        `}
                    >
                        {item.checked && <CheckSquare size={14} className="text-white" />}
                    </button>
                    <input
                        value={item.text}
                        onChange={(e) => updateText(i, e.target.value)}
                        className={`
                            flex-1 bg-transparent outline-none text-lg transition-all
                            ${item.checked ? 'text-gray-500 line-through' : 'text-gray-200'}
                        `}
                        placeholder="To-do item"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addItem();
                            }
                            if (e.key === 'Backspace' && item.text === '') {
                                e.preventDefault();
                                deleteItem(i);
                            }
                        }}
                    />
                    <button onClick={() => deleteItem(i)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-opacity">
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            <button
                onClick={addItem}
                className="flex items-center gap-3 text-gray-500 hover:text-gray-300 transition-colors mt-2 px-1"
            >
                <Plus size={16} />
                <span>Add item</span>
            </button>
        </div>
    );
};

export default Notes;
