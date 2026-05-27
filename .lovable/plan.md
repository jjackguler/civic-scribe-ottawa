
# Editorial Layer for Ottawa Civic Ledger

Goal: add a premium, magazine-quality editorial publishing system on top of the existing civic platform — without disturbing the map, traffic, 311, sources, donate, or submit flows. No new random modules; every new piece is part of one coherent editorial architecture.

---

## 1. Information architecture

New top-level routes (all under `src/routes/`, TanStack file-based):

```
/editorial                  Editorial hub
/interviews                 Interview index
/interviews/$slug           Interview article
/opinion                    Opinion index
/opinion/$slug              Opinion article
/columns                    All columns
/columns/$columnSlug        Column landing (recurring series)
/columns/$columnSlug/$slug  Column entry
/analysis                   Analysis index
/analysis/$slug             Analysis article
/essays                     Essays index
/essays/$slug               Essay article
/investigations             Investigations index
/investigations/$slug       Long-read / investigation
/explainers                 Explainers index
/explainers/$slug           Explainer article
/cartoons                   Cartoon gallery
/cartoons/$slug             Single cartoon
/satire                     Satire & humor index
/satire/$slug               Satire piece (clearly labeled)
/photo-essays               Photo essay index
/photo-essays/$slug         Photo essay
/op-docs                    Op-Docs index (future-ready, "coming soon")
/op-docs/$slug              Op-Doc page
/community-voices           Community Voices index
/community-voices/$slug     Community voice piece
/editorial-board            Editorial Board page (masthead, mission)
/letters                    Letters to the Editor (list + submit form)
/letters/$slug              Published letter
/authors                    Author directory
/authors/$slug              Author profile + archive
```

Existing `/solutions` stays and is linked from the editorial hub.

Top navigation reorganized (Header component) into two tiers:

- Primary: News · Ottawa Map · Social Trends · Traffic · Interviews · Opinion · Culture · Cartoons · Solutions · Events · Submit
- "Culture" is a small dropdown / section landing covering Photo Essays, Essays, Long Reads, Community Voices.
- A secondary editorial sub-nav appears on `/editorial` and on every editorial article: Interviews · Opinion · Columns · Analysis · Cartoons · Satire · Long Reads · Photo Essays · Letters.

Bilingual toggle, breaking bar, footer, and current civic pages remain untouched.

---

## 2. Data model (typed, DB-ready)

New file `src/types/editorial.ts` — pure TypeScript interfaces, ready to back with Supabase later. No DB migration in this pass; we use local fixtures in `src/lib/editorial-data.ts` and a small loader API so swapping to Supabase later is a one-file change.

```text
ArticleType  = 'news' | 'interview' | 'opinion' | 'analysis' | 'essay'
             | 'cartoon' | 'satire' | 'photo-essay' | 'investigation'
             | 'explainer' | 'solution' | 'op-doc' | 'column' | 'letter'
             | 'community-voice'

ArticleLabel = 'NEWS' | 'INTERVIEW' | 'OPINION' | 'ANALYSIS' | 'CARTOON'
             | 'SATIRE' | 'LETTER' | 'INVESTIGATION' | 'EXPLAINER'
             | 'SOLUTIONS' | 'OP-DOC' | 'ESSAY' | 'PHOTO ESSAY'
             | 'COLUMN' | 'COMMUNITY VOICE'

Author { id, slug, name, role ('reporter'|'columnist'|'editor'
        |'cartoonist'|'contributor'|'community-voice'),
        bio_en, bio_fr, language ('en'|'fr'|'both'),
        neighborhood?, social_links?, disclosure?, portrait_src }

Column { slug, name_en, name_fr, columnist_id, description, topic_tags[],
         cadence ('weekly'|'biweekly'|'monthly') }

EditorialSeries { slug, title, description, article_slugs[] }

MediaAsset { id, kind ('image'|'audio'|'video'),
             src, alt_en, alt_fr, credit, rights_status
             ('owner-confirmed'|'cc-licensed'|'ai-generated'|'editorial-stock'),
             consent_status?, location? }

ArticleBase {
  slug, type, label, title{en,fr}, dek{en,fr}, byline_author_ids[],
  publishedAt, updatedAt?, neighborhood?, language, hero?: MediaAsset,
  body_blocks[], sources?, corrections?, editor_note?, pull_quote?,
  comments_enabled (default false on sensitive types),
  related_slugs?, donation_cta (bool)
}

Specializations:
  Interview   { person:{name,role,neighborhood,portrait}, intro, qa[], transcript?, key_quote, audio_placeholder, video_placeholder }
  Opinion     { author_disclosure, conflict_note?, opinion_label:true }
  ColumnEntry { column_slug }
  Cartoon     { artist_id, caption, alt_text, image: MediaAsset, satire_label:true }
  Satire      { satire_label:true, content_warnings[] }
  PhotoEssay  { photographer_id, photos: MediaAsset[] (with captions) }
  Investigation/LongRead { chapters:[{id,title,body_blocks}], toc, methodology, documents[] }
  Explainer   { questions:[{q,a}], glossary? }
  Solution    { problem, evidence[], local_application }
  OpDoc       { video_src?, thumbnail, transcript, credits, status ('coming-soon'|'published') }
  Letter      { writer_display_name, anonymous, neighborhood?, topic, body,
                moderation_status ('pending'|'approved'|'rejected'),
                editor_response?, comments_enabled:false }

CommentModeration (letters only):
  { letter_id, decision, moderator_id, reason?, decided_at }
```

