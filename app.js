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
                const autocomplete = false;
                const newline = true;
                const tShift = -1000;
                const tPause = 250;
                const tTag = 250;
                const tContent1 = 750;
                const tContent2 = 1500;
                const tCursor = 750;
                const eCursor = document.createElement("span");
                eTitleCard.appendChild(eCursor);
                eCursor.classList.add("cursor");
                const elems = [
                    {
                        t: 0, l: tTag, at: 0,
                        i: 0,
                        type: "tag",
                        text: "h1", wraps: ["<", ">"],

                        br: newline,
                    },
                    {
                        t: tTag+tPause, l: tContent1, at: autocomplete ? 1 : 2,
                        i: newline ? 1 : 0,
                        type: "content",
                        text: "Jeffrey Fan", size: "4em",

                        br: newline,
                    },
                    {
                        t: autocomplete ? tTag : (tTag+tPause+tContent1+tPause),
                        l: autocomplete ? 0 : tTag,
                        at: autocomplete ? 1 : 2,

                        i: 0,
                        type: "tag",
                        text: "h1", wraps: ["</", ">"],

                        br: true,
                    },
                    {
                        t: tTag+tPause+tContent1+tPause + (autocomplete ? 0 : (tTag+tPause)),
                        l: tTag,
                        at: 3,

                        i: 0,
                        type: "tag",
                        text: "p", wraps: ["<", ">"],

                        br: newline,
                    },
                    {
                        t: tTag+tPause+tContent1+tPause + (autocomplete ? 0 : (tTag+tPause)) + tTag+tPause,
                        l: tContent2,
                        at: 4,

                        i: newline ? 1 : 0,
                        type: "content",
                        text: "Frontend and application developer, graphic designer", size: "1em",
                        init: elem => {
                            elem.style.color = "#fffa";
                            elem.style.letterSpacing = "0.1em";
                            elem.style.fontWeight = 400;
                        },

                        br: newline,
                    },
                    {
                        t: tTag+tPause+tContent1+tPause + (autocomplete ? 0 : (tTag+tPause)) + (autocomplete ? tTag : (tTag+tPause+tContent2+tPause)),
                        l: tTag,
                        at: autocomplete ? 4 : 5,

                        i: 0,
                        type: "tag",
                        text: "p", wraps: ["</", ">"],

                        br: true,
                    },
                ];
                const cursor = autocomplete ?
                    [
                        { t: 0, at: 1 },
                        { t: tTag, at: 0 },
                        { t: tTag+tPause, at: 1 },
                        { t: tTag+tPause+tContent1+tPause, at: 3 },
                        { t: tTag+tPause+tContent1+tPause+tTag+tPause, at: 4 },
                    ] : [
                        { t: 0, at: 1000 },
                    ];
                const tStart = util.getTime();
                const update = delta => {
                    const tNow = util.getTime();
                    const t = (tNow-tStart + tShift) / 1;
                    const tStop = autocomplete ?
                        (tPause+tTag+tPause+tContent1+tPause+tTag+tPause+tContent2+10*tPause) :
                        (tPause+tTag+tPause+tContent1+tPause+tTag+tPause+tTag+tPause+tContent2+tPause+tTag+10*tPause);
                    if (t > tStop) {
                        this.remHandler("update", update);
                        eCursor.remove();
                        return;
                    }
                    elems.forEach(data => {
                        if (t < data.t) return;
                        if (!data.elem) {
                            data.elem = document.createElement("span");
                            data.elem.style.setProperty("--i", data.i);
                            if (data.type == "tag") data.elem.classList.add("tag");
                            if (data.type == "content") data.elem.style.fontSize = data.size;
                            if (data.init) data.init(data.elem);
                            let at = data.at;
                            const children = Array.from(eTitleCard.children).filter(elem => (!(elem instanceof HTMLBRElement) && !elem.classList.contains("cursor")));
                            if (at < 0 || at >= children.length) {
                                eTitleCard.appendChild(data.elem);
                                if (data.br) eTitleCard.appendChild(document.createElement("br"));
                            } else {
                                const before = children[at];
                                eTitleCard.insertBefore(data.elem, before);
                                if (data.br) eTitleCard.insertBefore(document.createElement("br"), before);
                            }
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
                    const children = Array.from(eTitleCard.children).filter(elem => (!(elem instanceof HTMLBRElement) && !elem.classList.contains("cursor")));
                    eCursor.remove();
                    if (at < 0 || at >= children.length) {
                        if (children.at(-1) && children.at(-1).nextSibling) {
                            eTitleCard.insertBefore(eCursor, children.at(-1).nextSibling);
                            eCursor.style.fontSize = children.at(-1).classList.contains("tag") ? "1em" : elems.find(data => data.elem == children.at(-1)).size;
                        } else {
                            eTitleCard.appendChild(eCursor);
                            eCursor.style.fontSize = "1em";
                        }
                    } else {
                        eTitleCard.insertBefore(eCursor, children[at].nextSibling);
                        eCursor.style.fontSize = children[at].classList.contains("tag") ? "1em" : elems.find(data => data.elem == children[at]).size;
                    }
                };
                this.addHandler("update", update);
            }
        });
    }

    start() { this.post("start"); }

    setup() { this.post("setup"); }

    update(delta) { this.post("update", delta); }
}
