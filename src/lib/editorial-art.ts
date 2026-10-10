import manifest from "../content/editorial-art.json";

export type EditorialArt = {
  storyIds: string[];
  image: string;
  video?: string;
  alt: { en: string; fr: string };
  model: string;
  createdAt: string;
  projectUrl: string;
};

/** Explicit story assignments only: metaphorical art must never imply a different event. */
export function editorialArtFor(storyId: string): EditorialArt | undefined {
  return (manifest as EditorialArt[]).find(art => art.storyIds.includes(storyId));
}
