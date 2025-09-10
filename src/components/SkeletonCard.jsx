export default function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="rounded-xl bg-surface-2 h-40 w-full mb-3" />
      <div className="h-4 bg-surface-2 rounded w-2/3 mb-2" />
      <div className="h-3 bg-surface-2 rounded w-1/3" />
      <div className="flex gap-2 mt-3">
        <div className="chip" style={{ width: 60 }}>&nbsp;</div>
        <div className="chip" style={{ width: 80 }}>&nbsp;</div>
        <div className="chip" style={{ width: 50 }}>&nbsp;</div>
      </div>
    </div>
  );
}
