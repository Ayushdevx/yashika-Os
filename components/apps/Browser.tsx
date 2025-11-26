
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, X, Plus, Search, Lock, ShieldAlert, Star, Briefcase, Users, MessageSquare, Bell, Heart, Share2, Bookmark, MoreHorizontal, Send, Bot, User, Compass, PlusSquare, Film, Menu } from 'lucide-react';
import { AppProps } from '../../types';
import { getChatResponse } from '../../services/geminiService';

interface Tab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
}

const DEFAULT_HOME = 'https://www.google.com/webhp?igu=1';

const Browser: React.FC<AppProps> = ({ params }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { 
      id: 'tab-1', 
      title: 'New Tab', 
      url: params?.url || DEFAULT_HOME, 
      history: [params?.url || DEFAULT_HOME], 
      historyIndex: 0,
      isLoading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [addressBarInput, setAddressBarInput] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // --- ChatGPT State ---
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([
      { role: 'ai', text: 'Hello! I am ChatGPT. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  useEffect(() => {
    setAddressBarInput(activeTab.url);
  }, [activeTab.url, activeTabId]);

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const navigate = (url: string) => {
    const newUrl = processUrl(url);
    const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
    newHistory.push(newUrl);

    updateTab(activeTabId, {
      url: newUrl,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isLoading: true
    });
  };

  const processUrl = (input: string): string => {
    let url = input.trim();
    
    const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
    const hasDomain = url.includes('.') && !url.includes(' ');

    if (!hasProtocol && hasDomain) {
      return `https://${url}`;
    }
    
    if (!hasProtocol && !hasDomain) {
      return `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
    }

    return url;
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      updateTab(activeTabId, {
        historyIndex: newIndex,
        url: activeTab.history[newIndex],
        isLoading: true
      });
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      updateTab(activeTabId, {
        historyIndex: newIndex,
        url: activeTab.history[newIndex],
        isLoading: true
      });
    }
  };

  const handleReload = () => {
    if (activeTab.url.includes('linkedin.com') || activeTab.url.includes('instagram.com') || activeTab.url.includes('chatgpt.com')) {
        updateTab(activeTabId, { isLoading: true });
        setTimeout(() => updateTab(activeTabId, { isLoading: false }), 600);
    } else if (iframeRef.current) {
        updateTab(activeTabId, { isLoading: true });
        setTimeout(() => {
            if (iframeRef.current) iframeRef.current.src = activeTab.url;
            updateTab(activeTabId, { isLoading: false });
        }, 100);
    }
  };

  const addTab = () => {
    const newId = `tab-${Date.now()}`;
    setTabs([...tabs, {
      id: newId,
      title: 'New Tab',
      url: DEFAULT_HOME,
      history: [DEFAULT_HOME],
      historyIndex: 0,
      isLoading: false
    }]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; 
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigate(addressBarInput);
    }
  };

  const handleIFrameLoad = () => {
    updateTab(activeTabId, { isLoading: false, title: 'External Page' });
  };

  const loadBookmark = (url: string) => {
      navigate(url);
  };

  // --- ChatGPT Logic ---
  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = chatInput;
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setChatInput('');
      setIsChatTyping(true);

      const response = await getChatResponse(userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsChatTyping(false);
  };

  // --- Render Content Logic ---
  const renderContent = () => {
      const url = activeTab.url.toLowerCase();

      if (url.includes('linkedin.com')) {
          return <MockLinkedIn />;
      }
      if (url.includes('instagram.com')) {
          return <MockInstagram />;
      }
      if (url.includes('chatgpt.com') || url.includes('openai.com')) {
          return (
              <div className="h-full flex flex-col bg-[#343541] text-gray-100 font-sans">
                  <div className="flex-1 overflow-y-auto">
                      {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`py-8 border-b border-black/10 dark:border-gray-900/50 ${msg.role === 'ai' ? 'bg-[#444654]' : 'bg-[#343541]'}`}>
                              <div className="max-w-3xl mx-auto flex gap-4 px-4">
                                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-teal-500' : 'bg-purple-600'}`}>
                                      {msg.role === 'ai' ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
                                  </div>
                                  <div className="leading-relaxed prose prose-invert">
                                      {msg.text}
                                  </div>
                              </div>
                          </div>
                      ))}
                      {isChatTyping && (
                          <div className="py-8 bg-[#444654] border-b border-black/10">
                              <div className="max-w-3xl mx-auto flex gap-4 px-4">
                                  <div className="w-8 h-8 bg-teal-500 rounded-sm flex items-center justify-center"><Bot size={20} /></div>
                                  <div className="flex gap-1 items-center h-full">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="p-4 border-t border-gray-600 bg-[#343541]">
                      <form onSubmit={handleChatSubmit} className="max-w-3xl mx-auto relative">
                          <input 
                              type="text" 
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              className="w-full bg-[#40414f] text-white rounded-md py-3 pl-4 pr-12 shadow-md border border-transparent focus:border-gray-500 outline-none resize-none"
                              placeholder="Send a message..."
                          />
                          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                              <Send size={16} />
                          </button>
                      </form>
                      <div className="text-xs text-gray-500 text-center mt-2">Free Research Preview. ChatGPT may produce inaccurate information about people, places, or facts.</div>
                  </div>
              </div>
          );
      }

      // Default IFrame
      return (
          <iframe
            ref={iframeRef}
            src={activeTab.url}
            title={activeTab.title}
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            onLoad={handleIFrameLoad}
          />
      );
  };

  return (
    <div className="h-full flex flex-col bg-[#1c1b22] text-gray-200 font-sans">
      {/* Tab Bar */}
      <div className="flex items-end px-2 pt-2 gap-1 bg-[#0c0c0d] overflow-x-auto select-none no-scrollbar">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 pr-8 rounded-t-lg text-xs max-w-[200px] min-w-[120px] cursor-pointer transition-colors
              ${activeTabId === tab.id ? 'bg-[#1c1b22] text-white font-medium shadow-sm' : 'bg-transparent text-gray-400 hover:bg-[#1c1b22]/50 hover:text-gray-200'}
            `}
          >
             <div className="w-3 h-3 rounded-full bg-blue-500/50"></div>
             <span className="truncate">
                 {tab.url.includes('linkedin') ? 'LinkedIn' : 
                  tab.url.includes('instagram') ? 'Instagram' :
                  tab.url.includes('chatgpt') ? 'ChatGPT' :
                  tab.title}
             </span>
             <button 
                onClick={(e) => closeTab(e, tab.id)}
                className={`absolute right-2 p-0.5 rounded-full hover:bg-white/20 ${tabs.length === 1 ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}
             >
               <X size={10} />
             </button>
          </div>
        ))}
        <button 
            onClick={addTab}
            className="p-1.5 hover:bg-white/10 rounded-full mb-1 text-gray-400 transition-colors"
        >
            <Plus size={14} />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="bg-[#1c1b22] p-2 flex items-center gap-2 border-b border-[#0c0c0d] shadow-sm z-10">
         <div className="flex items-center gap-1 text-gray-400">
            <button 
                onClick={handleBack} 
                disabled={activeTab.historyIndex === 0}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
                <ArrowLeft size={16} />
            </button>
            <button 
                onClick={handleForward}
                disabled={activeTab.historyIndex === activeTab.history.length - 1}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
                <ArrowRight size={16} />
            </button>
            <button onClick={handleReload} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                <RotateCw size={14} className={activeTab.isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => navigate(DEFAULT_HOME)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                <Home size={16} />
            </button>
         </div>

         {/* Address Bar */}
         <div className="flex-1 bg-[#2b2a33] rounded-md px-3 py-1.5 text-sm text-white flex items-center gap-2 border-2 border-transparent focus-within:border-blue-500 transition-colors group">
            {activeTab.url.startsWith('https') ? <Lock size={12} className="text-green-500" /> : <ShieldAlert size={12} className="text-gray-500" />}
            <input 
                type="text" 
                value={addressBarInput}
                onChange={(e) => setAddressBarInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-500"
                placeholder="Search with Google or enter address"
            />
            {activeTab.isLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
            <Star size={14} className="text-gray-500 hover:text-yellow-400 cursor-pointer" />
         </div>
         
         {/* Simple Menu / Bookmarks */}
         <div className="flex gap-1">
             <button onClick={() => loadBookmark('https://chatgpt.com')} title="ChatGPT" className="p-1.5 hover:bg-white/10 rounded text-gray-400">
                 AI
             </button>
             <button onClick={() => loadBookmark('https://www.instagram.com')} title="Instagram" className="p-1.5 hover:bg-white/10 rounded text-gray-400">
                 IG
             </button>
         </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 relative bg-white overflow-hidden">
          {renderContent()}
          
          {!(activeTab.url.includes('linkedin.com') || activeTab.url.includes('instagram.com') || activeTab.url.includes('chatgpt.com') || activeTab.url.includes('openai.com')) && (
            <div className="absolute top-0 left-0 right-0 p-2 bg-yellow-100 text-yellow-800 text-xs text-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                Note: Some websites block embedding. Use Wikipedia or Search for best results.
            </div>
          )}
      </div>
    </div>
  );
};

// --- Enhanced Mock Instagram ---

// Mock Data
const IG_USERS = [
  { id: 'user_me', username: 'yashika.sec', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop', name: 'Yashika Kainth' },
  { id: 'user1', username: 'mr.robot', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop', name: 'Elliot' },
  { id: 'user2', username: 'kali_linux', avatar: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=64&h=64&fit=crop', name: 'Kali Official' },
  { id: 'user3', username: 'zero_cool', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=64&h=64&fit=crop', name: 'Crash Override' },
  { id: 'user4', username: 'hack_planet', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop', name: 'Hacker' },
];

const IG_STORIES = [
    { id: 's1', user: IG_USERS[1], image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=400&h=800&fit=crop' },
    { id: 's2', user: IG_USERS[2], image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=800&fit=crop' },
    { id: 's3', user: IG_USERS[3], image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=800&fit=crop' },
    { id: 's4', user: IG_USERS[4], image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=800&fit=crop' },
];

const IG_POSTS = [
  { 
    id: 'p1', 
    user: IG_USERS[0], 
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', 
    likes: 1243, 
    caption: 'Late night penetration testing session. 💻 #cybersecurity #hacking #kali', 
    comments: [
      { user: 'mr.robot', text: 'Stay safe out there.' },
      { user: 'kali_linux', text: 'Nice setup!' }
    ],
    time: '2h'
  },
  { 
    id: 'p2', 
    user: IG_USERS[2], 
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', 
    likes: 856, 
    caption: 'New tools added to the repo. Check them out. 🔧 #opensource', 
    comments: [],
    time: '5h'
  },
  { 
    id: 'p3', 
    user: IG_USERS[3], 
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80', 
    likes: 2301, 
    caption: 'Analyzing the matrix code. It\'s beautiful. 🟢', 
    comments: [
        { user: 'acid_burn', text: 'Mess with the best, die like the rest.' }
    ],
    time: '1d'
  },
  { 
    id: 'p4', 
    user: IG_USERS[1], 
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', 
    likes: 543, 
    caption: 'Coffee and Code. The essentials.', 
    comments: [],
    time: '2d'
  },
];

const MockInstagram = () => {
    const [activePage, setActivePage] = useState<'home' | 'search' | 'explore' | 'messages' | 'notifications' | 'profile'>('home');
    const [viewingStory, setViewingStory] = useState<string | null>(null);

    return (
        <div className="flex h-full bg-black text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 md:w-64 border-r border-gray-800 flex flex-col p-3 flex-shrink-0">
                <div className="mb-8 px-2 md:px-4 pt-2 hidden md:block">
                    <div className="font-serif text-2xl tracking-wide">Instagram</div>
                </div>
                <div className="mb-8 px-2 md:px-4 pt-2 md:hidden">
                    <div className="font-serif text-xl">IG</div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <SidebarItem icon={<Home size={24} />} label="Home" active={activePage === 'home'} onClick={() => setActivePage('home')} />
                    <SidebarItem icon={<Search size={24} />} label="Search" active={activePage === 'search'} onClick={() => setActivePage('search')} />
                    <SidebarItem icon={<Compass size={24} />} label="Explore" active={activePage === 'explore'} onClick={() => setActivePage('explore')} />
                    <SidebarItem icon={<Film size={24} />} label="Reels" />
                    <SidebarItem icon={<MessageSquare size={24} />} label="Messages" active={activePage === 'messages'} onClick={() => setActivePage('messages')} />
                    <SidebarItem icon={<Heart size={24} />} label="Notifications" active={activePage === 'notifications'} onClick={() => setActivePage('notifications')} />
                    <SidebarItem icon={<PlusSquare size={24} />} label="Create" />
                    <SidebarItem 
                        icon={<div className="w-6 h-6 rounded-full overflow-hidden border border-white"><img src={IG_USERS[0].avatar} alt="me" className="w-full h-full object-cover"/></div>} 
                        label="Profile" 
                        active={activePage === 'profile'} 
                        onClick={() => setActivePage('profile')} 
                    />
                </div>
                
                <div className="mt-auto">
                    <SidebarItem icon={<Menu size={24} />} label="More" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex justify-center overflow-y-auto custom-scrollbar bg-black">
                <div className="w-full max-w-[630px] py-8 px-2 md:px-0">
                    {activePage === 'home' && (
                        <>
                            {/* Stories */}
                            <div className="flex gap-4 overflow-x-auto pb-4 mb-4 no-scrollbar">
                                {IG_STORIES.map((story) => (
                                    <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0" onClick={() => setViewingStory(story.id)}>
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-black border-2 border-black overflow-hidden">
                                                <img src={story.user.avatar} alt={story.user.username} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-300 w-16 truncate text-center">{story.user.username}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Feed */}
                            <div className="flex flex-col gap-4">
                                {IG_POSTS.map(post => (
                                    <Post key={post.id} post={post} />
                                ))}
                            </div>
                        </>
                    )}

                    {activePage === 'profile' && <ProfileView />}
                    {(activePage !== 'home' && activePage !== 'profile') && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Feature not implemented in this simulation.
                        </div>
                    )}
                </div>
            </div>

            {/* Story Viewer Overlay */}
            {viewingStory && (
                <StoryViewer 
                    storyId={viewingStory} 
                    onClose={() => setViewingStory(null)} 
                    onNext={() => {
                        const idx = IG_STORIES.findIndex(s => s.id === viewingStory);
                        if (idx < IG_STORIES.length - 1) setViewingStory(IG_STORIES[idx + 1].id);
                        else setViewingStory(null);
                    }}
                />
            )}
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all group ${active ? 'font-bold' : 'hover:bg-white/5'}`}
    >
        <div className={`group-hover:scale-105 transition-transform ${active ? 'scale-105' : ''}`}>{icon}</div>
        <span className="hidden md:block text-sm">{label}</span>
    </div>
);

const Post = ({ post }: any) => {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showHeart, setShowHeart] = useState(false);

    const handleDoubleClick = () => {
        setLiked(true);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
    };

    return (
        <div className="border-b border-gray-800 pb-5 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                        <img src={post.user.avatar} alt={post.user.username} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-sm">{post.user.username}</span>
                    <span className="text-gray-500 text-xs">• {post.time}</span>
                </div>
                <MoreHorizontal size={20} className="text-gray-300 cursor-pointer" />
            </div>

            {/* Image */}
            <div className="aspect-square bg-gray-900 rounded overflow-hidden relative cursor-pointer border border-gray-800" onDoubleClick={handleDoubleClick}>
                <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${showHeart ? 'opacity-100' : 'opacity-0'}`}>
                    <Heart size={100} className="text-white fill-white drop-shadow-2xl animate-bounce" />
                </div>
            </div>

            {/* Actions */}
            <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-4">
                        <button onClick={() => setLiked(!liked)} className="hover:opacity-60 transition-opacity">
                            <Heart size={24} className={liked ? 'text-red-500 fill-red-500' : 'text-white'} />
                        </button>
                        <button className="hover:opacity-60 transition-opacity"><MessageSquare size={24} /></button>
                        <button className="hover:opacity-60 transition-opacity"><Send size={24} /></button>
                    </div>
                    <button onClick={() => setSaved(!saved)} className="hover:opacity-60 transition-opacity">
                        <Bookmark size={24} className={saved ? 'text-white fill-white' : 'text-white'} />
                    </button>
                </div>
                
                <div className="font-bold text-sm mb-1">{liked ? post.likes + 1 : post.likes} likes</div>
                
                <div className="text-sm mb-2">
                    <span className="font-bold mr-2">{post.user.username}</span>
                    {post.caption}
                </div>

                {post.comments.length > 0 && (
                    <div className="text-gray-500 text-sm mb-2 cursor-pointer">View all {post.comments.length} comments</div>
                )}
                
                <div className="flex items-center gap-2 mt-2">
                    <input type="text" placeholder="Add a comment..." className="bg-transparent text-sm flex-1 outline-none text-white placeholder-gray-500" />
                    <span className="text-blue-500 text-xs font-bold cursor-pointer hover:text-white">Post</span>
                </div>
            </div>
        </div>
    );
};

const StoryViewer = ({ storyId, onClose, onNext }: any) => {
    const story = IG_STORIES.find(s => s.id === storyId);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    onNext();
                    return 0;
                }
                return p + 1;
            });
        }, 50); // 5 seconds duration
        return () => clearInterval(interval);
    }, [storyId, onNext]);

    if (!story) return null;

    return (
        <div className="absolute inset-0 z-50 bg-[#1a1a1a] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-full w-full md:w-[400px] md:h-[85vh] bg-black md:rounded-xl overflow-hidden flex flex-col">
                {/* Progress Bar */}
                <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
                    {IG_STORIES.map(s => (
                        <div key={s.id} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div 
                                className={`h-full bg-white transition-all duration-100 ease-linear ${s.id === storyId ? 'w-full' : (IG_STORIES.findIndex(x => x.id === s.id) < IG_STORIES.findIndex(x => x.id === storyId) ? 'w-full' : 'w-0')}`}
                                style={s.id === storyId ? { width: `${progress}%` } : {}}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 flex items-center gap-2 z-20">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50">
                        <img src={story.user.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-sm font-bold">{story.user.username}</span>
                    <span className="text-gray-300 text-xs">3h</span>
                </div>

                <div className="absolute top-8 right-4 z-20 cursor-pointer" onClick={onClose}>
                    <X size={24} className="text-white" />
                </div>

                {/* Image */}
                <img src={story.image} alt="" className="w-full h-full object-cover" onClick={onNext} />

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 bg-gradient-to-t from-black/80 to-transparent">
                    <input type="text" placeholder={`Reply to ${story.user.username}...`} className="bg-transparent border border-white/50 rounded-full px-4 py-2 text-white text-sm flex-1 outline-none placeholder-white/70" />
                    <button className="p-2"><Heart size={24} className="text-white" /></button>
                    <button className="p-2"><Send size={24} className="text-white" /></button>
                </div>
            </div>
        </div>
    );
};

const ProfileView = () => (
    <div className="flex flex-col items-center text-white pt-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex gap-8 md:gap-16 items-center mb-8 px-4 w-full max-w-2xl">
            <div className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-gray-800 p-[2px] border border-gray-700 overflow-hidden flex-shrink-0">
                <img src={IG_USERS[0].avatar} alt="" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-4 items-center flex-wrap">
                    <span className="text-xl font-light">{IG_USERS[0].username}</span>
                    <div className="flex gap-2">
                        <button className="bg-[#363636] hover:bg-[#262626] px-4 py-1.5 rounded-lg text-sm font-bold">Edit profile</button>
                        <button className="bg-[#363636] hover:bg-[#262626] px-4 py-1.5 rounded-lg text-sm font-bold">View Archive</button>
                    </div>
                </div>
                <div className="flex gap-6 text-sm md:text-base">
                    <span><span className="font-bold">12</span> posts</span>
                    <span><span className="font-bold">864</span> followers</span>
                    <span><span className="font-bold">420</span> following</span>
                </div>
                <div className="text-sm">
                    <div className="font-bold">{IG_USERS[0].name}</div>
                    <div className="text-gray-300">
                        Cybersecurity Researcher 🛡️<br/>
                        CTF Player 🚩<br/>
                        Kali Linux Enthusiast 🐧<br/>
                        <span className="text-blue-400">github.com/yashika</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="border-t border-gray-800 w-full">
            <div className="flex justify-center gap-12 text-xs font-bold tracking-widest text-gray-500 uppercase border-t border-transparent -mt-[1px]">
                <div className="border-t border-white text-white py-4 flex items-center gap-2"><PlusSquare size={12} /> Posts</div>
                <div className="py-4 flex items-center gap-2 cursor-pointer hover:text-gray-300"><Bookmark size={12} /> Saved</div>
                <div className="py-4 flex items-center gap-2 cursor-pointer hover:text-gray-300"><User size={12} /> Tagged</div>
            </div>
            
            <div className="grid grid-cols-3 gap-1 md:gap-4 w-full">
                {IG_POSTS.map(post => (
                    <div key={post.id} className="aspect-square bg-gray-900 relative group cursor-pointer border border-transparent hover:opacity-90">
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-bold transition-opacity">
                            <div className="flex items-center gap-1"><Heart fill="white" size={18} /> {post.likes}</div>
                            <div className="flex items-center gap-1"><MessageSquare fill="white" size={18} /> {post.comments.length}</div>
                        </div>
                    </div>
                ))}
                {/* Fillers */}
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square bg-gray-900 flex items-center justify-center text-gray-700 border border-gray-800">
                        <Film size={24} />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Mock LinkedIn (Copied from previous version)
const MockLinkedIn = () => (
    <div className="w-full h-full bg-[#f3f2ef] overflow-y-auto animate-in fade-in duration-300 text-black">
      <div className="bg-white border-b border-gray-300 px-4 md:px-20 py-2 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
              <div className="text-[#0a66c2] font-bold text-2xl leading-none">Linked<span className="bg-[#0a66c2] text-white px-1 rounded ml-0.5 text-xl">in</span></div>
              <div className="bg-[#eef3f8] px-3 py-1.5 rounded flex items-center gap-2 text-gray-500 w-48 md:w-64">
                  <Search size={14} />
                  <span className="text-sm">Search</span>
              </div>
          </div>
          <div className="flex gap-6 text-gray-500 text-[10px] items-center">
              <div className="flex flex-col items-center hover:text-black cursor-pointer"><Home size={18} /><span>Home</span></div>
              <div className="flex flex-col items-center hover:text-black cursor-pointer"><Users size={18} /><span>My Network</span></div>
              <div className="flex flex-col items-center hover:text-black cursor-pointer"><Briefcase size={18} /><span>Jobs</span></div>
              <div className="flex flex-col items-center hover:text-black cursor-pointer"><MessageSquare size={18} /><span>Messaging</span></div>
              <div className="flex flex-col items-center hover:text-black cursor-pointer"><Bell size={18} /><span>Notifications</span></div>
              <div className="flex flex-col items-center border-l pl-6 ml-2"><div className="w-5 h-5 rounded-full bg-gray-300 border border-gray-400"></div><span className="mt-0.5">Me</span></div>
          </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mb-10">
          <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-300 relative">
                  <div className="h-32 bg-[#a0b4b7]"></div>
                  <div className="px-6 pb-6 relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 absolute -top-16 flex items-center justify-center text-4xl text-gray-400 font-bold shadow-md">
                          YK
                      </div>
                      <div className="mt-16">
                          <h1 className="text-2xl font-bold text-gray-900">Yashika Kainth</h1>
                          <p className="text-gray-700 mt-1">Cybersecurity Enthusiast | Ethical Hacker | Kali Linux User</p>
                          <p className="text-gray-500 text-sm mt-1">India • <span className="text-[#0a66c2] font-bold hover:underline cursor-pointer">Contact info</span></p>
                          <div className="text-[#0a66c2] text-sm font-bold hover:underline cursor-pointer mt-1">500+ connections</div>
                          <div className="mt-4 flex gap-2">
                              <button className="bg-[#0a66c2] text-white px-6 py-1.5 rounded-full font-bold hover:bg-[#004182] transition-colors">Connect</button>
                              <button className="border border-[#0a66c2] text-[#0a66c2] px-6 py-1.5 rounded-full font-bold hover:bg-blue-50 transition-colors">Message</button>
                              <button className="border border-gray-600 text-gray-600 px-4 py-1.5 rounded-full font-bold hover:bg-gray-100 transition-colors">More</button>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-300">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">About</h2>
                  <p className="text-gray-800 text-sm leading-relaxed">
                      Passionate about cybersecurity and penetration testing. Experienced with Nmap, Metasploit, Wireshark, and other Kali Linux tools. Always learning and exploring new vulnerabilities to secure systems. Currently exploring advanced ethical hacking techniques and network defense strategies.
                  </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-300">
                  <div className="flex justify-between items-center mb-4">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900">Activity</h2>
                          <p className="text-sm text-[#0a66c2] font-bold hover:underline cursor-pointer">500 followers</p>
                      </div>
                      <button className="border border-[#0a66c2] text-[#0a66c2] px-4 py-1 rounded-full font-bold hover:bg-blue-50 transition-colors text-sm">Create a post</button>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="border-b border-gray-100 pb-4">
                          <p className="text-xs text-gray-500 mb-1">Yashika Kainth posted this • 2d</p>
                          <div className="flex gap-3">
                              <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                                  <Briefcase size={24} className="text-gray-400" />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-gray-900">Just completed a new CTF challenge! 🚩</p>
                                  <p className="text-xs text-gray-600 mt-1">Learning privilege escalation is always fun.</p>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="mt-4 text-center border-t border-gray-100 pt-2">
                      <button className="text-gray-600 font-bold text-sm hover:bg-gray-100 w-full py-2 rounded transition-colors">Show all activity</button>
                  </div>
              </div>
          </div>

          <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-300">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-600 text-sm">People also viewed</h3>
                  </div>
                  {[1,2,3,4].map(i => (
                      <div key={i} className="flex gap-3 mb-4 items-start">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">U{i}</div>
                          </div>
                          <div>
                              <div className="font-bold text-sm text-gray-900 cursor-pointer hover:underline">Cyber Expert {i}</div>
                              <div className="text-xs text-gray-500 line-clamp-2">Security Analyst at Tech Corp • Penetration Tester</div>
                              <button className="mt-2 border border-gray-500 rounded-full px-4 py-1 text-sm text-gray-600 flex items-center gap-1 hover:bg-gray-100 transition-colors font-medium">
                                  <Plus size={14}/> Connect
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
);

export default Browser;
