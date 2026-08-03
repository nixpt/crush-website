# WEB-1 — Content accuracy audit vs shipped crush-ast reality

**Status**: Backlog · **Priority**: P2

Audit-shaped ticket (read the site first, then fix): verify every capability
claim on the site against what crush-ast actually ships today — the s390+
polyglot surface (deps/sandbox/timeouts), the M5 AI-native layer (annotations,
crush-index, codebase.* caps — landed), JIT status (honest: bail-out +
coverage per CRUSH-72/59 state, NOT "complete"), and remove/flag anything
describing unshipped syntax (lambdas until CRUSH-75 merges). Code samples on
the site get the GUIDE-1 treatment: run through the real pipeline before
publishing. The site must not out-promise the compiler — same
no-fabricated-green doctrine as the code.

## Done
- [ ] Claim-by-claim audit table committed; wrong claims fixed; samples verified
