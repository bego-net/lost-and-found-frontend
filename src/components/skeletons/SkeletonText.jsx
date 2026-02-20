function SkeletonText({ width = "w-full", height = "h-4" }) {
    return (
      <div
        className={`skeleton ${width} ${height} rounded-md`}
      />
    );
  }
  
  export default SkeletonText;
  