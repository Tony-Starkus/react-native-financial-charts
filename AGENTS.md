# AI Agent Context

This repository is a React Native charting library. Treat this file as the fast-start context for Codex, Claude Code, Cursor, Gemini CLI, Aider, Windsurf, and future agents.

## Source Of Truth

- Canonical source code lives in `src/`.
- Public exports are defined in `src/index.tsx`.
- Generated build output lives in `lib/`; do not edit it by hand.
- The Expo example app lives in `example/` and demonstrates real local usage.
- Existing public chart docs live in `docs/*ChartDocs.md` and `docs/interfaces/*.md`.
- Context engineering docs live in `docs/architecture.md`, `docs/business-rules.md`, `docs/coding-standards.md`, `docs/testing.md`, `docs/frontend.md`, `docs/backend.md`, `docs/glossary.md`, and `docs/examples.md`.

## Project Shape

- `src/charts/LineChart`: time-series line chart with Catmull-Rom smoothing, Skia paths, gesture cursor, baseline, area fill, and animated tooltips.
- `src/charts/BarChart`: categorical bar chart with fit/scroll modes, selection, Y-axis, grid, tooltip, skeleton, and batch Skia rendering.
- `src/charts/PieChart`: pie/donut chart with selection, deterministic fallback colors, `Others` aggregation, D3 arc layout, and layout cache.
- `src/charts/CandlestickChart`: OHLC financial chart with scroll, tap selection, visible-range Y scaling, Y-axis, last price, cursor, and OHLC/date tooltips.
- `src/charts/GaugeChart`: single-value arc gauge with track, segments, animated progress/needle (UI thread), ticks and animated value label. Pure math in `utils.ts`, tested in `src/__tests__/gauge-utils.test.ts`.
- `src/components/AnimatedTextInput.tsx`: shared Reanimated text optimization for LineChart tooltips.
- `src/utils.ts`: shared Catmull-Rom interpolation helper.
- `src/__tests__`: Jest tests. Current meaningful coverage is focused on CandlestickChart and GaugeChart utils.

## Commands

- Install dependencies with `yarn`. This is a Yarn workspace project; do not switch to npm.
- Typecheck with `yarn typecheck`.
- Lint with `yarn lint`.
- Test with `yarn test`.
- Build the package with `yarn prepare`.
- Run the example with `yarn example start`, `yarn example android`, `yarn example ios`, or `yarn example web`.

## Implementation Rules For Agents

- Preserve the compound API shape exported by `src/index.tsx`.
- Add new public chart pieces through `src/index.tsx` and the relevant `docs/interfaces/*.md` when applicable.
- Keep heavy chart math in providers or `utils.ts` files, not scattered through presentational components.
- Treat Reanimated worklets as constrained runtime code. Avoid non-worklet-safe APIs in `format` callbacks that run on the UI thread.
- When Skia `Canvas` creates a context boundary, re-provide the relevant chart context inside the canvas component.
- Keep selection semantics consistent: `selectedIndex.value === -1` means no active selection.
- For BarChart, PieChart, and CandlestickChart, imperative selection should keep callback behavior aligned with touch selection.
- BarChart and PieChart support controlled selection via `selectedKey` (key = `item.id ?? item.label`). `undefined` = uncontrolled; in controlled mode taps and ref calls only fire the callback, and prop changes never fire it. Keep new charts consistent with this.
- Prefer pure utility tests for math/layout behavior because they are stable under Jest.
- Do not edit generated `lib/` files directly. Build output should come from `yarn prepare`.

## Human Validation Needed

- Whether root-level native folders listed in `package.json` `files` are planned or historical. No root `android/`, `ios/`, or `cpp/` implementation is present in the current source tree.
- Whether future business rules should support negative bar values, zero-value pie slices, or non-financial categorical semantics. Current code largely assumes non-negative visual magnitudes.
- Whether the public docs should remain English-only. The AI context docs added here are in Portuguese because the audit request was in Portuguese.

## Review Checklist

- Did the change modify `src/` rather than generated `lib/`?
- Did it keep TypeScript strictness and exported types aligned?
- Did it respect Skia/Reanimated/Gesture Handler runtime boundaries?
- Did it update or add tests for pure math, data normalization, layout, or selection behavior?
- Did it update docs when changing public API?
- Did it record breaking changes (behavior or exported types) in `CHANGELOG.md` with a migration snippet?
