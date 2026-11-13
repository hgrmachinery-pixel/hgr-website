export function validateServerURL(
  value: string,
  nodeEnv = process.env.NODE_ENV,
  railwayEnvironmentName = process.env.RAILWAY_ENVIRONMENT_NAME,
): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("SERVER_URL must be an HTTP or HTTPS URL without credentials");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("SERVER_URL must be an HTTP or HTTPS URL without credentials");
  }
  if (nodeEnv === "production" && url.protocol !== "https:") {
    throw new Error("SERVER_URL must use HTTPS in production");
  }
  if (nodeEnv === "production" && railwayEnvironmentName?.trim().toLowerCase() === "production" && url.origin !== "https://hgrmachinery.com") {
    throw new Error("SERVER_URL must be https://hgrmachinery.com in the production environment");
  }
  return url;
}
