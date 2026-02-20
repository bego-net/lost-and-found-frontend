import { Link } from "react-router-dom";

function ItemCard({ item }) {
  const rawImage = item?.images?.[0];

  const imageUrl = rawImage
    ? `http://localhost:5000${rawImage.startsWith("/") ? rawImage : "/" + rawImage}`
    : null;

  return (
    <div className="
      bg-white/30 dark:bg-gray-800/40 
      backdrop-blur-xl 
      border border-white/40 dark:border-white/10 
      rounded-2xl 
      shadow-lg 
      hover:shadow-2xl 
      transition-all 
      duration-300 
      p-4 
      hover:-translate-y-2
      group
    ">
      
      {/* IMAGE */}
      <div className="relative w-full h-48 overflow-hidden rounded-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="
              w-full h-full object-cover 
              transition-transform duration-500 
              group-hover:scale-110
            "
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-xl">
            <span className="text-gray-500 dark:text-gray-300">No Image</span>
          </div>
        )}

        {/* TYPE BADGE */}
        <div
          className={`
            absolute top-3 left-3 px-4 py-1 text-sm font-semibold rounded-full 
            text-white
            backdrop-blur-md shadow-md
            ${item.type === "lost"
              ? "bg-gradient-to-r from-red-500 to-orange-500"
              : "bg-gradient-to-r from-green-500 to-emerald-500"}
          `}
        >
          {item.type.toUpperCase()}
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-bold mt-4 capitalize text-gray-900 dark:text-white">
        {item.title}
      </h2>

      {/* DESCRIPTION */}
      <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
        {item.description.length > 80
          ? item.description.substring(0, 80) + "..."
          : item.description}
      </p>

      {/* CATEGORY BADGE */}
      {item.category && (
        <span className="
          inline-block mt-3 px-3 py-1 
          text-xs font-semibold 
          bg-blue-100 text-blue-700 
          dark:bg-blue-900 dark:text-blue-300 
          rounded-full
        ">
          {item.category.toUpperCase()}
        </span>
      )}

      {/* LOCATION */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
        <strong>Location:</strong> {item.location || "N/A"}
      </p>

      {/* VIEW DETAILS */}
       <Link
  to={`/item/${item._id}`}
  state={{ from: item.type }}   // 👈 THIS IS THE FIX
  className="
    mt-4 inline-block 
    text-[#103B66] dark:text-blue-300 
    font-semibold 
    hover:underline
  "
>
  View Details →
</Link>

    </div>
  );
}

export default ItemCard;
