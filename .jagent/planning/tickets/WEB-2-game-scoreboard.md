# WEB-2 — Scoreboard for the playground's interactive games

**Status**: Backlog · **Priority**: P3 · **Filed**: 2026-10-31 (captain's request, after a $100 → $5,000
run of `playground/games/blackjack_interactive.crush`)

Let visitors play the interactive games in the playground (`playground/games/*.crush`, run in the
browser by crush-web with `io.read()` fed from the Input box) and put their results on a scoreboard.

## What's there today (checked 2026-10-31)

- The site is static (GitHub Pages, `CNAME`). There is nowhere to store shared scores.
- Games run entirely in the visitor's browser, so a submitted score can be forged by anyone who
  opens the dev tools.
- `blackjack_interactive.crush` always starts from `game_loop(42, 100, 1)`: a **fixed seed**, so
  every visitor gets the same cards in the same order. Fine for a demo; a public leaderboard would
  fill up with people who memorised the deck.
- The games are deterministic: the same seed and the same input lines give the same output. That is
  what makes a score checkable (phase 2).

## Phases

1. **Local scoreboard (no backend).** Per-visitor best scores in `localStorage`, shown next to the
   game. A game reports its score with one agreed output line (e.g. `SCORE: 5000`), so the page
   needs no per-game code. Nothing to forge, because nothing is shared.
2. **Shared, verified leaderboard.** The page asks a small service for a fresh seed, the game takes it
   as input (no more fixed `42`), and on submit the page sends `{game, seed, input lines, claimed
   score, name}`. The service re-runs the same `.crush` file at the same crush-ast version
   (`crush-run`, or crush-web under Node) with those inputs and accepts the score only if the replay
   prints the same `SCORE:` line. crush-ast's execution transcript (CRUSH-165, feature `transcript`)
   can stand in for a full output comparison: equal digests mean equal runs.
   - Storage/host: pick one small service (e.g. a Cloudflare Worker with KV or D1); needs the
     captain's call on hosting and on accounts vs. free-text names.
   - Limits: cap input length and replay steps (`--max-steps`), rate-limit submissions, keep a
     moderation path for names.
3. **Per-game rules.** Which games score (blackjack: final bankroll; fifteen_puzzle / lights_out:
   moves; tictactoe / rps_tournament: wins), and whether a round must end before it counts.

## Done when

- [ ] Phase 1 live on crushlang.org for blackjack, with the `SCORE:` convention documented.
- [ ] Decision recorded on phase 2 (host, names, which games).
- [ ] If phase 2 ships: a forged submission (edited score, edited inputs, reused seed) is rejected by
      replay, shown by a test.
