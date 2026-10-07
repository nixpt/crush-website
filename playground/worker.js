// Runs Crush off the main thread so a long program never freezes the page.
// Programs that read input (io.read) run as a crush-web Session: it returns
// 'need_input' when the program calls io.read with no line pending, and the
// page answers with provide() or close() (end of input). Everything else runs
// through execute(): Session steps crush-vm's PortableVm, which still diverges
// from the scheduler on some programs (stack underflow on tictactoe, lights_out,
// blackjack; crush-ast#94), so it's used only where input requires it. The VM stops at its instruction quota; the page also
// has a wall-clock timeout per call that terminates this worker.
import init, { Session, execute } from './pkg/crush_web.js';

const ready = init();
let session = null;

function report(id, r, started) {
    self.postMessage({
        id,
        status: r.status,
        output: r.output || '',
        error: r.error,
        steps: r.steps,
        ms: performance.now() - started,
    });
}

self.onmessage = async ({ data }) => {
    await ready;
    const started = performance.now();
    try {
        if (data.type === 'run') {
            if (session) { session.free?.(); session = null; }
            if (/\bio\.read\b/.test(data.source)) {
                session = new Session(data.source, { max_steps: data.maxSteps });
                report(data.id, session.run(), started);
            } else {
                try {
                    const r = execute(data.source);
                    report(data.id, { status: 'done', output: r.output, steps: r.steps }, started);
                } catch (err) {
                    report(data.id, { status: 'error', output: '', error: String(err) }, started);
                }
            }
        } else if (data.type === 'provide' && session) {
            report(data.id, session.provide(data.line), started);
        } else if (data.type === 'eof' && session) {
            report(data.id, session.close(), started);
        }
    } catch (err) {
        self.postMessage({ id: data.id, status: 'error', output: '', error: String(err), ms: performance.now() - started });
    }
};

ready.then(() => self.postMessage({ ready: true }));
