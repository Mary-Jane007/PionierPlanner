# PionierPlanner

Git remotes:

- GitHub (source of truth for this checkout): `https://github.com/Mary-Jane007/PionierPlanner.git`
- Cursor Origin: [marisolleefland/PionierPlanner](https://cursor.com/codebase/marisolleefland/PionierPlanner) — `https://origin.cursor.com/marisolleefland/PionierPlanner.git`

Add the Origin remote and push:

```bash
origin auth login
git remote add cursor https://origin.cursor.com/marisolleefland/PionierPlanner.git
git push -u cursor main
```

To mirror GitHub into Origin instead of pushing by hand:

```bash
origin repo create-mirrored Mary-Jane007/PionierPlanner --namespace marisolleefland
```
