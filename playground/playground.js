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
        blurb: 'Natively, a granted @python block runs on the host. Here nothing grants it, so the block is refused before anything runs.',
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

const TIMEOUT_MS = 8000;
const $ = (id) => document.getElementById(id);
const src = $('src'), out = $('out'), stats = $('stats'), runBtn = $('run');
const picker = $('example'), blurb = $('blurb'), shareBtn = $('share');

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

function show(r) {
    const ms = r.ms < 1 ? '<1' : Math.round(r.ms);
    if (r.ok) {
        out.className = '';
        out.textContent = r.output.length ? r.output : '(no output)';
        stats.textContent = `ok · ${r.steps.toLocaleString()} steps · ${ms} ms`;
    } else {
        out.className = 'err';
        out.textContent = r.error;
        stats.textContent = `error · ${ms} ms`;
    }
}

function run() {
    if (!ready || pending) return;
    pending = nextId++;
    runBtn.disabled = true;
    stats.textContent = 'running…';
    worker.postMessage({ id: pending, source: src.value });
    timer = setTimeout(() => {
        worker.terminate();
        pending = null;
        out.className = 'err';
        out.textContent = `Stopped after ${TIMEOUT_MS / 1000} s of wall-clock time. The runtime has been restarted.`;
        stats.textContent = 'timed out';
        startWorker();
    }, TIMEOUT_MS);
}

function load(ex) {
    src.value = ex.source;
    blurb.textContent = ex.blurb;
    picker.value = ex.id;
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

for (const ex of EXAMPLES) picker.add(new Option(ex.name, ex.id));
picker.addEventListener('change', () => load(EXAMPLES.find((e) => e.id === picker.value)));

runBtn.addEventListener('click', run);
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
if (shared) {
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
