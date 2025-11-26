
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { WindowState, AppID } from '../../types';
import { APP_REGISTRY } from '../../constants';
import { playSystemSound } from '../../utils/soundEffects';

interface WindowProps {
    windowState: WindowState;
    isActive: boolean;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onMaximize: (id: string) => void;
    onFocus: (id: string) => void;
    onMove: (id: string, x: number, y: number) => void;
    onResize: (id: string, width: number, height: number) => void;
    children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({
    windowState,
    isActive,
    onClose,
    onMinimize,
    onMaximize,
    onFocus,
    onMove,
    onResize,
    children,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [snapPreview, setSnapPreview] = useState<{ x: number, y: number, width: number | string, height: number | string, active: boolean } | null>(null);
    const windowRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Trigger entry animation
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent propagation to lower elements
        onFocus(windowState.id);
        if (!windowState.isMaximized) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - windowState.position.x,
                y: e.clientY - windowState.position.y,
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                onMove(windowState.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);

                // Snap Logic Checks
                const screenW = window.innerWidth;
                const taskbarH = 48;
                const threshold = 15;

                if (e.clientX < threshold) {
                    // Left Snap
                    setSnapPreview({ x: 0, y: 0, width: '50%', height: `calc(100% - ${taskbarH}px)`, active: true });
                } else if (e.clientX > screenW - threshold) {
                    // Right Snap
                    setSnapPreview({ x: screenW / 2, y: 0, width: '50%', height: `calc(100% - ${taskbarH}px)`, active: true });
                } else if (e.clientY < 10) {
                    // Top Snap (Maximize)
                    setSnapPreview({ x: 0, y: 0, width: '100%', height: `calc(100% - ${taskbarH}px)`, active: true });
                } else {
                    setSnapPreview(null);
                }
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (isDragging) {
                setIsDragging(false);

                // Apply Snap if active
                if (snapPreview?.active) {
                    playSystemSound('open');
                    const screenW = window.innerWidth;
                    const screenH = window.innerHeight;
                    const taskbarH = 48;
                    const threshold = 15;

                    if (e.clientX < threshold) {
                        // Snap Left
                        onMove(windowState.id, 0, 0);
                        onResize(windowState.id, screenW / 2, screenH - taskbarH);
                    } else if (e.clientX > screenW - threshold) {
                        // Snap Right
                        onMove(windowState.id, screenW / 2, 0);
                        onResize(windowState.id, screenW / 2, screenH - taskbarH);
                    } else if (e.clientY < 10) {
                        // Snap Top (Maximize)
                        onMaximize(windowState.id);
                    }
                }
                setSnapPreview(null);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, onMove, onResize, onMaximize, windowState.id, snapPreview]);

    const appInfo = APP_REGISTRY[windowState.appId];

    const minimizedStyle: React.CSSProperties = {
        opacity: 0,
        transform: `scale(0.5) translateY(100vh) translateX(${windowState.position.x / 4}px)`,
        pointerEvents: 'none',
    };

    const normalStyle: React.CSSProperties = {
        width: windowState.isMaximized ? '100%' : windowState.size.width,
        height: windowState.isMaximized ? 'calc(100% - 48px)' : windowState.size.height,
        left: windowState.isMaximized ? 0 : windowState.position.x,
        top: windowState.isMaximized ? 0 : windowState.position.y,
        zIndex: windowState.zIndex,
        opacity: 1,
        transform: 'scale(1) translateY(0)',
    };

    // Crucial for realism: Disable CSS transitions while dragging to avoid "laggy" feel
    // But keep them active for maximize/minimize/snap operations
    const transitionClass = isDragging
        ? 'transition-none'
        : 'transition-all duration-300 cubic-bezier(0.2, 0, 0, 1)';

    return (
        <>
            {/* Snap Preview Overlay */}
            {snapPreview && snapPreview.active && (
                <div
                    className="fixed bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-lg z-[9999] pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95"
                    style={{
                        left: snapPreview.x,
                        top: snapPreview.y,
                        width: snapPreview.width,
                        height: snapPreview.height,
                    }}
                />
            )}

            {/* Window */}
            <div
                ref={windowRef}
                className={`
                absolute flex flex-col overflow-hidden backdrop-blur-2xl
                ${transitionClass} origin-center
                ${windowState.isMaximized ? 'rounded-none' : 'rounded-lg'}
                ${isActive
                        ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-gray-600 ring-1 ring-white/10 z-50'
                        : 'shadow-xl border-gray-700/40 opacity-95 grayscale-[0.1] hover:opacity-100'}
                ${!isMounted ? 'opacity-0 scale-95 translate-y-4 blur-sm' : ''}
                border bg-[#0a0a0a]/95
                animate-in fade-in zoom-in-95 duration-300 ease-out
            `}
                style={{
                    ...windowState.isMinimized ? minimizedStyle : normalStyle,
                    transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                onMouseDown={() => onFocus(windowState.id)}
            >

                {/* Title Bar */}
                <div
                    className={`
                h-10 flex items-center justify-between px-3 select-none cursor-default border-b transition-colors
                ${isActive ? 'bg-[#151b26] border-gray-700/50' : 'bg-[#151b26]/50 border-gray-800 text-gray-500'}
            `}
                    onMouseDown={handleMouseDown}
                    onDoubleClick={() => {
                        onMaximize(windowState.id);
                        playSystemSound('click');
                    }}
                >
                    <div className="flex items-center gap-3 pl-1">
                        <div className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-yashika-accent' : 'text-gray-600'}`}>
                            {appInfo.icon}
                        </div>
                        <span className={`text-xs font-mono font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>
                            {windowState.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => {
                                onMinimize(windowState.id);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors group"
                        >
                            <Minus size={14} className="group-hover:text-blue-200" />
                        </button>
                        <button
                            onClick={() => {
                                onMaximize(windowState.id);
                                playSystemSound('click');
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors group"
                        >
                            {windowState.isMaximized ? <Square size={12} className="group-hover:text-blue-200" /> : <Maximize2 size={12} className="group-hover:text-blue-200" />}
                        </button>
                        <button
                            onClick={() => {
                                onClose(windowState.id);
                            }}
                            className="p-1.5 hover:bg-red-500/80 rounded-md text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative text-gray-200">
                    {children}
                </div>

                {/* Resize Handle (Bottom Right) */}
                {!windowState.isMaximized && (
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 opacity-0 hover:opacity-100 bg-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 50%)' }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            // Resize logic requires passing state up or handling generic drag logic
                            // For this snippet, visual indicator only as main logic is in hook
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default Window;
