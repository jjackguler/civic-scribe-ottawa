# Newsroom directives

The newsroom desks read this file at the start of every run (every 30 minutes).
Edit it in GitHub's web editor (pencil icon), then "Commit changes" to `main`.
The next run uses it. No code, no keys, no Lovable credits.

How to write it:
- Keep the `##` headings exactly as they are. Write one item per line, starting with `- `.
- For topics, put the words to look for after `| keywords:`, separated by commas.
  Keywords are matched in story headlines and excerpts (case does not matter).
- Lines in brackets `( … )` are notes for people; the desks ignore them.
- The house rules in the code always apply and cannot be switched off here (no stories
  that could upset people: accusations, crime and courts, death and violence, abuse,
  war and terror, elections; no party politics; every fact from a named source; AI use
  disclosed). This file can add rules, never remove them.
- If something here can't be read, the desks use safe defaults and say so in the run log.

## Focus topics

(Stories that match come first. Canadian stories come first of all. Every fact still has to be in the sources: the desks never invent a Canadian angle.)

- Canadian AI policy and regulation | keywords: Canada, Canadian, Ottawa, federal, minister, Solomon, Quebec, Québec, Ontario, Alberta, British Columbia, regulation, policy, privacy commissioner
- AI funding and investment in Canada | keywords: funding, investment, invests, grant, Series A, Series B, Series C, Series D, Series E, venture, Cohere, Mila, Vector Institute, Amii, CIFAR, sovereign compute
- AI research | keywords: research, researchers, study, paper, university, laboratory, benchmark
- AI tools people can use | keywords: launches, launched, released, available, free, app, tool, feature, open-source, open-weight

## Banned topics

(Added to the house rules above. Stories that match are skipped before any paid call.)

- Crypto and token prices | keywords: crypto, cryptocurrency, bitcoin, memecoin, token sale, NFT
- Celebrity gossip | keywords: celebrity, gossip, dating rumours
- Stock tips and share-price moves | keywords: stock tip, share price, shares rose, shares fell, stock soared, stock plunged

## Tone

- Human-centred AI journalism: neither fear nor hype.
- Name people's worries plainly, then end on what the sources show people can do.
- Plain words for readers new to AI; explain every technical term once.
- When the sources support it, say what the news means for people in Canada.

## Daily target

(Published pieces per day. When `max` is reached the desks stop for the day, which saves money. `min` is what Output watch expects; fewer is a warning, none for 24 hours is a red failure. The daily cost cap, NEWSROOM_DAILY_CAP, still applies and is never raised by this file.)

- min: 3
- max: 5

## Morning brief

(One roundup of the morning's Canadian AI news, written by the same six desks, in the first run inside the window. Times are Toronto time. It needs at least `stories` minimum separate Canadian stories with enough reporting; otherwise it is skipped for the day and the log says why.)

- on: yes
- title: Canadian AI Brief
- titre: Le point IA canadien
- window: 06:00-11:00
- stories: 3-6
