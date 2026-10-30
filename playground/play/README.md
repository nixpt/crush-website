# playground/play

Copied from the language guide, not edited here: these are
[nixpt/crush-language-guide](https://github.com/nixpt/crush-language-guide)'s
`src/play/` at commit `f2f8691` (2026-10-30), the runtime behind the guide's Run
buttons, so the playground and the guide run programs the same way.

- `pkg/` — the crush-web browser build from crush-ast `c1cc21fb` (released as
  v0.8.0), with `polyglot-javascript` and `polyglot-python`. How it was built,
  its size and sha256: `pkg/PROVENANCE.md`.
- `worker.js` — runs each program as a crush-web `Session` (granted capabilities,
  `io.read`, granted `@javascript` / `@python` blocks). The playground starts it
  inside a sandboxed iframe with no network (`../playground.js`).
- `guest-js.js` (with `node-inspect.js`) and `guest-py.js` — run a granted
  `@javascript` block, and a granted `@python` block in Pyodide.
- `pyodide.json` — the Pyodide release (and each file's sha256) the page
  downloads the first time a run grants `@python`.

To refresh, copy the guide's `src/play/` again (it moves with the crush-ast
commit the guide is verified against), update the commit here and the runtime
line in `../index.html`'s footer, and run every playground program through it
with and without the grants it asks for.
