import config from "@payload-config";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

const payloadGET = REST_GET(config);

export const GET = async (request: Request, args: { params: Promise<{ slug?: string[] }> }) => {
  const path = new URL(request.url).pathname;
  const isPrivateAsset = path.includes("/machine-media/file/") || path.includes("/machine-documents/file/");
  try {
    const result = await payloadGET(request, args);
    if (!isPrivateAsset) return result;
    const headers = new Headers(result.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Pragma", "no-cache");
    headers.set("Vary", "Cookie, Origin");
    return new Response(result.body, { status: result.status, statusText: result.statusText, headers });
  } catch (error) {
    if (!isPrivateAsset) throw error;
    return Response.json({ errors: [{ message: "Private asset could not be served" }] }, {
      status: 500,
      headers: { "Cache-Control": "private, no-store", Pragma: "no-cache", Vary: "Cookie, Origin" },
    });
  }
};
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
