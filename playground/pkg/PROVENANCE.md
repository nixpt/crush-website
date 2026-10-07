# playground/pkg

Generated files. Do not edit by hand.

- `crush_web_bg.wasm` and `crush_web.js` are the `crush-web` crate from
  [nixpt/crush-ast](https://github.com/nixpt/crush-ast) at commit `be3ed23`
  (2026-10-07: CRUSH-118 adds `execute_with` and the interactive `Session`),
  built for the browser. The playground runs every program as a `Session`.
- Toolchain: `cargo build --release --target wasm32-unknown-unknown` in
  `crates/crush-web`, then `wasm-bindgen 0.2.126 --target web`. The
  wasm-bindgen CLI version must match the `wasm-bindgen` crate version in
  `crates/crush-web/Cargo.lock`.

To refresh:

```bash
cd crush-ast/crates/crush-web
cargo build --release --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir <crush-website>/playground/pkg \
  "$CARGO_TARGET_DIR/wasm32-unknown-unknown/release/crush_web.wasm"
```

Then update the commit in `playground/index.html`'s footer and re-run every
example on the page before publishing.
