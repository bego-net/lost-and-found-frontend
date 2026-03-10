import { Github, Twitter, Linkedin, Mail, Shield, Info, Map as MapIcon } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Explore",
      links: [
        { label: "Lost Items", path: "/lost-items" },
        { label: "Found Items", path: "/found-items" },
        { label: "How it Works", path: "/how-it-works" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Safety Tips", path: "/safety" },
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Contact Us", path: "/contact" },
      ],
    },
  ];

  return (
    <footer className="relative mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapIcon className="text-white" size={18} />
              </div>
              <span className="text-xl font-black tracking-tighter dark:text-white">
                Found<span className="text-blue-600">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              The world’s most advanced AI-powered lost and found network. Helping you reconnect with what matters most.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-blue-600 transition-colors dark:text-slate-400">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-blue-600 transition-colors dark:text-slate-400">
                <Github size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-blue-600 transition-colors dark:text-slate-400">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter/CTA Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">
              Found something?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Reporting a found item takes less than 2 minutes and can change someone's day.
            </p>
            
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-slate-400">
            © {currentYear} FoundFlow Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield size={14} className="text-emerald-500" />
              Secure Data Encryption
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info size={14} className="text-blue-500" />
              v2.4.0-Build
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;