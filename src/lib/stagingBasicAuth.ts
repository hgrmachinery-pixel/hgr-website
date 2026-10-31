import { createHash, timingSafeEqual } from "node:crypto";

type BasicCredentials = { username: Buffer; password: Buffer };
export type StagingAccessCheck =
  | { mode: "off" }
  | { mode: "authorized" }
  | { mode: "denied"; response: Response };

function parseBasicCredentials(header: string | null): BasicCredentials | null {
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header ?? "");
  if (!match) return null;

  const encoded = match[1];
  const decoded = Buffer.from(encoded, "base64");
  if (decoded.toString("base64") !== encoded) return null;

  const separator = decoded.indexOf(0x3a);
  if (separator < 1) return null;
  return {
    username: decoded.subarray(0, separator),
    password: decoded.subarray(separator + 1),
  };
}

function securelyMatches(actual: Buffer, expected: string): boolean {
  const expectedBytes = Buffer.from(expected, "utf8");
  const actualDigest = createHash("sha256").update(actual).digest();
  const expectedDigest = createHash("sha256").update(expectedBytes).digest();
  const digestMatches = timingSafeEqual(actualDigest, expectedDigest);
  return actual.length === expectedBytes.length && digestMatches;
}

function stagingGateMode(environment: Readonly<Record<string, string | undefined>>): "off" | "protect" | "misconfigured" {
  const environmentName = environment.RAILWAY_ENVIRONMENT_NAME;
  const isRailway = Boolean(environment.RAILWAY_PROJECT_ID);

  if (environmentName === "staging") return "protect";

  // A staging branch must never become public if Railway points it at a
  // differently named environment. Keep the ordinary production/main path
  // unchanged, and fail closed for other Railway environments.
  if (isRailway && (environmentName !== "production" || environment.RAILWAY_GIT_BRANCH === "staging")) {
    return "misconfigured";
  }
  return "off";
}

function denied(status: 401 | 503, message: string): StagingAccessCheck {
  const headers = new Headers({ "Cache-Control": "no-store", Vary: "Authorization" });
  if (status === 401) {
    headers.set("WWW-Authenticate", 'Basic realm="HGR staging", charset="UTF-8"');
  }
  return { mode: "denied", response: new Response(`${message}\n`, { status, headers }) };
}

export function checkStagingBasicAuth(
  request: Request,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): StagingAccessCheck {
  const mode = stagingGateMode(environment);
  if (mode === "off") return { mode: "off" };
  if (mode === "misconfigured") {
    return denied(503, "Staging access is not configured for this Railway environment.");
  }

  const username = environment.HGR_STAGING_BASIC_AUTH_USERNAME;
  const password = environment.HGR_STAGING_BASIC_AUTH_PASSWORD;
  if (!username?.trim() || !password?.trim()) {
    return denied(503, "Staging access credentials are not configured.");
  }

  const supplied = parseBasicCredentials(request.headers.get("authorization"));
  if (!supplied) return denied(401, "Staging access credentials are required.");

  const usernameMatches = securelyMatches(supplied.username, username);
  const passwordMatches = securelyMatches(supplied.password, password);
  if (!usernameMatches || !passwordMatches) {
    return denied(401, "Staging access credentials are invalid.");
  }
  return { mode: "authorized" };
}

export function createStagingProxy(
  continueRequest: () => Response,
  environment: () => Readonly<Record<string, string | undefined>> = () => process.env,
) {
  return (request: Request): Response => {
    const access = checkStagingBasicAuth(request, environment());
    if (access.mode === "denied") return access.response;

    const response = continueRequest();
    if (access.mode === "authorized") {
      response.headers.set("Cache-Control", "private, no-store");
      const vary = response.headers.get("Vary");
      response.headers.set("Vary", vary ? `${vary}, Authorization` : "Authorization");
    }
    return response;
  };
}
