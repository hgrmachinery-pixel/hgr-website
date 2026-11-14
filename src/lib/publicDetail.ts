/** Keep temporary data-source failures distinct from a genuinely missing page. */
export function throwIfPublicDetailUnavailable(unavailable: boolean): void {
  if (unavailable) {
    throw new Error("This page is temporarily unavailable. Please try again shortly.");
  }
}

export function resolvePublicDetail<T>(
  record: T | null,
  unavailable: boolean,
  notFound: () => never,
): T {
  throwIfPublicDetailUnavailable(unavailable);
  if (record === null) return notFound();
  return record;
}
