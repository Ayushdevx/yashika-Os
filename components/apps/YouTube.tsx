
import React, { useState } from 'react';
import { AppProps } from '../../types';
import { Search, Menu, Bell, Video, User, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Home, Compass, PlaySquare, Clock } from 'lucide-react';

const MOCK_VIDEOS = [
    { id: 1, title: "Ethical Hacking Full Course - Learn Ethical Hacking in 10 Hours", channel: "Edureka", views: "5.2M views", time: "2 years ago", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80" },
    { id: 2, title: "Kali Linux 2024.1 Review - The Best Release Yet?", channel: "NetworkChuck", views: "890K views", time: "3 months ago", thumbnail: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80" },
    { id: 3, title: "lofi hip hop radio - beats to relax/study to", channel: "Lofi Girl", views: "60K watching", time: "LIVE", thumbnail: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=600&q=80" },
    { id: 4, title: "Mr. Robot - Season 1 Trailer", channel: "Universal Pictures", views: "12M views", time: "8 years ago", thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80" },
    { id: 5, title: "Top 10 Cybersecurity Tools You Must Know", channel: "Simplilearn", views: "1.1M views", time: "1 year ago", thumbnail: "https://images.unsplash.com/photo-1563206767-5b1d972eefab?w=600&q=80" },
    { id: 6, title: "How to Hack Wi-Fi (Educational Purpose)", channel: "David Bombal", views: "2.4M views", time: "1 year ago", thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80" },
];

const YouTube: React.FC<AppProps> = () => {
    const [activeVideo, setActiveVideo] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleVideoClick = (id: number) => {
        setActiveVideo(id);
    };

    const activeVidData = MOCK_VIDEOS.find(v => v.id === activeVideo);

    return (
        <div className="h-full flex flex-col bg-[#0f0f0f] text-white font-sans">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 sticky top-0 bg-[#0f0f0f] z-20 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Menu className="text-white cursor-pointer" size={24} />
                    <div className="flex items-center gap-1 cursor-pointer">
                        <div className="bg-red-600 text-white p-0.5 rounded-lg">
                            <PlaySquare size={20} fill="white" />
                        </div>
                        <span className="font-bold text-lg tracking-tighter">YouTube</span>
                        <span className="text-[10px] text-gray-400 -mt-3 ml-0.5">IN</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-2xl ml-10">
                    <div className="flex items-center flex-1">
                        <input 
                            type="text" 
                            placeholder="Search" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2 outline-none focus:border-blue-500 focus:ml-0 ml-8"
                        />
                        <button className="bg-[#222] border border-[#303030] border-l-0 px-5 py-2 rounded-r-full hover:bg-[#303030]">
                            <Search size={20} className="text-gray-400" />
                        </button>
                    </div>
                    <div className="bg-[#181818] p-2 rounded-full hover:bg-[#303030] cursor-pointer">
                        <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                    </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                    <Video size={24} className="cursor-pointer hover:text-white text-gray-300" />
                    <Bell size={24} className="cursor-pointer hover:text-white text-gray-300" />
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm cursor-pointer">Y</div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={`w-20 lg:w-60 flex-shrink-0 overflow-y-auto hover:overflow-y-scroll custom-scrollbar py-3 px-2 ${activeVideo ? 'hidden lg:hidden' : ''}`}>
                    <SidebarItem icon={<Home size={24}/>} label="Home" active />
                    <SidebarItem icon={<Compass size={24}/>} label="Shorts" />
                    <SidebarItem icon={<PlaySquare size={24}/>} label="Subscriptions" />
                    <hr className="border-white/10 my-3 mx-2" />
                    <SidebarItem icon={<User size={24}/>} label="You" />
                    <SidebarItem icon={<Clock size={24}/>} label="History" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {activeVideo ? (
                        <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
                            <div className="flex-1">
                                {/* Video Player */}
                                <div className="aspect-video bg-black w-full relative group">
                                    <img src={activeVidData?.thumbnail} alt="" className="w-full h-full object-cover opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                                </div>
                                
                                <h1 className="text-xl font-bold mt-4">{activeVidData?.title}</h1>
                                
                                <div className="flex items-center justify-between mt-2 pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                                        <div>
                                            <div className="font-bold">{activeVidData?.channel}</div>
                                            <div className="text-xs text-gray-400">1.2M subscribers</div>
                                        </div>
                                        <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm ml-4 hover:bg-gray-200">Subscribe</button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <div className="flex bg-[#222] rounded-full items-center">
                                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#303030] rounded-l-full border-r border-white/10">
                                                <ThumbsUp size={20} /> 24K
                                            </button>
                                            <button className="px-4 py-2 hover:bg-[#303030] rounded-r-full">
                                                <ThumbsDown size={20} />
                                            </button>
                                        </div>
                                        <button className="flex items-center gap-2 bg-[#222] px-4 py-2 rounded-full hover:bg-[#303030] font-bold text-sm">
                                            <Share2 size={20} /> Share
                                        </button>
                                        <button className="bg-[#222] p-2 rounded-full hover:bg-[#303030]">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-[#222] rounded-xl p-3 mt-4 text-sm cursor-pointer hover:bg-[#303030]">
                                    <div className="font-bold mb-1">{activeVidData?.views} • {activeVidData?.time}</div>
                                    <p>This is a comprehensive tutorial on ethical hacking. We cover reconnaissance, scanning, exploitation, and post-exploitation...</p>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-bold text-xl mb-4">245 Comments</h3>
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm">Y</div>
                                        <input type="text" placeholder="Add a comment..." className="flex-1 bg-transparent border-b border-gray-700 outline-none text-sm pb-1 focus:border-white" />
                                    </div>
                                    {[1,2,3].map(i => (
                                        <div key={i} className="flex gap-4 mb-4">
                                            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                                            <div>
                                                <div className="text-xs font-bold mb-1">User {i} <span className="text-gray-400 font-normal">2 hours ago</span></div>
                                                <div className="text-sm">Great video! Really helped me understand the basics.</div>
                                                <div className="flex items-center gap-4 mt-2 text-gray-400">
                                                    <ThumbsUp size={14} /> <span className="text-xs">12</span>
                                                    <ThumbsDown size={14} />
                                                    <span className="text-xs font-bold hover:text-white cursor-pointer">Reply</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full lg:w-[350px] flex flex-col gap-2">
                                {MOCK_VIDEOS.filter(v => v.id !== activeVideo).map(video => (
                                    <div key={video.id} className="flex gap-2 cursor-pointer group" onClick={() => handleVideoClick(video.id)}>
                                        <div className="w-40 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative">
                                            <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1 rounded">10:24</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm line-clamp-2 group-hover:text-white text-gray-100 mb-1">{video.title}</div>
                                            <div className="text-xs text-gray-400">{video.channel}</div>
                                            <div className="text-xs text-gray-400">{video.views} • {video.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {MOCK_VIDEOS.map(video => (
                                <div key={video.id} className="cursor-pointer group" onClick={() => handleVideoClick(video.id)}>
                                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-800 mb-3 relative">
                                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1 rounded font-medium">12:45</div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-700 flex-shrink-0"></div>
                                        <div>
                                            <h3 className="font-bold text-sm line-clamp-2 leading-tight mb-1 group-hover:text-white text-gray-100">{video.title}</h3>
                                            <div className="text-xs text-gray-400 hover:text-white">{video.channel}</div>
                                            <div className="text-xs text-gray-400">{video.views} • {video.time}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active }: any) => (
    <div className={`flex items-center gap-5 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#272727] ${active ? 'bg-[#272727] font-bold' : ''}`}>
        {icon}
        <span className="text-sm truncate">{label}</span>
    </div>
);

export default YouTube;
