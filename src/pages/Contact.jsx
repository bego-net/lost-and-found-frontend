import { Mail, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const Contact = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {

      await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, {
        name,
        email,
        message
      });

      setSuccess("Message sent successfully! Our support team will contact you soon.");

      setName("");
      setEmail("");
      setMessage("");

    } catch  {
      setError("Failed to send message. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Get in Touch
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">
            Have a question? Our support team typically responds within 2 hours.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl">

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4 text-center">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
                  placeholder="john@example.com"
                />
              </div>

            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                Message
              </label>

              <textarea
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] px-6 py-4 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none resize-none"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
            >
              <Send size={18} />
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>
        </div>

        <div className="flex justify-center gap-8 mt-12">

          <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
            <Mail size={16} className="text-blue-500" />
            support@foundflow.com
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
            <MessageCircle size={16} className="text-emerald-500" />
            Live Chat
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;