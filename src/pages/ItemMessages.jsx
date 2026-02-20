import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api/axios";

const socket = io("http://localhost:5000");

export default function ItemMessages() {
  const { itemId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({}); // 🔥 NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // ===============================
  // FETCH MESSAGES
  // ===============================
  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/item/${itemId}`);

      const grouped = {};

      res.data.forEach((msg) => {
        const otherUser =
          msg.sender._id === user._id
            ? msg.receiver
            : msg.sender;

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

      // 🔥 FETCH UNREAD COUNT FOR EACH USER
      chats.forEach(async (chat) => {
        try {
          const { data } = await api.get(
            `/messages/unread/${itemId}/${chat.user._id}`
          );

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

  // ===============================
  // SOCKET CONNECTION
  // ===============================
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("userOnline", user._id);
    socket.emit("joinConversation", itemId);

    socket.on("updateOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", async (newMessage) => {
      if (newMessage.item !== itemId) return;

      const otherUserId =
        newMessage.sender === user._id
          ? newMessage.receiver
          : newMessage.sender;

      // Update last message
      setConversations((prev) => {
        const existing = prev.find(
          (chat) => chat.user._id === otherUserId
        );

        if (existing) {
          return prev.map((chat) =>
            chat.user._id === otherUserId
              ? {
                  ...chat,
                  lastMessage: newMessage.content,
                  time: newMessage.createdAt,
                }
              : chat
          );
        } else {
          return [
            {
              user: { _id: otherUserId },
              lastMessage: newMessage.content,
              time: newMessage.createdAt,
            },
            ...prev,
          ];
        }
      });

      // 🔥 Increase unread count if message from other user
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

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading conversations...
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-10 text-red-500">
        {error}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">

      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <Link
          to={`/item/${itemId}`}
          className="text-emerald-600 hover:underline"
        >
          ← Back
        </Link>

        <h2 className="text-lg font-semibold">Item Conversations</h2>
      </div>

      {conversations.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No conversations yet for this item.
        </div>
      ) : (
        <div>
          {conversations.map((chat) => {
            const isOnline = onlineUsers.includes(chat.user._id);
            const unread = unreadCounts[chat.user._id] || 0;

            return (
              <Link
                key={chat.user._id}
                to={`/conversation/${itemId}/${chat.user._id}`}
                className="block p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {chat.user?.name || "User"}

                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>

                      {/* 🔴 UNREAD BADGE */}
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {unread}
                        </span>
                      )}
                    </h3>

                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  <span className="text-xs text-gray-400">
                    {new Date(chat.time).toLocaleTimeString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
