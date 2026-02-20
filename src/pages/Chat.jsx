import { useEffect, useState } from "react";
import socket from "../lib/socket";
import axios from "axios";
import { useParams } from "react-router-dom";

function Chat() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socket.emit("joinConversation", conversationId);

    axios
      .get(`/api/messages/${conversationId}`)
      .then((res) => setMessages(res.data));

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => socket.off("receiveMessage");
  }, [conversationId]);

  const sendMessage = () => {
    socket.emit("sendMessage", {
      conversation: conversationId,
      sender: JSON.parse(localStorage.getItem("user"))._id,
      text,
    });

    setText("");
  };

  return (
    <div>
      <h2>Chat</h2>

      {messages.map((msg) => (
        <div key={msg._id}>
          <strong>{msg.sender}</strong>: {msg.text}
        </div>
      ))}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;
