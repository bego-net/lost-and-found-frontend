import { Github, Twitter, Linkedin, Map as MapIcon, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 mb-6 px-4 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Main Glass Container */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] px-8 py-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Left: Logo & Copyright */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <MapIcon className="text-white" size={16} />
                </div>
                <span className="text-lg font-black tracking-tighter dark:text-white">
                  Found<span className="text-blue-600">Lost</span>
                </span>
              </Link>
              <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800" />
              <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                © {currentYear}
              </p>
            </div>

            {/* Center: Inline Links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {[
                { label: "Lost", path: "/lost-items" },
                { label: "Found", path: "/found-items" },
                { label: "Safety", path: "/safety" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <Link 
                  key={link.label}
                  to={link.path} 
                  className="text-[13px] font-black text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Social & Status */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3 pr-5 border-r border-slate-200 dark:border-slate-800">
                <a href="https://x.com/BegonetDebebe" className="text-slate-400 hover:text-blue-600 transition-colors"><Twitter size={16}/></a>
                <a href="https://github.com/bego-net" className="text-slate-400 hover:text-blue-600 transition-colors"><Github size={16}/></a>
                <a href="https://linkedin.com/in/begonet-d-b69b6536a" className="text-slate-400 hover:text-blue-600 transition-colors"><Linkedin size={16}/></a>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;