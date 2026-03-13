import { NavLink, Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus, User, LogOut, LayoutGrid } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import NotificationBell from "./NotificationBell";
import { toImageUrl } from "../lib/utils";

/* ================= ACTIVE LINK STYLE ================= */
const navLinkClass = ({ isActive }) =>
  `
  relative px-5 py-2 rounded-xl font-medium text-sm
  transition-all duration-300 ease-in-out
  ${
    isActive
      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
  }
`;

function Navbar() {
  const { token, user, setToken, setUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate(); // ✅ added

  const logout = () => {
    setToken(null);
    setUser(null);
    setOpen(false);

    navigate("/", { replace: true }); // ✅ redirect to home page
  };

  const profileImg = user?.profileImage
    ? toImageUrl(user.profileImage)
    : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const closeMenu = () => setOpen(false);

  return (
    <nav
      className="
      sticky top-0 z-50
      backdrop-blur-md
      bg-white/70 dark:bg-[#0B0F1A]/80
      border-b border-slate-200/50 dark:border-slate-800/50
    "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <LayoutGrid className="text-white" size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Found<span className="text-blue-600">Lost</span>
          </span>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/lost-items" className={navLinkClass}>
            Lost Items
          </NavLink>

          <NavLink to="/found-items" className={navLinkClass}>
            Found Items
          </NavLink>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

          <NavLink
            to="/create"
            className={({ isActive }) =>
              `
              flex items-center gap-2 px-5 py-2 rounded-xl
              font-bold text-sm transition-all
              ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl"
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/10"
              }
            `
            }
          >
            <Plus size={16} strokeWidth={3} />
            Post Item
          </NavLink>
        </div>

        {/* ================= RIGHT UTILITIES ================= */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <div className="flex items-center gap-1 sm:gap-3">
             <ModeToggle />
             {token && <NotificationBell user={user} />}
          </div>

          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 cursor-pointer border-2 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-blue-500 transition-all">
                  <AvatarImage src={profileImg} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="px-2 py-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                </div>

                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                <DropdownMenuItem asChild className="rounded-xl focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer py-2.5">
                  <Link to="/profile" className="flex items-center gap-3 w-full">
                    <User size={18} />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={logout}
                  className="rounded-xl focus:bg-red-50 dark:focus:bg-red-900/20 text-red-500 focus:text-red-600 cursor-pointer py-2.5"
                >
                  <div className="flex items-center gap-3 w-full">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 sm:px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* ================= MOBILE MENU ================= */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
              <Menu size={20} />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[300px] bg-white dark:bg-[#0B0F1A] border-l border-slate-200 dark:border-slate-800 pt-16"
            >
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Menu</p>

                <NavLink to="/lost-items" onClick={closeMenu} className={navLinkClass}>
                  Lost Items
                </NavLink>

                <NavLink to="/found-items" onClick={closeMenu} className={navLinkClass}>
                  Found Items
                </NavLink>

                <NavLink
                  to="/create"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 mt-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  Post Item
                </NavLink>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-4" />
                
                {token && (
                  <>
                    <NavLink to="/profile" onClick={closeMenu} className={navLinkClass}>
                      My Profile
                    </NavLink>

                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
