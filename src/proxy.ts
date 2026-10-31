import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createStagingProxy } from "@/lib/stagingBasicAuth";

const runProxy = createStagingProxy(() => NextResponse.next());

export function proxy(request: NextRequest) {
  return runProxy(request);
}

// No matcher exclusions: the gate must run for every path, including admin,
// API, media, Next assets, and public files.
