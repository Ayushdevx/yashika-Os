import React, { useState, useRef, useEffect } from 'react';
import { AppProps } from '../../types';
import { Send, Bot, User, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { getChatResponse } from '../../services/geminiService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const AyushGPT: React.FC<AppProps> = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm Ayush GPT, your advanced AI assistant within Yashika OS. How can I help you today?",
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Simulate network delay for realism if response is too fast
            const responseText = await getChatResponse(userMessage.content);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I encountered an error connecting to my neural network. Please try again.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-gray-200 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="h-16 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-white tracking-wide">Ayush GPT</h1>
                        <div className="flex items-center gap-2 text-xs text-blue-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Online • v2.5
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([])}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Clear Chat"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        {/* Avatar */}
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg
                            ${msg.role === 'assistant'
                                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300'}
                        `}>
                            {msg.role === 'assistant' ? <Sparkles size={20} /> : <User size={20} />}
                        </div>

                        {/* Message Bubble */}
                        <div className={`
                            max-w-[80%] rounded-2xl p-4 shadow-md relative group
                            ${msg.role === 'assistant'
                                ? 'bg-[#1e293b] border border-white/5 text-gray-200 rounded-tl-none'
                                : 'bg-blue-600 text-white rounded-tr-none'}
                        `}>
                            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                                {msg.content}
                            </div>

                            {/* Timestamp & Actions */}
                            <div className={`
                                flex items-center gap-2 mt-2 text-[10px] opacity-50
                                ${msg.role === 'user' ? 'justify-end text-blue-100' : 'text-gray-500'}
                            `}>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.role === 'assistant' && (
                                    <button
                                        onClick={() => copyToClipboard(msg.content, msg.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                    >
                                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Bot size={20} className="text-white animate-pulse" />
                        </div>
                        <div className="bg-[#1e293b] border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0f172a]/90 backdrop-blur border-t border-white/10 z-20">
                <div className="relative max-w-4xl mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Ayush GPT anything..."
                        className="w-full bg-[#1e293b] text-white rounded-xl pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/5 shadow-lg placeholder-gray-500 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`
                            absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all
                            ${!input.trim() || isLoading
                                ? 'text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'}
                        `}
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="text-center mt-2 text-[10px] text-gray-600">
                    Ayush GPT can make mistakes. Consider checking important information.
                </div>
            </div>
        </div>
    );
};

export default AyushGPT;
