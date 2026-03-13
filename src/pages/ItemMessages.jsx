import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api/axios";
import { ArrowLeft, MessageSquare, Search, User, Clock, ChevronRight } from "lucide-react";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

export default function ItemMessages() {
  const { itemId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/item/${itemId}`);
      const grouped = {};

      res.data.forEach((msg) => {
        const otherUser = msg.sender._id === user._id ? msg.receiver : msg.sender;

        if (!grouped[otherUser._id]) {
          grouped[otherUser._id] = {
            user: otherUser,
            lastMessage: msg.content,
            time: msg.createdAt,
          };
        } else {
          if (new Date(msg.createdAt) > new Date(grouped[otherUser._id].time)) {
            grouped[otherUser._id].lastMessage = msg.content;
            grouped[otherUser._id].time = msg.createdAt;
          }
        }
      });

      const chats = Object.values(grouped);
      setConversations(chats);

      chats.forEach(async (chat) => {
        try {
          const { data } = await api.get(`/messages/unread/${itemId}/${chat.user._id}`);
          setUnreadCounts((prev) => ({
            ...prev,
            [chat.user._id]: data.unreadCount,
          }));
        } catch (err) {
          console.error(err);
        }
      });
    } catch {
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("userOnline", user._id);
    socket.emit("joinConversation", itemId);
    socket.on("updateOnlineUsers", (users) => setOnlineUsers(users));

    socket.on("receiveMessage", async (newMessage) => {
      if (newMessage.item !== itemId) return;
      const otherUserId = newMessage.sender === user._id ? newMessage.receiver : newMessage.sender;

      setConversations((prev) => {
        const existing = prev.find((chat) => chat.user._id === otherUserId);
        if (existing) {
          return prev.map((chat) =>
            chat.user._id === otherUserId
              ? { ...chat, lastMessage: newMessage.content, time: newMessage.createdAt }
              : chat
          );
        } else {
          return [{ user: { _id: otherUserId }, lastMessage: newMessage.content, time: newMessage.createdAt }, ...prev];
        }
      });

      if (newMessage.sender !== user._id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [otherUserId]: (prev[otherUserId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("updateOnlineUsers");
      socket.off("receiveMessage");
    };
  }, [itemId, user]);

  useEffect(() => {
    fetchMessages();
  }, [itemId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Chats...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl text-center">
      <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all">
      
      {/* 1. Header Area */}
      <div className="p-6 border-b dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex justify-between items-center mb-6">
          <Link to={`/item/${itemId}`} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back to Item</span>
          </Link>
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Inbox</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Messages</h2>
      </div>

      {/* 2. Conversations List */}
      <div className="divide-y dark:divide-slate-800">
        {conversations.length === 0 ? (
          <div className="p-20 text-center">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-[2rem] mb-4 text-slate-400">
              <MessageSquare size={40} />
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg">No inquiries yet</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mt-2">
              When people message you about this item, they will appear here.
            </p>
          </div>
        ) : (
          conversations.map((chat) => {
            const isOnline = onlineUsers.includes(chat.user._id);
            const unread = unreadCounts[chat.user._id] || 0;

            return (
              <Link
                key={chat.user._id}
                to={`/conversation/${itemId}/${chat.user._id}`}
                className="group flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all relative"
              >
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-500 group-hover:shadow-lg transition-all">
                    <User size={24} />
                  </div>
                  {isOnline && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-[#0B0F1A] rounded-full" />
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-black text-slate-900 dark:text-white truncate">
                      {chat.user?.name || "Anonymous User"}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                       <Clock size={10} />
                       {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${unread > 0 ? "text-slate-900 dark:text-slate-200 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
                      {chat.lastMessage}
                    </p>
                    
                    {unread > 0 && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-500/30">
                        {unread}
                      </span>
                    )}
                    
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* 3. Bottom Footer/Indicator */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/30 text-center border-t dark:border-slate-800">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Syncing with real-time server
        </p>
      </div>
    </div>
  );
}