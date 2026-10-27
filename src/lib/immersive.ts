// Immersive Journalism: case files readers can walk through.
// Every case is rendered in Unreal Engine: 360° stops, short films and a walkthrough.
// Media is pinned on the `immersive-media` branch and served through jsDelivr.

// Bump MEDIA_SHA after adding files to that branch; earlier files stay valid at the newer commit.
const MEDIA_SHA = "34500f0a55e85c79ae212fa32f7774530f13be95";
const media = (slug: string) => (file: string) =>
  `https://cdn.jsdelivr.net/gh/jjackguler/civic-scribe-ottawa@${MEDIA_SHA}/immersive/${slug}/${file}`;

export type Still = { src: string; alt: string; title: string; caption: string };
export type Stop = {
  id: string;
  name: string;
  where: string;
  caption: string;
  estimated: string[];
  pano: string;
  clip: string;
  poster: string;
};
export type Film = { src: string; poster: string; title: string; specs: string[]; body: string };
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
  contentNote: string;
  status: string;
  launch: Film;
  launchStills: Still[];
  walkthrough: Film;
  stops: Stop[];
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
const ue = (file: string) => ch(`unreal/${file}`);
const stop = (
  id: string,
  name: string,
  where: string,
  caption: string,
  estimated: string[],
): Stop => ({
  id,
  name,
  where,
  caption,
  estimated,
  pano: ue(`pano2_${id}.jpg`),
  clip: ue(`clip_${id}.mp4`),
  poster: ue(`clip_${id}.jpg`),
});