Sensitive-topic rule, enforced in a small helper `isSensitiveTopic(article)`:
crime, minors, victims, ongoing investigations, public-safety holds → `comments_enabled = false`, no letters CTA, no satire cross-link.

---

## 3. Templates (one polished React component per article type)

New folder `src/components/editorial/`:

- `EditorialLabel.tsx` — high-contrast label chip (NEWS / OPINION / SATIRE / CARTOON…), color-coded via design tokens.
- `ArticleHeader.tsx` — kicker, label, title, dek, byline, neighborhood, dates, share.
- `AuthorCard.tsx` — portrait, name, role, bio, disclosure, link to `/authors/$slug`.
- `PullQuote.tsx`, `SectionDivider.tsx`, `EditorNote.tsx`, `CorrectionsBox.tsx`, `MethodologyBox.tsx`, `SourcesList.tsx`, `RelatedRail.tsx`, `DonationInlineCTA.tsx`, `LettersCTA.tsx`.
- Type-specific templates:
  - `NewsReportTemplate.tsx` (refactor of current article view, shared)
  - `InterviewTemplate.tsx` — portrait + intro + Q&A list with styled Q/A glyphs + key quote pullout + transcript accordion + audio/video placeholder card.
  - `OpinionTemplate.tsx` — large OPINION label, "This is opinion, not news reporting" banner, author card with disclosure, letters CTA.
  - `ColumnTemplate.tsx` — column masthead (column name + cadence + columnist), entry body, "More from this column" archive rail.
  - `AnalysisTemplate.tsx` — ANALYSIS label, key-findings sidebar, sources.
  - `EssayTemplate.tsx` — serif-forward long-form layout, dropcap, generous measure.
  - `CartoonTemplate.tsx` — full-bleed image area, title, artist, caption, alt text, SATIRE/CARTOON label, accessibility description block.
  - `SatireTemplate.tsx` — persistent SATIRE banner top and bottom, content warnings, no breaking-bar promotion, sensitive-topic guardrails.
  - `PhotoEssayTemplate.tsx` — alternating full-bleed and two-up image layouts, captions, photographer credit, rights/consent badges.
  - `InvestigationTemplate.tsx` (also used for Long Reads) — sticky chapter TOC, chaptered scroll, documents grid, methodology, corrections, related, donation CTA.
  - `ExplainerTemplate.tsx` — Q&A accordions, glossary, "Was this useful?" footer (no comments).
  - `SolutionTemplate.tsx` — reuses existing SolutionCard styling, expanded with problem → evidence → local application.
  - `OpDocTemplate.tsx` — 16:9 video area (placeholder poster + "Coming soon" overlay when status is coming-soon), transcript, credits.
  - `LetterTemplate.tsx` — quoted-letter layout, writer display name + neighborhood, editor response block.

All templates compose the shared building blocks above so spacing, type scale, and rules stay consistent.

Routing: a single dynamic resolver `src/routes/editorial.$type.$slug.tsx` is NOT used — each section gets its own route file (above) so head() metadata and SEO are per-section. Each route loads from `editorial-data.ts` via a typed `getArticle(type, slug)`.

---

## 4. Editorial hub `/editorial`

Magazine-style landing, not a card grid:

1. Hero: Featured Interview (large portrait, pull quote, link).
2. Two-column band: Latest Opinion (left, OPINION label + author) · Latest Analysis (right).
3. "Columns" strip: 3–4 columnist mastheads with latest entry.
4. Cartoon of the week — full-width visual.
5. Long Reads — 2 large editorial cards with chapter count + reading time.
6. Photo Essays — masonry of 3 covers.
7. Satire & Humor — clearly labeled strip, separated by a heavy rule.
8. Community Voices + Letters from Readers — two-column.
9. Future Op-Docs — "Coming this season" teaser row.

