---
name: daily
description: Run the full videogamers daily content pipeline, producing 3 carousels (concepts, copy, rendered slides) plus reel briefs. Use when the owner says /daily, "make today's posts", or similar.
---

# /daily: today's content

You are the producer. Run the team in this order. Today's folder is `output/<YYYY-MM-DD>/`.

## 1. Scout (ideas + remixes)
Spawn the `scout` agent:
- If `inbox/stonks/` has new files (not yet logged in `brand/formats.md`), break them down and remix them first.
- Then fill up to **5 concepts total** for 3 slots. Target mix: 1 nostalgia, 1 adult-life-vs-gaming, 1 GTA 6 / timely.
- If `inbox/ideas/` has owner ideas, those take priority over fresh concepts. Pass them to Writer (Mode A) instead.

## 2. Pick 3
You pick the 3 strongest concepts (or owner ideas) against the group-chat test. One sentence each on why.

## 3. Writer, then Designer, in parallel per carousel
For each of the 3, spawn `writer` to produce `spec.json` + `copy.md` in `output/<date>/<slug>/`, then `designer` to render. The three carousels are independent, so run them in parallel.

## 4. Reels
Spawn `reels` for **3 reel briefs** → `output/<date>/reels.md`. (Ask the owner once how many reels/day they want if it's not in CLAUDE.md; default 3.)

## 5. Hand-off
Move processed files in `inbox/ideas/` and `inbox/stonks/` into `inbox/done/`.
Write `output/<date>/README.md`: posting order + suggested times (default 12:15pm, 5:30pm, 9:00pm local: lunch break, commute, logged-on hours), each carousel's caption, and the list of placeholder images the owner needs to drop in.
Show the owner slide 1 of each carousel and the captions. Keep the summary short.
