// Immersive Journalism: case files readers can walk through.
// Each case has a web experience under /public/experiences/<slug>/ (its own Vite build)
// and media pinned on the `immersive-media` branch, served through jsDelivr.

const MEDIA_SHA = "2997286d56ab307f7461f4ddba8bf8240620ee19";
const media = (slug: string) => (file: string) =>
  `https://cdn.jsdelivr.net/gh/jjackguler/civic-scribe-ottawa@${MEDIA_SHA}/immersive/${slug}/${file}`;

export type Still = { src: string; alt: string; title: string; caption: string };
export type Pano = { src: string; label: string; caption: string };
export type Film = { src: string; poster: string; title: string; specs: string[]; body: string };
export type Chapter = {
  name: string;
  label: string;
  body: string;
  image: string;
  alt: string;
  hash: string;
};

export type ImmersiveCase = {
  slug: string;
  title: string;
  kicker: string;
  dek: string;
  dateline: string;
  question: string;
  hero: string;
  heroAlt: string;
  og: string;
  /** The web experience, served from /public. */
  appUrl: string;
  playUrl: string;
  contentNote: string;
  status: string;
  launch: Film;
  launchStills: Still[];
  panos: Pano[];
  chapters: Chapter[];
  terrain: Still[];
  teaser: Film;
  windows: { body: string; walk: string[]; time: string[] };
  facts: { k: string; v: string }[];
  howMade: string[];
  limits: string[];
  sources: string[];
  updated: string;
};

const ch = media("challenger-1986");
const APP = "/experiences/challenger-1986/index.html";

