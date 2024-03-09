import * as util from "./util.mjs";
import { V } from "./util.mjs";

import * as THREE from "three";


export default class App extends util.Target {
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

        this.addHandler("setup", () => {
            const eWindow = document.getElementById("window");
            if (eWindow) {
                const tFlicker = 500;
                const tBloom = 500;
                const tStart = util.getTime();
                let valm = null, val = null, valt = 0;
                this.addHandler("update", delta => {
                    let t = util.getTime()-tStart;
                    if (t < tFlicker) {
                        if (valm != 0) {
                            valm = 0;
                            val = null;
                            valt = 0;
                        }
                        if (valt <= 0) {
                            val = Math.random();
                            valt += util.lerp(10, 50, Math.random());
                        } else valt -= delta;
                        eWindow.style.setProperty("--r", util.lerp(0, 0.5, val));
                        return;
                    }
                    t -= tFlicker;
                    if (t < tBloom) {
                        eWindow.style.setProperty("--r", util.lerp(0.5, 1, t/tBloom));
                        return;
                    }
                });
            }
        });
    }

    start() { this.post("start"); }

    setup() { this.post("setup"); }

    update(delta) { this.post("update", delta); }
}
