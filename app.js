function now() {
    return Date.now() / 1000;
}
class JiggleController {
    errorGain;
    veloDecay;
    value;
    wantedValue;
    valueVelo;
    wantedValueSmooth;
    errorSmooth;
    constructor(config) {
        this.errorGain = config.errorGain ?? 5;
        this.veloDecay = config.veloDecay ?? 0.95;
        this.value = config.value ?? 0;
        this.wantedValue = this.value;
        this.valueVelo = 0;
        this.wantedValueSmooth = this.wantedValue;
        this.errorSmooth = this.error;
    }
    get error() {
        return this.wantedValue - this.value;
    }
    get isStopped() {
        return (Math.abs(this.error) < 0.01 &&
            Math.abs(this.valueVelo) < 1 &&
            Math.abs(this.wantedValueSmooth - this.wantedValue) < 0.1 &&
            Math.abs(this.errorSmooth - this.error) < 0.1);
    }
    update(delta) {
        this.valueVelo += this.errorGain * this.error * (delta / 0.008);
        this.valueVelo *= this.veloDecay * 0.99999 ** (1 - delta / 0.008);
        this.value += this.valueVelo * delta;
        this.wantedValueSmooth +=
            (this.wantedValue - this.wantedValueSmooth) * 20 * delta;
        this.errorSmooth += (this.error - this.errorSmooth) * 20 * delta;
    }
    getScale(mag) {
        return this.wantedValueSmooth + (mag ?? 0.5) * this.errorSmooth;
    }
    getXYScale(mag, flip = false) {
        let x = this.getScale(mag ?? 0.5);
        let y = this.getScale(-(mag ?? 0.5));
        return flip ? [y, x] : [x, y];
    }
}
function bindClickJiggle(elem, config) {
    const getDebounce = () => config.debounce ?? 0.1;
    const getPerturb = () => config.perturb ?? 1;
    const controller = new JiggleController({
        errorGain: config.errorGain,
        veloDecay: config.veloDecay,
        value: 1,
    });
    let frameId = -1;
    let lastClickTime = 0;
    elem.addEventListener("click", (e) => {
        let clickTime = now();
        if (clickTime - lastClickTime < getDebounce())
            return;
        window.cancelAnimationFrame(frameId);
        lastClickTime = clickTime;
        controller.value =
            1 + (+(Math.sign(controller.value - 1) <= 0) * 2 - 1) * getPerturb();
        if (config.onStart)
            config.onStart(controller);
        let t0 = now();
        const update = () => {
            let t1 = now();
            controller.update(Math.min(t1 - t0, 0.1));
            t0 = t1;
            if (controller.isStopped) {
                if (config.onStop)
                    config.onStop(controller);
                return;
            }
            frameId = window.requestAnimationFrame(update);
            if (config.periodic)
                config.periodic(now() - clickTime, controller);
        };
        update();
    });
    return controller;
}
function bindHoverJiggle(elem, config) {
    const getHoverOut = () => config.hoverOut ?? 1;
    const getHoverIn = () => config.hoverIn ?? 1.25;
    const controller = new JiggleController({
        errorGain: config.errorGain,
        veloDecay: config.veloDecay,
        value: getHoverOut(),
    });
    let frameId = -1;
    elem.addEventListener("mouseleave", (e) => {
        const startTime = now();
        window.cancelAnimationFrame(frameId);
        if (frameId >= 0)
            if (config.onHoverInStop)
                config.onHoverInStop(controller);
        controller.wantedValue = getHoverOut();
        if (config.onHoverOutStart)
            config.onHoverOutStart(controller);
        let t0 = now();
        const update = () => {
            let t1 = now();
            controller.update(Math.min(t1 - t0, 0.1));
            t0 = t1;
            if (controller.isStopped) {
                if (config.onHoverOutStop)
                    config.onHoverOutStop(controller);
                return;
            }
            frameId = window.requestAnimationFrame(update);
            if (config.periodic)
                config.periodic(now() - startTime, controller);
        };
        update();
    });
    elem.addEventListener("mouseenter", (e) => {
        const startTime = now();
        window.cancelAnimationFrame(frameId);
        if (frameId >= 0)
            if (config.onHoverOutStop)
                config.onHoverOutStop(controller);
        controller.wantedValue = getHoverIn();
        if (config.onHoverInStart)
            config.onHoverInStart(controller);
        let t0 = now();
        const update = () => {
            let t1 = now();
            controller.update(Math.min(t1 - t0, 0.1));
            t0 = t1;
            if (controller.isStopped) {
                if (config.onHoverInStop)
                    config.onHoverInStop(controller);
                return;
            }
            frameId = window.requestAnimationFrame(update);
            if (config.periodic)
                config.periodic(now() - startTime, controller);
        };
        update();
    });
    return controller;
}
function bindClickHoverJiggle(elem, config) {
    const update = () => {
        if (config.periodic)
            config.periodic(clickController, hoverController);
    };
    const clickController = bindClickJiggle(elem, {
        get debounce() {
            return config.debounce;
        },
        get perturb() {
            return config.perturb;
        },
        get errorGain() {
            return config.errorGain;
        },
        get veloDecay() {
            return config.veloDecay;
        },
        onStart: config.onClickStart,
        onStop: config.onClickStop,
        periodic: update,
    });
    const hoverController = bindHoverJiggle(elem, {
        get hoverIn() {
            return config.hoverIn;
        },
        get hoverOut() {
            return config.hoverOut;
        },
        get errorGain() {
            return config.errorGain;
        },
        get veloDecay() {
            return config.veloDecay;
        },
        onHoverOutStart: config.onHoverOutStart,
        onHoverOutStop: config.onHoverOutStop,
        onHoverInStart: config.onHoverInStart,
        onHoverInStop: config.onHoverInStop,
        periodic: update,
    });
    return { clickController, hoverController };
}
function getXYScale(clickController, hoverController, clickWeight = 1, hoverWeight = 0.5) {
    let [cx, cy] = clickController.getXYScale(0.5);
    let [hx, hy] = hoverController.getXYScale(0.5);
    cx = (cx - 1) * clickWeight + 1;
    cy = (cy - 1) * clickWeight + 1;
    hx = (hx - 1) * hoverWeight + 1;
    hy = (hy - 1) * hoverWeight + 1;
    let x = (hx + cx) / 2;
    let y = (hy + cy) / 2;
    return [x, y];
}
class App {
    static _instance = null;
    static get instance() {
        if (!this._instance)
            this._instance = new this();
        return this._instance;
    }
    mainPage;
    aboutMePage;
    activitiesPage;
    projectsPage;
    activePage = null;
    lastHash = "";
    constructor() {
        this.mainPage = new MainPage();
        this.aboutMePage = new AboutMePage();
        this.activitiesPage = new ActivitiesPage();
        this.projectsPage = new ProjectsPage();
        const elem = document.querySelector("body > div button");
        if (elem instanceof HTMLElement)
            bindClickHoverJiggle(elem, {
                periodic: (clickController, hoverController) => {
                    let [x, y] = getXYScale(clickController, hoverController, 4, 2);
                    elem.style.transform = `scale(${x}, ${y})`;
                },
            });
        this.updateHash();
        window.addEventListener("hashchange", () => {
            if (this.lastHash === App.readHash())
                return;
            this.updateHash();
        });
        let t0 = null;
        const update = () => {
            window.requestAnimationFrame(update);
            let t1 = now();
            if (t0 === null) {
                t0 = t1;
                return;
            }
            this.update(Math.min(t1 - t0, 0.1));
            t0 = t1;
        };
        update();
    }
    get pages() {
        return [
            this.mainPage,
            this.aboutMePage,
            this.activitiesPage,
            this.projectsPage,
        ];
    }
    update(delta) {
        if (window.innerHeight > window.innerWidth * 1.5)
            document.body.classList.add("portrait");
        else
            document.body.classList.remove("portrait");
        this.pages.forEach((page) => page.update(delta));
    }
    updateHash() {
        const hash = (this.lastHash = App.readHash());
        if (this.activePage && this.activePage.hash === hash)
            return;
        if (this.activePage)
            this.activePage.leave();
        let hitPage = false;
        this.pages.forEach((page) => {
            if (page.hash === hash && !hitPage) {
                hitPage = true;
                this.activePage = page;
                this.activePage.enter();
                return;
            }
        });
        if (!hitPage) {
            this.activePage = null;
            App.writeHash("");
        }
    }
    static fixHash() {
        if (location.hash === "" && String(location).endsWith("#"))
            history.replaceState("", document.title, window.location.pathname + window.location.search);
    }
    static readHash() {
        this.fixHash();
        let hash = location.hash;
        if (hash.startsWith("#"))
            hash = hash.slice(1);
        return hash;
    }
    static writeHash(hash) {
        location.hash = hash;
        this.fixHash();
    }
}
class Page {
    get id() {
        return "";
    }
    get hash() {
        return this.id;
    }
    elem;
    constructor() {
        const elem = document.querySelector(`body > article#${this.id}`);
        if (!(elem instanceof HTMLElement))
            throw new Error(`Page Element with id=${this.id} not found`);
        this.elem = elem;
    }
    update(delta) {
        this.periodic(delta);
    }
    enter() {
        this.elem.classList.add("this");
        App.writeHash(this.hash);
        this.onEnter();
    }
    leave() {
        this.elem.classList.remove("this");
        this.onLeave();
    }
}
class MainPage extends Page {
    get id() {
        return "main";
    }
    get hash() {
        return "";
    }
    headerElems;
    headerSpanElems;
    headerSpanStyles;
    nLayers;
    nChars;
    constructor() {
        super();
        this.headerElems = [];
        this.headerSpanElems = [];
        this.headerSpanStyles = [];
        this.elem
            .querySelectorAll(":scope > section.title > h1")
            .forEach((headerElem) => {
            if (!(headerElem instanceof HTMLElement))
                return;
            this.headerElems.push(headerElem);
            this.headerSpanElems.push([]);
            this.headerSpanStyles.push([]);
            headerElem.querySelectorAll(":scope > span").forEach((spanElem) => {
                if (!(spanElem instanceof HTMLElement))
                    return;
                this.headerSpanElems[this.headerElems.length - 1].push(spanElem);
                this.headerSpanStyles[this.headerElems.length - 1].push(spanElem.getAttribute("style") ?? "");
            });
        });
        this.nLayers = this.headerElems.length;
        this.nChars = Math.min(...this.headerSpanElems.map((spanElems) => spanElems.length));
        for (let layerI = 0; layerI < this.nLayers; layerI++) {
            for (let charI = 0; charI < this.nChars; charI++) {
                const spanElem = this.headerSpanElems[layerI][charI];
                bindClickJiggle(spanElem, {
                    onStart: () => {
                        spanElem.style.animation = "none";
                        setTimeout(() => {
                            if (layerI + 1 < this.nLayers)
                                this.headerSpanElems[layerI + 1][charI].click();
                        }, 0.1 * 1000);
                    },
                    onStop: () => {
                        spanElem.style.animation = "";
                        spanElem.style.transform = "";
                        spanElem.style.setProperty("--delay", "0s");
                        spanElem.style.setProperty("--duration", "0s");
                    },
                    periodic: (time, controller) => {
                        let [x, y] = controller.getXYScale(0.5);
                        spanElem.style.transform = `scale(${(x - 1) * 0.5 ** layerI + 1}, ${(y - 1) * 0.5 ** layerI + 1})`;
                    },
                });
            }
        }
        this.elem.querySelectorAll(":scope > nav button").forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            bindClickHoverJiggle(elem, {
                periodic: (clickController, hoverController) => {
                    let [x, y] = getXYScale(clickController, hoverController);
                    elem.style.transform = `scale(${x}, ${y})`;
                },
            });
        });
    }
    onEnter() {
        for (let layerI = 0; layerI < this.nLayers; layerI++) {
            for (let charI = 0; charI < this.nChars; charI++) {
                const spanElem = this.headerSpanElems[layerI][charI];
                spanElem.style.animation = "none";
                spanElem.offsetWidth;
                spanElem.setAttribute("style", this.headerSpanStyles[layerI][charI]);
                spanElem.style.animation = "";
            }
        }
    }
    onLeave() { }
    periodic(delta) { }
}
class AboutMePage extends Page {
    get id() {
        return "about-me";
    }
    get hash() {
        return "about-me";
    }
    headerElem;
    headerSpanElems;
    jiggleControllers;
    constructor() {
        super();
        const elem = this.elem.querySelector(":scope > h1");
        if (!(elem instanceof HTMLElement))
            throw new Error(`AboutMePage Element ":scope > h1" not found`);
        this.headerElem = elem;
        this.headerSpanElems = [];
        this.jiggleControllers = [];
        this.headerElem.querySelectorAll(":scope > span").forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            this.headerSpanElems.push(elem);
            this.jiggleControllers.push(new JiggleController({}));
        });
        [
            ...this.elem.querySelectorAll(":scope > section.programming > section button"),
            ...this.elem.querySelectorAll(":scope > section.awards > section button"),
        ].forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            bindClickHoverJiggle(elem, {
                periodic: (clickController, hoverController) => {
                    let [x, y] = getXYScale(clickController, hoverController);
                    elem.style.transform = `scale(${x}, ${y})`;
                },
            });
        });
        const profileElem = this.elem.querySelector(":scope > section.art > p > span > span:has(> img)");
        if (profileElem instanceof HTMLElement) {
            bindClickHoverJiggle(profileElem, {
                periodic: (clickController, hoverController) => {
                    let [x, y] = getXYScale(clickController, hoverController, 0.25, 0.5);
                    profileElem.style.transform = `scale(${x}, ${y})`;
                },
            });
        }
    }
    onEnter() {
        this.jiggleControllers.forEach((controller, layerI) => {
            setTimeout(() => {
                controller.wantedValue = 1;
            }, 0.1 * 1000 * layerI);
        });
    }
    onLeave() {
        this.jiggleControllers.forEach((controller) => {
            controller.wantedValue = 0;
        });
    }
    periodic(delta) {
        this.jiggleControllers.forEach((controller, layerI) => {
            controller.update(delta);
            const spanElem = this.headerSpanElems[layerI];
            let x = controller.getScale(0.5);
            spanElem.style.transform = `var(--transform) scaleX(${x})`;
        });
    }
}
class ActivitiesPage extends Page {
    get id() {
        return "activities";
    }
    get hash() {
        return "activities";
    }
    headerElem;
    headerSpanElems;
    jiggleControllers;
    navButtons;
    _navPage;
    constructor() {
        super();
        const elem = this.elem.querySelector(":scope > h1");
        if (!(elem instanceof HTMLElement))
            throw new Error(`AboutMePage Element ":scope > h1" not found`);
        this.headerElem = elem;
        this.headerSpanElems = [];
        this.jiggleControllers = [];
        this.headerElem.querySelectorAll(":scope > span").forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            this.headerSpanElems.push(elem);
            this.jiggleControllers.push(new JiggleController({}));
        });
        this.navButtons = {};
        this._navPage = "";
        this.elem
            .querySelectorAll(":scope > section > nav button")
            .forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            const page = (elem.textContent ?? "").toLowerCase();
            this.navButtons[page] = elem;
            elem.addEventListener("click", (e) => {
                this.navPage = page;
            });
            new MutationObserver(() => {
                if (elem.classList.contains("this")) {
                    config.hoverOut = 1.5;
                    config.hoverIn = 1.75;
                }
                else {
                    config.hoverOut = undefined;
                    config.hoverIn = undefined;
                }
                elem.dispatchEvent(new Event("mouseenter"));
                elem.dispatchEvent(new Event("mouseleave"));
            }).observe(elem, {
                attributes: true,
                attributeFilter: ["class"],
            });
            const config = {
                periodic: (clickController, hoverController) => {
                    let [x, y] = getXYScale(clickController, hoverController);
                    elem.style.transform = `scale(${x}, ${y})`;
                },
            };
            bindClickHoverJiggle(elem, config);
        });
    }
    get navPage() {
        return this._navPage;
    }
    set navPage(page) {
        if (Object.keys(this.navButtons).length <= 0) {
            this._navPage = "";
            return;
        }
        if (!(page in this.navButtons))
            page = Object.keys(this.navButtons)[0];
        if (this._navPage === page)
            return;
        this._navPage = page;
        for (const [page, elem] of Object.entries(this.navButtons)) {
            if (page === this.navPage)
                elem.classList.add("this");
            else
                elem.classList.remove("this");
        }
        this.elem
            .querySelectorAll(":scope > section > section > section")
            .forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            if (elem.classList.contains(this.navPage))
                elem.classList.add("this");
            else
                elem.classList.remove("this");
        });
    }
    onEnter() {
        this.jiggleControllers.forEach((controller, layerI) => {
            setTimeout(() => {
                controller.wantedValue = 1;
            }, 0.1 * 1000 * layerI);
        });
        this.navPage = this.navPage;
    }
    onLeave() {
        this.jiggleControllers.forEach((controller) => {
            controller.wantedValue = 0;
        });
    }
    periodic(delta) {
        this.jiggleControllers.forEach((controller, layerI) => {
            controller.update(delta);
            const spanElem = this.headerSpanElems[layerI];
            let x = controller.getScale(0.5);
            spanElem.style.transform = `var(--transform) scaleX(${x})`;
        });
    }
}
class ProjectsPage extends Page {
    get id() {
        return "projects";
    }
    get hash() {
        return "projects";
    }
    headerElem;
    headerSpanElems;
    jiggleControllers;
    constructor() {
        super();
        const elem = this.elem.querySelector(":scope > h1");
        if (!(elem instanceof HTMLElement))
            throw new Error(`AboutMePage Element ":scope > h1" not found`);
        this.headerElem = elem;
        this.headerSpanElems = [];
        this.jiggleControllers = [];
        this.headerElem.querySelectorAll(":scope > span").forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            this.headerSpanElems.push(elem);
            this.jiggleControllers.push(new JiggleController({}));
        });
        this.elem
            .querySelectorAll(":scope > section.featured > section > section.img > span")
            .forEach((elem) => {
            if (!(elem instanceof HTMLElement))
                return;
            bindClickHoverJiggle(elem, {
                periodic: (clickController, hoverController) => {
                    let [x, y] = getXYScale(clickController, hoverController, 0.25, 0.5);
                    elem.style.transform = `scale(${x}, ${y})`;
                },
            });
        });
    }
    onEnter() {
        this.jiggleControllers.forEach((controller, layerI) => {
            setTimeout(() => {
                controller.wantedValue = 1;
            }, 0.1 * 1000 * layerI);
        });
    }
    onLeave() {
        this.jiggleControllers.forEach((controller) => {
            controller.wantedValue = 0;
        });
    }
    periodic(delta) {
        this.jiggleControllers.forEach((controller, layerI) => {
            controller.update(delta);
            const spanElem = this.headerSpanElems[layerI];
            let x = controller.getScale(0.5);
            spanElem.style.transform = `var(--transform) scaleX(${x})`;
        });
    }
}
App.instance;
