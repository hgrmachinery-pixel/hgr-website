"use client";

export default function FoundationError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Foundation test could not load</h1>
      <p>
        The local test services may be unavailable. No machine inventory is
        shown here.
      </p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
