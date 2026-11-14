"use client";

export default function FoundationError({ reset }: { reset: () => void }) {
  return (
    <main className="page-shell">
      <h1 className="page-title">We’re having trouble loading this page</h1>
      <p className="page-intro">Please try again in a moment. If the problem continues, contact HGR for help.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
