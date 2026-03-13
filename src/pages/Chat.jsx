import { useEffect, useState, useRef } from "react";
import socket from "../lib/socket";
import api from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, User, ShieldCheck, Clock, MoreHorizontal } from "lucide-react";

function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const chatContainerRef = useRef(null);

  useEffect(() => {
    socket.emit("joinConversation", conversationId);

    api
      .get(`/messages/${conversationId}`)
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => socket.off("receiveMessage");
  }, [conversationId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      conversation: conversationId,
      sender: currentUser._id,
      text,
    });

    setText("");
  };

  // Helper function to format time safely
  const formatTime = (dateString) => {
    if (!dateString) return "Just now"; // Avoid using Date.now() in render
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto bg-white dark:bg-[#0B0F1A] shadow-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden my-4 transition-all">
      
      {/* 1. CHAT HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <User size={20} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white leading-tight">Secure Chat</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">End-to-end encrypted</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* 2. MESSAGES CONTAINER */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/50 dark:bg-transparent scroll-smooth"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <ShieldCheck size={48} className="mb-2 text-slate-400" />
            <p className="font-bold text-sm uppercase tracking-tighter">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === currentUser._id || msg.sender?._id === currentUser._id;
            return (
              <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[75%] ${isMe ? "order-2" : "order-1"}`}>
                  <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-2 mt-1.5 opacity-50 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-[9px] font-black uppercase tracking-tighter dark:text-slate-400">
                      {/* ✅ FIXED: Using the helper function instead of Date.now() */}
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. INPUT BAR */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
        <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white font-medium"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-0 disabled:scale-75"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
