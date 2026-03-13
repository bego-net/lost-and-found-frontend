import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import {
  Users,
  Package,
  CheckCircle,
  LayoutDashboard,
  Mail,
  X,
  Shield,
  Trash2,
  Ban,
  UserCheck,
  Reply,
  Search,
  ArrowUpRight
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalLostItems: 0, totalFoundItems: 0 });
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const authData = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const currentAdminId = authData?._id || authData?.id;

  const fetchData = async () => {
    try {
      const [s, u, i, m] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/items"),
        api.get("/admin/messages").catch(() => ({ data: [] }))
      ]);
      setStats(s.data);
      setUsers(u.data);
      setItems(i.data);
      setMessages(m.data);
    } catch {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleBan = async (user) => {
    if (user._id === currentAdminId) return toast.error("Action denied: Admin self-restriction");
    try {
      const endpoint = user.isBanned ? 'unban' : 'ban';
      await api.put(`/admin/users/${endpoint}/${user._id}`);
      toast.success("Security status updated");
      fetchData();
    } catch { toast.error("Update failed"); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Confirm permanent deletion?")) return;
    try {
      await api.delete(`/admin/items/${id}`);
      toast.success("Record cleared");
      fetchData();
    } catch { toast.error("Deletion failed"); }
  };

  const sendReply = async () => {
    if (!replyText) return toast.error("Content required");
    try {
      await api.post("/admin/reply", { email: selectedMessage.email, reply: replyText });
      toast.success("Reply transmitted");
      setReplyText("");
      setSelectedMessage(null);
    } catch { toast.error("Transmission failed"); }
  };

  const filteredUsers = users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredItems = items.filter(i => `${i.title}`.toLowerCase().includes(userSearch.toLowerCase()));

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 dark:border-slate-800 rounded-full animate-pulse" />
        <div className="absolute top-0 w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      
      {/* SIDEBAR (Theme Toggle Removed) */}
      <aside className="w-72 p-6 h-screen sticky top-0 hidden lg:flex flex-col">
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex-1 flex flex-col p-6 shadow-sm">
          <div className="flex items-center gap-3 px-3 py-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase dark:text-white">FoundFlow</span>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === "dashboard"} onClick={()=>setActiveTab("dashboard")} />
            <SidebarItem icon={<Users size={20}/>} label="Users" active={activeTab === "users"} onClick={()=>setActiveTab("users")} />
            <SidebarItem icon={<Package size={20}/>} label="Items" active={activeTab === "items"} onClick={()=>setActiveTab("items")} />
            <SidebarItem icon={<Mail size={20}/>} label="Messages" active={activeTab === "messages"} onClick={()=>setActiveTab("messages")} />
          </nav>

          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/20">
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-center">System Secure</p>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <div className="w-4 h-[2px] bg-indigo-600"/> Admin Portal
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white capitalize">{activeTab}</h1>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              placeholder="Search database..." 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full md:w-96 shadow-sm"
              value={userSearch} onChange={e=>setUserSearch(e.target.value)}
            />
          </div>
        </header>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <StatCard icon={<Users/>} title="Total Users" value={stats.totalUsers} color="from-indigo-500 to-indigo-600" />
            <StatCard icon={<Package/>} title="Lost Items" value={stats.totalLostItems} color="from-rose-500 to-rose-600" />
            <StatCard icon={<CheckCircle/>} title="Found Items" value={stats.totalFoundItems} color="from-emerald-500 to-emerald-600" />
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <Table headers={["Profile", "Role", "Status", "Management"]}>
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800 group" onClick={()=>setSelectedUser(u)}>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
  {u.profileImage && u.profileImage !== "/uploads/default-profile.png" ? (
    <img
      src={`http://localhost:5000${u.profileImage}`}
      alt={u.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="font-bold text-slate-600 dark:text-slate-300 text-sm uppercase">
      {u.name.charAt(0)}
    </span>
  )}
</div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                        <div className="text-[11px] font-medium text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6"><span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">{u.role}</span></td>
                  <td className="p-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.isBanned ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {u.isBanned ? 'Restricted' : 'Active'}
                    </div>
                  </td>
                  <td className="p-6" onClick={e=>e.stopPropagation()}>
                    {u._id !== currentAdminId && (
                      <div className="flex gap-2">
                        <ActionButton 
                           icon={u.isBanned ? <UserCheck size={14}/> : <Ban size={14}/>} 
                           label={u.isBanned ? "Unban" : "Ban"} 
                           onClick={()=>toggleBan(u)} 
                           color={u.isBanned ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-rose-50 text-rose-600 hover:bg-rose-100"}
                        />
                        <ActionButton icon={<Trash2 size={14}/>} label="Delete" color="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === "items" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            {filteredItems.map(item => (
              <div key={item._id} onClick={()=>setSelectedItem(item)} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] hover:shadow-2xl transition-all group cursor-pointer relative">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="text-slate-300" size={20} />
                </div>
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:rotate-6 transition-transform"><Package size={28}/></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry: {item._id.slice(-8)}</span>
                    <ActionButton 
                      icon={<Trash2 size={14}/>} 
                      label="Delete Item" 
                      onClick={(e)=>{e.stopPropagation(); deleteItem(item._id)}} 
                      color="bg-rose-50 text-rose-600 hover:bg-rose-100" 
                    />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4">
            {messages.map(msg => (
              <div key={msg._id} className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 group transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-sm">{msg.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-black dark:text-white uppercase tracking-tighter text-sm">{msg.name}</h4>
                      <p className="text-xs text-indigo-500 font-bold">{msg.email}</p>
                    </div>
                  </div>
                  <button onClick={()=>setSelectedMessage(msg)} className="w-full md:w-auto px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-transform flex items-center justify-center gap-2">
                    <Reply size={14}/> Reply
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium italic">
                  "{msg.message}"
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL SYSTEM */}
      {(selectedUser || selectedItem || selectedMessage) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in" onClick={() => {setSelectedUser(null); setSelectedItem(null); setSelectedMessage(null)}}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-10 rounded-[3.5rem] shadow-2xl relative animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
            <button onClick={() => {setSelectedUser(null); setSelectedItem(null); setSelectedMessage(null)}} className="absolute top-10 right-10 text-slate-400 hover:text-rose-500"><X size={24}/></button>
            
            {selectedUser && <>
              <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden bg-slate-200 flex items-center justify-center">
  {selectedUser.profileImage &&
  selectedUser.profileImage !== "/uploads/default-profile.png" ? (
    <img
      src={`http://localhost:5000${selectedUser.profileImage}`}
      alt={selectedUser.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-3xl font-bold text-white bg-indigo-600 w-full h-full flex items-center justify-center">
      {selectedUser.name.charAt(0)}
    </span>
  )}
</div>
                <h3 className="text-3xl font-black dark:text-white tracking-tighter">{selectedUser.name}</h3>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">{selectedUser.role}</p>
              </div>
              <div className="space-y-4">
                <ModalInfo label="Contact" value={selectedUser.email} />
                <ModalInfo label="Account Standing" value={selectedUser.isBanned ? 'Banned' : 'Active'} color={selectedUser.isBanned ? 'text-rose-500' : 'text-emerald-500'} />
              </div>
            </>}

            {selectedMessage && <>
              <h2 className="text-2xl font-black dark:text-white tracking-tighter mb-8">Reply to Message</h2>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Recipient</p>
                <p className="text-sm font-black text-indigo-600">{selectedMessage.email}</p>
              </div>
              <textarea 
                rows="6" 
                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white rounded-[2rem] p-6 text-sm outline-none ring-2 ring-transparent focus:ring-indigo-500/20 border-none mb-6 resize-none transition-all font-medium" 
                placeholder="Compose your reply..."
                value={replyText} onChange={e=>setReplyText(e.target.value)}
              />
              <button onClick={sendReply} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none">Transmit Reply</button>
            </>}

            {selectedItem && <>
              <h2 className="text-3xl font-black dark:text-white tracking-tighter mb-4">{selectedItem.title}</h2>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-8 rounded-[2.5rem] text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">"{selectedItem.description}"</div>
              <div className="grid grid-cols-2 gap-8 px-4">
                <ModalInfo label="Creation Date" value={new Date(selectedItem.createdAt).toLocaleDateString()} />
                <ModalInfo label="Item Code" value={selectedItem._id.slice(-10).toUpperCase()} />
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI SUB-COMPONENTS ---------------- */

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-500 ${active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black shadow-lg translate-x-1' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
    {icon} <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-sm relative overflow-hidden group">
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
  </div>
);

const Table = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50/50 dark:bg-slate-800/40">
          {headers.map(h => (<th key={h} className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">{h}</th>))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const ActionButton = ({ icon, label, onClick, color }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-black text-[10px] uppercase tracking-wider ${color}`}
  >
    {icon} {label}
  </button>
);

const ModalInfo = ({ label, value, color = "dark:text-white" }) => (
  <div className="px-2">
    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{label}</p>
    <p className={`text-sm font-black truncate ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;