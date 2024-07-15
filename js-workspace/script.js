const eInfo = document.getElementById("info");
const eCanvas = document.getElementById("canvas");
const eOffCanvas = eCanvas.transferControlToOffscreen();
const worker = new Worker("./workerscript.js", { type: "module" });
worker.postMessage({ type: "start", data: { eCanvas: eOffCanvas } }, [eOffCanvas]);
let down = false, prevMouse = [0, 0], mouse = [0, 0], channels = [true, true, true], shift = false, alt = false;
eCanvas.addEventListener("mousedown", e => (down = true));
eCanvas.addEventListener("mouseup", e => (down = false));
eCanvas.addEventListener("mousemove", e => ([prevMouse, mouse] = [mouse, [e.offsetX, e.offsetY]]));
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
};
update();
