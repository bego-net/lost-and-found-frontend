import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function MyItems() {
  const [items, setItems] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const res = await api.get("/items/my-items");
        setItems(res.data);

        const counts = {};
        for (let item of res.data) {
          const countRes = await api.get(
            `/messages/unread/${item._id}`
          );
          counts[item._id] = countRes.data.count;
        }
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Error loading items:", error);
      }
    };

    fetchMyItems();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Posted Items</h2>

      {items.length === 0 && (
        <p style={styles.empty}>You haven’t posted any items yet.</p>
      )}

      {items.map((item) => (
        <div key={item._id} style={styles.card}>
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>

          <div style={styles.right}>
            {unreadCounts[item._id] > 0 && (
              <span style={styles.badge}>
                {unreadCounts[item._id]} new
              </span>
            )}

            <Link to={`/my-items/${item._id}`} style={styles.button}>
              View Messages
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    color: "#fff",
  },
  title: {
    marginBottom: "20px",
  },
  empty: {
    opacity: 0.7,
  },
  card: {
    background: "#111827",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  badge: {
    background: "red",
    color: "white",
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  button: {
    background: "#2563eb",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
  },
};
