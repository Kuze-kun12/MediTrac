# Git semantic push helper

Run this from the repo root:

```bash
bash utilities/git-semantic-push.sh
```

It will:
- ask for a semantic prefix like `feat`, `fix`, `docs`, `refactor`
- ask for a commit message
- run `git add .`
- run `git commit -m "<semantic>: <message>"`
- run `git pull --rebase origin <current-branch>`
- run `git push origin <current-branch>`

Example:

```bash
semantic: feat
commit message: update dashboard ui
```

This creates:

```bash
git commit -m "feat: update dashboard ui"
```

Then it rebases and pushes the branch.