export const CHALLENGER: ImmersiveCase = {
  slug: "challenger-1986",
  title: "Challenger, 28 January 1986",
  kicker: "Case file · Launch Complex 39B",
  dek: "Walk Pad 39B as it stood that cold morning, then step through the records: what was known before launch, who knew it, and what the inquiry found later.",
  dateline: "Kennedy Space Center, Florida · 11:38 a.m. EST",
  question:
    "What was known before launch, who had access to that information, and what did the later investigation establish?",
  hero: ch("hd_fence_s.jpg"),
  heroAlt:
    "The launch pad and the shuttle stack seen through a chain-link fence, in a 3D reconstruction",
  og: ch("og.jpg"),
  appUrl: `${APP}#/case/challenger-1986`,
  playUrl: `${APP}#/play/challenger-1986`,
  contentNote:
    "This case is about the loss of Challenger and its seven crew members: Francis R. Scobee, Michael J. Smith, Ellison S. Onizuka, Judith A. Resnik, Ronald E. McNair, Gregory B. Jarvis and Christa McAuliffe. The reconstruction stops at 73 seconds. The breakup is not shown, and no one's final moments are recreated.",
  status:
    "Prototype. Built with AI and shared while editorial, subject-matter and accessibility review continues. Corrections are welcome.",
  launch: {
    src: ch("launch_web.mp4"),
    poster: ch("launch_poster.jpg"),
    title: "The launch, T−8 s to T+73 s",
    specs: ["1280×720", "99 s", "7 shots", "Holds at T+73 s"],
    body: "The main engines ignite at T−6.6 s and the boosters at T−0. Four cameras follow: the perimeter fence, a close-up of the right booster's aft joint, a tracking view and the press site. The film ends on the “after the inquiry” view, which adds two findings of the Presidential Commission at that joint: black smoke from T+0.678 s and a flame from T+58.788 s. The flame was on the side facing the external tank, so from this angle the tank hides it. Flight path, smoke and joint position are approximate.",
  },
  launchStills: [
    {
      src: ch("launch_perimeter.jpg"),
      title: "T+2 s, perimeter",
      caption: "Liftoff; steam and exhaust from the flame trench.",
      alt: "From behind the fence, the shuttle lifts off as the exhaust cloud spreads",
    },
    {
      src: ch("launch_tracking.jpg"),
      title: "T+15 s, tracking",
      caption: "Roll complete; the solid-fuel trail behind.",
      alt: "Tracking camera: the shuttle and two booster flames with a white trail",
    },
    {
      src: ch("launch_inquiry_puffs.jpg"),
      title: "After the inquiry, T+2.2 s",
      caption: "Black smoke at the right booster's aft joint, as the Commission found on film.",
      alt: "Black smoke at the aft joint of the right solid rocket booster",
    },
    {
      src: ch("launch_hold.jpg"),
      title: "T+73 s, press site",
      caption: "The clock stops here.",
      alt: "A smoke trail curving into the sky, seen from the press site",
    },
  ],
  panos: [
    {
      src: ch("pano_fence_south.jpg"),
      label: "South fence",
      caption: "312 m south of the pad at eye level, facing north toward the stack.",
    },
    {
      src: ch("pano_pad_apron.jpg"),
      label: "Pad apron",
      caption: "South-east corner of the concrete pad, 65 m from the stack.",
    },
    {
      src: ch("pano_mlp_deck_east.jpg"),
      label: "Platform deck",
      caption: "East edge of the launch platform, at the foot of the right booster.",
    },
    {
      src: ch("pano_access_arm_147ft.jpg"),
      label: "Crew access arm",
      caption: "The crew access arm, 147 ft up (NASA figure). The arm's route is estimated.",
    },
    {
      src: ch("pano_beach_northeast.jpg"),
      label: "Beach",
      caption: "836 m north-east of the pad, on the real shoreline.",
    },
    {
      src: ch("pano_fence_south_launch_T6.jpg"),
      label: "Launch, T+6 s",
      caption: "South fence, six seconds after liftoff. The clock is frozen.",
    },
    {
      src: ch("pano_beach_launch_T30.jpg"),
      label: "Launch, T+30 s",
      caption: "From the beach at T+30 s. The trail is approximate.",
    },
  ],
  chapters: [
    {
      name: "The Place",
      label: "Historical reconstruction",
      body: "Launch Complex 39B as it stood that morning, with the sun where it was at 11:38. Every object says whether its size is sourced or estimated.",
      image: ch("app_place.jpg"),
      alt: "The pad in the web experience, with labelled objects",
      hash: "#/case/challenger-1986/place",
    },
    {
      name: "The Mechanism",
      label: "Explanatory model",
      body: "A booster field joint taken apart step by step: tang, clevis, and the two O-rings that had to seal it in the cold.",
      image: ch("app_mechanism.jpg"),
      alt: "Cutaway of a booster field joint showing the two O-rings",
      hash: "#/case/challenger-1986/mechanism",
    },
    {
      name: "The Record",
      label: "Archival record",
      body: "47 sourced claims you can pin, compare and filter by what was public, what was internal, and what only the inquiry established.",
      image: ch("app_record.jpg"),
      alt: "The records workspace with pinned evidence cards",
      hash: "#/case/challenger-1986/record",
    },
    {
      name: "The Timeline",
      label: "Four kinds of time",
      body: "From 1977 to the launch day, with each event's audience. Move the clock and the knowledge view changes with it.",
      image: ch("app_timeline.jpg"),
      alt: "The chronology, with internal records marked as not public at the selected time",
      hash: "#/case/challenger-1986/timeline",
    },
  ],
  terrain: [
    {
      src: ch("terrain_aerial.jpg"),
      title: "Aerial",
      caption: "Pad and crawlerway from USGS 1 m lidar, the Atlantic to the north-east.",
      alt: "Aerial view of the pad shape, crawlerway and shoreline",
    },
    {
      src: ch("lidar_pad_relief.png"),
      title: "Lidar relief",
      caption: "700 × 700 m around the pad; north is up. Survey from 2018.",
      alt: "Shaded lidar relief of the ground around the pad",
    },
    {
      src: ch("terrain_stack.jpg"),
      title: "On the pad",
      caption: "Service structures from NASA's Shuttle-era model, simplified.",
      alt: "NASA's pad model with the Challenger stack",
    },
    {
      src: ch("worm_compare.jpg"),
      title: "1986 markings",
      caption:
        "Left, NASA photo 51L-S-157; right, the scene. The wing logotype follows NASA's 1976 graphics manual.",
      alt: "Side-by-side: a 1986 NASA photo of the starboard wing and the same spot in the reconstruction",
    },
  ],
  teaser: {
    src: ch("teaser_web.mp4"),
    poster: ch("teaser_poster.jpg"),
    title: "Pad 39B, before the launch",
    specs: ["1920×1080", "40 s", "No launch", "Light at 11:38 EST"],
    body: "Six shots in the morning light: over the sea, the fence, the pad apron, the access arm, from the air, and the press site at 135 mm.",
  },
  windows: {
    body: "A walkable desktop edition built in Unreal Engine 5, with real terrain from USGS lidar, NASA's pad model, a guide voice that reads the records, and the launch with four cameras. It is in testing and not yet available to download.",
    walk: [
      "W A S D to walk, mouse to look, F to fly",
      "1–6 jump to stops: fence, apron, platform, access arm, east of the stack, booster joint",
      "Click a part to hear what the records say about it",
    ],
    time: [
      "L starts the launch, which holds at T+73 s",
      "C switches cameras",
      "V turns the time dial: “launch day” or “after the inquiry”",
    ],
  },
  facts: [
    { k: "Format", v: "3D web experience, playable sketch, films, 360° views" },
    { k: "Claims", v: "47, each with a source and locator" },
    { k: "Guided time", v: "6 to 8 minutes guided, or explore freely" },
    { k: "Works on", v: "Recent desktop browsers; a reading mode carries the same content" },
  ],
  howMade: [
    "Code, scenes, narration script and source research were produced with AI (Claude, made by Anthropic) from a written brief, and are labelled as such. No AI-generated imagery is used.",
    "Every claim cites an online record with a locator. Short quotes only; records are linked, not copied.",
    "Five labels keep things apart: archival record, historical reconstruction, explanatory model, editorial interpretation, unverified detail.",
    "Three knowledge views: the public record at a chosen moment, documented internal information, and the later investigation. Nothing found later leaks into the launch-day view.",
    "Named people appear only as authors or subjects of records. The case does not infer motives or assign blame.",
  ],
  limits: [
    "The scenes are reconstructions, not documentation. Many sizes and positions are estimates and are marked as such.",
    "Terrain comes from a 2018 survey, 32 years after 1986; the pad was modified in between.",
    "Weather, haze and the ice recorded on the pad that morning are not fully depicted. Plants are not Florida species.",
    "Quoted passages still need a word-for-word editorial re-check, and no Shuttle historian has reviewed the case yet.",
    "Not affiliated with or endorsed by NASA, the National Archives or any archive cited.",
  ],
  sources: [
    "Report of the Presidential Commission on the Space Shuttle Challenger Accident (Rogers Commission), NASA History Office web edition",
    "NASA Image and Video Library: 51L-S-154 to 157, 51L-10147, S86-38627, KSC-86PC-0310",
    "NASA 3D Resources (Shuttle stack and Launch Complex 39 models)",
    "NASA Graphics Standards Manual, NHB 1430.2 (January 1976)",
    "USGS 3D Elevation Program, 1 m lidar",
  ],
  updated: "2026-10-26",
};

export const CASES: ImmersiveCase[] = [CHALLENGER];
export const caseBySlug = (slug: string) => CASES.find((c) => c.slug === slug);
