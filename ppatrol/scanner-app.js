import * as util from "./util.js";
import { V } from "./util.js";

import { Match } from "./data.js";

export default class App extends util.Target {
    #scanner;

    constructor() {
        super();

        window.app = this;

        this.addHandler("start", () => {
            let id = setInterval(async () => {
                if (document.readyState != "complete") return;
                this.setup();
                clearInterval(id);
                let t0 = null;
                const update = async () => {
                    window.requestAnimationFrame(update);
                    let t1 = util.getTime();
                    if (t0 == null) return t0 = t1;
                    this.update(t1-t0);
                    t0 = t1;
                };
                update();
            }, 10);
        });

        this.addHandler("setup", async () => {
            this.#scanner = new Html5Qrcode("feed");

            this.ePrompt = document.getElementById("prompt");
            this.eMessage = document.getElementById("message");
            this.eContent = document.getElementById("content");
            this.eFinish = document.getElementById("finish");
            this.eFinish.addEventListener("click", e => {
                this.startScanning();
                this.ePrompt.classList.remove("this");
            });

            await this.scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                },
                async text => {
                    this.stopScanning();
                    this.ePrompt.classList.add("this");
                    let data = Match.fromBufferStr(text);
                    let textData = JSON.stringify(data, null, "  ");
                    this.eContent.textContent = textData;
                    this.eFinish.disabled = true;
                    let resp = await fetch("https://ppatrol.pythonanywhere.com/data/matches/"+util.getTime(), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Password": "6036ftw"
                        },
                        body: JSON.stringify({
                            v: data,
                        }),
                    });
                    console.log(await resp.text());
                    this.eFinish.disabled = false;
                },
                () => {},
            );

            this.startScanning();
            this.ePrompt.classList.remove("this");
        });
    }

    start() { this.post("start"); }

    setup() { this.post("setup"); }

    update(delta) { this.post("update", delta); }

    get scanner() { return this.#scanner; }

    async startScanning() {
        return await this.scanner.resume();
    }
    async stopScanning() {
        return await this.scanner.pause(true);
    }
}