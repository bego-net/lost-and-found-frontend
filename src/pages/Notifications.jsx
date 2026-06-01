import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import { toImageUrl } from "../lib/utils";
import socket from "../lib/socket";
import { 
  Bell, 
  MessageSquare, 
  Package, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Check, 
  BellOff, 
  ArrowLeft,
  Settings
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications() {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "unread", "matches"
  const navigate = useNavigate();

  // Load all notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadNotifications();
  }, [token]);

  // Socket & Sync listeners
  useEffect(() => {
    if (!user?._id) return;
    socket.emit("userOnline", user._id);

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });
      // Sync badge with bell dropdown
      window.dispatchEvent(new Event("notificationsUpdated"));
    };

    const handleReceiveMessage = (newMessage) => {
      if (!newMessage) return;
      const senderId = newMessage.sender?._id || newMessage.sender;
      if (senderId === user?._id) return;
      const synthetic = {
        _id: `msg-${newMessage._id || Date.now()}`,
        type: "message",
        sender: newMessage.sender,
        item: newMessage.item,
        createdAt: newMessage.createdAt || new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [synthetic, ...prev]);
      window.dispatchEvent(new Event("notificationsUpdated"));
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("receiveMessage", handleReceiveMessage);

    // Sync from dropdown actions
    const handleNotificationsSync = () => {
      // Reload silently from database to stay in sync
      const reloadSilently = async () => {
        try {
          const res = await api.get("/notifications");
          setNotifications(res.data || []);
        } catch (err) {
          console.error("Silent reload error:", err);
        }
      };
      reloadSilently();
    };
    window.addEventListener("notificationsUpdated", handleNotificationsSync);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("receiveMessage", handleReceiveMessage);
      window.removeEventListener("notificationsUpdated", handleNotificationsSync);
    };
  }, [user?._id]);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all read error:", err);
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkSingleRead = async (e, id) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Mark read error:", err);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Delete notification error:", err);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        window.dispatchEvent(new Event("notificationsUpdated"));
      }

      const itemId = notification.item?._id || notification.item;
      if (notification.type === "message") {
        const senderId = notification.sender?._id || notification.sender;
        if (itemId && senderId) {
          navigate(`/chat/${itemId}/${senderId}`);
          return;
        }
      }
      if (itemId) {
        navigate(`/item/${itemId}`);
      }
    } catch (err) {
      console.error("Click handler error:", err);
    }
  };

  // Nice human-friendly time formatting
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getNotificationDetails = (n) => {
    switch (n.type) {
      case "match":
        return {
          icon: <Sparkles className="text-amber-500" size={18} />,
          text: n.similarity ? `AI found a ${n.similarity}% match for "${n.item?.title || 'your reported item'}"` : `AI found a similar item: ${n.item?.title || 'your reported item'}`,
          color: "bg-amber-50 dark:bg-amber-500/10",
          badge: "AI Match"
        };
      case "message":
        return {
          icon: <MessageSquare className="text-blue-500" size={18} />,
          text: `Sent you a new message regarding "${n.item?.title || 'item'}"`,
          color: "bg-blue-50 dark:bg-blue-500/10",
          badge: "Chat"
        };
      case "offer":
        return {
          icon: <Package className="text-emerald-500" size={18} />,
          text: `Sent you an offer for "${n.item?.title || 'item'}"`,
          color: "bg-emerald-50 dark:bg-emerald-500/10",
          badge: "Offer"
        };
      default:
        return {
          icon: <Bell className="text-slate-500" size={18} />,
          text: "New update received",
          color: "bg-slate-50 dark:bg-slate-500/10",
          badge: "Info"
        };
    }
  };

  // Redirect if not signed in
  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <Bell className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold dark:text-white">Authentication Required</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
          Please sign in to view and manage your account notifications.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Filter Logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "matches") return n.type === "match";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 dark:bg-[#0B0F1A] min-h-screen">
      
      {/* Back to Home & Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[100%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[80%] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      <button 
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full animate-pulse">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            Stay updated with real-time alerts, chats, and AI lost-and-found matches.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 flex-shrink-0"
          >
            <Check size={14} className="text-blue-500" /> Mark all as read
          </button>
        )}
      </div>

      {/* Tab Filter bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-6">
        {[
          { id: "all", label: "All Alerts", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "matches", label: "AI Matches", count: notifications.filter(n => n.type === "match").length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-1 relative text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === tab.id
                  ? "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Notifications List Container */}
      <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm backdrop-blur-md">
        
        {loading ? (
          /* ===== LOADING STATE SKELETON ===== */
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-6 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl flex-shrink-0" />
                <div className="flex-grow space-y-3 pt-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* ===== EMPTY STATE ===== */
          <div className="py-24 px-6 text-center">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-[2rem] mb-4 text-slate-400 dark:text-slate-500">
              <BellOff size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              All caught up!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              {activeTab === "unread" 
                ? "You have no unread notifications at the moment." 
                : activeTab === "matches"
                ? "AI matches for items you reported will appear here."
                : "No notifications found. We'll alert you when updates happen."}
            </p>
          </div>
        ) : (
          /* ===== NOTIFICATIONS LIST ===== */
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence initial={false}>
              {filteredNotifications.map((n) => {
                const details = getNotificationDetails(n);
                return (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={() => handleNotificationClick(n)}
                    className={`group relative flex gap-4 p-6 cursor-pointer transition-colors ${
                      !n.isRead 
                        ? "bg-blue-50/30 dark:bg-blue-500/[0.02] hover:bg-slate-50 dark:hover:bg-slate-800/40" 
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                    }`}
                  >
                    {/* Unread Glow Ribbon indicator */}
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-lg" />
                    )}

                    {/* Avatar & Icon Corner Tag */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-200/50 dark:border-slate-800">
                        {n.type === "match" ? (
                          <>
                            <AvatarImage
                              src="https://cdn-icons-png.flaticon.com/512/4712/4712038.png"
                              alt="FoundLost AI"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center">
                              <Sparkles size={20} />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            {n.sender?.profileImage ? (
                              <AvatarImage
                                src={toImageUrl(n.sender.profileImage)}
                                alt={n.sender?.name || "User"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : null}
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-lg flex items-center justify-center">
                              {(n.sender?.name || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-white dark:border-slate-900 shadow-sm ${details.color}`}>
                        {details.icon}
                      </div>
                    </div>

                    {/* Notification Details & Content */}
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {n.type === "match" ? "FoundLost AI" : (n.sender?.name || "User")}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                          {details.badge}
                        </span>
                      </div>
                      <p className={`text-xs md:text-sm leading-relaxed mb-2.5 ${!n.isRead ? "text-slate-800 dark:text-slate-200 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
                        {details.text}
                      </p>
                      
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={10} />
                          {formatTime(n.createdAt)}
                        </span>
                        {n.item && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 truncate max-w-[200px]">
                            #{n.item?.title || "Item Detail"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel (Appears on Hover, or Persistent small icons on mobile) */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button
                          onClick={(e) => handleMarkSingleRead(e, n._id)}
                          title="Mark as read"
                          className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 rounded-xl transition-all border border-slate-100 dark:border-slate-700/50 hover:border-blue-200"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        title="Delete notification"
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all border border-slate-100 dark:border-slate-700/50 hover:border-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
