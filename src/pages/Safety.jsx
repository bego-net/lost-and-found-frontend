import { ShieldCheck, Eye, MessageSquare, MapPin, Smartphone } from "lucide-react";

const Safety = () => {
  const tips = [
    {
      icon: <Eye className="text-blue-500" />,
      title: "Public Meetings",
      desc: "Always meet in well-lit, busy public places like cafes or police station 'safe zones'."
    },
    {
      icon: <ShieldCheck className="text-emerald-500" />,
      title: "Verify Identity",
      desc: "Ask for a detailed description or a specific identifier that wasn't in the public post."
    },
    {
      icon: <MessageSquare className="text-purple-500" />,
      title: "Stay On-Platform",
      desc: "Keep your conversations within FoundFlow to ensure a secure record of the exchange."
    },
    {
      icon: <Smartphone className="text-rose-500" />,
      title: "Share Your Status",
      desc: "Tell a friend or family member where you are going before meeting someone."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">Security First</span>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tighter">Safety Guidelines</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium text-lg">Your safety is our top priority while using the network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                {tip.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{tip.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Safety;