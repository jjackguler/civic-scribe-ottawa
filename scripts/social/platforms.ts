/**
 * Thin clients for the official posting APIs. Each platform is on only when its
 * secrets are set; otherwise the caller logs a dry run.
 *
 *   Meta (Instagram + Facebook Page): META_PAGE_TOKEN (long-lived Page token with
 *     instagram_content_publish, pages_manage_posts), FB_PAGE_ID, IG_USER_ID
 *   LinkedIn (company page): LINKEDIN_TOKEN (w_organization_social), LINKEDIN_ORG_ID
 */
const GRAPH = "https://graph.facebook.com/v21.0";
const LI = "https://api.linkedin.com/rest";
const LI_VERSION = process.env.LINKEDIN_VERSION || "202509";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function ok<T>(r: Response, what: string): Promise<T> {
  const text = await r.text();
  if (!r.ok) throw new Error(`${what}: HTTP ${r.status} ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

// ---------- Meta ----------
export type Meta = { token: string; pageId: string; igUserId: string };
export function metaFromEnv(): Meta | null {
  const { META_PAGE_TOKEN: token, FB_PAGE_ID: pageId, IG_USER_ID: igUserId } = process.env;
  return token && pageId && igUserId ? { token, pageId, igUserId } : null;
}

async function graph<T>(m: Meta, path: string, params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams({ ...params, access_token: m.token });
  return ok<T>(await fetch(`${GRAPH}/${path}`, { method: "POST", body }), `graph ${path}`);
}

/** Instagram containers must finish processing before they can be published. */
async function igWait(m: Meta, id: string) {
  for (let i = 0; i < 60; i++) {
    const r = await ok<{ status_code?: string }>(await fetch(`${GRAPH}/${id}?fields=status_code&access_token=${m.token}`), "ig status");
    if (r.status_code === "FINISHED") return;
    if (r.status_code === "ERROR" || r.status_code === "EXPIRED") throw new Error(`ig container ${id}: ${r.status_code}`);
    await sleep(5000);
  }
  throw new Error(`ig container ${id}: timed out`);
}

async function igPublish(m: Meta, creation: string): Promise<string> {
  await igWait(m, creation);
  return (await graph<{ id: string }>(m, `${m.igUserId}/media_publish`, { creation_id: creation })).id;
}

export async function igCarousel(m: Meta, imageUrls: string[], caption: string): Promise<string> {
  const children: string[] = [];
  for (const image_url of imageUrls) children.push((await graph<{ id: string }>(m, `${m.igUserId}/media`, { image_url, is_carousel_item: "true" })).id);
  const c = await graph<{ id: string }>(m, `${m.igUserId}/media`, { media_type: "CAROUSEL", children: children.join(","), caption });
  return igPublish(m, c.id);
}

export async function igStory(m: Meta, imageUrl: string): Promise<string> {
  const c = await graph<{ id: string }>(m, `${m.igUserId}/media`, { media_type: "STORIES", image_url: imageUrl });
  return igPublish(m, c.id);
}

export async function igReel(m: Meta, videoUrl: string, caption: string): Promise<string> {
  const c = await graph<{ id: string }>(m, `${m.igUserId}/media`, { media_type: "REELS", video_url: videoUrl, caption, share_to_feed: "true" });
  return igPublish(m, c.id);
}

export async function fbPhotos(m: Meta, imageUrls: string[], message: string): Promise<string> {
  const ids: string[] = [];
  for (const url of imageUrls) ids.push((await graph<{ id: string }>(m, `${m.pageId}/photos`, { url, published: "false" })).id);
  const params: Record<string, string> = { message };
  ids.forEach((id, i) => { params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id }); });
  return (await graph<{ id: string }>(m, `${m.pageId}/feed`, params)).id;
}

export async function fbStory(m: Meta, imageUrl: string): Promise<string> {
  const photo = await graph<{ id: string }>(m, `${m.pageId}/photos`, { url: imageUrl, published: "false" });
  return (await graph<{ post_id?: string; id?: string }>(m, `${m.pageId}/photo_stories`, { photo_id: photo.id })).post_id ?? photo.id;
}

export async function fbReel(m: Meta, videoUrl: string, description: string): Promise<string> {
  const start = await graph<{ video_id: string }>(m, `${m.pageId}/video_reels`, { upload_phase: "start" });
  await ok(await fetch(`https://rupload.facebook.com/video-upload/v21.0/${start.video_id}`, {
    method: "POST", headers: { Authorization: `OAuth ${m.token}`, file_url: videoUrl },
  }), "fb reel upload");
  await graph(m, `${m.pageId}/video_reels`, { upload_phase: "finish", video_id: start.video_id, video_state: "PUBLISHED", description });
  return start.video_id;
}

