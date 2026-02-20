import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api/axios";

const socket = io("http://localhost:5000");

function Conversation() {
  const { itemId, userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState("");

  const messagesEndRef = useRef(null);

  // ===============================
  // FETCH CONVERSATION
  // ===============================
  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get(
        `/messages/conversation/${itemId}/${userId}`
      );

      setMessages(data);

      if (data.length > 0) {
        const firstMsg = data[0];
        const otherUser =
          firstMsg.sender._id === currentUser._id
            ? firstMsg.receiver
            : firstMsg.sender;

        setOtherUserName(otherUser?.name || "User");
      }

      // 🔥 Mark messages as read
      await api.put(`/messages/mark-read/${itemId}/${userId}`);

      // 🔥 VERY IMPORTANT: Refresh global unread count
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

  // ===============================
  // SOCKET SETUP
  // ===============================
  useEffect(() => {
    if (!currentUser?._id) return;

    socket.emit("joinConversation", itemId);

    socket.on("receiveMessage", async (newMessage) => {
      if (newMessage.item !== itemId) return;

      const isRelated =
        (newMessage.sender === currentUser._id &&
          newMessage.receiver === userId) ||
        (newMessage.sender === userId &&
          newMessage.receiver === currentUser._id);

      if (!isRelated) return;

      setMessages((prev) => [...prev, newMessage]);

      // 🔥 If message is from other user → mark as read immediately
      if (newMessage.sender === userId) {
        await api.put(`/messages/mark-read/${itemId}/${userId}`);
        await api.get("/messages/unread/count");
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [itemId, userId, currentUser]);

  // ===============================
  // AUTO SCROLL
  // ===============================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===============================
  // SEND MESSAGE
  // ===============================
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
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">

      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <Link
          to={`/my-items/${itemId}/messages`}
          className="text-emerald-600 hover:underline"
        >
          ← Back
        </Link>

        <h2 className="font-semibold text-lg">
          {otherUserName || "Conversation"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
        {loading ? (
          <div className="text-center text-gray-500">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              msg.sender._id === currentUser._id ||
              msg.sender === currentUser._id;

            return (
              <div
                key={msg._id || Math.random()}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words shadow ${
                    isMe
                      ? "bg-emerald-600 text-white"
                      : "bg-white dark:bg-gray-700 border"
                  }`}
                >
                  {!isMe && (
                    <div className="text-xs font-semibold mb-1 text-gray-500 dark:text-gray-300">
                      {msg.sender?.name}
                    </div>
                  )}

                  <p>{msg.content}</p>

                  <div className="text-xs mt-1 opacity-70 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t dark:border-gray-700 flex gap-3 bg-white dark:bg-gray-900">
        <input
          type="text"
          className="flex-1 p-3 rounded-xl border dark:bg-gray-800 outline-none"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Conversation; 
