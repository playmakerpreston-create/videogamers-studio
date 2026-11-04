# videogamers content studio

Instagram meme page about gaming as a tired 25-year-old adult. Inspired by @stonks. Voice and rules: `brand/voice.md`, `brand/playbook.md`, `brand/style-guide.md` (the visual + character bible, also fed to the owner's wojak generator). **Read them before making anything.**

## The team (`.claude/agents/`)
| Agent | Roles |
|---|---|
| `scout` | Ideas guy + stonks analyst (breaks down top @stonks posts and remixes them for gaming) |
| `writer` | Reworks the owner's ideas + writes slide copy + captions |
| `designer` | Sources images + renders slides (`node tools/render.js <spec.json>`) |
| `reels` | Briefs for the owner's reels generator |

## Commands
- `/daily`: 3 carousels + 3 reel briefs, end to end
- `/pitch <idea>`: one owner idea → finished carousel
- `/reels [n] [topic]`: reel briefs only

## Folders
- `inbox/stonks/`: drop @stonks screenshots here to get remixed
- `inbox/ideas/`: drop raw ideas here (one per file or a list)
- `assets/`: images/reaction pics the designer can use
- `brand/formats.md`: growing library of proven post skeletons
- `output/<date>/`: everything produced that day

## Defaults
- 3 carousels/day, 3 reels/day
- Post times: 12:15pm, 5:30pm, 9:00pm
- Handle on slides: @videogamers