// ---------- LinkedIn ----------
export type LinkedIn = { token: string; org: string };
export function linkedInFromEnv(): LinkedIn | null {
  const { LINKEDIN_TOKEN: token, LINKEDIN_ORG_ID: id } = process.env;
  return token && id ? { token, org: `urn:li:organization:${id}` } : null;
}

const liHeaders = (l: LinkedIn) => ({
  Authorization: `Bearer ${l.token}`, "LinkedIn-Version": LI_VERSION, "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json",
});

async function liImage(l: LinkedIn, bytes: Buffer): Promise<string> {
  const init = await ok<{ value: { uploadUrl: string; image: string } }>(await fetch(`${LI}/images?action=initializeUpload`, {
    method: "POST", headers: liHeaders(l), body: JSON.stringify({ initializeUploadRequest: { owner: l.org } }),
  }), "li image init");
  await ok(await fetch(init.value.uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${l.token}` }, body: bytes }), "li image upload");
  return init.value.image;
}

async function liVideo(l: LinkedIn, bytes: Buffer): Promise<string> {
  const init = await ok<{ value: { video: string; uploadToken: string; uploadInstructions: { uploadUrl: string; firstByte: number; lastByte: number }[] } }>(
    await fetch(`${LI}/videos?action=initializeUpload`, {
      method: "POST", headers: liHeaders(l),
      body: JSON.stringify({ initializeUploadRequest: { owner: l.org, fileSizeBytes: bytes.length, uploadCaptions: false, uploadThumbnail: false } }),
    }), "li video init");
  const etags: string[] = [];
  for (const part of init.value.uploadInstructions) {
    const r = await fetch(part.uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${l.token}` }, body: bytes.subarray(part.firstByte, part.lastByte + 1) });
    if (!r.ok) throw new Error(`li video part: HTTP ${r.status}`);
    etags.push(r.headers.get("etag") ?? "");
  }
  await ok(await fetch(`${LI}/videos?action=finalizeUpload`, {
    method: "POST", headers: liHeaders(l),
    body: JSON.stringify({ finalizeUploadRequest: { video: init.value.video, uploadToken: init.value.uploadToken, uploadedPartIds: etags } }),
  }), "li video finalize");
  return init.value.video;
}

async function liPost(l: LinkedIn, commentary: string, content: unknown): Promise<string> {
  const r = await fetch(`${LI}/posts`, {
    method: "POST", headers: liHeaders(l),
    body: JSON.stringify({
      author: l.org, commentary, visibility: "PUBLIC", lifecycleState: "PUBLISHED", isReshareDisabledByAuthor: false,
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] }, content,
    }),
  });
  await ok(r, "li post");
  return r.headers.get("x-restli-id") ?? "";
}

/** LinkedIn commentary is "little text": reserved characters are escaped and #Tags become hashtag templates. */
export const liText = (s: string) => s.replace(/[\\|{}@\[\]()<>*_~]/g, c => `\\${c}`)
  .replace(/#(\w+)/g, "{hashtag|\\#|$1}").replace(/(?<!\\)#/g, "\\#");

export async function liCarousel(l: LinkedIn, images: Buffer[], text: string): Promise<string> {
  const ids: string[] = [];
  for (const b of images) ids.push(await liImage(l, b));
  return liPost(l, liText(text), { multiImage: { images: ids.map(id => ({ id, altText: "AI Broadsheet slide" })) } });
}

export async function liVideoPost(l: LinkedIn, video: Buffer, title: string, text: string): Promise<string> {
  const id = await liVideo(l, video);
  return liPost(l, liText(text), { media: { id, title } });
}
