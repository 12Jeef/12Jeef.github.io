import * as util from "./util.mjs";
import { V } from "./util.mjs";


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
            const eTitleCard = document.getElementById("title-card");
            if (eTitleCard) {
                eTitleCard.innerHTML = "";
                const autocomplete = true;
                const tShift = -250;
                const tPause = 250;
                const tTag = 250;
                const tContent = 750;
                const tCursor = 750;
                const tag = "h1";
                const content = "Jeffrey Fan";
                const eCursor = document.createElement("span");
                eTitleCard.appendChild(eCursor);
                eCursor.classList.add("cursor");
                const elems = [
                    {
                        t: 0, l: tTag, at: 0,
                        type: "tag",
                        text: tag, wraps: ["<", ">"],
                    },
                    {
                        t: tTag+tPause, l: tContent, at: 1,
                        type: "content",
                        text: content,
                    },
                    {
                        t: autocomplete ? tTag : (tTag+tPause+tContent+tPause),
                        l: autocomplete ? 0 : tTag,
                        at: autocomplete ? 1 : 2,

                        type: "tag",
                        text: tag, wraps: ["</", ">"],
                    },
                ];
                const cursor = autocomplete ?
                    [
                        { t: 0, at: 1 },
                        { t: tTag+tPause, at: 2 },
                        { t: tTag+tPause+tContent+3*tPause, at: 3 },
                    ] : [
                        { t: 0, at: 1000 },
                    ];
                const tStart = util.getTime();
                const update = delta => {
                    const tNow = util.getTime();
                    const t = tNow-tStart + tShift;
                    const tStop = autocomplete ? (tPause+tTag+tPause+tContent+10*tPause) : (tPause+tTag+tPause+tContent+tPause+tTag+10*tPause);
                    if (t > tStop) {
                        this.remHandler("update", update);
                        eCursor.remove();
                        return;
                    }
                    elems.forEach(data => {
                        if (t < data.t) return;
                        if (!data.elem) {
                            data.elem = document.createElement("span");
                            if (data.type == "tag") data.elem.classList.add("tag");
                            if (data.at < 0 || data.at >= eTitleCard.children.length)
                                eTitleCard.appendChild(data.elem);
                            else eTitleCard.insertBefore(data.elem, eTitleCard.children[data.at]);
                        }
                        const text = String((data.type == "tag") ? data.wraps[0]+data.text+data.wraps[1] : data.text);
                        const p = Math.min(1, Math.max(0, (t-data.t)/data.l));
                        const i = Math.round(p*text.length);
                        if (data.type == "tag") {
                            data.elem.innerHTML = "";
                            data.elem.appendChild(document.createTextNode(text.substring(
                                0,
                                Math.min(i, data.wraps[0].length),
                            )));
                            data.elem.appendChild(document.createElement("span"));
                            data.elem.lastChild.classList.add("tag");
                            data.elem.lastChild.textContent = text.substring(
                                data.wraps[0].length,
                                Math.min(data.wraps[0].length+data.text.length, Math.max(data.wraps[0].length, i)),
                            );
                            data.elem.appendChild(document.createTextNode(text.substring(
                                data.wraps[0].length+data.text.length,
                                Math.max(data.wraps[0].length+data.text.length, i),
                            )));
                            return;
                        }
                        data.elem.textContent = text.substring(0, i);
                    });
                    eCursor.style.opacity = (((t/tCursor)%1) < 0.5) ? util.lerp(1, 0.75, ((t/tCursor)%1)/0.5) : 0;
                    let at = 0;
                    cursor.forEach(data => {
                        if (t < data.t) return;
                        at = data.at;
                    });
                    if (Array.from(eTitleCard.children).indexOf(eCursor) == at) return;
                    eCursor.remove();
                    if (at < 0 || at >= eTitleCard.children.length)
                        eTitleCard.appendChild(eCursor);
                    else eTitleCard.insertBefore(eCursor, eTitleCard.children[at]);
                };
                this.addHandler("update", update);
            }
        });
    }

    start() { this.post("start"); }

    setup() { this.post("setup"); }

    update(delta) { this.post("update", delta); }
}
