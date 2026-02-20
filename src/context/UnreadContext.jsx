import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const UnreadContext = createContext();

export const UnreadProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get("/messages/unread/count");
      setUnreadCount(data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <UnreadContext.Provider
      value={{ unreadCount, setUnreadCount, fetchUnreadCount }}
    >
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => useContext(UnreadContext);
