import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { SITE } from "./site";

/**
 * After the Headline, AI Broadsheet's own podcast. Episodes (MP3 + cover) live on the
 * repository's media branch, listed in originals/podcast/manifest.json; the site plays them at
 * /podcast and publishes an iTunes-compatible feed at /podcast.xml for Apple and Spotify.
 */
export type PodcastEpisode = {
  id: string;
  number: number;
  title: string;
  summary: string;
  publishedAt: string;
  durationSec: number;
  fileUrl: string;
  /** Bytes, for the RSS enclosure. */
  fileSize: number;
  imageUrl?: string;
  /** Labelled as opinion on the page and in the feed. */
  opinion?: boolean;
  /** "ElevenLabs stock voices" or "NotebookLM Audio Overview": always disclosed. */
  voices: string;
  sources: { name: string; url: string }[];
  transcript: string;
};
export type PodcastManifest = {
  title: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
  episodes: PodcastEpisode[];
};

export const PODCAST_MANIFEST_URL = "https://raw.githubusercontent.com/jjackguler/civic-scribe-ottawa/media/originals/podcast/manifest.json";
const EMPTY: PodcastManifest = { title: "After the Headline", description: "", imageUrl: "", updatedAt: new Date(0).toISOString(), episodes: [] };

const g = globalThis as unknown as { __podcast?: { ts: number; data: PodcastManifest } };
async function load(): Promise<PodcastManifest> {
  const cached = g.__podcast;
  if (cached && Date.now() - cached.ts < 10 * 60_000) return cached.data;
  try {
    const res = await fetch(PODCAST_MANIFEST_URL, { signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as PodcastManifest;
    // Episodes appear at their publication time, newest first.
    data.episodes = (data.episodes ?? []).filter(e => Date.parse(e.publishedAt) <= Date.now()).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    g.__podcast = { ts: Date.now(), data };
    return data;
  } catch {
    return cached?.data ?? EMPTY;
  }
}

export const getPodcast = createServerFn({ method: "GET" }).handler(load);
export function usePodcast(initial?: PodcastManifest | null) {
  return useQuery({ queryKey: ["podcast"], queryFn: () => getPodcast(), initialData: initial ?? undefined, staleTime: 5 * 60_000 });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hms = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** The show's RSS feed, with the iTunes and podcast namespaces Apple Podcasts and Spotify read. */
export async function buildPodcastRss(): Promise<string> {
  const m = await load();
  const origin = `https://${SITE.domain}`;
  const items = m.episodes.map(e => `
    <item>
      <title>${esc(e.title)}</title>
      <description><![CDATA[<p>${esc(e.summary)}</p>${e.opinion ? "<p><strong>Opinion.</strong></p>" : ""}<p>Voices: ${esc(e.voices)}. Written and checked by the AI Broadsheet newsroom.</p><p>Sources:</p><ul>${e.sources.map(s => `<li><a href="${esc(s.url)}">${esc(s.name)}</a></li>`).join("")}</ul>]]></description>
      <link>${origin}/podcast#${esc(e.id)}</link>
      <guid isPermaLink="false">${esc(e.id)}</guid>
      <pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate>
      <enclosure url="${esc(e.fileUrl)}" length="${e.fileSize}" type="audio/mpeg"/>
      <itunes:duration>${hms(e.durationSec)}</itunes:duration>
      <itunes:episode>${e.number}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>false</itunes:explicit>${e.imageUrl ? `\n      <itunes:image href="${esc(e.imageUrl)}"/>` : ""}
    </item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${esc(m.title)}</title>
    <link>${origin}/podcast</link>
    <atom:link href="${origin}/podcast.xml" rel="self" type="application/rss+xml"/>
    <language>en-ca</language>
    <copyright>© ${new Date().getFullYear()} ${esc(SITE.name)}</copyright>
    <description>${esc(m.description)}</description>
    <itunes:author>${esc(SITE.name)}</itunes:author>
    <itunes:owner><itunes:name>${esc(SITE.name)}</itunes:name><itunes:email>${esc(SITE.email.general)}</itunes:email></itunes:owner>
    <itunes:image href="${esc(m.imageUrl)}"/>
    <image><url>${esc(m.imageUrl)}</url><title>${esc(m.title)}</title><link>${origin}/podcast</link></image>
    <itunes:category text="News"><itunes:category text="Tech News"/></itunes:category>
    <itunes:category text="Technology"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <podcast:locked>no</podcast:locked>${items}
  </channel>
</rss>`;
}
