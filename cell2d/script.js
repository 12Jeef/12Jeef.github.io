const eInfo = document.getElementById("info");

const ePen = document.getElementById("pen");
const ePenValue = document.getElementById("pen-value");

const eCanvas = document.getElementById("main");
const eOffCanvas = eCanvas.transferControlToOffscreen();

const eCanvas2 = document.getElementById("meter");
const eOffCanvas2 = eCanvas2.transferControlToOffscreen();

const worker = new Worker("./workerscript-heart.js", { type: "module" });
worker.postMessage({ type: "start", data: { eCanvas: eOffCanvas, eCanvas2: eOffCanvas2 } }, [eOffCanvas, eOffCanvas2]);

let meter = [20, 20];
const updateMeter = () => {
    worker.postMessage({ type: "meter", data: meter });
};
updateMeter();
const updatePen = () => {
    worker.postMessage({ type: "pen", data: ePen.value });
    ePenValue.textContent = ePen.value;
};
ePen.addEventListener("input", updatePen);
updatePen();

let down = false, prevMouse = [0, 0], mouse = [0, 0], channels = [true, true, true], shift = false, alt = false, keyM = false;
eCanvas.addEventListener("mousedown", e => (down = true));
eCanvas.addEventListener("mouseup", e => (down = false));
eCanvas.addEventListener("mousemove", e => {
    let pos = [e.offsetX, e.offsetY];
    let r = eCanvas.getBoundingClientRect();
    pos[0] *= eCanvas.width / r.width;
    pos[1] *= eCanvas.height / r.height;
    [prevMouse, mouse] = [mouse, pos];
});
document.body.addEventListener("keydown", e => {
    if (e.code.startsWith("Digit")) {
        const digit = parseInt(e.code.slice("Digit".length)) - 1;
        if (digit < 0) return;
        if (digit > channels.length) return;
        if (e.shiftKey) {
            channels.fill(false);
            channels[digit] = true;
        } else {
            channels[digit] = !channels[digit];
        }
        return;
    }
    if (e.code.startsWith("Shift")) {
        shift = true;
        return;
    }
    if (e.code.startsWith("Alt")) {
        alt = true;
        return;
    }
    if (e.code == "KeyM") {
        keyM = true;
        return;
    }
});
document.body.addEventListener("keyup", e => {
    if (e.code.startsWith("Shift")) {
        shift = false;
        return;
    }
    if (e.code.startsWith("Alt")) {
        alt = false;
        return;
    }
    if (e.code == "KeyM") {
        keyM = false;
        return;
    }
});

const update = () => {
    window.requestAnimationFrame(update);
    eInfo.textContent = channels.map((v, i) => v ? "RGB"[i] : "").join("");
    if (down) {
        let i = [];
        channels.forEach((v, j) => {
            if (!v) return;
            i.push(j);
        })
        if (shift)
            worker.postMessage({ type: "move", data: { pos: mouse, shift: [mouse[0] - prevMouse[0], mouse[1] - prevMouse[1]], i: i }});
        else if (alt)
            worker.postMessage({ type: "erase", data: { pos: mouse, i: i }});
        else
            worker.postMessage({ type: "draw", data: { pos: mouse, i: i } });
    }
    if (keyM) {
        meter = [...mouse].map(v => Math.round(v));
        updateMeter();
    }
};
update();
