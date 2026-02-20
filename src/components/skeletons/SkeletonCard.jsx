import SkeletonText from "./SkeletonText";

function SkeletonCard() {
  return (
    <div
      className="
        bg-white dark:bg-cardDark
        border border-gray-200 dark:border-borderDark
        rounded-2xl p-4 shadow-lg
        space-y-3
      "
    >
      {/* Image */}
      <div className="skeleton h-40 w-full rounded-xl" />

      {/* Title */}
      <SkeletonText height="h-5" />

      {/* Meta */}
      <SkeletonText width="w-1/2" />
      <SkeletonText width="w-1/3" />
    </div>
  );
}

export default SkeletonCard;
