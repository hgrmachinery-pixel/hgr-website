import { createHmac, timingSafeEqual } from "node:crypto";

import { machinePath } from "./identity.ts";
import { isStaffUser } from "./access.ts";

const PREVIEW_TOKEN_TTL_SECONDS = 5 * 60;

type PreviewClaims = { machineId: string; expiresAt: number };

function encodeClaims(claims: PreviewClaims): string {
  return Buffer.from(JSON.stringify(claims)).toString("base64url");
}

function sign(value: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(value).digest();
}

export function createMachinePreviewToken(
  machineId: string | number,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const body = encodeClaims({
    machineId: String(machineId),
    expiresAt: nowSeconds + PREVIEW_TOKEN_TTL_SECONDS,
  });
  return `${body}.${sign(body, secret).toString("base64url")}`;
}

export function machinePreviewURL(
  machine: { id?: unknown },
  serverURL: string,
  secret: string,
): string | null {
  if (secret.length < 32) return null;
  if ((typeof machine.id !== "string" && typeof machine.id !== "number") ||
      !/^[1-9]\d*$/.test(String(machine.id))) return null;
  const url = new URL("/api/preview", serverURL);
  url.searchParams.set("id", String(machine.id));
  url.searchParams.set("token", createMachinePreviewToken(machine.id, secret));
  return url.toString();
}

export function verifyMachinePreviewToken(
  token: string,
  machineId: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const [body, encodedSignature, extra] = token.split(".");
  if (!body || !encodedSignature || extra !== undefined) return false;

  let claims: PreviewClaims;
  let supplied: Buffer;
  try {
    claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PreviewClaims;
    supplied = Buffer.from(encodedSignature, "base64url");
  } catch {
    return false;
  }

  const expected = sign(body, secret);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return false;
  }
  return claims.machineId === machineId &&
    Number.isInteger(claims.expiresAt) &&
    claims.expiresAt > nowSeconds;
}

type PreviewMachine = { id: string | number; slug?: string; archived?: boolean };
type PreviewUser = { id: string | number; collection?: string; role?: string };

export function createPreviewHandler(dependencies: {
  authenticate: (request: Request) => Promise<PreviewUser | null>;
  findMachine: (id: string, user: PreviewUser) => Promise<PreviewMachine | null>;
  enableDraft: () => Promise<void>;
  serverURL: string;
  secret: string;
  nowSeconds?: () => number;
}) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("token");
    const noStore = { "Cache-Control": "no-store, private" };
    if (!id || !/^[1-9]\d*$/.test(id) || !token || token.length > 1024) {
      return Response.json({ error: "Invalid preview request." }, { status: 400, headers: noStore });
    }

    const user = await dependencies.authenticate(request);
    if (!isStaffUser(user)) {
      return Response.json({ error: "Authentication required." }, { status: 401, headers: noStore });
    }
    const now = dependencies.nowSeconds?.() ?? Math.floor(Date.now() / 1000);
    if (!verifyMachinePreviewToken(token, id, dependencies.secret, now)) {
      return Response.json({ error: "Invalid or expired preview link." }, { status: 403, headers: noStore });
    }

    const machine = await dependencies.findMachine(id, user);
    if (!machine || machine.archived || !machine.slug) {
      return Response.json({ error: "Machine not found." }, { status: 404, headers: noStore });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(machine.slug)) {
      return Response.json({ error: "Machine route is invalid." }, { status: 404, headers: noStore });
    }

    await dependencies.enableDraft();
    const destination = new URL(machinePath(machine.slug), dependencies.serverURL);
    return new Response(null, {
      status: 307,
      headers: { Location: destination.toString(), ...noStore },
    });
  };
}
