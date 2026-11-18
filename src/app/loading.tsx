export default function Loading() {
  return (
    <div className="container-page py-12" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-10 w-64 rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] rounded-2xl" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded" />
            <div className="skeleton mt-2 h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
