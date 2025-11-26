
import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';
import {
    Monitor, User, Info, Image as ImageIcon, Wifi, Lock, Shield, Volume2,
    Globe, Cpu, Camera, MapPin, Bell, Moon, Sun, Palette, Zap, HardDrive,
    Bluetooth, Radio, Settings as SettingsIcon, Circle, Check, ChevronRight,
    Search, Power, AlertCircle, Download, RefreshCw, Network, Eye, EyeOff
} from 'lucide-react';
import { AppProps } from '../../types';

// Wallpaper gallery
const WALLPAPERS = [
    { name: "Cyberpunk City", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" },
    { name: "Kali Dragon", url: "https://www.kali.org/images/notebook-kali-2022.1.jpg" },
    { name: "Matrix Code", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop" },
    { name: "Abstract Dark", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop" },
    { name: "Server Room", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop" },
    { name: "Deep Space", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2011&auto=format&fit=crop" },
    { name: "Neon Lights", url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2070&auto=format&fit=crop" },
    { name: "Circuit Board", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" },
];

// Theme options
const THEMES = [
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'auto', name: 'Auto', icon: Zap },
];

// Accent colors
const ACCENT_COLORS = [
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Green', color: '#10b981' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Orange', color: '#f59e0b' },
    { name: 'Pink', color: '#ec4899' },
    { name: 'Cyan', color: '#06b6d4' },
    { name: 'Yellow', color: '#eab308' },
];

// Storage for settings
const STORAGE_KEY = 'yashika-os-settings';

interface SettingsData {
    theme: string;
    accentColor: string;
    brightness: number;
    volume: number;
    systemVolume: number;
    notificationVolume: number;
    mediaVolume: number;
    soundEffects: boolean;
    nightLight: boolean;
    nightLightSchedule: string;
    transparency: boolean;
    iconSize: number;
    fontSize: number;
    firewall: boolean;
    locationEnabled: boolean;
    cameraEnabled: boolean;
    microphoneEnabled: boolean;
    wifiEnabled: boolean;
    vpnEnabled: boolean;
    bluetoothEnabled: boolean;
    username: string;
}

const defaultSettings: SettingsData = {
    theme: 'dark',
    accentColor: '#3b82f6',
    brightness: 100,
    volume: 75,
    systemVolume: 80,
    notificationVolume: 70,
    mediaVolume: 85,
    soundEffects: true,
    nightLight: false,
    nightLightSchedule: 'sunset',
    transparency: true,
    iconSize: 48,
    fontSize: 14,
    firewall: true,
    locationEnabled: false,
    cameraEnabled: false,
    microphoneEnabled: false,
    wifiEnabled: true,
    vpnEnabled: false,
    bluetoothEnabled: false,
    username: 'yashika',
};

const Settings: React.FC<AppProps> = () => {
    const { wallpaper, setWallpaper } = useOS();
    const [activeTab, setActiveTab] = useState<'appearance' | 'display' | 'sound' | 'network' | 'privacy' | 'about'>('appearance');
    const [settings, setSettings] = useState<SettingsData>(defaultSettings);
    const [searchQuery, setSearchQuery] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(saved) });
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }, []);

    // Save settings to localStorage
    const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        showSuccessToast('Setting saved');
    };

    const showSuccessToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    // Reusable Components
    const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
        <div className="flex items-center gap-3">
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
            >
                <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
            {label && <span className="text-sm text-gray-300">{label}</span>}
        </div>
    );

    const Slider: React.FC<{ value: number; onChange: (value: number) => void; min?: number; max?: number; label: string; unit?: string }> = ({
        value, onChange, min = 0, max = 100, label, unit = '%'
    }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">{label}</label>
                <span className="text-sm text-blue-400 font-mono">{value}{unit}</span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #374151 ${value}%, #374151 100%)`
                    }}
                />
            </div>
        </div>
    );

    const SettingItem: React.FC<{
        icon: React.ReactNode;
        title: string;
        description?: string;
        children: React.ReactNode;
    }> = ({ icon, title, description, children }) => (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                    <div className="text-gray-400 mt-1">{icon}</div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-200">{title}</h3>
                        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                    </div>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );

    const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6 first:mt-0">{children}</h3>
    );

    const SidebarItem: React.FC<{
        id: typeof activeTab;
        icon: React.ReactNode;
        label: string;
    }> = ({ id, icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${activeTab === id
                    ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                }`}
        >
            <div className={activeTab === id ? 'scale-110' : ''}>{icon}</div>
            <span className="text-sm font-medium">{label}</span>
            {activeTab === id && <ChevronRight size={16} className="ml-auto" />}
        </button>
    );

    return (
        <div className="h-full flex bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200 font-sans select-none">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-2xl animate-in slide-in-from-top-5 fade-in">
                    <div className="flex items-center gap-2">
                        <Check size={16} />
                        <span className="text-sm font-medium">{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <SettingsIcon size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Settings</h2>
                            <p className="text-xs text-gray-500">System Configuration</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mb-2">System</div>
                    <SidebarItem id="appearance" icon={<Palette size={18} />} label="Appearance" />
                    <SidebarItem id="display" icon={<Monitor size={18} />} label="Display" />
                    <SidebarItem id="sound" icon={<Volume2 size={18} />} label="Sound" />

                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mb-2 mt-4">Network</div>
                    <SidebarItem id="network" icon={<Wifi size={18} />} label="Network" />

                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mb-2 mt-4">Privacy</div>
                    <SidebarItem id="privacy" icon={<Shield size={18} />} label="Privacy & Security" />

                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mb-2 mt-4">System Info</div>
                    <SidebarItem id="about" icon={<Info size={18} />} label="About" />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => {
                            setSettings(defaultSettings);
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
                            showSuccessToast('Settings reset to defaults');
                        }}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={14} />
                        Reset to Default
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">

                    {/* APPEARANCE TAB */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Appearance</h1>
                                <p className="text-gray-500">Customize the look and feel of Yashika OS</p>
                            </div>

                            {/* Theme Selection */}
                            <div>
                                <SectionTitle>Theme</SectionTitle>
                                <div className="grid grid-cols-3 gap-3">
                                    {THEMES.map((theme) => {
                                        const Icon = theme.icon;
                                        return (
                                            <button
                                                key={theme.id}
                                                onClick={() => updateSetting('theme', theme.id)}
                                                className={`p-4 rounded-xl border-2 transition-all ${settings.theme === theme.id
                                                        ? 'border-blue-500 bg-blue-500/10'
                                                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                                                    }`}
                                            >
                                                <Icon size={24} className={settings.theme === theme.id ? 'text-blue-400' : 'text-gray-400'} />
                                                <div className="mt-2 text-sm font-medium">{theme.name}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Accent Color */}
                            <div>
                                <SectionTitle>Accent Color</SectionTitle>
                                <div className="grid grid-cols-8 gap-3">
                                    {ACCENT_COLORS.map((color) => (
                                        <button
                                            key={color.color}
                                            onClick={() => updateSetting('accentColor', color.color)}
                                            className={`aspect-square rounded-lg border-2 transition-all relative ${settings.accentColor === color.color
                                                    ? 'border-white scale-110 shadow-lg'
                                                    : 'border-gray-700 hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color.color }}
                                            title={color.name}
                                        >
                                            {settings.accentColor === color.color && (
                                                <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow-lg" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Wallpaper */}
                            <div>
                                <SectionTitle>Wallpaper</SectionTitle>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {WALLPAPERS.map((wp) => (
                                        <button
                                            key={wp.url}
                                            onClick={() => setWallpaper(wp.url)}
                                            className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${wallpaper === wp.url
                                                    ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                                                    : 'border-gray-700 hover:border-gray-600'
                                                }`}
                                        >
                                            <img
                                                src={wp.url}
                                                alt={wp.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute bottom-2 left-2 text-xs font-medium text-white">
                                                    {wp.name}
                                                </div>
                                            </div>
                                            {wallpaper === wp.url && (
                                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Options */}
                            <div>
                                <SectionTitle>Additional Options</SectionTitle>
                                <div className="space-y-3">
                                    <SettingItem
                                        icon={<Eye size={18} />}
                                        title="Transparency Effects"
                                        description="Enable blur and transparency in windows and panels"
                                    >
                                        <ToggleSwitch
                                            checked={settings.transparency}
                                            onChange={(v) => updateSetting('transparency', v)}
                                        />
                                    </SettingItem>

                                    <SettingItem
                                        icon={<ImageIcon size={18} />}
                                        title="Desktop Icon Size"
                                        description="Adjust the size of icons on your desktop"
                                    >
                                        <div className="w-48">
                                            <Slider
                                                value={settings.iconSize}
                                                onChange={(v) => updateSetting('iconSize', v)}
                                                min={32}
                                                max={96}
                                                label=""
                                                unit="px"
                                            />
                                        </div>
                                    </SettingItem>

                                    <SettingItem
                                        icon={<Globe size={18} />}
                                        title="Interface Font Size"
                                        description="Change the size of text across the system"
                                    >
                                        <div className="w-48">
                                            <Slider
                                                value={settings.fontSize}
                                                onChange={(v) => updateSetting('fontSize', v)}
                                                min={10}
                                                max={20}
                                                label=""
                                                unit="px"
                                            />
                                        </div>
                                    </SettingItem>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DISPLAY TAB */}
                    {activeTab === 'display' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Display</h1>
                                <p className="text-gray-500">Screen and display settings</p>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Brightness & Color</SectionTitle>

                                <SettingItem
                                    icon={<Sun size={18} />}
                                    title="Brightness"
                                    description="Adjust screen brightness level"
                                >
                                    <div className="w-64">
                                        <Slider
                                            value={settings.brightness}
                                            onChange={(v) => updateSetting('brightness', v)}
                                            label=""
                                        />
                                    </div>
                                </SettingItem>

                                <SettingItem
                                    icon={<Moon size={18} />}
                                    title="Night Light"
                                    description="Reduce blue light for better sleep"
                                >
                                    <ToggleSwitch
                                        checked={settings.nightLight}
                                        onChange={(v) => updateSetting('nightLight', v)}
                                    />
                                </SettingItem>

                                {settings.nightLight && (
                                    <div className="ml-12 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
                                        <select
                                            value={settings.nightLightSchedule}
                                            onChange={(e) => updateSetting('nightLightSchedule', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="sunset">Sunset to Sunrise</option>
                                            <option value="custom">Custom Hours</option>
                                            <option value="always">Always On</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Display Settings</SectionTitle>

                                <SettingItem
                                    icon={<Monitor size={18} />}
                                    title="Resolution"
                                    description="Current display resolution"
                                >
                                    <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        <option>1920 × 1080 (Recommended)</option>
                                        <option>2560 × 1440</option>
                                        <option>3840 × 2160</option>
                                    </select>
                                </SettingItem>

                                <SettingItem
                                    icon={<Zap size={18} />}
                                    title="Refresh Rate"
                                    description="How often your display updates"
                                >
                                    <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        <option>60 Hz</option>
                                        <option>75 Hz</option>
                                        <option>144 Hz</option>
                                        <option>240 Hz</option>
                                    </select>
                                </SettingItem>

                                <SettingItem
                                    icon={<Power size={18} />}
                                    title="Screen Timeout"
                                    description="Turn off screen after inactivity"
                                >
                                    <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        <option>Never</option>
                                        <option>1 minute</option>
                                        <option>5 minutes</option>
                                        <option>10 minutes</option>
                                        <option>30 minutes</option>
                                    </select>
                                </SettingItem>
                            </div>
                        </div>
                    )}

                    {/* SOUND TAB */}
                    {activeTab === 'sound' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Sound</h1>
                                <p className="text-gray-500">Audio and sound settings</p>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Volume Controls</SectionTitle>

                                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 space-y-4">
                                    <Slider
                                        value={settings.volume}
                                        onChange={(v) => updateSetting('volume', v)}
                                        label="Master Volume"
                                    />
                                    <Slider
                                        value={settings.systemVolume}
                                        onChange={(v) => updateSetting('systemVolume', v)}
                                        label="System Sounds"
                                    />
                                    <Slider
                                        value={settings.notificationVolume}
                                        onChange={(v) => updateSetting('notificationVolume', v)}
                                        label="Notifications"
                                    />
                                    <Slider
                                        value={settings.mediaVolume}
                                        onChange={(v) => updateSetting('mediaVolume', v)}
                                        label="Media Playback"
                                    />
                                </div>

                                <SettingItem
                                    icon={<Bell size={18} />}
                                    title="Sound Effects"
                                    description="Play sounds for system events"
                                >
                                    <ToggleSwitch
                                        checked={settings.soundEffects}
                                        onChange={(v) => updateSetting('soundEffects', v)}
                                    />
                                </SettingItem>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Output Devices</SectionTitle>

                                <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 divide-y divide-gray-700">
                                    <div className="p-4 flex items-center gap-3">
                                        <Volume2 size={18} className="text-green-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">Built-in Speakers</div>
                                            <div className="text-xs text-gray-500">Default Output Device</div>
                                        </div>
                                        <Circle size={8} className="text-green-400 fill-green-400" />
                                    </div>
                                    <div className="p-4 flex items-center gap-3 opacity-50">
                                        <Volume2 size={18} className="text-gray-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">Headphones</div>
                                            <div className="text-xs text-gray-500">Not Connected</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Input Devices</SectionTitle>

                                <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 divide-y divide-gray-700">
                                    <div className="p-4 flex items-center gap-3">
                                        <Radio size={18} className="text-blue-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">Built-in Microphone</div>
                                            <div className="text-xs text-gray-500">Default Input Device</div>
                                        </div>
                                        <Circle size={8} className="text-blue-400 fill-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                                <Volume2 size={18} />
                                Test Audio Output
                            </button>
                        </div>
                    )}

                    {/* NETWORK TAB */}
                    {activeTab === 'network' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Network</h1>
                                <p className="text-gray-500">Network and internet settings</p>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Wireless</SectionTitle>

                                <SettingItem
                                    icon={<Wifi size={18} />}
                                    title="Wi-Fi"
                                    description="Connect to wireless networks"
                                >
                                    <ToggleSwitch
                                        checked={settings.wifiEnabled}
                                        onChange={(v) => updateSetting('wifiEnabled', v)}
                                    />
                                </SettingItem>

                                {settings.wifiEnabled && (
                                    <div className="ml-12 space-y-2">
                                        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 divide-y divide-gray-700">
                                            <div className="p-4 flex items-center gap-3 bg-blue-500/10">
                                                <Wifi size={18} className="text-blue-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">Yashika-Network-5G</div>
                                                    <div className="text-xs text-gray-500">Connected • Excellent Signal</div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-3 bg-blue-400 rounded-full"></div>
                                                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                                                    <div className="w-1 h-5 bg-blue-400 rounded-full"></div>
                                                    <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="p-4 flex items-center gap-3 opacity-50 cursor-pointer hover:bg-gray-700/30">
                                                <Wifi size={18} className="text-gray-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">Guest-Network</div>
                                                    <div className="text-xs text-gray-500">Secured • Good Signal</div>
                                                </div>
                                                <Lock size={14} className="text-gray-500" />
                                            </div>
                                            <div className="p-4 flex items-center gap-3 opacity-30">
                                                <Wifi size={18} className="text-gray-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">Public-WiFi</div>
                                                    <div className="text-xs text-gray-500">Open • Weak Signal</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <SettingItem
                                    icon={<Bluetooth size={18} />}
                                    title="Bluetooth"
                                    description="Connect to Bluetooth devices"
                                >
                                    <ToggleSwitch
                                        checked={settings.bluetoothEnabled}
                                        onChange={(v) => updateSetting('bluetoothEnabled', v)}
                                    />
                                </SettingItem>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>VPN & Proxy</SectionTitle>

                                <SettingItem
                                    icon={<Shield size={18} />}
                                    title="VPN"
                                    description="Virtual Private Network for secure browsing"
                                >
                                    <ToggleSwitch
                                        checked={settings.vpnEnabled}
                                        onChange={(v) => updateSetting('vpnEnabled', v)}
                                    />
                                </SettingItem>

                                {settings.vpnEnabled && (
                                    <div className="ml-12 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                            <Check size={16} />
                                            VPN Connected - Your connection is secure
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Server: United States (New York)</div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Network Statistics</SectionTitle>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                                            <Download size={16} />
                                            <span className="text-xs font-medium uppercase">Download</span>
                                        </div>
                                        <div className="text-2xl font-bold">47.3 GB</div>
                                        <div className="text-xs text-gray-500 mt-1">This month</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                                            <Network size={16} />
                                            <span className="text-xs font-medium uppercase">Upload</span>
                                        </div>
                                        <div className="text-2xl font-bold">12.8 GB</div>
                                        <div className="text-xs text-gray-500 mt-1">This month</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRIVACY & SECURITY TAB */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Privacy & Security</h1>
                                <p className="text-gray-500">Protect your data and control permissions</p>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Security</SectionTitle>

                                <SettingItem
                                    icon={<Shield size={18} />}
                                    title="Firewall"
                                    description="Block unauthorized network access"
                                >
                                    <ToggleSwitch
                                        checked={settings.firewall}
                                        onChange={(v) => updateSetting('firewall', v)}
                                    />
                                </SettingItem>

                                {settings.firewall && (
                                    <div className="ml-12 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                            <Check size={16} />
                                            Firewall is Active
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Your system is protected from threats</div>
                                    </div>
                                )}

                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertCircle size={18} className="text-yellow-400" />
                                        <div>
                                            <div className="text-sm font-medium">Security Status</div>
                                            <div className="text-xs text-gray-500">Last scan: 2 hours ago</div>
                                        </div>
                                    </div>
                                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                        Run Security Scan
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>App Permissions</SectionTitle>

                                <SettingItem
                                    icon={<MapPin size={18} />}
                                    title="Location Services"
                                    description="Allow apps to access your location"
                                >
                                    <ToggleSwitch
                                        checked={settings.locationEnabled}
                                        onChange={(v) => updateSetting('locationEnabled', v)}
                                    />
                                </SettingItem>

                                <SettingItem
                                    icon={<Camera size={18} />}
                                    title="Camera"
                                    description="Allow apps to use your camera"
                                >
                                    <ToggleSwitch
                                        checked={settings.cameraEnabled}
                                        onChange={(v) => updateSetting('cameraEnabled', v)}
                                    />
                                </SettingItem>

                                <SettingItem
                                    icon={<Radio size={18} />}
                                    title="Microphone"
                                    description="Allow apps to use your microphone"
                                >
                                    <ToggleSwitch
                                        checked={settings.microphoneEnabled}
                                        onChange={(v) => updateSetting('microphoneEnabled', v)}
                                    />
                                </SettingItem>
                            </div>

                            <div className="space-y-3">
                                <SectionTitle>Data Protection</SectionTitle>

                                <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 divide-y divide-gray-700">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Lock size={18} className="text-purple-400" />
                                            <div>
                                                <div className="text-sm font-medium">File Encryption</div>
                                                <div className="text-xs text-gray-500">Encrypt sensitive files</div>
                                            </div>
                                        </div>
                                        <button className="text-sm text-blue-400 hover:text-blue-300">Configure</button>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <EyeOff size={18} className="text-cyan-400" />
                                            <div>
                                                <div className="text-sm font-medium">Privacy Mode</div>
                                                <div className="text-xs text-gray-500">Enhanced privacy protection</div>
                                            </div>
                                        </div>
                                        <button className="text-sm text-blue-400 hover:text-blue-300">Enable</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ABOUT TAB */}
                    {activeTab === 'about' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-800">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-2xl flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                                    Y
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        Yashika OS
                                    </h1>
                                    <p className="text-gray-400 mt-1">Version 1.0.0 • Based on Kali Linux 2026</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Developed by</span>
                                        <a
                                            href="https://ayushxupadhyayayushxupadhyay.netlify.app"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                                        >
                                            Ayush Upadhyay
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/20">
                                    <div className="flex items-center gap-2 text-blue-400 mb-4">
                                        <Cpu size={20} />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Hardware</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-500">Processor</span>
                                            <span className="text-gray-300 font-medium">Virtual CPU @ 3.40GHz</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-500">Memory</span>
                                            <span className="text-gray-300 font-medium">16.0 GiB</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-500">Graphics</span>
                                            <span className="text-gray-300 font-medium">WebGL Accelerated</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Storage</span>
                                            <span className="text-gray-300 font-medium">512 GB SSD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/20">
                                    <div className="flex items-center gap-2 text-purple-400 mb-4">
                                        <Globe size={20} />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Software</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-500">OS Name</span>
                                            <span className="text-gray-300 font-medium">Yashika OS</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-500">Kernel</span>
                                            <span className="text-gray-300 font-medium">6.9.0-kali-amd64</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-500">Shell</span>
                                            <span className="text-gray-300 font-medium">zsh 5.9</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Desktop</span>
                                            <span className="text-gray-300 font-medium">Yashika DE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                                <div className="flex items-center gap-2 text-cyan-400 mb-4">
                                    <HardDrive size={20} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Storage</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Used</span>
                                        <span className="text-gray-300 font-medium">247 GB of 512 GB</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '48%' }} />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>48% full</span>
                                        <span>265 GB available</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                                <div className="flex items-center gap-2 text-green-400 mb-4">
                                    <Zap size={20} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">System Status</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-green-400">99.8%</div>
                                        <div className="text-xs text-gray-500 mt-1">Uptime</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-400">24h 17m</div>
                                        <div className="text-xs text-gray-500 mt-1">Running</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-400">42°C</div>
                                        <div className="text-xs text-gray-500 mt-1">CPU Temp</div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                                <Download size={18} />
                                Check for Updates
                            </button>

                            <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800">
                                <p>© 2026 Yashika OS • Licensed under MIT License</p>
                                <p className="mt-1">Built with React, TypeScript, and Vite</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
      `}</style>
        </div>
    );
};

export default Settings;
