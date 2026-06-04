import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft, Send, MoreVertical, ShieldCheck, Clock, User, Package } from "lucide-react";
import socket from "../lib/socket";
import { toImageUrl } from "../lib/utils";

function Conversation() {
  const { itemId, userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/messages/conversation/${itemId}/${userId}`);
      setMessages(data.messages || []);
      setConversationId(data.conversationId);
      setOtherUser(data.otherUser);

      if (data.otherUser) {
        setOtherUserName(data.otherUser.name);
      } else if (data.messages && data.messages.length > 0) {
        const firstMsg = data.messages[0];
        const otherUserObj = firstMsg.sender._id === currentUser._id ? firstMsg.receiver : firstMsg.sender;
        setOtherUserName(otherUserObj?.name || "User");
        setOtherUser(otherUserObj);
      } else {
        // Fallback: Fetch user details dynamically if no messages exist yet
        api.get(`/auth/profile/${userId}`)
          .then((res) => {
            if (res.data?.user) {
              setOtherUserName(res.data.user.name);
              setOtherUser(res.data.user);
            }
          })
          .catch(() => setOtherUserName("User"));
      }

      await api.put(`/messages/mark-read/${itemId}/${userId}`);
      await api.get("/messages/unread/count");

      if (data.conversationId) {
        socket.emit("messagesSeen", { conversationId: data.conversationId, userId: currentUser._id });
      }
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
    if (!currentUser?._id || !conversationId) return;

    socket.emit("joinConversation", conversationId);
    socket.emit("userOnline", currentUser._id);

    // Sync online users list
    socket.on("updateOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    const handleMessage = async (newMessage) => {
      if (newMessage.conversation !== conversationId) return;

      setMessages((prev) => {
        if (newMessage._id && prev.some((m) => m._id === newMessage._id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      const isSenderOther = newMessage.sender === userId || newMessage.sender?._id === userId;
      if (isSenderOther) {
        await api.put(`/messages/mark-read/${itemId}/${userId}`);
        await api.get("/messages/unread/count");
        socket.emit("messagesSeen", { conversationId, userId: currentUser._id });
      }
    };

    const handleMessagesSeen = ({ conversationId: seenConvoId }) => {
      if (seenConvoId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender === currentUser._id || msg.sender?._id === currentUser._id
              ? { ...msg, read: true, seenAt: new Date() }
              : msg
          )
        );
      }
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("updateOnlineUsers");
    };
  }, [conversationId, itemId, userId, currentUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !conversationId) return;
    const messageData = {
      sender: currentUser._id,
      receiver: userId,
      item: itemId || undefined,
      conversation: conversationId,
      content: text,
    };
    socket.emit("sendMessage", messageData);
    setText("");
  };

  const isOnline = onlineUsers.includes(userId);

  const getPresenceText = () => {
    if (isOnline) return "Active now";
    if (!otherUser?.lastSeen) return "Offline";

    const date = new Date(otherUser.lastSeen);
    const diffMs = Date.now() - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    return `Last seen on ${date.toLocaleDateString()}`;
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-[#0B0F1A] sm:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
      
      {/* 1. Telegram-Style Chat Header */}
      <div className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link
            to={
              itemId && /^[0-9a-fA-F]{24}$/.test(itemId)
                ? `/my-items/${itemId}/messages`
                : "/my-items"
            }
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to={`/profile?userId=${userId}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
              <div className="relative">
                {otherUser?.profileImage && otherUser.profileImage !== "/uploads/default-profile.png" ? (
                  <img
                    src={toImageUrl(otherUser.profileImage)}
                    alt={otherUserName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 font-black text-sm">
                    {otherUserName?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0B0F1A] rounded-full" />
                )}
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-white leading-none mb-1 text-base">
                  {otherUserName || "User"}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold tracking-wide ${isOnline ? "text-emerald-500" : "text-slate-400"}`}>
                    {getPresenceText()}
                  </span>
                </div>
              </div>
            </Link>
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
            const isMe = msg.sender === currentUser._id || msg.sender?._id === currentUser._id;
            const showItemPreview = msg.item && typeof msg.item === "object" && msg.item.title;

            return (
              <div key={`${msg._id || ""}-${idx}`} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-fadeIn`}>
                {showItemPreview && (
                  <div className="mb-2 p-3 bg-white dark:bg-slate-800 rounded-2xl flex items-center gap-3 max-w-xs border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                    {msg.item.images?.[0] ? (
                      <img
                        src={toImageUrl(msg.item.images[0])}
                        alt={msg.item.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Package size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-none">Inquiry About</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate mt-1 leading-tight">{msg.item.title}</p>
                    </div>
                  </div>
                )}
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
                    {isMe && (
                      <span className={`text-[11px] font-black leading-none ${msg.read ? "text-blue-500 dark:text-blue-400" : "text-slate-400"}`}>
                        {msg.read ? "✓✓" : "✓"}
                      </span>
                    )}
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
