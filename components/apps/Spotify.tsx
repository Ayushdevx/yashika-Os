import React, { useState, useEffect, useRef } from 'react';
import { AppProps } from '../../types';
import { Home, Search, Library, Plus, Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Mic2, ListMusic, Laptop2, ArrowLeft, ArrowRight, Maximize2, Clock } from 'lucide-react';

const TRACKS = [
    { id: 7, title: "Draculla", artist: "AUR", album: "Single", duration: "4:23", cover: "https://i.ytimg.com/vi/xnP7qKxwzjg/maxresdefault.jpg", url: "/music/song.mp3" },
    { id: 1, title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80", url: "" },
    { id: 2, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=150&q=80", url: "" },
    { id: 3, title: "Cyberpunk Theme", artist: "Marcin Przybyłowicz", album: "Cyberpunk 2077", duration: "3:50", cover: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&q=80", url: "" },
    { id: 4, title: "Nightcall", artist: "Kavinsky", album: "OutRun", duration: "4:18", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=150&q=80", url: "" },
    { id: 5, title: "Harder, Better, Faster, Stronger", artist: "Daft Punk", album: "Discovery", duration: "3:44", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80", url: "" },
    { id: 6, title: "Algorithm", artist: "Muse", album: "Simulation Theory", duration: "4:05", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&q=80", url: "" },
];

const PLAYLISTS = ["Cyberpunk Vibes", "Coding Mode", "Late Night Hacking", "Synthwave Essentials", "Focus Flow"];

const Spotify: React.FC<AppProps> = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Playback failed:", error);
                        setIsPlaying(false);
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const curr = audioRef.current.currentTime;
            const dur = audioRef.current.duration;
            setCurrentTime(curr);
            setDuration(dur);
            if (dur > 0) {
                setProgress((curr / dur) * 100);
            } else {
                setProgress(0);
            }
        }
    };

    const handleTrackEnd = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const handlePlay = (track?: typeof TRACKS[0]) => {
        if (track) {
            if (track.id !== currentTrack.id) {
                setCurrentTrack(track);
                setIsPlaying(true);
            } else {
                setIsPlaying(!isPlaying);
            }
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            const bar = e.currentTarget;
            const rect = bar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = percent * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(percent * 100);
        }
    };

    const handleVolumeSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        setVolume(percent * 100);
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === Infinity) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col bg-black text-gray-300 font-sans select-none">
            <audio
                ref={audioRef}
                src={currentTrack.url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleTrackEnd}
                onLoadedMetadata={handleTimeUpdate}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-60 bg-black flex flex-col p-2 gap-2 flex-shrink-0">
                    <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-white font-bold cursor-pointer hover:opacity-80"><Home size={24} /> Home</div>
                        <div className="flex items-center gap-4 cursor-pointer hover:text-white transition-colors"><Search size={24} /> Search</div>
                    </div>

                    <div className="bg-[#121212] rounded-lg flex-1 p-2 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-2 text-gray-400 shadow-md z-10">
                            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors font-bold"><Library size={24} /> Your Library</div>
                            <div className="flex gap-2">
                                <Plus size={20} className="hover:bg-[#2a2a2a] rounded-full p-0.5 cursor-pointer" />
                                <ArrowRight size={20} className="hover:bg-[#2a2a2a] rounded-full p-0.5 cursor-pointer" />
                            </div>
                        </div>

                        <div className="flex gap-2 px-2 py-2 overflow-x-auto no-scrollbar">
                            <span className="bg-[#2a2a2a] px-3 py-1 rounded-full text-xs text-white cursor-pointer hover:bg-[#3a3a3a]">Playlists</span>
                            <span className="bg-[#2a2a2a] px-3 py-1 rounded-full text-xs text-white cursor-pointer hover:bg-[#3a3a3a]">Artists</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar mt-2">
                            <div className="p-2 flex items-center gap-3 hover:bg-[#1a1a1a] rounded cursor-pointer">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-700 to-blue-300 rounded flex items-center justify-center"><Heart fill="white" size={20} className="text-white" /></div>
                                <div>
                                    <div className="text-white font-bold text-sm">Liked Songs</div>
                                    <div className="text-xs flex gap-1"><span>Playlist</span>•<span>124 songs</span></div>
                                </div>
                            </div>
                            {PLAYLISTS.map((pl, i) => (
                                <div key={i} className="p-2 flex items-center gap-3 hover:bg-[#1a1a1a] rounded cursor-pointer">
                                    <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-gray-500 font-bold text-xl">{pl.charAt(0)}</div>
                                    <div>
                                        <div className="text-white font-bold text-sm truncate w-32">{pl}</div>
                                        <div className="text-xs flex gap-1"><span>Playlist</span>•<span>Yashika</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-[#121212] m-2 rounded-lg overflow-y-auto custom-scrollbar relative">
                    {/* Top Bar Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-900/80 to-[#121212] pointer-events-none"></div>

                    {/* Header Nav */}
                    <div className="sticky top-0 flex items-center justify-between p-4 z-20 bg-[#121212]/0 hover:bg-[#121212]/20 transition-colors">
                        <div className="flex gap-2">
                            <div className="bg-black/70 rounded-full p-1 cursor-not-allowed"><ArrowLeft size={20} /></div>
                            <div className="bg-black/70 rounded-full p-1 cursor-not-allowed"><ArrowRight size={20} /></div>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-white text-black rounded-full px-4 py-1 text-sm font-bold hover:scale-105 transition-transform">Explore Premium</button>
                            <div className="w-8 h-8 bg-[#535353] rounded-full p-1 flex items-center justify-center text-black font-bold cursor-pointer">Y</div>
                        </div>
                    </div>

                    <div className="relative z-10 px-6 pt-4">
                        <h1 className="text-3xl font-bold text-white mb-6">Good morning</h1>

                        {/* Recent Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {TRACKS.slice(0, 6).map(track => (
                                <div key={track.id} className="flex items-center bg-[#2a2a2a]/50 hover:bg-[#2a2a2a] rounded overflow-hidden cursor-pointer transition-colors group">
                                    <img src={track.cover} alt="" className="w-20 h-20 object-cover shadow-lg" />
                                    <span className="font-bold text-white px-4 truncate flex-1">{track.title}</span>
                                    <div className="mr-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all" onClick={(e) => { e.stopPropagation(); handlePlay(track) }}>
                                        <Play fill="black" size={20} className="text-black ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">Made for Yashika</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group">
                                    <div className="aspect-square bg-[#333] mb-4 rounded shadow-lg overflow-hidden relative">
                                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-4xl font-bold text-gray-500">Mix {i}</div>
                                        <div className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                                            <Play fill="black" size={24} className="text-black ml-1" />
                                        </div>
                                    </div>
                                    <div className="font-bold text-white mb-1">Daily Mix {i}</div>
                                    <div className="text-sm text-gray-400 line-clamp-2">M83, The Weeknd, Kavinsky and more</div>
                                </div>
                            ))}
                        </div>

                        {/* Track List */}
                        <h2 className="text-2xl font-bold text-white mb-4 mt-8">Popular Tracks</h2>
                        <div className="flex flex-col pb-8">
                            <div className="flex text-sm text-gray-400 border-b border-white/10 pb-2 mb-2 px-4">
                                <div className="w-8">#</div>
                                <div className="flex-1">Title</div>
                                <div className="hidden md:block w-48">Album</div>
                                <div className="w-16 text-right"><Clock size={16} /></div>
                            </div>
                            {TRACKS.map((track, idx) => (
                                <div
                                    key={track.id}
                                    onClick={() => handlePlay(track)}
                                    className={`flex items-center text-sm text-gray-400 hover:bg-white/10 rounded p-2 px-4 cursor-pointer group ${currentTrack.id === track.id ? 'text-green-500' : ''}`}
                                >
                                    <div className="w-8 flex items-center">
                                        <span className={`group-hover:hidden ${currentTrack.id === track.id && isPlaying ? 'hidden' : ''}`}>{idx + 1}</span>
                                        {currentTrack.id === track.id && isPlaying ? (
                                            <div className="w-3 h-3 bg-green-500 animate-pulse rounded-full"></div>
                                        ) : (
                                            <Play size={14} className="hidden group-hover:block text-white" fill="white" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex items-center gap-3">
                                        <img src={track.cover} className="w-10 h-10 rounded" alt="" />
                                        <div>
                                            <div className={`font-bold text-base ${currentTrack.id === track.id ? 'text-green-500' : 'text-white'}`}>{track.title}</div>
                                            <div className="group-hover:text-white transition-colors">{track.artist}</div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block w-48 group-hover:text-white">{track.album}</div>
                                    <div className="w-16 text-right">{track.duration}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Now Playing Bar */}
            <div className="h-24 bg-[#181818] border-t border-[#282828] flex items-center justify-between px-4 z-50">
                {/* Track Info */}
                <div className="flex items-center gap-4 w-[30%]">
                    <img src={currentTrack.cover} alt="" className="w-14 h-14 rounded shadow-md" />
                    <div>
                        <div className="text-white text-sm font-bold hover:underline cursor-pointer">{currentTrack.title}</div>
                        <div className="text-xs text-gray-400 hover:underline cursor-pointer hover:text-white">{currentTrack.artist}</div>
                    </div>
                    <Heart size={16} className="text-green-500 ml-2 cursor-pointer hover:scale-110 transition-transform" fill="#10b981" />
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center gap-2 w-[40%]">
                    <div className="flex items-center gap-6">
                        <Shuffle size={16} className="hover:text-white cursor-pointer text-green-500" />
                        <SkipBack size={20} className="hover:text-white cursor-pointer fill-white" />
                        <button
                            onClick={() => handlePlay()}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            {isPlaying ? <Pause size={20} fill="black" className="text-black" /> : <Play size={20} fill="black" className="text-black ml-1" />}
                        </button>
                        <SkipForward size={20} className="hover:text-white cursor-pointer fill-white" />
                        <Repeat size={16} className="hover:text-white cursor-pointer" />
                    </div>
                    <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <div
                            className="flex-1 h-1 bg-gray-600 rounded-full relative group cursor-pointer"
                            onClick={handleSeek}
                        >
                            <div className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-500" style={{ width: `${progress}%` }}></div>
                            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" style={{ left: `${progress}%` }}></div>
                        </div>
                        <span>{currentTrack.url ? formatTime(duration) : currentTrack.duration}</span>
                    </div>
                </div>

                {/* Volume/Extra */}
                <div className="flex items-center gap-3 w-[30%] justify-end">
                    <Mic2 size={16} className="hover:text-white cursor-pointer" />
                    <ListMusic size={16} className="hover:text-white cursor-pointer" />
                    <Laptop2 size={16} className="hover:text-white cursor-pointer" />
                    <div className="flex items-center gap-2 w-24 group">
                        <Volume2 size={16} />
                        <div
                            className="flex-1 h-1 bg-gray-600 rounded-full relative cursor-pointer"
                            onClick={handleVolumeSeek}
                        >
                            <div className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-500" style={{ width: `${volume}%` }}></div>
                        </div>
                    </div>
                    <Maximize2 size={16} className="hover:text-white cursor-pointer" />
                </div>
            </div>
        </div>
    );
};

export default Spotify;