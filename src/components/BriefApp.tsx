import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Copy,
  ExternalLink,
  FileText,
  Headphones,
  Heart,
  Repeat2,
  Plus,
  Layers3,
  Menu,
  MessageCircle,
  Pause,
  Play,
  Search,
  Share2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocale } from "@/lib/locale-context";
import { useNewsroom, type NewsroomList } from "@/lib/newsroom";
import { useOriginals, type OriginalsManifest } from "@/lib/originals";
import {
  BRIEF_SAVED_KEY,
  briefShareUrl,
  buildBriefFeed,
  parseBriefSaved,
  type Brief,
} from "@/lib/brief-feed";
import { localePath } from "@/lib/seo";
import { SITE } from "@/lib/site";

import {
  BRIEF_PREFS_KEY,
  parseBriefPreferences,
  topicKey,
  type BriefPreferences,
} from "@/lib/brief-preferences";

type Tab = "today" | "watch" | "following" | "saved";
type Panel = "sources" | "share" | "discover" | "menu" | null;
type Props = {
  initial: { newsroom: NewsroomList | null; originals: OriginalsManifest | null };
  initialStory?: string;
};
const clip = (text: string, max = 200) =>
  text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;

export function BriefApp({ initial, initialStory }: Props) {
  const { locale, setLocale } = useLocale();
  const fr = locale === "fr";
  const t = (en: string, french: string) => (fr ? french : en);
  const { data: newsroom } = useNewsroom(initial.newsroom);
  const { data: originals } = useOriginals(initial.originals);
  const incoming = useMemo(
    () => buildBriefFeed(newsroom?.items ?? [], originals?.items ?? [], locale),
    [newsroom, originals, locale],
  );
  const [edition, setEdition] = useState(() =>
    buildBriefFeed(initial.newsroom?.items ?? [], initial.originals?.items ?? [], locale),
  );
  const [tab, setTab] = useState<Tab>("today");
  const [saved, setSaved] = useState<Brief[]>([]);
  const [preferences, setPreferences] = useState<BriefPreferences>({ liked: [], following: [] });
  const [seen, setSeen] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [shortOnly, setShortOnly] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [active, setActive] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Brief | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [speaking, setSpeaking] = useState("");
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [muted, setMuted] = useState(true);
  const interacted = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const initialOpened = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!interacted.current) setEdition(incoming);
  }, [incoming]);
  useEffect(() => {
    const refresh = () => {
      try {
        setSaved(parseBriefSaved(localStorage.getItem(BRIEF_SAVED_KEY)));
        setPreferences(parseBriefPreferences(localStorage.getItem(BRIEF_PREFS_KEY)));
      } catch {
        setSaved([]);
      }
      setStorageReady(true);
    };
    refresh();
    setVoiceAvailable("speechSynthesis" in window);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  const items = useMemo(() => {
    const all = tab === "saved" ? saved : edition;
    return all
      .filter(
        (s) =>
          tab !== "watch" ||
          (s.format === "video" &&
            (!shortOnly || (s.duration != null && s.duration > 0 && s.duration <= 60))),
      )
      .filter((s) => tab !== "following" || preferences.following.includes(topicKey(s.topic)))
      .filter(
        (s) =>
          !query ||
          `${s.title} ${s.summary} ${s.topic}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()),
      );
  }, [edition, saved, tab, query, shortOnly, preferences.following]);
  const current = items.find((s) => s.id === active) ?? items[0];
  useEffect(() => {
    if (current?.id)
      setSeen((old) => (old.includes(current.id) ? old : [...old, current.id].slice(-100)));
  }, [current?.id]);
  const updatePreference = (kind: "liked" | "following", value: string, onlyAdd = false) => {
    interacted.current = true;
    try {
      const previous = parseBriefPreferences(localStorage.getItem(BRIEF_PREFS_KEY));
      const exists = previous[kind].includes(value);
      const values =
        exists && !onlyAdd ? previous[kind].filter((v) => v !== value) : [value, ...previous[kind]];
      const next = parseBriefPreferences(JSON.stringify({ ...previous, [kind]: values }));
      localStorage.setItem(BRIEF_PREFS_KEY, JSON.stringify(next));
      setPreferences(next);
      setNotice(
        kind === "liked"
          ? exists && !onlyAdd
            ? t("Like removed.", "Mention retirée.")
            : t("Liked on this device.", "Aimé sur cet appareil.")
          : exists
            ? t("Topic unfollowed.", "Thème retiré.")
            : t("Following this topic on this device.", "Thème suivi sur cet appareil."),
      );
    } catch {
      setNotice(
        t(
          "Storage unavailable. Your preference was not saved.",
          "Stockage indisponible. Préférence non enregistrée.",
        ),
      );
    }
  };
  useEffect(() => {
    const node = feedRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting && e.intersectionRatio >= 0.65)
            setActive((e.target as HTMLElement).dataset.briefId || "");
      },
      { root: node, threshold: [0.65] },
    );
    node.querySelectorAll("[data-brief-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);
  useEffect(() => {
    if (!initialStory || initialOpened.current) return;
    const target = Array.from(
      feedRef.current?.querySelectorAll<HTMLElement>("[data-brief-id]") ?? [],
    ).find((e) => e.dataset.briefId === initialStory);
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "instant" });
      setActive(initialStory);
      initialOpened.current = true;
      interacted.current = true;
    }
  }, [items, initialStory]);
  useEffect(() => {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    setSpeaking("");
  }, [active, tab, panel]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden && "speechSynthesis" in window) {
        speechSynthesis.cancel();
        setSpeaking("");
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);

  const open = (next: Panel, story = current) => {
    interacted.current = true;
    returnFocus.current = document.activeElement as HTMLElement;
    setSelected(story ?? null);
    setPanel(next);
  };
  const changeTab = (next: Tab) => {
    interacted.current = true;
    setTab(next);
    setQuery("");
    feedRef.current?.scrollTo({ top: 0 });
  };
  const toggleSave = (story: Brief) => {
    interacted.current = true;
    const exists = saved.some((s) => s.id === story.id);
    // Read again so a second tab's save isn't overwritten by a stale React state.
    try {
      const previous = parseBriefSaved(localStorage.getItem(BRIEF_SAVED_KEY));
      const next = exists
        ? previous.filter((s) => s.id !== story.id)
        : parseBriefSaved(JSON.stringify([story, ...previous]));
      localStorage.setItem(BRIEF_SAVED_KEY, JSON.stringify(next));
      setSaved(next);
      setNotice(
        exists
          ? t("Removed from saved.", "Retiré de la liste.")
          : t("Saved on this device.", "Enregistré sur cet appareil."),
      );
    } catch {
      setNotice(
        t(
          "Storage is unavailable. This story was not saved.",
          "Stockage indisponible. Cet article n’a pas été enregistré.",
        ),
      );
    }
  };
  const listen = (story: Brief) => {
    interacted.current = true;
    if (!voiceAvailable) {
      setNotice(
        t(
          "Text-to-speech is unavailable in this browser.",
          "La lecture audio est indisponible dans ce navigateur.",
        ),
      );
      return;
    }
    speechSynthesis.cancel();
    if (speaking === story.id) {
      setSpeaking("");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `${story.title}. ${story.summary}. ${story.context}. ${story.caveat}`,
    );
    utterance.lang = story.id.startsWith("video-") ? "en-CA" : fr ? "fr-CA" : "en-CA";
    utterance.rate = 0.98;
    utterance.onend = utterance.onerror = () => setSpeaking("");
    setSpeaking(story.id);
    speechSynthesis.speak(utterance);
    setNotice(
      t(
        "Synthetic device voice. Tap again to stop.",
        "Voix synthétique de l’appareil. Touchez pour arrêter.",
      ),
    );
  };
  const copy = async (story: Brief) => {
    try {
      await navigator.clipboard.writeText(briefShareUrl(story));
      setNotice(t("Link copied.", "Lien copié."));
    } catch {
      setNotice(t("Copy the link shown below.", "Copiez le lien ci-dessous."));
    }
  };
  const nativeShare = async (story: Brief) => {
    if (!navigator.share) {
      await copy(story);
      return;
    }
    try {
      await navigator.share({ title: story.title, text: story.summary, url: briefShareUrl(story) });
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setNotice(
          t(
            "Sharing could not open. Copy the link instead.",
            "Le partage est indisponible. Copiez le lien.",
          ),
        );
    }
  };
  const move = (delta: number) => {
    const index = Math.max(
      0,
      items.findIndex((s) => s.id === current?.id),
    );
    const next = feedRef.current?.querySelectorAll<HTMLElement>("[data-brief-id]")[index + delta];
    next?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  };
  const fresh = incoming.some((s) => !edition.some((e) => e.id === s.id));
  return (
    <div className="brief-shell">
      <a className="brief-skip" href="#brief-feed">
        {t("Skip to stories", "Aller aux articles")}
      </a>
      <aside className="brief-intro">
        <a
          href={"https://aibroadsheet.com" + localePath("/", locale)}
          className="brief-desktop-brand"
        >
          <img src="/brief/mark.webp" alt="" />
          AI Broadsheet<span>THE BRIEF</span>
        </a>
        <div className="brief-intro-copy">
          <p className="brief-eyebrow">
            {t("A NEW RHYTHM FOR NEWS", "UN AUTRE RYTHME POUR L’ACTU")}
          </p>
          <h1>
            {t("Stay curious.", "Restez curieux.")}
            <br />
            <em>{t("Get the picture.", "Voyez plus clair.")}</em>
          </h1>
          <p>
            {t(
              "A little context goes a long way. AI news you can watch, swipe and actually understand.",
              "Un peu de contexte change tout. L’actualité IA à regarder, à parcourir et à comprendre.",
            )}
          </p>
          <div className="brief-intro-actions">
            <span>
              <ArrowDown size={16} /> {t("Scroll to explore", "Défiler pour explorer")}
            </span>
            <span>
              <Headphones size={16} /> {t("Listen your way", "Écouter à votre rythme")}
            </span>
          </div>
        </div>
        <div className="brief-intro-bottom">
          <p>{SITE.tagline[locale]}</p>
          <a href={"https://aibroadsheet.com" + localePath("/", locale)}>
            {t("Read the newspaper", "Lire le journal")} <ArrowUpRight size={15} />
          </a>
        </div>
      </aside>
      <section
        className={`brief-device ${tab === "watch" ? "brief-watch-mode" : ""}`}
        aria-label={t("The Brief news app", "L’application Le Brief")}
      >
        <header className="brief-header">
          <a
            href={"https://aibroadsheet.com" + localePath("/", locale)}
            className="brief-brand"
            aria-label="AI Broadsheet"
          >
            <img src="/brief/mark.webp" alt="" />
            <span>
              AI Broadsheet
              <small>
                THE BRIEF
                <span className="brief-brand-dot" />
              </small>
            </span>
          </a>
          <div>
            <button
              onClick={() => open("discover")}
              aria-label={t("Search and topics", "Recherche et thèmes")}
            >
              <Search size={21} />
            </button>
            <button onClick={() => open("menu")} aria-label={t("Open app menu", "Ouvrir le menu")}>
              <Menu size={22} />
            </button>
          </div>
        </header>
        <div className="brief-topics">
          <span className="brief-edition-label">{t("THE EDIT", "LA SÉLECTION")}</span>
          <button
            onClick={() => {
              changeTab("today");
            }}
            className={!query && tab === "today" ? "selected" : ""}
          >
            {t("All stories", "Tout")}
          </button>
          <button
            onClick={() => changeTab("following")}
            className={tab === "following" ? "selected" : ""}
          >
            {t("Following", "Suivis")}
          </button>
          <button onClick={() => changeTab("watch")} className={tab === "watch" ? "selected" : ""}>
            {t("Shorts", "Vidéos")}
          </button>
        </div>
        {tab === "watch" ? (
          <div className="brief-watch-options">
            <button
              aria-pressed={shortOnly}
              onClick={() => {
                setShortOnly(!shortOnly);
                feedRef.current?.scrollTo(0, 0);
              }}
            >
              {t("60 seconds or less", "60 secondes max")}
            </button>
            <button
              aria-pressed={autoPlay}
              onClick={() => {
                setAutoPlay(!autoPlay);
                setMuted(true);
              }}
            >
              <Play size={12} /> {t("Auto-play", "Lecture auto")} {autoPlay ? "ON" : "OFF"}
            </button>
          </div>
        ) : (
          tab !== "saved" && (
            <nav className="brief-circles" aria-label={t("Story highlights", "À la une")}>
              {edition.slice(0, 8).map((story) => (
                <button
                  key={story.id}
                  className={seen.includes(story.id) ? "seen" : ""}
                  aria-label={t("Open story: ", "Ouvrir : ") + story.title}
                  onClick={() => {
                    changeTab("today");
                    requestAnimationFrame(() => {
                      const node = Array.from(
                        feedRef.current?.querySelectorAll<HTMLElement>("[data-brief-id]") ?? [],
                      ).find((el) => el.dataset.briefId === story.id);
                      node?.scrollIntoView({ block: "start", behavior: "instant" });
                      setActive(story.id);
                    });
                  }}
                >
                  <span className="brief-circle-image">
                    {story.image ? (
                      <img src={story.image} alt="" loading="lazy" />
                    ) : (
                      <b>{(story.coverWord || story.topic).slice(0, 3).toUpperCase()}</b>
                    )}
                    {story.format === "video" && <Play size={12} fill="currentColor" />}
                  </span>
                  <span>{clip(story.title, 29)}</span>
                </button>
              ))}
            </nav>
          )
        )}
        {fresh && (
          <button
            className="brief-new"
            onClick={() => {
              setEdition(incoming);
              changeTab("today");
            }}
          >
            {t(
              "New stories are ready. Refresh the edit",
              "De nouveaux articles sont prêts. Actualiser",
            )}{" "}
            <ArrowRight size={14} />
          </button>
        )}
        <div
          ref={feedRef}
          id="brief-feed"
          className="brief-feed"
          tabIndex={0}
          aria-label={t(
            "Stories. Scroll vertically for the next story.",
            "Articles. Défiler verticalement pour le suivant.",
          )}
          onPointerDown={() => {
            interacted.current = true;
          }}
          onWheel={() => {
            interacted.current = true;
          }}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              move(e.key === "ArrowDown" ? 1 : -1);
            }
          }}
        >
          {items.map((story, index) => (
            <BriefCard
              key={story.id}
              story={story}
              active={current?.id === story.id && panel === null}
              index={index}
              total={items.length}
              fr={fr}
              saved={saved.some((s) => s.id === story.id)}
              liked={preferences.liked.includes(story.id)}
              following={preferences.following.includes(topicKey(story.topic))}
              onLike={(onlyAdd = false) => updatePreference("liked", story.id, onlyAdd)}
              onFollow={() => updatePreference("following", topicKey(story.topic))}
              autoPlay={autoPlay && tab === "watch"}
              watchMode={tab === "watch"}
              onEnded={() => {
                if (autoPlay && tab === "watch") move(1);
              }}
              saveReady={storageReady}
              onSave={() => toggleSave(story)}
              onSources={() => open("sources", story)}
              onShare={() => open("share", story)}
              onListen={() => listen(story)}
              speaking={speaking === story.id}
              muted={muted}
              setMuted={setMuted}
            />
          ))}
          <div className="brief-end">
            <img src="/brief/mark.webp" alt="" />
            <p className="brief-eyebrow">{t("YOU’RE ALL CAUGHT UP", "VOUS AVEZ FAIT LE TOUR")}</p>
            <h2>
              {items.length
                ? t("A little more perspective.", "Un peu plus de recul.")
                : t("Make room for a good story.", "Gardez une place pour un bon article.")}
            </h2>
            <p>
              {tab === "saved"
                ? t(
                    "Saved briefs stay on this device. Find a story, then tap the bookmark.",
                    "Les favoris restent sur cet appareil. Touchez le signet pour enregistrer un article.",
                  )
                : tab === "following"
                  ? t(
                      "Follow a topic on any story to build your own edit. Your choices stay on this device.",
                      "Suivez un thème depuis un article. Vos choix restent sur cet appareil.",
                    )
                  : query
                    ? t(
                        "Try another topic or explore all stories.",
                        "Essayez un autre thème ou explorez tous les articles.",
                      )
                    : t(
                        "That’s this edition. Take a breath, explore a topic or open the full newspaper.",
                        "C’est toute cette édition. Soufflez, explorez un thème ou ouvrez le journal.",
                      )}
            </p>
            <button
              className="brief-pill"
              onClick={() => {
                changeTab("today");
                setEdition(incoming);
              }}
            >
              {t("Back to the edit", "Retour à la sélection")} <ArrowRight size={17} />
            </button>
            <a href={"https://aibroadsheet.com" + localePath("/", locale)}>
              {t("Open the newspaper", "Ouvrir le journal")} <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <nav className="brief-nav" aria-label={t("App navigation", "Navigation de l’application")}>
          <button
            className={tab === "today" ? "active" : ""}
            onClick={() => changeTab("today")}
            aria-pressed={tab === "today"}
          >
            <Layers3 size={22} />
            <span>{t("The edit", "La sélection")}</span>
          </button>
          <button
            className={tab === "watch" ? "active" : ""}
            onClick={() => changeTab("watch")}
            aria-pressed={tab === "watch"}
          >
            <Play size={22} />
            <span>{t("Shorts", "Vidéos")}</span>
          </button>
          <button onClick={() => open("discover")}>
            <Compass size={22} />
            <span>{t("Explore", "Explorer")}</span>
          </button>
          <button
            className={tab === "saved" ? "active" : ""}
            onClick={() => changeTab("saved")}
            aria-pressed={tab === "saved"}
          >
            <Bookmark size={22} />
            <span>
              {t("Saved", "Favoris")}
              {saved.length > 0 && <b>{saved.length}</b>}
            </span>
          </button>
        </nav>
        {notice && !panel && (
          <div className="brief-toast" role="status">
            {notice}
          </div>
        )}
      </section>
      <aside className="brief-margin">
        <div>
          <span className="brief-live-dot" />
          {t("INDEPENDENT PERSPECTIVE", "UN REGARD INDÉPENDANT")}
        </div>
        <h2>
          {t("Less noise.", "Moins de bruit.")}
          <br />
          <em>{t("More signal.", "Plus de sens.")}</em>
        </h2>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>{t("The story", "L’essentiel")}</strong>
              <p>{t("The idea. Without the jargon.", "L’idée, sans le jargon.")}</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>{t("The context", "Le contexte")}</strong>
              <p>{t("Why it matters to your world.", "Pourquoi cela vous concerne.")}</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>{t("The receipts", "Les sources")}</strong>
              <p>{t("Evidence. Dates. Open questions.", "Preuves. Dates. Questions ouvertes.")}</p>
            </div>
          </li>
        </ol>
        <p className="brief-margin-note">
          {t(
            "Curiosity is the starting point. Understanding is the point.",
            "La curiosité est le début. Comprendre est le but.",
          )}
        </p>
        <div className="brief-desktop-controls">
          <button onClick={() => move(-1)} aria-label={t("Previous story", "Article précédent")}>
            <ArrowLeft size={21} />
          </button>
          <button onClick={() => move(1)} aria-label={t("Next story", "Article suivant")}>
            <ArrowRight size={21} />
          </button>
        </div>
        <a href={localePath("/standards", locale)}>
          {t("How we work", "Notre méthode")} <ArrowUpRight size={14} />
        </a>
      </aside>
      <Dialog.Root
        open={panel !== null}
        onOpenChange={(value) => {
          if (!value) setPanel(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="brief-overlay" />
          <Dialog.Content
            className="brief-sheet"
            aria-describedby="brief-sheet-description"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              returnFocus.current?.focus();
            }}
          >
            <span className="brief-sheet-handle" />
            <Dialog.Close className="brief-sheet-close" aria-label={t("Close panel", "Fermer")}>
              <X size={21} />
            </Dialog.Close>
            <Dialog.Title className="brief-sheet-title">
              {panel === "sources"
                ? t("Show the receipts.", "Voyons les sources.")
                : panel === "share"
                  ? t("Worth a conversation.", "Ça mérite une discussion.")
                  : panel === "discover"
                    ? t("Follow your curiosity.", "Suivez votre curiosité.")
                    : t("Make it yours.", "À votre façon.")}
            </Dialog.Title>
            <Dialog.Description id="brief-sheet-description" className="brief-sheet-description">
              {panel === "sources"
                ? t(
                    "The evidence, the limits and how this was made.",
                    "Les preuves, les limites et la fabrication.",
                  )
                : panel === "share"
                  ? t("Send the context with the headline.", "Partagez le contexte avec le titre.")
                  : panel === "discover"
                    ? t("Search the edit. Choose a topic.", "Recherchez et choisissez un thème.")
                    : t("Your reading. Your pace.", "Votre lecture. Votre rythme.")}
            </Dialog.Description>
            {notice && (
              <p className="brief-panel-notice" role="status">
                {notice}
              </p>
            )}
            {panel === "sources" && selected && (
              <>
                <h3>{selected.title}</h3>
                <p>{selected.caveat}</p>
                <div className="brief-source-list">
                  {selected.sources.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.name}
                      <ExternalLink size={17} />
                    </a>
                  ))}
                  {selected.path.includes("/article/") && (
                    <a href={selected.path}>
                      {t("Open the full source ledger", "Ouvrir toutes les sources")}
                      <ArrowUpRight size={17} />
                    </a>
                  )}
                </div>
                <p className="brief-method">
                  {selected.aiLabel}
                  {selected.date &&
                    ` · ${new Date(selected.date).toLocaleDateString(fr ? "fr-CA" : "en-CA", { timeZone: "America/Toronto" })}`}
                </p>
                {selected.credits && <p className="brief-credits">{selected.credits}</p>}
                {selected.transcript && (
                  <details>
                    <summary>{t("Read the transcript", "Lire la transcription")}</summary>
                    <p>{selected.transcript}</p>
                  </details>
                )}
                <a className="brief-sheet-link" href={localePath("/standards", locale)}>
                  {t("Our editorial standards", "Nos normes éditoriales")}{" "}
                  <ArrowUpRight size={16} />
                </a>
              </>
            )}
            {panel === "share" && selected && (
              <>
                <h3>{selected.title}</h3>
                <p>{selected.summary}</p>
                <div className="brief-share-grid">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(selected.title + "\n" + briefShareUrl(selected))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle />
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selected.title)}&url=${encodeURIComponent(briefShareUrl(selected))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Repeat2 /> {t("Repost on X", "Partager sur X")}
                  </a>
                  <button onClick={() => nativeShare(selected)}>
                    <Share2 />
                    {t("Share…", "Partager…")}
                  </button>
                  <button onClick={() => copy(selected)}>
                    <Copy />
                    {t("Copy link", "Copier le lien")}
                  </button>
                </div>
                <input
                  readOnly
                  aria-label={t("Story link", "Lien de l’article")}
                  value={briefShareUrl(selected)}
                  onFocus={(e) => e.target.select()}
                />
              </>
            )}
            {panel === "discover" && (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPanel(null);
                    setTab("today");
                    feedRef.current?.scrollTo(0, 0);
                  }}
                >
                  <label className="brief-search-label" htmlFor="brief-search">
                    {t("Search stories", "Rechercher des articles")}
                  </label>
                  <div className="brief-search-box">
                    <Search size={20} />
                    <input
                      id="brief-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("AI, work, research…", "IA, travail, recherche…")}
                    />
                    <button aria-label={t("Search", "Rechercher")}>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </form>
                <div className="brief-topic-grid">
                  {[
                    t("AI literacy", "Culture IA"),
                    "agents",
                    "research",
                    "business",
                    "responsible",
                    "Originals",
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setQuery(topic);
                        setTab("today");
                        setPanel(null);
                        feedRef.current?.scrollTo(0, 0);
                      }}
                    >
                      {topic}
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
                <a className="brief-sheet-link" href={localePath("/search", locale)}>
                  {t("Search the full newspaper", "Rechercher dans le journal")}{" "}
                  <ArrowUpRight size={16} />
                </a>
              </>
            )}
            {panel === "menu" && (
              <>
                <div className="brief-menu-links">
                  <a href={"https://aibroadsheet.com" + localePath("/", locale)}>
                    <FileText />
                    {t("The newspaper", "Le journal")}
                    <ArrowUpRight />
                  </a>
                  <a href={localePath("/more", locale)}>
                    <Compass />
                    {t("Install the app", "Installer l’application")}
                    <ArrowUpRight />
                  </a>
                  <a href={localePath("/values", locale)}>
                    <Check />
                    {t("Our values", "Nos valeurs")}
                    <ArrowUpRight />
                  </a>
                </div>
                <div className="brief-language">
                  <span>{t("Language", "Langue")}</span>
                  <button aria-pressed={!fr} onClick={() => setLocale("en")}>
                    EN
                  </button>
                  <button aria-pressed={fr} onClick={() => setLocale("fr")}>
                    FR
                  </button>
                </div>
                <p className="brief-method">
                  {t(
                    "No account required. Likes, followed topics and saved briefs stay on this device. There are no public like counts. Videos start muted. Auto-play is optional and resets when you reopen the app.",
                    "Sans compte. Mentions, thèmes suivis et favoris restent sur cet appareil. Aucun compteur public. Vidéos muettes au départ. Lecture auto facultative, réinitialisée à la réouverture.",
                  )}
                </p>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function BriefCard({
  story,
  active,
  index,
  total,
  fr,
  saved,
  liked,
  following,
  onLike,
  onFollow,
  autoPlay,
  watchMode,
  onEnded,
  saveReady,
  onSave,
  onSources,
  onShare,
  onListen,
  speaking,
  muted,
  setMuted,
}: {
  story: Brief;
  active: boolean;
  index: number;
  total: number;
  fr: boolean;
  saved: boolean;
  liked: boolean;
  following: boolean;
  onLike: (onlyAdd?: boolean) => void;
  onFollow: () => void;
  autoPlay: boolean;
  watchMode: boolean;
  onEnded: () => void;
  saveReady: boolean;
  onSave: () => void;
  onSources: () => void;
  onShare: () => void;
  onListen: () => void;
  speaking: boolean;
  muted: boolean;
  setMuted: (value: boolean) => void;
}) {
  const t = (en: string, french: string) => (fr ? french : en);
  const [frame, setFrame] = useState(0);
  const frames = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [duration, setDuration] = useState(story.duration ?? 0);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [heartBurst, setHeartBurst] = useState(false);
  const lastTap = useRef(0);
  const tapStart = useRef<{ x: number; y: number } | null>(null);
  const likeCover = (event: React.PointerEvent<HTMLElement>) => {
    const start = tapStart.current;
    tapStart.current = null;
    if (
      !start ||
      Math.abs(event.clientX - start.x) > 10 ||
      Math.abs(event.clientY - start.y) > 10
    ) {
      lastTap.current = 0;
      return;
    }
    if (!saveReady || (event.target as HTMLElement).closest("button, a, input")) return;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onLike(true);
      setHeartBurst(true);
      lastTap.current = 0;
    } else lastTap.current = now;
  };
  useEffect(() => {
    if (!heartBurst) return;
    const timer = setTimeout(() => setHeartBurst(false), 700);
    return () => clearTimeout(timer);
  }, [heartBurst]);
  useEffect(() => {
    if (video.current) video.current.playbackRate = speed;
  }, [speed]);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (!active || frame !== 0) el.pause();
    else if (autoPlay && !document.hidden)
      el.play().catch(() => {
        /* Tap-to-play remains available. */
      });
  }, [active, autoPlay, frame]);
  const isVideo = story.format === "video" && !!story.video;
  useEffect(() => {
    if (!active && video.current) video.current.pause();
    const hide = () => {
      if (document.hidden) video.current?.pause();
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [active]);
  const goFrame = (n: number) => {
    const el = frames.current;
    if (!el) return;
    el.scrollTo({
      left: n * el.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const toggleVideo = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setVideoError(true));
    else el.pause();
  };
  return (
    <article
      className={`brief-card ${watchMode ? "brief-short-card" : ""}`}
      data-brief-id={story.id}
      aria-label={story.title}
      lang={story.id.startsWith("video-") ? "en" : fr ? "fr" : "en"}
    >
      <div
        className="brief-frames"
        ref={frames}
        onScroll={(e) => {
          const el = e.currentTarget;
          setFrame(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        <section
          className={`brief-frame brief-cover ${isVideo ? "is-video" : ""}`}
          aria-label={t("The story", "L’essentiel")}
          onPointerDown={(event) => {
            tapStart.current = event.button === 0 ? { x: event.clientX, y: event.clientY } : null;
          }}
          onPointerCancel={() => {
            tapStart.current = null;
            lastTap.current = 0;
          }}
          onPointerUp={likeCover}
        >
          {!story.image && !isVideo && (
            <div className="brief-type-art" aria-hidden="true">
              <span>{story.coverWord || "AI"}</span>
              <i />
              <b>AI / {story.topic.toUpperCase()}</b>
            </div>
          )}
          {story.image && !isVideo && (
            <img
              className="brief-art"
              src={story.image}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          {isVideo && (
            <video
              ref={video}
              className="brief-video"
              src={active ? story.video : undefined}
              poster={story.image}
              preload="none"
              playsInline
              muted={muted}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                setPlaying(false);
                onEnded();
              }}
              onError={() => setVideoError(true)}
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration);
                e.currentTarget.playbackRate = speed;
              }}
              onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
              aria-label={story.title}
            />
          )}
          <div className="brief-cover-shade" />
          {heartBurst && (
            <Heart className="brief-heart-burst" size={82} fill="currentColor" aria-hidden="true" />
          )}
          {watchMode && (
            <div className="brief-social-rail">
              <button
                aria-label={t("Like story", "Aimer l’article")}
                aria-pressed={liked}
                disabled={!saveReady}
                onClick={() => onLike()}
                className={liked ? "selected" : ""}
              >
                <Heart fill={liked ? "currentColor" : "none"} />
                <span>{t("Like", "J’aime")}</span>
              </button>
              <button
                aria-label={t("Save story", "Enregistrer l’article")}
                aria-pressed={saved}
                disabled={!saveReady}
                onClick={onSave}
              >
                <Bookmark fill={saved ? "currentColor" : "none"} />
                <span>{t("Save", "Garder")}</span>
              </button>
              <button
                aria-label={t("Repost or share story", "Partager l’article")}
                onClick={onShare}
              >
                <Repeat2 />
                <span>{t("Repost", "Partager")}</span>
              </button>
              <button aria-label={t("Show sources", "Voir les sources")} onClick={onSources}>
                <FileText />
                <span>{t("Sources", "Sources")}</span>
              </button>
            </div>
          )}
          <div className="brief-card-meta">
            <button
              className="brief-kind brief-follow"
              onClick={onFollow}
              disabled={!saveReady}
              aria-pressed={following}
              aria-label={
                (following
                  ? t("Unfollow topic: ", "Ne plus suivre : ")
                  : t("Follow topic: ", "Suivre : ")) + story.topic
              }
            >
              {isVideo ? <Play size={12} fill="currentColor" /> : <Layers3 size={13} />}
              {isVideo ? "ORIGINAL" : story.topic.toUpperCase()}
              {following ? <Check size={12} /> : <Plus size={12} />}
            </button>
            <span>
              {String(index + 1).padStart(2, "0")}
              <i> / {String(total).padStart(2, "0")}</i>
            </span>
          </div>
          {isVideo && (
            <div className="brief-video-controls">
              <button
                className="brief-speed"
                aria-label={t(`Playback speed: ${speed}x`, `Vitesse : ${speed}x`)}
                onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}
              >
                {speed}×
              </button>
              <button
                className="brief-play"
                onClick={toggleVideo}
                aria-label={
                  playing ? t("Pause video", "Mettre en pause") : t("Play video", "Lire la vidéo")
                }
              >
                {playing ? (
                  <Pause size={30} fill="currentColor" />
                ) : (
                  <Play size={30} fill="currentColor" />
                )}
              </button>
              <button
                className="brief-sound"
                onClick={() => setMuted(!muted)}
                aria-label={
                  muted
                    ? t("Enable video sound", "Activer le son")
                    : t("Mute video", "Couper le son")
                }
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          )}
          <div className={`brief-cover-copy ${playing ? "video-playing" : ""}`}>
            <p className="brief-kicker">
              {story.date
                ? new Date(story.date).toLocaleDateString(fr ? "fr-CA" : "en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "America/Toronto",
                  })
                : t("THE EVERYDAY EXPLAINER", "POUR COMPRENDRE L’IA")}
            </p>
            <h2>{story.title}</h2>
            {!playing && <p className="brief-summary">{clip(story.summary, 210)}</p>}
            <button className="brief-context-link" onClick={() => goFrame(1)}>
              {t("Get the context", "Voir le contexte")}
              <ArrowRight size={16} />
            </button>
            <span className="brief-ai-label">{story.aiLabel}</span>
            {videoError && (
              <p role="status">
                {t(
                  "Video could not load. Read the transcript in Sources.",
                  "Vidéo indisponible. La transcription est dans les sources.",
                )}
              </p>
            )}
          </div>
          {isVideo && duration > 0 && (
            <label className="brief-progress">
              <span className="sr-only">{t("Video position", "Position dans la vidéo")}</span>
              <input
                type="range"
                min="0"
                max={duration}
                step=".1"
                value={Math.min(position, duration)}
                onChange={(e) => {
                  if (video.current) video.current.currentTime = Number(e.target.value);
                }}
              />
            </label>
          )}
        </section>
        <section className="brief-frame brief-context" aria-label={t("The context", "Le contexte")}>
          <span className="brief-eyebrow">02 / {t("THE CONTEXT", "LE CONTEXTE")}</span>
          <span className="brief-context-number" aria-hidden="true">
            ↗
          </span>
          <h3>{t("What changes?", "Ce qui change ?")}</h3>
          <p>{story.context ? clip(story.context, 900) : story.summary}</p>
          <div className="brief-open-question">
            <span>{t("KEEP IN MIND", "À RETENIR")}</span>
            <p>{story.caveat}</p>
          </div>
          {!story.path.includes("/app?") && (
            <a href={story.path} className="brief-pill">
              {t("Read the full story", "Lire l’article")}
              <ArrowUpRight size={17} />
            </a>
          )}
          <span className="brief-page-foot">{t("One catch a day.", "Une mise au point par jour.")}</span>
        </section>
        <section
          className="brief-frame brief-evidence"
          aria-label={t("The sources", "Les sources")}
        >
          <span className="brief-eyebrow">03 / {t("THE RECEIPTS", "LES SOURCES")}</span>
          <h3>
            {t("Curious?", "Curieux ?")}
            <br />
            <em>{t("Check it.", "Vérifiez.")}</em>
          </h3>
          <p>
            {t("Here is where the evidence comes from.", "Voici d’où viennent les informations.")}
          </p>
          <div className="brief-source-list">
            {story.sources.map((s) => (
              <a href={s.url} key={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
                <ArrowUpRight size={17} />
              </a>
            ))}
            {story.sources.length === 0 && (
              <a href={story.path}>
                {t("The article’s full source ledger", "Toutes les sources de l’article")}
                <ArrowUpRight size={18} />
              </a>
            )}
          </div>
          <p className="brief-method">{story.aiLabel}</p>
          <button className="brief-pill" onClick={onSources}>
            {t("Sources & how it’s made", "Sources et fabrication")}
            <ArrowRight size={17} />
          </button>
        </section>
      </div>
      <div className="brief-frame-nav">
        <button
          aria-label={t("Previous frame", "Carte précédente")}
          disabled={frame === 0}
          onClick={() => goFrame(frame - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <div aria-label={t(`Frame ${frame + 1} of 3`, `Carte ${frame + 1} sur 3`)}>
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              className={frame === n ? "active" : ""}
              onClick={() => goFrame(n)}
              aria-label={
                [
                  t("The story", "L’essentiel"),
                  t("The context", "Le contexte"),
                  t("The sources", "Les sources"),
                ][n]
              }
              aria-current={frame === n ? "step" : undefined}
            />
          ))}
        </div>
        <span>
          {frame === 0
            ? t("Swipe for context", "Glisser pour le contexte")
            : frame === 1
              ? t("Why it matters", "Pourquoi c’est important")
              : t("Check the evidence", "Vérifier les sources")}
        </span>
        <button
          aria-label={t("Next frame", "Carte suivante")}
          disabled={frame === 2}
          onClick={() => goFrame(frame + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="brief-tools">
        <button className="brief-receipts" onClick={onSources}>
          <FileText size={18} />
          <span>{t("Sources", "Sources")}</span>
          {story.sources.length > 0 && <b>{story.sources.length}</b>}
        </button>
        <div>
          {!watchMode && (
            <button
              onClick={() => onLike()}
              disabled={!saveReady}
              aria-label={t("Like story", "Aimer l’article")}
              aria-pressed={liked}
              className={liked ? "selected" : ""}
            >
              <Heart size={21} fill={liked ? "currentColor" : "none"} />
            </button>
          )}
          <button
            onClick={onListen}
            className={speaking ? "selected" : ""}
            aria-label={
              speaking
                ? t("Stop listening", "Arrêter la lecture")
                : t("Listen with synthetic voice", "Écouter avec une voix synthétique")
            }
            aria-pressed={speaking}
          >
            {speaking ? <Pause size={21} /> : <AudioLines size={21} />}
          </button>
          {!watchMode && (
            <button
              onClick={onSave}
              disabled={!saveReady}
              className={saved ? "selected" : ""}
              aria-label={
                saved
                  ? t("Remove saved story", "Retirer des favoris")
                  : t("Save story", "Enregistrer l’article")
              }
              aria-pressed={saved}
            >
              <Bookmark size={21} fill={saved ? "currentColor" : "none"} />
            </button>
          )}
          <button onClick={onShare} aria-label={t("Share story", "Partager l’article")}>
            <Share2 size={21} />
          </button>
        </div>
      </div>
    </article>
  );
}
