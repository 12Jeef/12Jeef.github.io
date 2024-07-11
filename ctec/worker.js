import * as util from "../util.mjs";
import { V } from "../util.mjs";


export class WorkerClient extends util.Target {
    constructor(src) {
        super();

        const worker = new Worker(src, { type: "module" });
        worker.addEventListener("error", e => console.error(e));
        worker.addEventListener("message", e => this.post("receive", e.data));
        this.addHandler("send", payload => worker.postMessage(payload));
        this.addHandler("terminate", () => worker.terminate());
    }

    send(payload) { this.post("send", payload); }
    onReceive(f) { this.addHandler("receive", f); }
    offReceive(f) { this.remHandler("receive", f); }
    terminate() { this.post("terminate"); }
}

export class WorkerServer extends util.Target {
    constructor(self) {
        super();

        self.addEventListener("message", e => this.post("receive", e.data));
        this.addHandler("send", payload => self.postMessage(payload));
    }

    send(payload) { this.post("send", payload); }
    onReceive(f) { this.addHandler("receive", f); }
    offReceive(f) { this.remHandler("receive", f); }
}
