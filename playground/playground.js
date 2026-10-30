// Try Crush: editor + runner. Every example below was run through this exact
// WebAssembly build (play/pkg) before it was listed here, with and without the
// grants it asks for.

const EXAMPLES = [
    {
        id: 'hello',
        name: 'Hello',
        blurb: 'Strings, numbers and printing. A run gets print and the standard library; anything else needs a grant.',
        source: `print("Hello from Crush, running in your browser")

let name = "Crush"
let answer = 6 * 7
print("1 + 2 = " + (1 + 2) + ", " + name + " says " + answer)
`,
    },
    {
        id: 'loops',
        name: 'Arrays & loops',
        blurb: 'Arrays, for-in, ranges, break and continue, and FizzBuzz.',
        source: `let arr = [10, 20, 30, 40, 50]
print("length: " + len(arr))

let sum = 0
for x in arr {
    sum = sum + x
}
print("sum: " + sum)

let squares = []
for i in 1..6 {
    squares.push(i * i)
}
print(squares)

for n in 1..16 {
    if n % 15 == 0 {
        print("FizzBuzz")
    } else if n % 3 == 0 {
        print("Fizz")
    } else if n % 5 == 0 {
        print("Buzz")
    } else {
        print(n)
    }
}
`,
    },
    {
        id: 'recursion',
        name: 'Recursion',
        blurb: 'Typed functions and recursion. Watch the step count climb.',
        source: `fn fib(n: Int) -> Int {
    if n <= 1 {
        return n
    }
    return fib(n - 1) + fib(n - 2)
}

fn factorial(n: Int) -> Int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n - 1)
}

fn main() {
    for i in 0..10 {
        print("fib(" + i + ") = " + fib(i))
    }
    print("10! = " + factorial(10))
}
`,
    },
    {
        id: 'structs',
        name: 'Structs',
        blurb: 'Struct declarations, field access and plain functions over them.',
        source: `struct Point { x: Float, y: Float }

fn dist2(a, b) {
    let dx = a.x - b.x
    let dy = a.y - b.y
    return dx * dx + dy * dy
}

let p = new Point()
p.x = 1.0
p.y = 2.0
let q = new Point()
q.x = 4.0
q.y = 6.0

print("p = (" + p.x + ", " + p.y + ")")
print("squared distance: " + dist2(p, q))
`,
    },
    {
        id: 'closures',
        name: 'Closures',
        blurb: 'Lambdas capture the variables around them: a counter that keeps its own state, and a function built from a value.',
        source: `fn make_counter() {
    let count = 0
    return || {
        count = count + 1
        return count
    }
}

let next = make_counter()
next()
next()
print("counter: " + next())

let rate = 3
let triple = |x| x * rate
print("triple(14) = " + triple(14))
`,
    },
    {
        id: 'errors',
        name: 'Exceptions',
        blurb: 'throw and try/catch. Any value can be thrown, including maps.',
        source: `fn safe_divide(a: Int, b: Int) -> Int {
    if b == 0 {
        throw "division by zero"
    }
    return a / b
}

try {
    print(safe_divide(10, 2))
    print(safe_divide(10, 0))
} catch e {
    print("Error: " + e)
}

try {
    throw {"code": 404, "msg": "not found"}
} catch err {
    print(err.code)
    print(err.msg)
}
`,
    },
    {
        id: 'caps',
        name: 'Capabilities',
        blurb: 'This program writes and reads a file. Nothing granted fs, so the VM refuses before running a line: there is no ambient authority to fall back on. Grant fs and it runs in an empty in-memory directory of its own, which it still cannot leave.',
        source: `// fs is a capability, not a builtin. Run this without the grant and it is
// refused before anything happens. Grant fs and the run gets an empty
// in-memory directory of its own: nothing of your machine.
fs.write("notes.txt", "written by this run")
print(fs.read("notes.txt"))

// Even with fs granted, the run cannot leave its directory.
print(fs.read("/etc/hostname"))
`,
    },
    {
        id: 'javascript',
        name: '@javascript',
        blurb: 'A @javascript block: Crush variables go in, the names after -> come out as typed values. It runs only when the run grants @javascript, in a sandbox with no network and no access to this page.',
        source: `// Crush variables go in; the names after -> come out, as JSON.
let n = 5
let tags = ["crush", "wasm"]
@javascript -> out {
const out = { doubled: n * 2, joined: tags.join("+"), count: tags.length }
}
print(out.doubled)
print(out.joined)
print(out.count)
`,
    },
    {
        id: 'python',
        name: '@python',
        blurb: 'A @python block, run by real CPython compiled to WebAssembly (Pyodide). Granting @python downloads Python the first time (about 13 MB, checked against pinned hashes).',
        source: `// Real CPython runs this block. Several values come out at once.
let xs = [2, 4, 4, 4, 5, 5, 7, 9]
@python -> (mean, spread, version) {
import sys
mean = sum(xs) / len(xs)
spread = max(xs) - min(xs)
version = sys.version.split()[0]
}
print("Python " + version)
print("mean: " + mean)
print("spread: " + spread)
`,
    },
    {
        id: 'polyglot',
        name: 'Polyglot gate',
        blurb: 'A @bash block. A browser has no shell to give it, so this grant does not exist here: the VM refuses before anything runs. Natively it needs crush run --polyglot.',
        source: `@bash {
echo "hello from bash"
}

print("This line never runs")
`,
    },
    {
        id: 'quota',
        name: 'Runaway loop',
        blurb: 'An infinite loop. The VM stops it at its instruction quota instead of hanging your tab.',
        source: `let i = 0
while true {
    i = i + 1
}
`,
    },
];

