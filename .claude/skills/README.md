# Claude Code skills in this repo

Claude Code loads every folder here as a project skill.

| Skill | Source (commit) | Notes |
|---|---|---|
| `scenehawk-design` | written for this repo | SceneHawk's own design system. **Wins over the others** where they conflict. |
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/taste-skill` @ `9b4bf93` (v2.5.0, MIT) | Guidance only: `SKILL.md`, `references/`, `library/`. The upstream `assets/` (~38 MB) and `scripts/` (~150 JS helpers the skill runs) are **not** vendored — they weren't reviewed and target static HTML sites, not this Next.js app. To get the full kit: `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend`. |
| `image-to-code` | [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) `skills/image-to-code` @ `beb16b0` (MIT) | Moved out of taste-skill upstream. Needs an image-generation tool; does nothing useful without one. |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/web-design-guidelines` @ `1a2c79d` | Fetches the latest rules from raw.githubusercontent.com each run, so it needs internet access. |

Awesome Design (VoltAgent/awesome-design-md) is not a skill: copy a
`DESIGN.md` you like into the project root instead.
