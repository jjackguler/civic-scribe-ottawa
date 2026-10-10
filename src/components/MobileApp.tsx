import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Bookmark, Check, Home, List, Menu, Share2, Type, WifiOff, Download, ArrowRight, Search, ChevronRight } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import { SAVED_EVENT, READER_KEY, readSaved, readerSize, writeSaved, type SavedStory } from '@/lib/mobile-store';
import { localePath, stripFr } from '@/lib/seo';
import { SITE } from '@/lib/site';

export function useSaved() {
  const [items, setItems] = useState<SavedStory[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const refresh = () => { setItems(readSaved()); setReady(true); };
    refresh(); window.addEventListener(SAVED_EVENT, refresh); window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(SAVED_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  return { items, ready };
}

export function MobileNav() {
  const { locale } = useLocale();
  const path = useRouterState({ select: s => stripFr(s.location.pathname) });
  const { items } = useSaved();
  const links = [
    { to: '/', en: 'Home', fr: 'Accueil', icon: Home },
    { to: '/news', en: 'Latest', fr: 'Fil', icon: List },
    { to: '/saved', en: 'Saved', fr: 'Enregistrés', icon: Bookmark },
    { to: '/more', en: 'More', fr: 'Plus', icon: Menu },
  ];
  return <nav className="mobile-nav" aria-label={locale === 'fr' ? 'Navigation de l’application' : 'App navigation'}>
    {links.map(l => { const active = l.to === '/' ? path === '/' : path === l.to; return <Link key={l.to} to={l.to as never} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
      <span className="relative"><l.icon size={21} strokeWidth={active ? 2.4 : 1.7} aria-hidden="true" />{l.to === '/saved' && items.length > 0 && <span className="saved-count">{items.length}</span>}</span>
      <span>{locale === 'fr' ? l.fr : l.en}</span>
    </Link>; })}
  </nav>;
}

export function ReaderSize() {
  const { locale } = useLocale();
  const fr = locale === 'fr';
  const [size, setSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [error, setError] = useState(false);
  useEffect(() => { try { setSize(readerSize(localStorage.getItem(READER_KEY))); } catch { /* default remains usable */ } }, []);
  const set = (next: typeof size) => {
    setSize(next); document.documentElement.dataset.readerSize = next;
    try { localStorage.setItem(READER_KEY, next); setError(false); } catch { setError(true); }
  };
  return <div>
    <div className="reader-controls" role="group" aria-label={fr ? 'Taille du texte' : 'Text size'}>
      <Type size={18} aria-hidden="true" /><span className="text-sm mr-2">{fr ? 'Texte' : 'Text'}</span>
      {(['normal', 'large', 'larger'] as const).map((s, i) => <button key={s} onClick={() => set(s)} aria-pressed={size === s} aria-label={fr ? ['Texte normal', 'Grand texte', 'Très grand texte'][i] : ['Normal text', 'Large text', 'Largest text'][i]} className={size === s ? 'selected' : ''}><span style={{ fontSize: 14 + i * 3 }}>A</span></button>)}
    </div>
    {error && <p role="status" className="text-sm mt-2">{fr ? 'Ce réglage ne sera pas conservé sur cet appareil.' : 'This setting could not be saved on this device.'}</p>}
  </div>;
}

export function ArticleTools({ title, summary = '', source = '', publishedAt = '' }: { title: string; summary?: string; source?: string; publishedAt?: string }) {
  const { locale } = useLocale(); const fr = locale === 'fr';
  const { items, ready } = useSaved();
  const href = useRouterState({ select: s => s.location.publicHref ?? s.location.href });
  const path = href.split(/[?#]/)[0];
  const saved = items.some(s => s.path === path);
  const [notice, setNotice] = useState('');
  const toggle = () => {
    const current = readSaved();
    const exists = current.some(s => s.path === path);
    const next = exists ? current.filter(s => s.path !== path) : [{ path, title, summary, source, publishedAt, savedAt: new Date().toISOString(), locale }, ...current];
    const ok = writeSaved(next);
    setNotice(ok ? (exists ? (fr ? 'Retiré des favoris.' : 'Removed from saved stories.') : (fr ? 'Lien et résumé enregistrés sur cet appareil.' : 'Link and summary saved on this device.')) : (fr ? 'Le stockage de cet appareil est indisponible.' : 'Device storage is unavailable. Your story was not saved.'));
  };
  const share = async () => {
    const url = `https://${SITE.domain}${path}`;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); setNotice(fr ? 'Lien copié.' : 'Link copied.'); }
      else setNotice(url);
    } catch (e) { if ((e as Error).name !== 'AbortError') setNotice(url); }
  };
  return <div className="article-tools">
    <div className="flex flex-wrap gap-2 items-center">
      <button className="app-button" onClick={toggle} disabled={!ready} aria-pressed={saved}>{saved ? <Check size={18} /> : <Bookmark size={18} />}{saved ? (fr ? 'Enregistré' : 'Saved') : (fr ? 'Enregistrer' : 'Save story')}</button>
      <button className="app-button" onClick={share}><Share2 size={18} />{fr ? 'Partager' : 'Share'}</button>
      <ReaderSize />
    </div>
    <p role="status" aria-live="polite" className="text-sm mt-2 text-muted-ink break-words">{notice}</p>
  </div>;
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let installEvent: InstallEvent | null = null;
const INSTALL_EVENT = 'ab-install-ready';

export function InstallCard() {
  const { locale } = useLocale(); const fr = locale === 'fr';
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const update = () => { setCanInstall(!!installEvent); setInstalled(window.matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone); };
    update(); window.addEventListener(INSTALL_EVENT, update); window.addEventListener('appinstalled', update);
    return () => { window.removeEventListener(INSTALL_EVENT, update); window.removeEventListener('appinstalled', update); };
  }, []);
  const install = async () => { const ev = installEvent; if (!ev) return; try { await ev.prompt(); await ev.userChoice; } finally { installEvent = null; setCanInstall(false); } };
  return <section className="install-card" aria-labelledby="install-title">
    <span className="app-eyebrow">{fr ? 'VOTRE JOURNAL, À PORTÉE DE MAIN' : 'YOUR PAPER, ALWAYS AT HAND'}</span>
    <div className="flex gap-4 mt-4 items-center"><img src="/icons/icon-192.png" width="56" height="56" className="rounded-xl" alt="" /><h2 id="install-title" className="masthead-serif text-2xl">AI Broadsheet</h2></div>
    <p className="mt-4 text-white/80">{installed ? (fr ? 'L’application est ouverte depuis votre écran d’accueil.' : 'You’re reading in the home-screen app.') : (fr ? 'Ajoutez votre journal à l’écran d’accueil. Sans boutique, sans abonnement supplémentaire.' : 'Add your newspaper to your home screen. No app store or extra subscription needed.')}</p>
    {canInstall && !installed && <button className="app-button install-button mt-5" onClick={install}><Download size={18} />{fr ? 'Installer l’application' : 'Install app'}</button>}
    {!installed && <div className="mt-5 border-t border-white/20 pt-4 text-sm space-y-3"><p><strong>iPhone / iPad</strong><br />{fr ? 'Dans Safari : Partager → Sur l’écran d’accueil → Ajouter.' : 'In Safari: Share → Add to Home Screen → Add.'}</p><p><strong>Android</strong><br />{fr ? 'Dans Chrome : menu ⋮ → Installer l’application ou Ajouter à l’écran d’accueil.' : 'In Chrome: ⋮ menu → Install app or Add to Home screen.'}</p></div>}
  </section>;
}

export function MobileRuntime() {
  const { locale } = useLocale(); const fr = locale === 'fr';
  const [offline, setOffline] = useState(false);
  const [update, setUpdate] = useState<ServiceWorker | null>(null);
  const [reconnected, setReconnected] = useState(false);
  useEffect(() => {
    try { document.documentElement.dataset.readerSize = readerSize(localStorage.getItem(READER_KEY)); } catch { /* storage can be blocked */ }
    const status = () => { setOffline(!navigator.onLine); if (navigator.onLine) setReconnected(true); };
    setOffline(!navigator.onLine); window.addEventListener('online', status); window.addEventListener('offline', status);
    const install = (e: Event) => { e.preventDefault(); installEvent = e as InstallEvent; window.dispatchEvent(new Event(INSTALL_EVENT)); };
    window.addEventListener('beforeinstallprompt', install);
    let active = true;
    if ('serviceWorker' in navigator && (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW === '1')) {
      navigator.serviceWorker.register('/mobile-sw.js', { updateViaCache: 'none' }).then(reg => {
        if (!active) return;
        if (reg.waiting) setUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => { const worker = reg.installing; worker?.addEventListener('statechange', () => { if (active && worker.state === 'installed' && navigator.serviceWorker.controller) setUpdate(worker); }); });
      }).catch(() => { /* Browsing works even when installation is unavailable. */ });
    }
    return () => { active = false; window.removeEventListener('online', status); window.removeEventListener('offline', status); window.removeEventListener('beforeinstallprompt', install); };
  }, []);
  const applyUpdate = () => {
    if (!update) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    update.postMessage({ type: 'SKIP_WAITING' });
  };
  if (!offline && !update && !reconnected) return null;
  return <div className="app-status" role="status">
    {offline ? <><WifiOff size={18} /><span>{fr ? 'Hors connexion. Les résumés enregistrés restent disponibles.' : 'Offline. Your saved summaries are still available.'}</span><a href="/offline">{fr ? 'Ouvrir' : 'Open'}</a></> : update ? <><span>{fr ? 'Une nouvelle version est prête.' : 'A new edition of the app is ready.'}</span><button onClick={applyUpdate}>{fr ? 'Mettre à jour' : 'Update'}</button></> : <><span>{fr ? 'Connexion rétablie.' : 'You’re back online.'}</span><button onClick={() => window.location.reload()}>{fr ? 'Actualiser' : 'Refresh'}</button><button onClick={() => setReconnected(false)} aria-label={fr ? 'Fermer' : 'Dismiss'}>×</button></>}
  </div>;
}