// Programs from awesome-crush (github.com/nixpt/awesome-crush @ e955df3): each one
// written by a different LLM that was pointed at crush-ast and asked "can you
// learn crush?". Sources live in ./games/ and load when picked. `frameStart` /
// `frameEnd` split the output into frames for playback.
const AC = 'https://github.com/nixpt/awesome-crush/blob/master/';
const GAMES = [
    {
        id: 'g-blackjack-play', name: 'Blackjack (you play)', file: 'blackjack_interactive.crush', author: 'Claude',
        path: 'games/blackjack_interactive.crush',
        blurb: 'You play this one. The program pauses at each io.read and asks you: type a bet, then h to hit or s to stand, and 0 to leave the table.',
    },
    {
        id: 'g-breakout', name: 'Breakout', file: 'breakout.crush', author: 'cece (DeepSeek-v4)',
        path: 'games/breakout.crush', frameEnd: /^score: /,
        blurb: 'An AI paddle tracks the ball; 30 bricks live as bits in one integer. Shortened from 200 to 30 ticks to fit the one-million-instruction budget.',
    },
    {
        id: 'g-pong', name: 'Pong', file: 'pong-deepseek.crush', author: 'cece / bro (DeepSeek-v4)',
        path: 'games/pong-deepseek.crush', frameStart: /^score {2}left /,
        blurb: 'Two self-playing paddles with an LCG-driven hesitation model. Shortened from 120 to 80 ticks to fit the instruction budget.',
    },
    {
        id: 'g-tictactoe', name: 'Tic-tac-toe', file: 'tictactoe.crush', author: 'foreman-v2 (Qwen3.8-27B fine-tune)',
        path: 'games/tictactoe.crush', frameStart: /^move \d+:/,
        blurb: 'Two strategies play each other. The whole board is one base-3 integer.',
    },
    {
        id: 'g-fifteen', name: 'Fifteen puzzle (IDA*)', file: 'fifteen_puzzle.crush', author: 'bro (DeepSeek-v4)',
        path: 'games/fifteen_puzzle.crush',
        blurb: 'Scrambles a 4x4 sliding puzzle, then solves it optimally with iterative-deepening A*. 15 tiles packed into one 64-bit integer.',
    },
    {
        id: 'g-lights', name: 'Lights Out', file: 'lights_out.crush', author: 'qwen38-base (Qwen3.8-27B)',
        path: 'games/lights_out.crush',
        blurb: 'Scrambles a 5x5 board and solves it by light chasing over 32 first-row masks. The board is a 25-bit bitfield.',
    },
    {
        id: 'g-blackjack', name: 'Blackjack', file: 'blackjack.crush', author: 'OpenCode',
        path: 'games/blackjack.crush',
        blurb: 'A deterministic 52-card shuffle, soft-ace scoring and a bankroll across six rounds.',
    },
    {
        id: 'g-rps', name: 'Rock-paper-scissors tournament', file: 'rps_tournament.crush', author: 'bro (Muse)',
        path: 'games/rps_tournament.crush',
        blurb: 'Three bots (always-rock, a cycler and a copycat) play a round-robin, then an ASCII standings chart crowns the champion.',
    },
    {
        id: 'g-brainfuck', name: 'Brainfuck interpreter', file: 'brainfuck.crush', author: 'buffy (DeepSeek-v4)',
        path: 'brainfuck/brainfuck.crush',
        blurb: 'A second language hosted inside Crush: a Brainfuck interpreter with a tape, a pointer and bracket matching, running a few Brainfuck programs.',
    },
    {
        id: 'g-forth', name: 'Forth interpreter', file: 'forth.crush', author: 'buffy (DeepSeek-v4)',
        path: 'forth/forth.crush',
        blurb: 'A small but real Forth interpreter in Crush: arithmetic, stack words, if/else/then and do/loop.',
    },
];

