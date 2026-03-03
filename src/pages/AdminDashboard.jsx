import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Package,
  CheckCircle,
  Trash2,
  LayoutDashboard,
  Search,
  Menu,
  X,
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLostItems: 0,
    totalFoundItems: 0,
  });

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch {
      toast.error("Failed to load stats");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get("/admin/items");
      setItems(res.data);
    } catch {
      toast.error("Failed to load items");
    }
  };

  /* ================= ACTIONS ================= */

  const toggleBan = async (user) => {
    try {
      if (user.isBanned) {
        await api.put(`/admin/users/unban/${user._id}`);
        toast.success("User unbanned");
      } else {
        await api.put(`/admin/users/ban/${user._id}`);
        toast.success("User banned");
      }
      fetchUsers();
    } catch {
      toast.error("Action failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
      fetchStats();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await api.delete(`/admin/items/${id}`);
      toast.success("Item deleted");
      fetchItems();
      fetchStats();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  /* ================= LOAD ================= */

  useEffect(() => {
    const loadData = async () => {
      await fetchStats();
      await fetchUsers();
      await fetchItems();
      setLoading(false);
    };
    loadData();
  }, []);

  /* ================= FILTERS ================= */

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const filteredItems = items.filter((item) =>
    `${item.title} ${item.description}`
      .toLowerCase()
      .includes(itemSearch.toLowerCase())
  );

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-[#103B66] text-white p-6 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav className="space-y-3">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
          />
          <SidebarItem
            icon={<Users size={18} />}
            label="Users"
            active={activeTab === "users"}
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
          />
          <SidebarItem
            icon={<Package size={18} />}
            label="Items"
            active={activeTab === "items"}
            onClick={() => {
              setActiveTab("items");
              setSidebarOpen(false);
            }}
          />
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-6 md:p-8 w-full">
        <button
          className="md:hidden mb-6"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </button>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Users className="text-blue-500" />}
              title="Total Users"
              value={stats.totalUsers}
            />
            <StatCard
              icon={<Package className="text-red-500" />}
              title="Lost Items"
              value={stats.totalLostItems}
            />
            <StatCard
              icon={<CheckCircle className="text-green-500" />}
              title="Found Items"
              value={stats.totalFoundItems}
            />
          </div>
        )}

        {/* ================= USERS ================= */}
        {activeTab === "users" && (
          <Section title="User Management" icon={<Shield size={18} />}>
            {/* USER SEARCH */}
            <div className="relative mb-6 w-72">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-3 py-2 w-full rounded-lg border dark:bg-gray-800 dark:text-white"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <Table>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="py-3">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.isBanned ? (
                      <span className="text-red-500">Banned</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </td>
                  <td className="text-right flex justify-end gap-2">
                    {user.role !== "admin" && (
                      <>
                        <button
                          onClick={() => toggleBan(user)}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          {user.isBanned ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Section>
        )}

        {/* ================= ITEMS ================= */}
        {activeTab === "items" && (
          <Section title="Items Management" icon={<Trash2 size={18} />}>
            {/* ITEM SEARCH */}
            <div className="relative mb-6 w-72">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search items..."
                className="pl-9 pr-3 py-2 w-full rounded-lg border dark:bg-gray-800 dark:text-white"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
              />
            </div>

            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between border-b py-3"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => deleteItem(item._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${
      active
        ? "bg-white text-[#103B66] font-semibold"
        : "hover:bg-white/20"
    }`}
  >
    {icon}
    {label}
  </div>
);

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
    {icon}
    <p className="mt-2">{title}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
    <h2 className="flex items-center gap-2 mb-6 font-semibold">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="border-b">
        <tr>
          <th className="py-3">Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th className="text-right">Action</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default AdminDashboard;