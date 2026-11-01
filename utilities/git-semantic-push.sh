#!/usr/bin/env bash
set -euo pipefail

branch="$(git branch --show-current)"

if [ -z "$branch" ]; then
  echo "Error: not inside a Git repository or on a detached HEAD."
  exit 1
fi

echo "Current branch: $branch"
read -p "semantic: " semantic
semantic="${semantic:-feat}"

read -p "commit message: " message
message="${message:-save frontend work}"

# stage everything
git add .

# commit with semantic prefix
if ! git commit -m "$semantic: $message"; then
  echo "Nothing to commit. Exiting before pull/push."
  exit 0
fi

git pull --rebase origin "$branch"
git push origin "$branch"

echo "Done: pushed $branch to origin/$branch"
