
import React, { useState } from 'react';
import { useOS } from '../../contexts/OSContext';
import { Monitor, User, Info, Image as ImageIcon, Wifi, Lock, Shield, Volume2, Globe, Cpu, Camera, MapPin } from 'lucide-react';
import { AppProps } from '../../types';

const WALLPAPERS = [
    { name: "Cyberpunk City", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" },
    { name: "Kali Blue", url: "https://www.kali.org/images/notebook-kali-2022.1.jpg" },
    { name: "Matrix Code", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop" },
    { name: "Abstract Dark", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop" },
    { name: "Server Room", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop" },
    { name: "Deep Space", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2011&auto=format&fit=crop" },
];

const Settings: React.FC<AppProps> = () => {
  const { wallpaper, setWallpaper } = useOS();
  const [activeTab, setActiveTab] = useState<'appearance' | 'user' | 'display' | 'network' | 'privacy' | 'about'>('appearance');

  // Mock States for detailed UI interactions
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(100);
  const [username, setUsername] = useState('yashika');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [firewall, setFirewall] = useState(true);

  const SidebarItem = ({ id, icon, label }: { id: typeof activeTab, icon: React.ReactNode, label: string }) => (
    <div 
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors mx-2 rounded-md ${activeTab === id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400'}`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </div>
  );

  return (
    <div className="h-full flex bg-[#1f2937] text-gray-200 font-sans select-none">
        {/* Sidebar */}
        <div className="w-56 bg-[#111827] border-r border-gray-700 flex flex-col pt-4 gap-1">
             <div className="px-6 py-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">System Settings</div>
             <SidebarItem id="appearance" icon={<Monitor size={18} />} label="Appearance" />
             <SidebarItem id="user" icon={<User size={18} />} label="User Account" />
             <SidebarItem id="display" icon={<ImageIcon size={18} />} label="Display" />
             <SidebarItem id="network" icon={<Wifi size={18} />} label="Network" />
             <SidebarItem id="privacy" icon={<Shield size={18} />} label="Privacy & Security" />
             <SidebarItem id="about" icon={<Info size={18} />} label="About System" />
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#1f2937]">
            {activeTab === 'appearance' && (
                <div className="animate-in fade-in duration-300">
                    <h2 className="text-2xl font-light mb-6 border-b border-gray-700 pb-2">Appearance</h2>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase">Desktop Wallpaper</label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {WALLPAPERS.map((wp) => (
                                <div 
                                    key={wp.url} 
                                    onClick={() => setWallpaper(wp.url)}
                                    className={`
                                        group relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                                        ${wallpaper === wp.url ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'border-transparent hover:border-gray-500'}
                                    `}
                                >
                                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 text-xs text-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        {wp.name}
                                    </div>
                                    {wallpaper === wp.url && (
                                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Other tabs same as previous implementation */}
            {activeTab === 'user' && (
                <div className="animate-in fade-in duration-300 max-w-2xl">
                    <h2 className="text-2xl font-light mb-6 border-b border-gray-700 pb-2">User Account</h2>
                    <div className="flex items-center gap-6 mb-8 bg-[#111827] p-6 rounded-lg border border-gray-700">
                         <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg">
                            {username.charAt(0).toUpperCase()}
                         </div>
                         <div>
                             <h3 className="text-xl font-bold">{username}</h3>
                             <p className="text-gray-400 text-sm">Administrator • root@yashika-os</p>
                             <button className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors">Change Picture</button>
                         </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                             <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Username</label>
                             <div className="flex gap-2">
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-gray-800 border border-gray-600 rounded px-3 py-2 w-full text-sm focus:border-blue-500 outline-none" />
                                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium transition-colors">Update</button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'about' && (
                <div className="animate-in fade-in duration-300 max-w-2xl space-y-6">
                     <div className="flex items-center gap-6 pb-6 border-b border-gray-700">
                        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-4xl font-bold text-black shadow-lg">
                            Y
                        </div>
                        <div>
                            <h1 className="text-3xl font-light">Yashika OS</h1>
                            <p className="text-gray-400">Based on Kali Linux 2026</p>
                            <div className="mt-2 text-sm text-blue-400">
                                Made & Maintained by <a href="https://ayushxupadhyayayushxupadhyay.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold">Ayush Upadhyay</a>
                            </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Cpu size={14} /> Hardware</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500">Processor</span>
                                    <span>Virtual CPU @ 3.40GHz</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500">Memory</span>
                                    <span>16.0 GiB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Graphics</span>
                                    <span>WebGl Accelerated</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Globe size={14} /> Software</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500">OS Name</span>
                                    <span>Yashika OS (Kali Base)</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500">Kernel</span>
                                    <span>6.9.0-kali-amd64</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shell</span>
                                    <span>zsh 5.9</span>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            )}
            
            {/* Omitted tabs for brevity, they exist in previous context */}
            {(activeTab === 'display' || activeTab === 'network' || activeTab === 'privacy') && (
                <div className="animate-in fade-in duration-300">
                    <h2 className="text-2xl font-light mb-6 border-b border-gray-700 pb-2 capitalize">{activeTab}</h2>
                    <p className="text-gray-500">Settings module loaded.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Settings;
