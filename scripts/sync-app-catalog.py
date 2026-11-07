#!/usr/bin/env python3
"""Copy only changed public radio catalogs that have not diverged in the app."""
import json
import os
from pathlib import Path
import subprocess
import sys

web = Path(os.environ["GITHUB_WORKSPACE"]) / "web"
app = Path(os.environ["GITHUB_WORKSPACE"]) / "app"
before = os.environ["SYNC_BEFORE"]
after = os.environ["SYNC_AFTER"]

def git(*args, check=True):
    return subprocess.run(["git", "-C", str(web), *args], check=check, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

if not before or set(before) == {"0"}:
    sys.exit("Cannot identify the previous main commit; refusing to guess a synchronization baseline.")
git("cat-file", "-e", before + "^{commit}")
paths = git("diff", "--name-only", "-z", "--no-renames", before, after, "--", "public/radio").stdout.split(b"\0")
conflicts = []
changed = []
for raw in paths:
    if not raw:
        continue
    name = raw.decode("utf-8")
    if not name.endswith(".json"):
        continue
    rel = Path(name)
    target = app / "frontend" / rel
    old = git("show", before + ":" + name, check=False)
    new = git("show", after + ":" + name, check=False)
    exists = target.is_file()
    # Only update if the app still matches the previous production version.
    if (old.returncode == 0 and (not exists or target.read_bytes() != old.stdout)) or (old.returncode != 0 and exists):
        conflicts.append(name)
        continue
    if new.returncode == 0:
        json.loads(new.stdout)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(new.stdout)
    elif exists:
        target.unlink()
    changed.append(name)
summary = app / "docs" / "sync-reports" / (after + ".md")
if conflicts:
    summary.parent.mkdir(parents=True, exist_ok=True)
    summary.write_text("# Catalog sync requires review\n\nSource commit: " + after + "\n\nThese files differ from the previous web version in the app and were not changed:\n\n" + "".join("- `" + p.replace("`", "") + "`\n" for p in conflicts), encoding="utf-8")
print("Catalogs updated:", len(changed), "requiring manual review:", len(conflicts))
