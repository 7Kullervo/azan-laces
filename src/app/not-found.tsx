import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">404</p>
      <h1 className="mt-3 text-5xl font-semibold">Page not found</h1>
      <p className="mt-3 text-stone">The page you are looking for may have moved or no longer exists.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-dark">Go home</Link>
        <Link href="/collections/all" className="btn-outline">Browse products</Link>
      </div>
    </div>
  );
}
