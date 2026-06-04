import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Package, Sparkles, CheckCircle2, Clock } from "lucide-react";
import socket from "../lib/socket";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { toImageUrl } from "../lib/utils";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [showRead, setShowRead] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Notification load error:", err);
      }
    };
    loadNotifications();

    const handleSync = () => {
      loadNotifications();
    };
    window.addEventListener("notificationsUpdated", handleSync);
    return () => {
      window.removeEventListener("notificationsUpdated", handleSync);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("userOnline", user._id);
    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });
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
    };
    socket.on("newNotification", handleNewNotification);
    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [user?._id]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleClick = async (notification) => {
    try {
      if (notification._id && !notification._id.startsWith("msg-")) {
        await api.put(`/notifications/${notification._id}/read`);
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
      const itemId = notification.item?._id || notification.item;
      const senderId = notification.sender?._id || notification.sender;
      if (notification.type === "message" && itemId && senderId) {
        navigate(`/conversation/${itemId}/${senderId}`);
      } else if (itemId) {
        navigate(`/item/${itemId}`);
      }
      setOpen(false);
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;
  const displayedNotifications = showRead
    ? notifications
    : unreadNotifications;

  const getNotificationDetails = (n) => {
    switch (n.type) {
      case "match":
        return {
          icon: <Sparkles className="text-amber-500" size={16} />,
          text: n.similarity ? `AI found a ${n.similarity}% match for "${n.item?.title}"` : `AI found a similar item: ${n.item?.title}`,
          color: "bg-amber-50 dark:bg-amber-500/10"
        };
      case "message":
        return {
          icon: <MessageSquare className="text-blue-500" size={16} />,
          text: "Sent you a new message",
          color: "bg-blue-50 dark:bg-blue-500/10"
        };
      case "offer":
        return {
          icon: <Package className="text-emerald-500" size={16} />,
          text: "Sent you an offer",
          color: "bg-emerald-50 dark:bg-emerald-500/10"
        };
      default:
        return {
          icon: <Bell className="text-slate-400" size={16} />,
          text: "New update received",
          color: "bg-slate-50 dark:bg-slate-500/10"
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Notification Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 transform active:scale-95 ${
          open 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" 
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        }`}
      >
        <Bell size={22} strokeWidth={open ? 2.5 : 2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[10px] font-black text-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* 📦 Dropdown Menu */}
      {open && (
        <div className="fixed md:absolute top-[70px] md:top-auto left-4 right-4 md:left-auto md:right-0 w-auto md:w-[350px] bg-white dark:bg-[#0B0F1A] shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2rem] border border-slate-200 dark:border-slate-800 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top md:origin-top-right">
          
          {/* Header */}
          <div className="px-6 py-5 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900/50">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white leading-none">Notifications</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                You have {unreadCount} unread
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 text-[10px] font-black rounded-lg">
                NEW
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-transparent">
            {notifications.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-3 text-slate-400">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-slate-900 dark:text-white font-bold text-sm">All caught up!</p>
                <p className="text-slate-500 text-xs mt-1">No notifications at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedNotifications.length === 0 ? (
                  <div className="py-8 px-6 text-center">
                    <p className="text-slate-500 text-xs">No unread notifications.</p>
                  </div>
                ) : (
                  displayedNotifications.map((n, idx) => {
                    const details = getNotificationDetails(n);
                    return (
                      <div
                        key={`${n._id || ""}-${idx}`}
                        onClick={() => handleClick(n)}
                        className={`group relative flex gap-4 p-5 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800 ${
                          !n.isRead ? "bg-white dark:bg-slate-900/40" : ""
                        }`}
                      >
                        {/* Avatar & Icon */}
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
                          <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg shadow-sm border-2 border-white dark:border-[#0B0F1A] ${details.color}`}>
                            {details.icon}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className="font-black text-sm text-slate-900 dark:text-white truncate pr-4">
                              {n.type === "match" ? "FoundLost AI" : (n.sender?.name || "User")}
                            </p>
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed mb-2 ${!n.isRead ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                            {details.text}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={10} />
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* See More Messages / See Less Toggle */}
                {notifications.some((n) => n.isRead) && (
                  <div className="p-3 text-center border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <button
                      onClick={() => setShowRead((prev) => !prev)}
                      className="px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {showRead ? "See Less" : "See More Messages"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {unreadNotifications.length > 0 && (
            <button 
              className="w-full py-4 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-t dark:border-slate-800"
              onClick={() => navigate('/notifications')}
            >
              View All Notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}
