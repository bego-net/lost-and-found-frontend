import { NavLink, Link } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import NotificationBell from "./NotificationBell";

/* ================= ACTIVE LINK STYLE ================= */
const navLinkClass = ({ isActive }) =>
  `
  relative px-4 py-2 rounded-full
  transition-all duration-300
  ${
    isActive
      ? "bg-white/20 text-white shadow-inner"
      : "text-white/80 hover:text-white hover:bg-white/10"
  }
`;

function Navbar() {
  const { token, user, setToken, setUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const logout = () => {
    setToken(null);
    setUser(null);
    setOpen(false);
  };

  const profileImg = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const closeMenu = () => setOpen(false);

  return (
    <nav
      className="
      sticky top-0 z-50
      backdrop-blur-xl
      bg-[#103B66]/80 dark:bg-gray-900/80
      border-b border-white/10
    "
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-wide text-white"
        >
          Lost<span className="text-gray-300"> & </span>Found
        </Link>

        {/* ================= DESKTOP ================= */}
        <div className="hidden md:flex items-center gap-4">

          <NavLink to="/lost-items" className={navLinkClass}>
            Lost Items
          </NavLink>

          <NavLink to="/found-items" className={navLinkClass}>
            Found Items
          </NavLink>

          {/* CTA */}
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `
              flex items-center gap-2 px-4 py-2 rounded-full
              font-semibold transition-all
              ${
                isActive
                  ? "bg-white text-[#103B66]"
                  : "bg-white/90 text-[#103B66] hover:scale-105"
              }
            `
            }
          >
            <Plus size={18} />
            Post Item
          </NavLink>

          {/* 🔔 Notification Bell */}
          {token && <NotificationBell user={user} />}

          {/* 🌙 Dark Mode Toggle */}
          <ModeToggle />

          {/* 👤 Profile Dropdown */}
          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer border-2 border-white hover:scale-105 transition">
                  <AvatarImage src={profileImg} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-white dark:bg-gray-800">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-500"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 rounded-full bg-white text-[#103B66] font-semibold"
            >
              Login
            </NavLink>
          )}
        </div>

        {/* ================= MOBILE ================= */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden text-white">
            <Menu size={28} />
          </SheetTrigger>

          <SheetContent
            side="right"
            className="bg-[#103B66] dark:bg-gray-900 text-white pt-16"
          >
            <div className="flex flex-col gap-4 text-lg">

              <NavLink
                to="/lost-items"
                onClick={closeMenu}
                className={navLinkClass}
              >
                Lost Items
              </NavLink>

              <NavLink
                to="/found-items"
                onClick={closeMenu}
                className={navLinkClass}
              >
                Found Items
              </NavLink>

              <NavLink
                to="/create"
                onClick={closeMenu}
                className="
                  flex items-center justify-center gap-2
                  bg-white text-[#103B66]
                  px-4 py-3 rounded-full font-semibold
                "
              >
                <Plus size={18} />
                Post Item
              </NavLink>

              {/* 🔔 Notification Bell Mobile */}
              {token && (
                <div className="flex justify-center">
                  <NotificationBell user={user} />
                </div>
              )}

              <ModeToggle />

              {token ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={closeMenu}
                    className={navLinkClass}
                  >
                    My Profile
                  </NavLink>

                  <button
                    onClick={logout}
                    className="text-left text-red-300 px-4 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="
                    bg-white text-[#103B66]
                    px-4 py-2 rounded-full font-semibold
                  "
                >
                  Login
                </NavLink>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default Navbar;