Typography: existing Playfair Display + Source Serif 4 + Inter. New utilities only as needed (drop cap, small caps kicker, chapter numerals) added to `src/styles.css` via semantic tokens — no hardcoded colors.

---

## 5. Author system

- `/authors` directory grouped by role.
- `/authors/$slug` profile: portrait, bio (EN/FR), role chip, neighborhood, disclosure, social, archive of articles (filtered from editorial data).
- `AuthorCard` reused on every article header and on column landings.

---

## 6. Letters to the Editor

- `/letters` shows: hero explainer, submit form, list of recently published letters (LetterTemplate cards).
- Submit form fields: name, neighborhood, email, topic, body, consent checkbox, display option (publish name / anonymous). Zod validation: lengths, allowed chars, email format.
- All submissions → `moderation_status: 'pending'`. No public auto-publish.
- Backed by a serverFn `submitLetter` (validates + stores; for this pass it writes to an in-memory/JSON queue and returns a confirmation — DB wiring deferred).
- Moderation surfaced in `/admin/letters` (new admin sub-page) with approve/reject/edit-response actions, reusing the admin sources page chrome.
- No general comments anywhere. Sensitive stories: no LettersCTA rendered.

---

## 7. Guardrails (enforced in code, not just policy)

Helpers in `src/lib/editorial-guards.ts`:

- `assertSatireLabeling(article)` — satire/cartoon templates always render the SATIRE banner; build-time check that `type='satire'|'cartoon'` ⇒ `label` set accordingly.
- `commentsAllowed(article)` — false for sensitive topics, satire about real ongoing events, public-safety holds.
- `mediaConsentOK(asset)` — photo essays / interviews require `rights_status` and (for identifiable people) `consent_status`.
- Satire content blocklist for targeting minors, victims, named private individuals.

---

## 8. Visuals & placeholders

- Reuse existing `NewsImage` + `newsprint:` sentinel system for all editorial covers when no real media exists. Add two new accents for editorial sections (opinion ink, cartoon cream) as tokens in `src/styles.css`.
- Cartoon placeholders: dedicated `cartoonNewsprintDataURI()` variant with heavier border + artist credit baked in.
- Op-Doc placeholder: 16:9 SVG with film-strip motif + "Op-Doc · Coming soon".
- No external stock images. No random Picsum.

---

## 9. Navigation + header changes

- `Header.tsx` updated: primary nav rewritten to the 11 items above; "Culture" becomes a hover/menu group on desktop, accordion on mobile.
- Secondary editorial sub-nav component `EditorialSubnav.tsx` mounted on `/editorial` and every editorial article route.
- Footer gets a new "Editorial" column linking the new sections.

---

## 10. SEO + metadata

Every new route defines its own `head()` with section-specific title, description, og:title, og:description. Article routes derive og:image from `hero.src` (or the deterministic newsprint SVG if absent). No og:image at root or layout level.

---

## 11. What we are NOT doing in this pass

- No Supabase schema migration yet — data lives in `editorial-data.ts` with typed accessors so the swap is mechanical later.
- No real video hosting for Op-Docs — placeholders only, status `coming-soon`.
- No public comments system, ever — only moderated Letters.
- No changes to: map, 311, traffic, radio, sources, donate, submit-story, kids/youth, deals, breaking bar, bilingual toggle.

---

## 12. Implementation order (single build pass)

1. Types + fixtures: `src/types/editorial.ts`, `src/lib/editorial-data.ts` (a handful of seeded examples per type so every template has real-looking content), `src/lib/editorial-guards.ts`.
2. Shared editorial primitives in `src/components/editorial/` (labels, header, author card, pullquote, divider, editor note, corrections, methodology, sources, related rail, letters CTA, donation CTA).
3. Templates (one per type).
4. Section index routes + article routes (list above).
5. `/editorial` hub.
6. `/authors` + `/authors/$slug`.
7. `/letters` + submit serverFn + `/admin/letters` moderation page.
8. Header nav rewrite + `EditorialSubnav` + footer column.
9. Design tokens for opinion/cartoon accents; cartoon + op-doc placeholder SVGs in `image-fallback.ts`.
10. SEO `head()` per route.
11. Manual smoke: each section index loads, one article per type renders, satire/cartoon banners present, letters form validates, sensitive-topic guard hides CTAs.

After approval, I'll execute steps 1–11 in one focused build pass and report route-by-route what shipped.
