"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-28 text-center">
      <h1 className="text-5xl font-semibold">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-md text-stone">
        We couldn&apos;t load this page. {error.message?.includes("fetch") ? "Check that the store database is connected." : "Please try again."}
      </p>
      <button onClick={reset} className="btn-dark mt-8">Try again</button>
    </div>
  );
}
