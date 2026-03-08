import React from "react";
import { useNavigate } from "react-router-dom";

function AIMatchPopup({ matches, onClose }) {
  const navigate = useNavigate();

  if (!matches || matches.length === 0) return null;

  const handleItemClick = (id) => {
    onClose(); // close popup
    navigate(`/item/${id}`); // navigate to item detail page
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div
        className="
        w-[95%] max-w-lg
        rounded-2xl
        bg-white dark:bg-gray-900
        shadow-2xl
        p-6
        border border-gray-200 dark:border-gray-700
      "
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-4">

          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            🔍 AI Found Possible Matches
          </h2>

          <button
            onClick={onClose}
            className="
            text-gray-500 hover:text-gray-800
            dark:hover:text-white
            text-xl
            "
          >
            ✕
          </button>

        </div>

        {/* Matches */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">

          {matches.map((match) => (

            <div
              key={match.item._id}
              onClick={() => handleItemClick(match.item._id)}
              className="
              flex gap-4
              border border-gray-200 dark:border-gray-700
              rounded-xl
              p-3
              cursor-pointer
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition
              "
            >

              {/* Image */}
              {match.item.images?.length > 0 ? (
                <img
                  src={`http://localhost:5000${match.item.images[0]}`}
                  alt={match.item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs">
                  No Image
                </div>
              )}

              {/* Text */}
              <div className="flex flex-col justify-between">

                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {match.item.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📍 {match.item.location || "Unknown location"}
                </p>

                <p className="text-sm font-medium text-blue-600">
                  Similarity: {match.similarity}%
                </p>

              </div>

            </div>

          ))}

        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">

          <button
            onClick={onClose}
            className="
            px-5 py-2
            rounded-lg
            bg-blue-600
            hover:bg-blue-700
            text-white
            font-medium
            transition
            "
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default AIMatchPopup;