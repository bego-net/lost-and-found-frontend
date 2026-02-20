import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function BackButton({ label = "Back", to = null }) {
  const navigate = useNavigate();

  const handlePress = () => {
    to ? navigate(to) : navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      className="
        group inline-flex items-center gap-3
        p-2 mb-6 rounded-full
        bg-white/40 dark:bg-gray-900/40 backdrop-blur
        hover:scale-105 transition
      "
    >
      <ArrowLeft size={18} />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

export default BackButton;
