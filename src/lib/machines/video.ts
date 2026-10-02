const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeVideoId(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim() || value.length > 2048) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.port || url.username || url.password) return undefined;
    const host = url.hostname.toLowerCase();
    let id: string | undefined;
    if (host === "youtu.be" || host === "www.youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0];
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v") ?? undefined;
      else if (/^\/(embed|shorts)\//.test(url.pathname)) id = url.pathname.split("/")[2];
    }
    return id && YOUTUBE_ID.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

export function youtubeEmbedURL(value: unknown): string | undefined {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : undefined;
}
