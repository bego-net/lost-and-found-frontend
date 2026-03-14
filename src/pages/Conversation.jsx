import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft, Send, MoreVertical, ShieldCheck, Clock, User } from "lucide-react";
import socket from "../lib/socket";

function Conversation() {
  const { itemId, userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState("");

  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/messages/conversation/${itemId}/${userId}`);
      setMessages(data);

      if (data.length > 0) {
        const firstMsg = data[0];
        const otherUser = firstMsg.sender._id === currentUser._id ? firstMsg.receiver : firstMsg.sender;
        setOtherUserName(otherUser?.name || "User");
      }
      await api.put(`/messages/mark-read/${itemId}/${userId}`);
      await api.get("/messages/unread/count");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [itemId, userId, currentUser._id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!currentUser?._id) return;
    socket.emit("joinConversation", itemId);
    socket.on("receiveMessage", async (newMessage) => {
      if (newMessage.item !== itemId) return;
      const isRelated = (newMessage.sender === currentUser._id && newMessage.receiver === userId) ||
                        (newMessage.sender === userId && newMessage.receiver === currentUser._id);
      if (!isRelated) return;

      setMessages((prev) => [...prev, newMessage]);

      if (newMessage.sender === userId) {
        await api.put(`/messages/mark-read/${itemId}/${userId}`);
        await api.get("/messages/unread/count");
      }
    });
    return () => { socket.off("receiveMessage"); };
  }, [itemId, userId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const messageData = {
      sender: currentUser._id,
      receiver: userId,
      item: itemId,
      conversation: itemId,
      content: text,
    };
    socket.emit("sendMessage", messageData);
    setText("");
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-[#0B0F1A] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
      
      {/* 1. CHAT HEADER */}
      <div className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link to={`/my-items/${itemId}/messages`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white leading-none mb-1">
                {otherUserName || "User"}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Active Now</span>
              </div>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* 2. MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50 dark:bg-[#0B0F1A] custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading encrypted chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-10">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm mb-4">
               <ShieldCheck size={40} className="text-blue-500 opacity-50" />
            </div>
            <p className="text-slate-900 dark:text-white font-bold">Start the conversation</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Be polite and clear about the item details.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
            return (
              <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}>
                <div className={`group relative max-w-[80%] sm:max-w-md ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`px-5 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm transition-all ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-slate-200/50"
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT AREA */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
        <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 pl-6 pr-14 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 border-2 outline-none transition-all dark:text-white font-medium shadow-inner"
            placeholder="Write a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="absolute right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all transform active:scale-90 disabled:opacity-0 disabled:scale-50 shadow-lg shadow-blue-500/40"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Conversation;