const TIMEOUT_MS = 8000;
const $ = (id) => document.getElementById(id);
const src = $('src'), out = $('out'), stats = $('stats'), runBtn = $('run');
const picker = $('example'), blurb = $('blurb'), shareBtn = $('share');
const verdict = $('verdict'), verdictTitle = $('verdict-title'), verdictBody = $('verdict-body');
const verdictGrant = $('verdict-grant');
const player = $('player'), playBtn = $('play'), restartBtn = $('restart'), frameNo = $('frame-no');
const speedSel = $('speed'), fullBtn = $('full');
const inputRow = $('input-row'), inputBox = $('stdin-line'), sendBtn = $('send'), eofBtn = $('eof');
const grantBoxes = Array.from(document.querySelectorAll('#run-grants input[type=checkbox]'));

// ── Grants: what this run may use beyond print and the standard library ────
const GRANT_LABEL = {
    'polyglot.javascript': '@javascript', 'polyglot.python': '@python',
    fs: 'fs', time: 'time', env: 'env',
};
// A refusal names the crush-run flag that would grant each missing capability.
const FLAG_GRANT = { '--fs': 'fs', '--time': 'time', '--env': 'env' };

function grants() {
    return grantBoxes.filter((b) => b.checked).map((b) => b.value);
}
function setGrants(list) {
    for (const b of grantBoxes) b.checked = list.includes(b.value);
}

// ── Runtime: crush-web in a worker, inside a sandboxed iframe ──────────────
// A granted @javascript block runs in the worker itself (play/guest-js.js), and
// any program can arrive in a share link, so the worker gets nothing of this
// page: the iframe has an opaque origin (no cookies, storage or same-origin
// requests) and a CSP that allows no network at all. The page fetches what the
// worker needs and hands it over with a MessagePort; the iframe only starts
// the worker. play/worker.js documents the messages.
const FRAME_CSP = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:; worker-src blob:";
const FRAME = `<!doctype html><meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}"><script>
onmessage = (e) => {
    onmessage = null;
    const w = new Worker(URL.createObjectURL(new Blob([e.data.worker], { type: 'text/javascript' })));
    w.onerror = (err) => e.data.port.postMessage({ loadError: err.message || 'the worker failed to start' });
    w.postMessage({ glue: e.data.glue, wasm: e.data.wasm, port: e.data.port }, [e.data.port, e.data.wasm]);
};
<\/script>`;

let frame = null, port = null, ready = false, assets = null;
let runId = 0, waiting = false, timer = null;

function fetchAssets() {
    const get = (rel, how) => fetch(new URL(rel, import.meta.url)).then((r) => {
        if (!r.ok) throw new Error(`${rel}: HTTP ${r.status}`);
        return r[how]();
    });
    return Promise.all([get('play/node-inspect.js', 'text'), get('play/guest-js.js', 'text'), get('play/guest-py.js', 'text'),
        get('play/worker.js', 'text'), get('play/pkg/crush_web.js', 'text'), get('play/pkg/crush_web_bg.wasm', 'arrayBuffer')])
        .then(([inspect, guestJs, guestPy, work, glue, wasm]) =>
            ({ worker: [inspect, guestJs, guestPy, work].join('\n'), glue, wasm }));
}

