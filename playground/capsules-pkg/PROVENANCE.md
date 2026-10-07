# playground/capsules-pkg

Generated files. Do not edit by hand.

- `exo_light_web_bg.wasm` and `exo_light_web.js` are the `exo-light-web` crate
  from nixpt/exo-light at commit `b890dc3` (2026-10-07), built for the browser:
  `cargo build --release --target wasm32-unknown-unknown` in
  `crates/exo-light-web`, then `wasm-bindgen 0.2.126 --target web` (the crate
  pins `wasm-bindgen = "=0.2.126"`).
- `../capsules/<sample>/` are that crate's `samples/` (CASM source, `spec.json`,
  `files.json` and the compiled `capsule.cvm1`), unchanged.

Before publishing a refresh, run exo-light-web's own
`scripts/browser-test.sh` against the new build; all six scenarios must give the
same allow/deny results as before.
