// Try Crush: editor + runner. Every example below was run through this exact
// WebAssembly build before it was listed here.

const EXAMPLES = [
    {
        id: 'hello',
        name: 'Hello',
        blurb: 'Strings, numbers and printing. `print` is the one capability this page grants.',
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
        blurb: 'This program asks to read a file. The page never granted fs, so the VM refuses. There is no ambient authority to fall back on.',
        source: `// fs.read is a capability, not a builtin. Nobody granted it.
let text = fs.read("/etc/hostname")
print(text)
`,
    },
    {
        id: 'polyglot',
        name: 'Polyglot gate',
        blurb: 'A @python block. Polyglot blocks only run when the host grants them, and this page grants nothing, so the VM refuses before anything runs.',
        source: `@python {
    print("hello from Python")
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
const player = $('player'), playBtn = $('play'), restartBtn = $('restart'), frameNo = $('frame-no');
const speedSel = $('speed'), fullBtn = $('full');
const inputRow = $('input-row'), inputBox = $('stdin-line'), sendBtn = $('send'), eofBtn = $('eof');

let worker, ready = false, pending = null, nextId = 1, timer = null;

function startWorker() {
    ready = false;
    worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
        if (data.ready) {
            ready = true;
            stats.textContent = 'ready';
            runBtn.disabled = false;
            return;
        }
        if (!pending || data.id !== pending) return;
        clearTimeout(timer);
        pending = null;
        runBtn.disabled = false;
        show(data);
    };
    worker.onerror = (e) => {
        stats.textContent = 'runtime failed to load';
        out.className = 'err';
        out.textContent = 'Could not start the Crush runtime: ' + (e.message || 'unknown error') +
            '\nThis page needs a browser with WebAssembly and module workers (recent Chrome, Firefox, Safari or Edge).';
    };
}

// Refusals are the capability model working, so they're shown as outcomes,
// not crashes. Anything unrecognised is shown as a plain error.
function classify(error) {
    if (interactiveRun && /stack underflow|truncated instruction/.test(error)) {
        return {
            kind: 'stopped',
            title: 'Known engine bug after the program finished (crush-ast#94)',
            body: 'Programs that read input run on the browser\'s step-by-step VM, which still disagrees with the native VM ' +
                'when unwinding some deep call chains, typically after a multi-round game. Everything printed above is ' +
                'correct, and the native crush-run finishes this program cleanly.',
        };
    }
    let m = error.match(/@(\w+) requires the 'polyglot\.\w+' capability/);
    if (m) {
        return {
            kind: 'refused',
            title: `Refused: the @${m[1]} block was not granted`,
            body: 'Crush never runs a polyglot block unless whoever runs the program grants it. ' +
                'Natively that grant is the --polyglot flag. This page grants nothing, and a browser ' +
                'has no host process to run Python, JavaScript or Bash in anyway, so polyglot blocks ' +
                'are always refused here. Running @javascript in the browser itself is planned.',
        };
    }
    m = error.match(/unknown capability: ([\w.]+)/);
    if (m) {
        return {
            kind: 'refused',
            title: `Refused: capability ${m[1]} was not granted`,
            body: 'Capabilities are granted by whoever runs the program, not by the program itself. ' +
                'This page grants only print, so the call is refused before it can do anything.',
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
let transcript = '', totalMs = 0, interactiveRun = false;

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

function send(message) {
    pending = nextId++;
    runBtn.disabled = true;
    inputRow.hidden = true;
    stats.textContent = 'running…';
    worker.postMessage({ ...message, id: pending });
    timer = setTimeout(() => {
        worker.terminate();
        pending = null;
        verdict.hidden = true;
        inputRow.hidden = true;
        out.className = 'err';
        out.textContent = (transcript ? transcript + '\n' : '') +
            `Stopped after ${TIMEOUT_MS / 1000} s of wall-clock time. The runtime has been restarted.`;
        stats.textContent = 'timed out';
        runBtn.disabled = false;
        startWorker();
    }, TIMEOUT_MS);
}

function run() {
    if (!ready || pending) return;
    verdict.hidden = true;
    hidePlayer();
    transcript = '';
    totalMs = 0;
    interactiveRun = /\bio\.read\b/.test(src.value);
    send({ type: 'run', source: src.value, maxSteps: 1_000_000 });
}

function provide(line) {
    if (pending) return;
    transcript += line + '\n';   // echo what the player typed, like a terminal
    send({ type: 'provide', line });
}

function load(ex) {
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

// Share links carry the program in the URL fragment: #code=<base64url>.
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
    const url = location.origin + location.pathname + '#code=' + encode(src.value);
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
eofBtn.addEventListener('click', () => { if (!pending) { transcript += '^D\n'; send({ type: 'eof' }); } });
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

const shared = location.hash.startsWith('#code=') ? location.hash.slice(6) : null;
const linkedGame = GAMES.find((g) => location.hash === '#' + g.id);
if (linkedGame) {
    loadGame(linkedGame);
} else if (shared) {
    try {
        src.value = decode(shared);
        blurb.textContent = 'A shared program.';
        picker.value = '';
    } catch {
        load(EXAMPLES[0]);
    }
} else {
    load(EXAMPLES[0]);
}

runBtn.disabled = true;
startWorker();
