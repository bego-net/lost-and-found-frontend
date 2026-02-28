import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ==================================================
   Create socket ONLY once (outside component)
================================================== */
const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* ==================================================
     1️⃣ LOAD NOTIFICATIONS
  ================================================== */
  useEffect(() => {
    if (!user?._id) return;

    const loadNotifications = async () => {
      try {
        const res = await axios.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    loadNotifications();
  }, [user?._id]);

  /* ==================================================
     2️⃣ SOCKET LISTENER
  ================================================== */
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("userOnline", user._id);

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [user?._id]);

  /* ==================================================
     3️⃣ CLOSE DROPDOWN WHEN CLICK OUTSIDE
  ================================================== */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ==================================================
     4️⃣ HANDLE NOTIFICATION CLICK
  ================================================== */
  const handleClick = async (notification) => {
    try {
      await axios.put(`/notifications/${notification._id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );

      // Make sure route exists in App.jsx
      navigate(
        `/chat/${notification.item?._id}/${notification.sender?._id}`
      );

      setOpen(false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ==================================================
     UI
  ================================================== */
  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200"
      >
        <span className="text-2xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 🔽 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">

          <div className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-white">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  !n.isRead
                    ? "bg-blue-50 dark:bg-gray-700"
                    : ""
                }`}
              >
                <img
                src={
                  n.sender?.profileImage
                    ? `http://localhost:5000${n.sender.profileImage}`
                    : "http://localhost:5000/uploads/default-profile.png"
           }
                 alt="avatar"
                 className="w-10 h-10 rounded-full object-cover"
            />

                <div className="flex-1">
                  <p className="font-medium text-sm dark:text-white">
                    {n.sender?.name || "Unknown User"}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sent you a message
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(
                      n.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                {!n.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}