function startWorker() {
    ready = false;
    pythonInWorker = false;
    runBtn.disabled = true;
    frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.hidden = true;
    frame.srcdoc = FRAME;
    const channel = new MessageChannel();
    port = channel.port1;
    port.onmessage = onMessage;
    if (!assets) assets = fetchAssets().catch((e) => { assets = null; throw e; });
    const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
    document.body.append(frame);
    const mine = frame;
    Promise.all([assets, loaded]).then(([a]) => {
        if (frame !== mine) return;
        const wasm = a.wasm.slice(0);
        frame.contentWindow.postMessage({ worker: a.worker, glue: a.glue, wasm, port: channel.port2 }, '*', [channel.port2, wasm]);
    }).catch(loadFailed);
}

function stopWorker() {
    if (port) port.close();
    if (frame) frame.remove();
    port = frame = null;
    ready = false;
}

function loadFailed(e) {
    stats.textContent = 'runtime failed to load';
    out.className = 'err';
    out.textContent = 'Could not start the Crush runtime: ' + ((e && e.message) || 'unknown error') +
        '\nThis page needs a browser with WebAssembly and module workers (recent Chrome, Firefox, Safari or Edge).';
}

function onMessage({ data }) {
    if (data.id === undefined) {
        if (data.ready) {
            ready = true;
            stats.textContent = 'ready';
            runBtn.disabled = false;
        } else if (data.loadError) {
            loadFailed(new Error(data.loadError));
        }
        return;
    }
    if (data.id === 'python') {
        if (pythonDone) pythonDone(data);
        return;
    }
    if (!waiting || data.id !== runId) return;
    clearTimeout(timer);
    waiting = false;
    runBtn.disabled = false;
    if (data.fatal) {          // a wasm trap leaves the instance unusable
        stopWorker();
        startWorker();
    }
    show(data);
}

// ── Python: Pyodide, fetched on the first run that grants @python ──────────
// The release pinned in play/pyodide.json, from its CDN; each file must match
// its pinned sha256 before it is used. The bytes are kept for the page, so a
// restarted worker loads Python again without downloading it again.
let pythonFiles = null, pythonInWorker = false, pythonDone = null;