export function SavedPageContent() {
  const { locale } = useLocale(); const fr = locale === 'fr'; const { items, ready } = useSaved();
  const [error, setError] = useState('');
  return <div className="mobile-page container-mw">
    <p className="app-eyebrow text-lake">{fr ? 'VOTRE COLLECTION' : 'YOUR READING LIST'}</p>
    <h1 className="masthead-serif text-4xl mt-3">{fr ? 'À lire, à votre rythme.' : 'Good stories. Your time.'}</h1>
    <p className="dek mt-4 max-w-xl">{fr ? 'Les liens et courts résumés que vous avez enregistrés sur cet appareil. Les articles complets nécessitent une connexion.' : 'Links and short summaries saved on this device. Open the full story when you’re online.'}</p>
    <p role="status" className="mt-3 text-sm text-live">{error}</p>
    {!ready ? <p className="py-12">{fr ? 'Chargement…' : 'Loading…'}</p> : !items.length ? <section className="empty-saved"><Bookmark size={36} strokeWidth={1.3} /><h2 className="masthead-serif text-2xl mt-5">{fr ? 'Votre liste commence ici.' : 'Your next read starts here.'}</h2><p className="dek mt-3">{fr ? 'Ouvrez un article et touchez Enregistrer pour le retrouver ici.' : 'Open a story and tap Save story to keep it here.'}</p><Link to="/news" className="app-button bg-night text-white mt-6">{fr ? 'Explorer les nouvelles' : 'Explore the latest'}<ArrowRight size={18} /></Link></section> : <ul className="saved-list mt-9">{items.map(s => <li key={s.path} className="saved-card"><div><p className="topic">{s.source || 'AI Broadsheet'} · {s.locale.toUpperCase()}</p><a href={s.path} className="hl text-xl mt-2 block hover:underline">{s.title}</a>{s.summary && <p className="dek mt-3 reader-copy">{s.summary}</p>}<p className="meta mt-3">{fr ? 'Résumé enregistré le ' : 'Summary saved '}{new Date(s.savedAt).toLocaleDateString(fr ? 'fr-CA' : 'en-CA')}</p></div><button className="app-button self-start" aria-label={`${fr ? 'Retirer' : 'Remove'}: ${s.title}`} onClick={() => { if (!writeSaved(readSaved().filter(x => x.path !== s.path))) setError(fr ? 'Impossible de modifier le stockage.' : 'Could not update device storage.'); }}><Bookmark size={18} fill="currentColor" /><span>{fr ? 'Retirer' : 'Remove'}</span></button></li>)}</ul>}
    <p className="meta mt-6">{fr ? '100 favoris maximum. Effacer les données du navigateur efface cette liste.' : 'Up to 100 saved stories. Clearing browser data removes this list.'}</p>
  </div>;
}

