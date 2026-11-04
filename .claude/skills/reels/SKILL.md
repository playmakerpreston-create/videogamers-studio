---
name: reels
description: Generate reel briefs for the videogamers reels generator. Use for /reels [n] [topic] when the owner wants reels without running the full daily pipeline.
---

# /reels [n] [topic]

Spawn the `reels` agent for `n` briefs (default 3), optionally around `topic`. Output appends to `output/<YYYY-MM-DD>/reels.md`. Show the owner the on-screen text + generator prompt for each, nothing else.