export const CHALLENGER: ImmersiveCase = {
  slug: "challenger-1986",
  title: "Challenger, 28 January 1986",
  kicker: "Case file · Launch Complex 39B",
  dek: "Walk Pad 39B as it stood that cold morning. Ten stops in 360°, from the perimeter fence to the crew access arm, rebuilt in Unreal Engine from NASA's models and photographs.",
  dateline: "Kennedy Space Center, Florida · 11:38 a.m. EST",
  question:
    "What was known before launch, who had access to that information, and what did the later investigation establish?",
  hero: ue("clip_perimeter_fence.jpg"),
  heroAlt:
    "The launch pad and the shuttle stack seen across the perimeter fence, in an Unreal Engine reconstruction",
  og: ch("og.jpg"),
  contentNote:
    "This case is about the loss of Challenger and its seven crew members: Francis R. Scobee, Michael J. Smith, Ellison S. Onizuka, Judith A. Resnik, Ronald E. McNair, Gregory B. Jarvis and Christa McAuliffe. The reconstruction stops at 73 seconds. The breakup is not shown, and no one's final moments are recreated.",
  status:
    "Prototype. Built with AI and shared while editorial, subject-matter and accessibility review continues. Corrections are welcome.",
  walkthrough: {
    src: ue("walkthrough.mp4"),
    poster: ue("walkthrough.jpg"),
    title: "From the fence to the white room",
    specs: ["1920×1080", "70 s", "On foot", "Light at 11:38 EST"],
    body: "On foot from the south gate in the perimeter fence, up the crawlerway and across the pad apron to the foot of the service tower, then out along the crew access arm, 147 ft up, to the white room beside the orbiter hatch. Slow dissolves shorten the walk, and the lift ride up the tower is not shown.",
  },
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
  stops: [
    stop(
      "perimeter_fence",
      "Perimeter fence",
      "309 m south of the stack",
      "Outside the south perimeter fence, looking north to the stack. Eye height 1.7 m. The clip dollies east along the fence.",
      ["Fence line and camera spot estimated from NASA photographs"],
    ),
    stop(
      "crawlerway_south",
      "Crawlerway approach",
      "240 m south of the stack",
      "On the crawlerway incline, looking north up the slope to the stack. The clip walks up the crawlerway.",
      ["Crawlerway surface from 2018 lidar, not a 1986 survey"],
    ),
    stop(
      "pad_apron",
      "Pad apron",
      "51 m south-west of the stack",
      "On the concrete apron about 17 m above sea level, looking up at the stack. The clip walks toward it, tilting up.",
      [],
    ),
    stop(
      "launch_platform_deck",
      "Launch platform deck",
      "21 m south-west of the stack",
      "On the Mobile Launcher Platform deck beside the boosters, about 15 m above the pad. The clip is filmed from the south end of the deck, panning between the tail service masts.",
      ["Deck height and layout estimated"],
    ),
    stop(
      "access_arm_white_room",
      "Crew access arm, 147 ft",
      "11 m south-west of the stack",
      "On the crew access arm, 147 ft (44.8 m) above the pad, facing east into the white room and the orbiter's hatch. The clip walks out along the arm.",
      ["Arm route and white room size estimated so the arm meets the orbiter model's hatch"],
    ),
    stop(
      "right_booster_aft_joint",
      "Right booster aft field joint",
      "15 m east of the stack",
      "On the platform deck east of the stack, looking up at the right booster's aft field joint. The orange ring is a guide marker for the joint's approximate position, not a physical part.",
      ["Joint height on the booster (10.8 m above the deck) estimated"],
    ),
    stop(
      "east_of_stack",
      "East of the stack",
      "90 m east of the stack",
      "On the ground below the east slope of the pad, looking west at the stack. The clip dollies south.",
      [],
    ),
    stop(
      "flame_trench_edge",
      "Flame trench rim",
      "54 m north of the stack",
      "At the east rim of the flame trench, north of the launch platform, looking south into the late-morning sun.",
      ["Trench shape from 2018 lidar, not a 1986 survey"],
    ),
    stop(
      "aerial_120m",
      "Aerial, 120 m",
      "120 m above the pad",
      "Above the south-west corner of the pad, looking down on the stack, towers and trench. The clip orbits slowly from south-west to west-south-west.",
      ["A chosen viewpoint: no one stood here"],
    ),
    stop(
      "press_site_distance",
      "At press-site distance",
      "5.4 km south-east of the stack",
      "This is not the press site. The real one is about 5.6 km south-west, which is lagoon and marsh in this terrain, so the view is taken from the same distance on the barrier island. The clip uses a telephoto lens; in the 360° view the stack is only a few pixels wide.",
      [
        "The bare mound left of the pad is most likely the Pad 39A hardstand from the 2018 lidar; no 39A structures are modelled",
      ],
    ),
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
    { k: "Format", v: "Unreal Engine 5 reconstruction: 10 stops in 360°, films" },
    { k: "Stops", v: "From the perimeter fence to the crew access arm, 147 ft up" },
    { k: "Light", v: "The sun as it stood at 11:38 a.m. EST" },
    { k: "Works on", v: "Any modern browser, phone or desktop" },
  ],
  howMade: [
    "The scene is built in Unreal Engine 5 from NASA's own 3D models, NASA photographs and USGS lidar terrain, and rendered frame by frame. No AI-generated imagery is used.",
    "Scene assembly, render scripts and source research were done with AI (Claude, made by Anthropic) from a written brief, and are disclosed here.",
    "Every stop says where the camera stands, how far from the stack and how high, and which positions are estimated.",
    "The launch film marks what launch-day viewers saw apart from what the inquiry found later on film.",
    "Named people appear only as authors or subjects of records. The case does not infer motives or assign blame.",
  ],
  limits: [
    "The scenes are reconstructions, not documentation. Many sizes and positions are estimates and are marked as such.",
    "Terrain comes from a 2018 survey, 32 years after 1986; the pad was modified in between.",
    "Weather, haze and the ice recorded on the pad that morning are not fully depicted. Plants are not Florida species.",
    "No Shuttle historian has reviewed the reconstruction yet; the walkthrough shortens the walk and skips the lift ride up the tower.",
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
