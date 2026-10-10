# AI Broadsheet Newsroom store

Written by `.github/workflows/newsroom.yml` (scripts/newsroom). The site reads this branch.

- `index.json` lists every article, newest first.
- `articles/<id>.json` is the full article, with its sources and each desk's notes.
- `log/rejected.json` lists events the desks turned down, and why.

## Unpublish an article

Edit `killed.json` here in GitHub's web editor and add the article's id (or its slug):

```json
{ "killed": ["<id>", { "id": "<id>", "reason": "why, for the record" }] }
```

Commit. Within about five minutes the site hides it everywhere and its page answers 410 Gone.
Remove the line to bring it back. Never delete files by hand: the workflow keeps the index in step.
