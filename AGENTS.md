# videogamers content studio (Codex / any AI agent)

Instagram meme page about gaming as a tired 25-year-old adult. Inspired by @stonks, but the subject is gaming, not money.

## Read these first, every time
1. `brand/voice.md`: who the narrator is, the voice rules, the reference bank
2. `brand/playbook.md`: the thought process every post must follow (learned from top @stonks posts in `brand/examples/`)
3. `brand/style-guide.md`: visual style, character bible, prop library, **image-generation prompt template (section 10)**, caption formula

## The team (role prompts)
Each role is a prompt file. When asked to do a role's job, read its file and follow it.

| Role | File | Does |
|---|---|---|
| Scout | `.claude/agents/scout.md` | Ideas + breaks down @stonks posts and remixes them for gaming |
| Writer | `.claude/agents/writer.md` | Reworks the owner's ideas, writes slide copy + captions → `spec.json` |
| Designer | `.claude/agents/designer.md` | Makes the images + renders slides |
| Reels | `.claude/agents/reels.md` | Briefs for the owner's reels generator |

## Workflows
- **Daily:** `.claude/skills/daily/SKILL.md`: 3 carousels + 3 reel briefs
- **Pitch:** `.claude/skills/pitch/SKILL.md`: one owner idea → finished carousel
- **Reels:** `.claude/skills/reels/SKILL.md`: reel briefs only

## Making images
- **Wojak illustrations** (the then-vs-now panels): use the prompt template in `brand/style-guide.md` section 10. Generate the picture **without text**, save it into `assets/`, and reference it as `"image": "assets/<file>"` in the post's `spec.json`.
- **Text, headers and quotes** are added by the renderer, so spelling is always correct:
  ```bash
  npm install
  npx playwright install chromium
  node tools/render.js output/<date>/<slug>/spec.json
  ```
  Layouts: `tweet`, `bigtext`, `meme`, `split`, `list`, `countdown`, `calendar`, `wasted` (documented at the top of `tools/render.js`).

## Folders
- `inbox/stonks/`: @stonks screenshots to remix
- `inbox/ideas/`: the owner's raw ideas
- `assets/`: images
- `brand/formats.md`: library of proven post skeletons (append as you learn)
- `output/<date>/`: everything produced that day

## Defaults
- 3 carousels/day, 3 reels/day
- Post times: 12:15pm, 5:30pm, 9:00pm
- Handle: @videogamers
- GTA 6 releases Thu Nov 19, 2026
