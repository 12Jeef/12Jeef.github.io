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

        Array.from(document.querySelectorAll("article section.nav")).forEach(sect => {
            const buttonArr = Array.from(sect.querySelectorAll(":scope > nav > button"));
            const sectArr = Array.from(sect.querySelectorAll(":scope > section > section"));
            buttonArr.forEach((button, i) => {
                button.addEventListener("click", e => {
                    buttonArr.forEach(button => button.classList.remove("active"));
                    button.classList.add("active");
                    sectArr.forEach(sect => {
                        if (sect.id == button.id+"-content")
                            sect.classList.add("this");
                        else sect.classList.remove("this");
                    });
                });
                if (i > 0) return;
                button.click();
            });
            const superSect = sect;
            sectArr.forEach(sect => {
                const update = () => {
                    if (!sect.classList.contains("this")) return;
                    console.log(sect.id, sect.scrollHeight);
                    superSect.style.setProperty("--h", sect.scrollHeight+"px");
                };
                new ResizeObserver(update).observe(sect);
                new MutationObserver(update).observe(sect, { attributes: ["class"] });
            });
        });

        this.addHandler("setup", () => {
            const canvas = document.getElementById("canvas");
            if (canvas && canvas.getContext) {
                const ctx = canvas.getContext("2d");
                const w = 1000, h = 500;
                let q = 1;
                let stars = [];
                for (let i = 0; i < 450; i++) stars.push({
                    pos: new V(Math.random()*w, Math.random()*h),
                    d: 360*Math.random(), l: util.lerp(5, 20, Math.random()),
                    t: util.lerp(1000, 3000, Math.random()), to: Math.random(),
                    r: Math.random(),
                });
                const update = delta => {
                    let p = (document.body.scrollTop < window.innerHeight*0.25) ? 0 : (document.body.scrollTop > window.innerHeight*0.75) ? 1 : ((document.body.scrollTop-window.innerHeight*0.25)/(window.innerHeight*0.5));
                    ctx.canvas.style.opacity = util.lerp(1, 0.5, p);
                    ctx.canvas.style.filter = "blur("+util.lerp(0, 0.25, p)+"rem)";
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    const scale = (ctx.canvas.height/q) / h;
                    stars.forEach(star => {
                        const t = ((((util.getTime()/star.t)-star.to)%1)+1)%1;
                        const p = util.ease.quadIO(1-Math.abs(t-0.5)/0.5);
                        let x = star.pos.x, y = star.pos.y;
                        let [ox, oy] = V.dir(star.d, util.lerp(-0.5, 0.5, t)*star.l).xy;
                        x += ox; y += oy;
                        const c = new util.Color((star.r < 0.5) ? [0, 128, 255, (star.r/0.5)] : [255*((star.r-0.5)/0.5), util.lerp(128, 255, ((star.r-0.5)/0.5)), 255, 0.5]);
                        c.a *= 1-(x/w - 0.25*y/h);
                        c.a *= p;
                        ctx.fillStyle = c.toRGBA();
                        ctx.beginPath();
                        ctx.arc(
                            ctx.canvas.width-x*scale*q,
                            ctx.canvas.height/2 + (y-h/2)*scale*q,
                            util.lerp(0.5, 1.5, star.r)*p*scale*q,
                            0, 2*Math.PI,
                        );
                        ctx.fill();
                    });
                };
                this.addHandler("update", update);
                const resize = () => {
                    q = window.devicePixelRatio;
                    ctx.canvas.style.width = window.innerWidth+"px";
                    ctx.canvas.style.height = window.innerHeight+"px";
                    ctx.canvas.width = window.innerWidth*q;
                    ctx.canvas.height = window.innerHeight*q;
                    update(0);
                };
                window.addEventListener("resize", resize);
                resize();
            }
            const eTitleCard = document.getElementById("title-card");
            if (eTitleCard) {
                let progressing = false;
                const animation = () => {
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

                            init: elem => {
                                elem.style.filter = "blur(0.025em)";
                            },
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
                            text: "Fellow developer, designer", size: "1em",

                            br: newline,

                            init: elem => {
                                elem.style.color = "#defc";
                                elem.style.letterSpacing = "0.1em";
                                elem.style.fontWeight = 400;
                            },
                        },
                        {
                            t: tTag+tPause+tContent1+tPause + (autocomplete ? 0 : (tTag+tPause)) + (autocomplete ? tTag : (tTag+tPause+tContent2+tPause)),
                            l: tTag,
                            at: autocomplete ? 4 : 5,

                            i: 0,
                            type: "tag",
                            text: "p", wraps: ["</", ">"],

                            br: true,

                            init: elem => {
                                elem.style.filter = "blur(0.025em)";
                            },
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
                        progressing = true;
                        const tNow = util.getTime();
                        const t = (tNow-tStart + tShift) / 1;
                        const tStop = autocomplete ?
                            (tPause+tTag+tPause+tContent1+tPause+tTag+tPause+tContent2+10*tPause) :
                            (tPause+tTag+tPause+tContent1+tPause+tTag+tPause+tTag+tPause+tContent2+tPause+tTag+10*tPause);
                        elems.forEach(data => {
                            if (t < data.t) return;
                            if (!data.elem) {
                                data.elem = document.createElement("span");
                                data.elem.style.setProperty("--i", data.i+0);
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
                        const p = (((t/tCursor)%1)+1)%1;
                        eCursor.style.opacity = (p < 0.5) ? util.lerp(1, 0.75, p/0.5) : 0;
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
                        if (t <= tStop) return;
                        progressing = false;
                        this.remHandler("update", update);
                        eCursor.remove();
                    };
                    this.addHandler("update", update);
                };
                animation();
            }
            const p = 0.1;
            Array.from(document.querySelectorAll("body > article")).forEach(elem => {
                const update = delta => {
                    let forceShow = false;
                    Array.from(elem.querySelectorAll("section.list")).forEach(sect => {
                        // forceShow = true;
                        const aArr = Array.from(sect.querySelectorAll("a"));
                        let reqs = [];
                        aArr.forEach(a => {
                            let r = a.getBoundingClientRect();
                            if (
                                (r.top > window.innerHeight*(1-p)) ||
                                (r.bottom < window.innerHeight*p)
                            ) {
                                sect.style.setProperty("--y", ((r.top+r.height/2) < (window.innerHeight/2)) ? -1 : +1);
                                if (a._idIn) {
                                    clearTimeout(a._idIn);
                                    delete a._idIn;
                                }
                                if (a._idOut) return;
                                reqs.push(i => (a._idOut = setTimeout(() => a.classList.remove("this"), 100*i)));
                                return;
                            }
                            if (a._idOut) {
                                clearTimeout(a._idOut);
                                delete a._idOut;
                            }
                            if (a._idIn) return;
                            reqs.push(i => (a._idIn = setTimeout(() => a.classList.add("this"), 100*i)));
                        });
                        reqs.forEach((req, i) => req(i));
                    });
                    Array.from(elem.querySelectorAll("section.timeline")).forEach(sect => {
                        const sectArr = Array.from(sect.querySelectorAll("section"));
                        sectArr.forEach(sect => {
                            let r = sect.getBoundingClientRect();
                            if (
                                (r.top > window.innerHeight*(1-p)) ||
                                (r.bottom < window.innerHeight*p)
                            ) {
                                sect.style.setProperty("--y", ((r.top+r.height/2) < (window.innerHeight/2)) ? -1 : +1);
                                sect.classList.remove("this");
                                return;
                            }
                            sect.classList.add("this");
                        });
                    });
                    Array.from(elem.querySelectorAll("section.nav")).forEach(sect => {
                        const buttonArr = Array.from(sect.querySelectorAll(":scope > nav > button"));
                        let reqs = [];
                        buttonArr.forEach(button => {
                            let r = button.getBoundingClientRect();
                            if (
                                (r.top > window.innerHeight*(1-p)) ||
                                (r.bottom < window.innerHeight*p)
                            ) {
                                sect.style.setProperty("--y", ((r.top+r.height/2) < (window.innerHeight/2)) ? -1 : +1);
                                if (button._idIn) {
                                    clearTimeout(button._idIn);
                                    delete button._idIn;
                                }
                                if (button._idOut) return;
                                reqs.push(i => (button._idOut = setTimeout(() => button.classList.remove("this"), 100*i)));
                                return;
                            }
                            if (button._idOut) {
                                clearTimeout(button._idOut);
                                delete button._idOut;
                            }
                            if (button._idIn) return;
                            reqs.push(i => (button._idIn = setTimeout(() => button.classList.add("this"), 100*i)));
                        });
                        reqs.forEach((req, i) => req(i));
                    });
                    let r = elem.getBoundingClientRect();
                    if (
                        (r.top > window.innerHeight*(1-p)) ||
                        (r.bottom < window.innerHeight*p)
                    ) {
                        elem.style.setProperty("--y", ((r.top+r.height/2) < (window.innerHeight/2)) ? -1 : +1);
                        if (!forceShow) return elem.classList.remove("this");
                    }
                    elem.classList.add("this");
                };
                this.addHandler("update", update);
            });
        });
    }

    start() { this.post("start"); }

    setup() { this.post("setup"); }

    update(delta) { this.post("update", delta); }
}