async function sha256(buf) {
    const d = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
    return Array.from(d, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function fetchPython() {
    const r = await fetch(new URL('play/pyodide.json', import.meta.url));
    if (!r.ok) throw new Error(`play/pyodide.json: HTTP ${r.status}`);
    const pin = await r.json();
    const files = await Promise.all(Object.entries(pin.files).map(async ([name, want]) => {
        const f = await fetch(pin.base + name);
        if (!f.ok) throw new Error(`${pin.base + name}: HTTP ${f.status}`);
        const buf = await f.arrayBuffer();
        if (await sha256(buf) !== want.sha256) throw new Error(`${name} does not match its pinned sha256 (play/pyodide.json)`);
        return [name, buf];
    }));
    return Object.fromEntries(files);
}

async function ensurePython() {
    if (pythonInWorker) return;
    if (!pythonFiles) pythonFiles = fetchPython().catch((e) => { pythonFiles = null; throw e; });
    const files = await pythonFiles;
    const copies = {}, transfer = [];
    for (const [name, buf] of Object.entries(files)) { copies[name] = buf.slice(0); transfer.push(copies[name]); }
    const answer = await new Promise((resolve) => {
        pythonDone = resolve;
        port.postMessage({ id: 'python', op: 'python', files: copies }, transfer);
    });
    pythonDone = null;
    if (answer.loadError) throw new Error(answer.loadError);
    pythonInWorker = true;
}

// Refusals are the capability model working, so they're shown as outcomes,
// not crashes. Anything unrecognised is shown as a plain error.
//
// crush-web refuses a program that needs capabilities its run was not granted
// before running any of it, one line per crush-run flag:
//   this program needs capabilities this run does not grant; nothing was run:
//     --fs: fs.read, fs.write
//     --polyglot: polyglot.python
function classify(error) {
    const at = error.indexOf('nothing was run:');
    if (at >= 0) {
        const can = [], cannot = [];
        for (const line of error.slice(at).split('\n').slice(1)) {
            const m = line.match(/^\s*(--[\w-]+):\s*(.+)$/);
            if (!m) continue;
            const caps = m[2].split(/,\s*/);
            if (m[1] === '--polyglot') {
                for (const c of caps) {
                    if (GRANT_LABEL[c]) can.push(c); else cannot.push('@' + c.replace(/^polyglot\./, ''));
                }
            } else if (FLAG_GRANT[m[1]]) {
                can.push(FLAG_GRANT[m[1]]);
            } else {
                cannot.push(caps.join(', ') + ` (${m[1]})`);
            }
        }
        const named = [...can.map((g) => GRANT_LABEL[g]), ...cannot];
        return {
            kind: 'refused',
            title: `Refused: this run was not granted ${named.join(', ')}`,
            body: 'Capabilities are granted by whoever runs a program, never by the program itself, and the VM checks ' +
                'them before it runs a single line. ' + (cannot.length
                ? `A browser cannot grant ${cannot.join(', ')} at all; run it natively with crush run and the matching flag.`
                : 'Tick the grant below the editor, or use the button, and run it again.'),
            grant: cannot.length ? null : can,
        };
    }
    let m = error.match(/unknown capability: (fs\.\w+): (.+)/);
    if (m) {
        return {
            kind: 'refused',
            title: `Refused: ${m[1]} outside the run's directory`,
            body: 'Granting fs gives this run an empty in-memory directory of its own, not a filesystem. ' +
                `A path outside it is refused (${m[2]}), whatever the program asks for.`,
        };
    }
    if (/instruction quota exceeded/.test(error)) {
        return {
            kind: 'stopped',
            title: 'Stopped: instruction quota reached',
            body: 'Every run is capped at one million VM instructions, so a runaway loop ends cleanly instead of hanging the tab.',
        };
    }
    return null;
}


// ── Frame playback for animated programs ──────────────────────────────────
let frames = [], intro = '', fullText = '', frameIdx = 0, playTimer = null, showingFull = false;

function currentGame() {
    return GAMES.find((g) => g.id === picker.value) || null;
}

function splitFrames(text, g) {
    const lines = text.split('\n');
    const out = [];
    let head = [], cur = null;
    for (const line of lines) {
        if (g.frameStart && g.frameStart.test(line)) {
            if (cur) out.push(cur.join('\n'));
            cur = [line];
        } else if (g.frameEnd) {
            (cur ||= []).push(line);
            if (g.frameEnd.test(line)) { out.push(cur.join('\n')); cur = null; }
        } else if (cur) {
            cur.push(line);
        } else {
            head.push(line);
        }
    }
    if (cur && cur.join('').trim()) {
        if (out.length && g.frameEnd) out[out.length - 1] += '\n' + cur.join('\n');
        else out.push(cur.join('\n'));
    }
    if (g.frameEnd && out.length) {
        // The first frame carries the title lines; peel them off as the intro.
        const first = out[0].split('\n');
        const border = first.findIndex((l) => /^\|-+\|$/.test(l));
        if (border > 0) { head = first.slice(0, border); out[0] = first.slice(border).join('\n'); }
    }
    return { intro: head.join('\n').replace(/\n+$/, ''), frames: out };
}

function stopPlayback() {
    clearInterval(playTimer);
    playTimer = null;
    playBtn.textContent = 'Play';
}

function drawFrame() {
    out.textContent = (intro ? intro + '\n\n' : '') + frames[frameIdx];
    frameNo.textContent = `frame ${frameIdx + 1} / ${frames.length}`;
}

function startPlayback() {
    stopPlayback();
    if (frameIdx >= frames.length - 1) frameIdx = 0;
    playBtn.textContent = 'Pause';
    playTimer = setInterval(() => {
        if (frameIdx >= frames.length - 1) { stopPlayback(); return; }
        frameIdx++;
        drawFrame();
    }, Number(speedSel.value));
}

function hidePlayer() {
    stopPlayback();
    player.hidden = true;
    frames = [];
}

playBtn.addEventListener('click', () => {
    if (showingFull) { showingFull = false; fullBtn.textContent = 'Full output'; }
    playTimer ? stopPlayback() : startPlayback();
});
restartBtn.addEventListener('click', () => {
    showingFull = false;
    fullBtn.textContent = 'Full output';
    frameIdx = 0;
    drawFrame();
    startPlayback();
});
speedSel.addEventListener('change', () => { if (playTimer) startPlayback(); });
fullBtn.addEventListener('click', () => {
    stopPlayback();
    showingFull = !showingFull;
    fullBtn.textContent = showingFull ? 'Frames' : 'Full output';
    if (showingFull) out.textContent = fullText; else drawFrame();
});

// A run is a session: output arrives in pieces (one per call) and is
// accumulated into `transcript`. 'need_input' means the program is waiting on
// io.read; the input row sends a line (provide) or end of input (eof).
let transcript = '', totalMs = 0;

function stepsText(r) {
    return (r.steps ?? 0).toLocaleString() + ' steps';
}

function finishOk(r, ms) {
    out.className = '';
    out.textContent = transcript.length ? transcript : '(no output)';
    stats.textContent = `ok · ${stepsText(r)} · ${ms} ms`;
    const g = currentGame();
    if (g && (g.frameStart || g.frameEnd)) {
        const split = splitFrames(transcript, g);
        if (split.frames.length > 1) {
            ({ intro, frames } = split);
            fullText = transcript;
            frameIdx = 0;
            showingFull = false;
            fullBtn.textContent = 'Full output';
            player.hidden = false;
            drawFrame();
            startPlayback();
        }
    }
}

function finishError(r, ms) {
    const error = r.error || 'error';
    const c = classify(error);
    const before = transcript.length ? transcript + (transcript.endsWith('\n') ? '' : '\n') : '';
    if (c) {
        verdict.className = 'verdict ' + c.kind;
        verdictTitle.textContent = c.title;
        verdictBody.textContent = c.body;
        verdictGrant.hidden = !c.grant;
        if (c.grant) {
            verdictGrant.textContent = `Grant ${c.grant.map((g) => GRANT_LABEL[g]).join(' + ')} and run`;
            verdictGrant.onclick = () => { setGrants([...new Set([...grants(), ...c.grant])]); run(); };
        }
        verdict.hidden = false;
        out.className = 'raw';
        out.textContent = before + error;
        stats.textContent = `${c.kind} · ${ms} ms`;
    } else {
        out.className = 'err';
        out.textContent = before + error;
        stats.textContent = `error · ${ms} ms`;
    }
}

function show(r) {
    transcript += r.output || '';
    totalMs += r.ms || 0;
    const ms = totalMs < 1 ? '<1' : Math.round(totalMs);
    if (r.status === 'need_input') {
        out.className = '';
        out.textContent = transcript;
        out.scrollTop = out.scrollHeight;
        stats.textContent = `waiting for input · ${stepsText(r)}`;
        inputRow.hidden = false;
        inputBox.value = '';
        inputBox.focus();
        return;
    }
    inputRow.hidden = true;
    if (r.status === 'done') finishOk(r, ms);
    else finishError(r, ms);
}

// One step of the current run: start, a line of input, or end of input.
// The wall-clock limit covers the step's running time, not time spent loading
// Python or waiting for the reader.
async function send(message) {
    waiting = true;
    runBtn.disabled = true;
    inputRow.hidden = true;
    if (message.op === 'start' && message.grants.includes('polyglot.python') && !pythonInWorker) {
        stats.textContent = 'loading Python…';
        try {
            await ensurePython();
        } catch (e) {
            waiting = false;
            runBtn.disabled = false;
            out.className = 'err';
            out.textContent = 'Could not load Python: ' + e.message;
            stats.textContent = 'error';
            return;
        }
    }
    stats.textContent = 'running…';
    port.postMessage({ ...message, id: runId });
    timer = setTimeout(() => {
        waiting = false;
        stopWorker();
        verdict.hidden = true;
        inputRow.hidden = true;
        out.className = 'err';
        out.textContent = (transcript ? transcript + '\n' : '') +
            `Stopped after ${TIMEOUT_MS / 1000} s of wall-clock time. The runtime has been restarted.`;
        stats.textContent = 'timed out';
        startWorker();
    }, TIMEOUT_MS);
}

function run() {
    if (!ready || waiting) return;
    verdict.hidden = true;
    verdictGrant.hidden = true;
    hidePlayer();
    transcript = '';
    totalMs = 0;
    runId++;
    send({ op: 'start', source: src.value, grants: grants() });
}

function provide(line) {
    if (waiting) return;
    transcript += line + '\n';   // echo what the player typed, like a terminal
    send({ op: 'input', line });
}

function load(ex) {
    setGrants([]);
    verdict.hidden = true;
    inputRow.hidden = true;
    hidePlayer();
    src.value = ex.source;
    blurb.textContent = ex.blurb;
    picker.value = ex.id;
}

const gameCache = new Map();
async function loadGame(g) {
    verdict.hidden = true;
    inputRow.hidden = true;
    hidePlayer();
    picker.value = g.id;
    setGrants([]);
    blurb.textContent = 'Loading…';
    try {
        if (!gameCache.has(g.id)) {
            const res = await fetch('games/' + g.file);
            if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
            gameCache.set(g.id, await res.text());
        }
        if (picker.value !== g.id) return;
        src.value = gameCache.get(g.id);
        blurb.textContent = '';
        blurb.append(g.blurb + ' Written by ' + g.author + '. ');
        const a = document.createElement('a');
        a.href = AC + g.path;
        a.textContent = 'Source on awesome-crush';
        a.target = '_blank';
        a.rel = 'noopener';
        blurb.append(a);
        out.className = '';
        out.textContent = 'Press Run to play.';
        stats.textContent = ready ? 'ready' : stats.textContent;
    } catch (err) {
        blurb.textContent = 'Could not load this game: ' + err.message;
    }
}

// Share links carry the program in the URL fragment: #code=<base64url>, plus
// &grants=fs,time when the run had grants. Opening one ticks them; nothing
// runs until Run is pressed.
function encode(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decode(s) {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

shareBtn.addEventListener('click', async () => {
    const g = grants();
    const url = location.origin + location.pathname + '#code=' + encode(src.value) +
        (g.length ? '&grants=' + g.join(',') : '');
    history.replaceState(null, '', url);
    try {
        await navigator.clipboard.writeText(url);
        shareBtn.textContent = 'Link copied';
    } catch {
        shareBtn.textContent = 'Link in address bar';
    }
    setTimeout(() => (shareBtn.textContent = 'Share'), 2000);
});

const tour = document.createElement('optgroup');
tour.label = 'Language tour';
for (const ex of EXAMPLES) tour.append(new Option(ex.name, ex.id));
const gamesGroup = document.createElement('optgroup');
gamesGroup.label = 'Games written by LLMs';
for (const g of GAMES) gamesGroup.append(new Option(g.name, g.id));
picker.append(tour, gamesGroup);
picker.addEventListener('change', () => {
    const g = currentGame();
    if (g) loadGame(g);
    else load(EXAMPLES.find((e) => e.id === picker.value));
});

runBtn.addEventListener('click', run);
sendBtn.addEventListener('click', () => provide(inputBox.value));
eofBtn.addEventListener('click', () => { if (!waiting) { transcript += '^D\n'; send({ op: 'eof' }); } });
inputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); provide(inputBox.value); }
});
src.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
    } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        src.setRangeText('    ', src.selectionStart, src.selectionEnd, 'end');
    }
});

const hash = new URLSearchParams(location.hash.slice(1));
const shared = location.hash.startsWith('#code=') ? hash.get('code') : null;
const linkedGame = GAMES.find((g) => location.hash === '#' + g.id);
if (linkedGame) {
    loadGame(linkedGame);
} else if (shared) {
    try {
        src.value = decode(shared);
        const g = (hash.get('grants') || '').split(',').filter((x) => GRANT_LABEL[x]);
        setGrants(g);
        blurb.textContent = 'A shared program.' +
            (g.length ? ` The link ticks ${g.map((x) => GRANT_LABEL[x]).join(', ')}: untick what you don't want to grant.` : '');
        picker.value = '';
    } catch {
        load(EXAMPLES[0]);
    }
} else {
    load(EXAMPLES[0]);
}

startWorker();
