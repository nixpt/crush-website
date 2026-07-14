# Crush Language Playground

Welcome to the **Crush Polyglot Playground**! This repository is configured to open directly in GitHub Codespaces or any Dev Container environment.

## 🚀 How it works

When you open this repository in Codespaces, it automatically:
1. Installs the [`buckets`](https://github.com/nixpt/buckets) runtime isolator.
2. Installs the latest `crush-run` and `crushc` binaries from the `crush-ast` repository.

### Running code

We use **`buckets`** to safely resolve, isolate, and provide all the dependencies (Python, Node, Rust) required for Crush's polyglot execution blocks.

Run the included `example.crush` file with all required runtimes isolated via `buckets`:

```bash
# This fetches and isolates Python, Node, and Rust inside a bwrap container
# before executing your crush program!
buckets run python node rust -- crush-run example.crush
```

For convenience, we've provided a shorthand alias in this Codespace:
```bash
play
```

### Interactive Shell

If you want an interactive shell where `python`, `node`, and `crush-run` are all available on your `PATH` within the isolated bucket, run:

```bash
buckets shell python node rust
```

## Running locally

If you love the experience and want to run this locally, the workflow is exactly the same! 
1. Install `buckets` locally.
2. Install `crush` locally.
3. Use `buckets run python node rust -- crush-run script.crush` to safely sandbox your executions without globally installing or conflicting with your system's Python/Node versions!
