// Crush Capsules: run exo-light capsules with the grants the visitor picks.
import init, { run_capsule } from './capsules-pkg/exo_light_web.js';

const SAMPLES = {
    wordcount: {
        about: 'Counts the words in /data/in/notes.txt. It asks to read /data/in and nothing else.',
        presets: [
            { label: 'Grant the read', grants: ['io.file.read:/data/in'] },
            { label: 'Withhold it', grants: [] },
        ],
    },
    report: {
        about: 'Reads the notes, then writes a summary to /data/out/report.txt. It asks to read /data/in and write /data/out.',
        presets: [
            { label: 'Read and write', grants: ['io.file.read:/data/in', 'io.file.write:/data/out'] },
            { label: 'Read only', grants: ['io.file.read:/data/in'] },
        ],
    },
    passwd: {
        about: 'Asks only to read /data/in, then tries to read /etc/passwd anyway. The file exists in its filesystem; the scope is what stops it.',
        presets: [
            { label: 'Grant what it asked for', grants: ['io.file.read:/data/in'] },
            { label: 'Also grant /etc', grants: ['io.file.read:/data/in'], extra: 'io.file.read:/etc' },
        ],
    },
};

const $ = (id) => document.getElementById(id);
const picker = $('sample'), runBtn = $('run'), about = $('about'), requests = $('requests');
const extra = $('extra-grant'), presets = $('presets'), filesBox = $('files'), source = $('source');
const out = $('out'), stats = $('stats'), verdict = $('verdict');
const verdictTitle = $('verdict-title'), verdictBody = $('verdict-body');
const after = $('after'), afterFiles = $('after-files');

let ready = false;
let current = null; // { id, spec, blob, files }

function describeCap(cap) {
    const m = cap.match(/^io\.file\.(read|write):(.+)$/);
    if (m) return `${m[1] === 'read' ? 'Read' : 'Write'} files under ${m[2]}`;
    return cap;
}

function renderRequests(spec) {
    requests.textContent = '';
    for (const cap of spec.capabilities) {
        const id = 'g-' + cap.replace(/[^a-z0-9]/gi, '-');
        const row = document.createElement('label');
        row.className = 'grant';
        row.htmlFor = id;
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.id = id;
        box.value = cap;
        box.checked = true;
        const text = document.createElement('span');
        text.innerHTML = '';
        const strong = document.createElement('strong');
        strong.textContent = describeCap(cap);
        const code = document.createElement('code');
        code.textContent = cap;
        text.append(strong, ' ', code);
        row.append(box, text);
        requests.append(row);
    }
}

function renderFiles(files) {
    filesBox.textContent = '';
    for (const [path, text] of Object.entries(files)) {
        const wrap = document.createElement('div');
        wrap.className = 'file';
        const label = document.createElement('label');
        const id = 'f-' + path.replace(/[^a-z0-9]/gi, '-');
        label.htmlFor = id;
        label.textContent = path;
        const area = document.createElement('textarea');
        area.id = id;
        area.dataset.path = path;
        area.spellcheck = false;
        area.rows = Math.min(6, text.split('\n').length + 1);
        area.value = text;
        wrap.append(label, area);
        filesBox.append(wrap);
    }
}

function renderPresets(sample) {
    presets.textContent = '';
    const lead = document.createElement('span');
    lead.className = 'pane-title';
    lead.textContent = 'Try';
    presets.append(lead);
    for (const p of sample.presets) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tool';
        b.textContent = p.label;
        b.addEventListener('click', () => {
            for (const box of requests.querySelectorAll('input')) box.checked = p.grants.includes(box.value);
            extra.value = p.extra || '';
            run();
        });
        presets.append(b);
    }
}

async function loadSample(id) {
    const base = 'capsules/' + id + '/';
    const [spec, files, blob, src] = await Promise.all([
        fetch(base + 'spec.json').then((r) => r.json()),
        fetch(base + 'files.json').then((r) => r.json()),
        fetch(base + 'capsule.cvm1').then((r) => r.arrayBuffer()),
        fetch(base + 'source.casm').then((r) => r.text()),
    ]);
    current = { id, spec, blob: new Uint8Array(blob), files };
    about.textContent = SAMPLES[id].about;
    renderRequests(spec);
    renderFiles(files);
    renderPresets(SAMPLES[id]);
    extra.value = '';
    source.textContent = src;
    verdict.hidden = true;
    after.hidden = true;
    out.className = '';
    out.textContent = 'Pick what to grant, then press Run.';
}

function collect() {
    const grants = [...requests.querySelectorAll('input:checked')].map((b) => b.value);
    const more = extra.value.trim();
    if (more) grants.push(more);
    const files = {};
    for (const area of filesBox.querySelectorAll('textarea')) files[area.dataset.path] = area.value;
    return { grants, files };
}

function showVerdict(kind, title, body) {
    verdict.className = 'verdict ' + kind;
    verdictTitle.textContent = title;
    verdictBody.textContent = body;
    verdict.hidden = false;
}

function renderAfter(before, result) {
    afterFiles.textContent = '';
    for (const [path, text] of Object.entries(result.files || {})) {
        const changed = before[path] !== text;
        const wrap = document.createElement('div');
        wrap.className = 'file after-file' + (changed ? ' changed' : '');
        const label = document.createElement('div');
        label.className = 'file-path';
        label.textContent = path + (path in before ? (changed ? '  (changed)' : '') : '  (new)');
        const pre = document.createElement('pre');
        pre.textContent = text;
        wrap.append(label, pre);
        afterFiles.append(wrap);
    }
    after.hidden = false;
}

function run() {
    if (!ready || !current) return;
    const { grants, files } = collect();
    const started = performance.now();
    let result;
    try {
        result = run_capsule({ spec: current.spec, blob: current.blob, grants, files, max_steps: 1_000_000 });
    } catch (err) {
        showVerdict('refused', 'Could not run', String(err));
        out.className = 'raw';
        out.textContent = String(err);
        after.hidden = true;
        stats.textContent = 'error';
        return;
    }
    const ms = Math.max(1, Math.round(performance.now() - started));
    out.className = result.ok ? '' : 'raw';
    out.textContent = result.output || (result.ok ? '(no output)' : '');
    if (result.ok) {
        showVerdict('allowed', 'Ran with the grants you gave', grants.length
            ? 'Granted: ' + grants.join(', ')
            : 'No grants were needed.');
    } else if (result.denied && result.denied.length) {
        const d = result.denied[0];
        showVerdict('refused', 'Refused: ' + d.cap, d.detail + '. Everything printed before the refusal is shown below.');
    } else if (result.error && /not requested/.test(result.error)) {
        showVerdict('refused', 'Refused before running', result.error);
        out.textContent = '(the capsule never started)';
    } else {
        showVerdict('refused', 'Stopped', result.error || 'The capsule did not finish.');
    }
    stats.textContent = `${result.ok ? 'ok' : 'refused'} · ${result.steps.toLocaleString()} steps · ${ms} ms`;
    if (result.steps > 0) renderAfter(files, result);
    else after.hidden = true;
}

picker.addEventListener('change', () => loadSample(picker.value));
runBtn.addEventListener('click', run);

const fromHash = location.hash.slice(1);
if (SAMPLES[fromHash]) picker.value = fromHash;

Promise.all([init(), loadSample(picker.value)])
    .then(() => {
        ready = true;
        runBtn.disabled = false;
        stats.textContent = 'ready';
    })
    .catch((err) => {
        stats.textContent = 'runtime failed to load';
        out.className = 'err';
        out.textContent = 'Could not start the capsule runtime: ' + err;
    });
