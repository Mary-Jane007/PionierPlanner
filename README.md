# PionierPlanner

Git remotes:

- GitHub (source of truth for this checkout and PRs): `https://github.com/Mary-Jane007/PionierPlanner.git`
- Cursor Origin (native Origin repo, not a GitHub mirror): [marisolleefland/PionierPlanner](https://cursor.com/codebase/marisolleefland/PionierPlanner) — `https://origin.cursor.com/marisolleefland/PionierPlanner.git`

The Origin repo already exists as a **native** codebase (`mirrorStatus: no-mirror`). Do not run `origin repo create-mirrored` against it; attach and push to the existing repo instead.

```bash
origin auth login --api-key "$CURSOR_API_KEY"
git remote add cursor https://origin.cursor.com/marisolleefland/PionierPlanner.git
git push cursor cursor/add-origin-codebase-9cae
```

Origin `main` already has the native Next.js app history. GitHub `main` is a separate initial commit; do not force-push GitHub `main` over Origin `main`.
