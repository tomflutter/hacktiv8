"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type Message = {
    role: "user" | "bot";
    text: string;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [sessionId] = useState(() => uuidv4());

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: "user", text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, message: currentInput }),
            });

            const data = await res.json();

            const botMessage: Message = {
                role: "bot",
                text: data.reply || "Maaf, saya tidak bisa menjawab itu.",
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [
                ...prev,
                { role: "bot", text: "Terjadi kesalahan koneksi." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header dengan efek glassmorphism */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl rotate-45 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="-rotate-45 text-2xl">🤖</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Gemini AI Assistant
                            </h1>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online · Siap membantu Anda
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Chat Messages Area */}
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden mb-4">
                    <div className="h-[500px] overflow-y-auto p-6 space-y-4 scroll-smooth" 
                         style={{ scrollBehavior: 'smooth' }}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 animate-float">
                                    <span className="text-4xl">💬</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    Mulai Percakapan
                                </h3>
                                <p className="text-gray-400 max-w-sm">
                                    Tanyakan apa saja kepada AI Assistant. Saya siap membantu Anda 24/7!
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                                >
                                    {msg.role === "bot" && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0 shadow-md">
                                            🤖
                                        </div>
                                    )}
                                    <div
                                        className={`relative group max-w-[70%] ${
                                            msg.role === "user" ? "order-1" : "order-2"
                                        }`}
                                    >
                                        <div
                                            className={`px-5 py-3 rounded-2xl shadow-sm ${
                                                msg.role === "user"
                                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                                                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {msg.text}
                                            </p>
                                        </div>
                                        <div
                                            className={`absolute bottom-0 ${
                                                msg.role === "user"
                                                    ? "right-0 translate-x-1/2"
                                                    : "left-0 -translate-x-1/2"
                                            } opacity-0 group-hover:opacity-100 transition-opacity`}
                                        >
                                            <span className="text-xs text-gray-400">
                                                {new Date().toLocaleTimeString('id-ID', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm ml-2 flex-shrink-0 shadow-md">
                                            👤
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        
                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm mr-2 shadow-md">
                                    🤖
                                </div>
                                <div className="bg-white rounded-2xl rounded-bl-none p-4 border border-gray-200 shadow-sm">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Area dengan efek glassmorphism */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-2">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ketik pesan Anda di sini..."
                                disabled={loading}
                                className="w-full px-5 py-4 pr-12 bg-transparent border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400"
                            />
                            {input.length > 0 && (
                                <button
                                    onClick={() => setInput("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className={`px-6 py-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                loading || !input.trim()
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
                            }`}
                        >
                            <span>Kirim</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Footer Info */}
                    <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Fast Response
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Secure
                            </span>
                        </div>
                        <span>Powered by Google Gemini AI</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}