export function MorePageContent() {
  const { locale, setLocale } = useLocale(); const fr = locale === 'fr';
  const links = [ ['/search', 'Search the paper', 'Rechercher', Search], ['/dispatch', 'Explained', 'Expliqué', List], ['/originals', 'Videos & explainers', 'Vidéos et explications', List], ['/labs', 'Learn AI', 'Apprendre l’IA', List], ['/quiz', 'The Broadsheet 5', 'Le quiz Broadsheet', List], ['/glossary', 'AI glossary', 'Glossaire IA', List], ['/standards', 'Editorial standards', 'Normes éditoriales', List], ['/privacy', 'Privacy', 'Confidentialité', List] ] as const;
  return <div className="mobile-page container-mw"><p className="app-eyebrow text-lake">{fr ? 'TOUT LE JOURNAL' : 'EXPLORE YOUR PAPER'}</p><h1 className="masthead-serif text-4xl mt-3">{fr ? 'Plus de perspectives.' : 'A little more perspective.'}</h1><div className="more-grid mt-8"><div><div className="section-links">{links.map(([to, en, fl, Icon]) => <Link key={to} to={to as never}><Icon size={20} aria-hidden="true" /><span>{fr ? fl : en}</span><ChevronRight size={18} aria-hidden="true" /></Link>)}</div><section className="settings-panel mt-8"><h2 className="hl text-xl mb-5">{fr ? 'Votre lecture' : 'Make it yours'}</h2><ReaderSize /><div className="flex gap-3 items-center border-t border-line mt-5 pt-5"><span className="mr-auto text-sm">{fr ? 'Langue' : 'Language'}</span><button className="app-button" aria-pressed={!fr} onClick={() => setLocale('en')}>EN</button><button className="app-button" aria-pressed={fr} onClick={() => setLocale('fr')}>FR</button></div></section></div><InstallCard /></div><p className="meta mt-8">{fr ? 'Une édition mobile du même journal. Les favoris restent sur votre appareil.' : 'A mobile edition of the same newspaper. Your saved stories stay on your device.'}</p></div>;
}

