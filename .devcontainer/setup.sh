#!/bin/bash
set -e

echo "========================================="
echo "🛠️ Installing buckets (Throwaway runtimes)"
echo "========================================="
cargo install --git https://github.com/nixpt/buckets.git

echo "========================================="
echo "🌌 Installing crush-ast toolchain"
echo "========================================="
cargo install --git https://github.com/nixpt/crush-ast.git crush-lang-sdk --bin crush-run --bin crushc --bin crush-repl

echo "========================================="
echo "✅ Setting up environment"
echo "========================================="
# Provide some handy aliases for the playground
echo 'alias play="buckets run python node rust -- crush-run example.crush"' >> ~/.bashrc
echo 'alias crush-shell="buckets shell python node rust"' >> ~/.bashrc

echo "========================================="
echo "🚀 Auto-launching REPL on terminal start"
echo "========================================="
echo 'echo "Welcome to the Crush Polyglot Playground!"' >> ~/.bashrc
echo 'echo "We have dropped you straight into the Crush REPL, isolated by buckets."' >> ~/.bashrc
echo 'echo "Type :quit to exit the REPL, or run \`play\` to execute example.crush."' >> ~/.bashrc
echo 'buckets run python node rust -- crush-repl' >> ~/.bashrc

echo "Setup complete! The terminal will drop you directly into the REPL."
