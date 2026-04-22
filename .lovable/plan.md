
# MCP Playground — Plan

A polished, fully-responsive learning sandbox for the Model Context Protocol. Default experience is fully mocked so it works instantly; optional live LLM mode is a clearly-labeled advanced toggle.

## Information architecture

Two routes, separate files (better SSR/SEO):
- `/` — Home (hero, presets, "How it works", CTAs)
- `/playground` — 3-panel playground

Shared header with logo, route links, theme toggle, and "Reset" button. Footer with a short MCP glossary link.

## Home screen (`/`)

- **Hero**: One-sentence definition of MCP ("a standard way for AI apps to discover and call tools, read resources, and reuse prompts from external servers"), subtext, two CTAs: *Try a preset* and *Open blank playground*.
- **Preset cards** (4): Filesystem Assistant, Research Assistant, Support Copilot, Dev Helper. Each card shows icon, name, one-line description, and 2–3 example capability chips. Click → opens `/playground` preloaded with that preset.
- **How it works**: 4 numbered steps — Connect → Discover → Call tools → Return results — with tiny illustrative diagrams.
- **Concept primer**: Three small cards explaining Tools vs Resources vs Prompts in plain language.

## Playground screen (`/playground`)

Desktop: 3-panel layout (left 280px / center fluid / right 380px). Tablet: collapses right panel into tabs under center. Mobile: stacks vertically with a sticky top bar containing preset selector + Run button.

**Left panel — Server & settings**
- Preset selector (dropdown with the 4 presets + "Blank")
- Server browser: shows currently selected mock MCP server with its name, version, transport label
- Mode toggle: **Mocked (default)** / **Live (advanced)** — Live shows a clear amber banner and requires an API key field (stored in localStorage only)
- Settings: temperature, max steps, "Auto-explain steps" toggle
- Undo / Redo / Reset buttons grouped at the bottom

**Center panel — Capability explorer & request**
- Three tabs: **Tools**, **Resources**, **Prompts**. Each lists items from the active server with name, description, and a small schema preview (input params for tools, URI for resources, arguments for prompts).
- Inline help: "What's the difference?" expandable callout.
- Request composer: large textarea with the preloaded sample request, plus 3–5 quick-action chips (clickable example prompts) above it.
- Big **Run** button.

**Right panel — Run output**
- **Tool-call timeline**: vertical stepped list. Each step shows: step number, capability type badge (tool/resource/prompt), name, duration, status, and an "Explain this step" link that opens a plain-language explanation of what happened and why.
- **Raw results**: collapsible JSON viewer per step.
- **Final answer**: rendered as markdown in a distinct card.
- **Run controls**: Replay, Compare runs (side-by-side of last two runs), Save run.

## Mocked engine

A small in-app simulator that, given a preset + request, deterministically produces a sequence of tool calls, raw outputs, and a final markdown answer. Each preset ships:
- A mock server descriptor (name, tools[], resources[], prompts[])
- 3–5 example prompts
- A scripted run per example prompt (steps, raw outputs, final answer, per-step explanations)

This keeps the default experience polished, instant, and offline.

## Live mode (optional, isolated)

Toggle reveals an API key input and a model dropdown. When enabled, requests go through a server function that proxies to an LLM via Lovable AI Gateway, with the mock servers exposed as tool definitions. Mocked mode remains the default and is never removed. UI shows a persistent badge: **Simulated** or **Live**.

## Undo / Redo / Reset

- A history stack tracks major actions: change preset, edit request, change mode, change settings, run, clear, replay.
- Undo/Redo cycle through snapshots of the playground state.
- Reset returns to the home screen and clears the current session (presets and theme are preserved).

## Persistence (localStorage)

Single namespaced key `mcp-playground:v1` storing: theme, selectedPreset, mode, settings, currentRequest, notes, recentRequests (last 10), savedRuns (last 5), liveApiKey (only if user opts in). Undo/redo history is in-memory.

## Design system

- Light default + dark toggle, persisted.
- Neutral palette: near-white background, slate text, single calm accent (muted indigo). No gradients.
- Generous spacing, 1px subtle borders, soft shadow only on elevated cards, rounded-lg.
- Typography: Inter, clear hierarchy, comfortable line-height.
- Capability badges color-coded but desaturated: Tool, Resource, Prompt.

## Accessibility

- All controls keyboard reachable, visible focus rings, semantic landmarks, ARIA labels on icon buttons, ≥44px tap targets on mobile, AA contrast in both themes.

## Out of scope (v1)

- Real MCP transport (stdio/SSE) — simulated only.
- Multi-user accounts, server-side persistence, sharing links.
