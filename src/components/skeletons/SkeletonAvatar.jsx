function SkeletonAvatar({ size = "w-12 h-12" }) {
    return (
      <div
        className={`skeleton ${size} rounded-full`}
      />
    );
  }
  
  export default SkeletonAvatar;
  