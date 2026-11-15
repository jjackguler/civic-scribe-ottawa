# Editorial concept (15 Nov 2026)

AI Broadsheet covers **AI, robotics and tech**, Canada first, with the human stakes left in.
Inspired by how daily AI newsletters are organised (three beats, one fixed story format, a
short roundup), never by their content: every story is ours to pick and word, every fact
comes from a named, linked source.

## The five desks (`src/lib/desks.ts`)
| Desk | Covers | Not this desk |
|---|---|---|
| **Canada** | Ottawa, the provinces, Canadian labs, companies, public money | — |
| **AI** | Models, labs, tools, agents, the AI business (fallback desk) | Hype without a source |
| **Robotics** | Humanoids, factory and warehouse robots, self-driving vehicles, physical AI | Weapons |
| **Tech** | Chips, data centres, devices, energy, platforms around AI | Gadget reviews, deals |
| **Human stakes** | Rights, privacy, jobs, schools, families, culture, regulation | Party politics |

Old desk links (`rights`, `work`, `science`, `world`) answer 301: rights and work → Human
stakes, science and world → AI.

## One format for every story
1. **What happened**: one sentence.
2. **The facts**: two or three names and numbers from the source; company figures, targets and
   plans are labelled as claims.
3. **The human stakes**: what it changes for people, only as far as the facts go.
4. **Source**: outlet, date, link.

The newsroom summaries already follow it (What's new / What's known / Why it matters);
`newsroom/DIRECTIVES.md` now tells the desks the same order.

## Cadence
- **Live desk** (`/news`): headlines from the feeds all day, filed to the five desks.
- **Newsroom summaries**: 3–5 a day, steered by `newsroom/DIRECTIVES.md`.
- **The week in AI, robotics and tech** (`/week`, front-page band): the editor's six stories
  plus quick hits, every Sunday; data in `src/lib/week-sheet.ts`, newest edition first.
  It is the web twin of the AI Broadsheet Weekly newsletter.
- **The Catch**: one claim worth checking a day, on social and in the Ledger.

## What we don't cover
Crypto and token prices, stock tips, celebrity gossip, crime and courts, death and violence,
war, elections and party politics (house rules in code), sexual content, product promotion.
