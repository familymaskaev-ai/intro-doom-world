#!/usr/bin/env bash
# Fails if a secret or an .env file is about to land in the repo. Runs in CI on every push and PR.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

bad=0
if git ls-files | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example$'; then
  echo "An .env file is tracked by git. Remove it and keep it only on the Mac." >&2
  bad=1
fi
patterns='(ghp_|gho_|github_pat_)[A-Za-z0-9_]{20,}|sk_(live|test)_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[abp]-[A-Za-z0-9-]{10,}'
if git grep -nIE "$patterns" -- ':!scripts/check-secrets.sh'; then
  echo "Something that looks like a secret key is in the files above." >&2
  bad=1
fi
[ "$bad" = 0 ] && echo "No secrets found."
exit "$bad"
