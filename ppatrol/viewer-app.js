import * as util from "./util.js";
import { V } from "./util.js";

import { Match, fieldSize } from "./data.js";


function sortScouter(a, b) {
    let roleA = ["scouter", "other", "dev"].indexOf(String(a.role).split("-")[0]);
    let roleB = ["scouter", "other", "dev"].indexOf(String(b.role).split("-")[0]);
    if (roleA < roleB) return -1;
    if (roleB < roleA) return +1;
    let nameA = String(a.name);
    let nameB = String(b.name);
    if (nameA < nameB) return -1;
    if (nameB < nameA) return +1;
    return 0;
}


function mean(data, def=0) {
    if (data.length <= 0) return def;
    return data.sum() / data.length;
}
function median(data, def=0) {
    if (data.length <= 0) return def;
    data = [...data].sort((a, b) => a-b);
    let l = Math.floor(data.length/2);
    if (data.length % 2 == 0)
        return (data[l]+data[l-1])/2;
    return data[l];
}
function mode(data, def=0) {
    if (data.length <= 0) return def;
    let map = new Map();
    let n = 0;
    data.forEach(v => {
        if (!map.has(v)) map.set(v, 0);
        map.set(v, map.get(v)+1);
        n = Math.max(n, map.get(v));
    });
    data = data.filter(v => map.get(v) == n);
    return median(data, def);
}

function determineYN(text) {
    text = String(text).toLowerCase();
    if (["yes", "ye", "y", "ys", "es", "true", "1", "mhm", "ofc", "yep", "yp"].includes(text)) return true;
    if (["no", "n", "o", "not", "false", "0", "nuh", "nope", "nop", "np"].includes(text)) return false;
    return null;
}
function determineNumber(text) {
    text = String(text);
    text = text.split("").filter(c => util.NUMBERS.includes(c)).join("");
    return parseFloat(text);
}
function determineText(text) {
    text = String(text).split("|")[0].toLowerCase();
    let parts = [""];
    for (let c of text) {
        if (!(util.ALPHABETLOWER+util.NUMBERS).includes(c)) {
            parts.push("");
            continue;
        }
        parts[parts.length-1] += c;
    }
    parts = parts.filter(part => part.length > 0);
    return parts.join("-");
}
function determineDimensions(text) {
    text = String(text).toLowerCase();
    for (let split of ["x", "-", "by", "+", "/", ":", ".", ","]) {
        let parts = text.split(split);
        if (parts.length != 2) continue;
        return parts.map(part => determineNumber(part));
    }
    return [NaN, NaN];
}
const pitQueries = {
    "pit-scouter": {
        type: "raw",
    },
    "team-number": {
        type: "number",
        fail: "N/A",
    },
    "drive-type": {
        type: "text",
        values: ["wcd", "mechanum", "swerve"],
    },
    "speaker-scoring-range": {
        type: "text",
        values: ["none", "subwoofer", "podium", "wing", "center-line"],
    },
    "amp": {
        type: "yn",
    },
    "trap": {
        type: "yn",
    },
    "under-stage": {
        type: "yn",
    },
    "climb": {
        type: "yn",
    },
    "climb-time": {
        type: "number",
    },
    "can-harmonize": {
        type: "yn",
    },
    "intake-mechanism": {
        type: "raw",
    },
    "pickup-method": {
        type: "raw",
    },
    "shooter-mechanism": {
        type: "raw",
    },
    "chassis-dimensions": {
        type: "dimensions",
        fail: "N/A",
    },
    "weight": {
        type: "number",
        fail: "N/A",
    },
    "vision": {
        type: "raw",
    },
    "number-of-cameras": {
        type: "number",
    },
    "vision-system": {
        type: "text",
        values: ["limelight", "photonvision", "custom"],
    },
    "auton-paths": {
        type: "raw",
    },
    "programming-language": {
        type: "raw",
    },
    "attitude": {
        type: "number-scale[1-5]",
    },
    "pit-organization": {
        type: "number-scale[1-5]",
    },
    "notes": {
        type: "raw",
    },
};


export default class App extends util.Target {
    #lock;

    get locked() { return this.#lock.state; }
    set locked(v) { this.#lock.state = !!v; }
    get unlocked() { return !this.locked; }
    set unlocked(v) { this.locked = !v; }
    lock() { return this.locked = true; }
    unlock() { return this.unlocked = true; }
    whenLocked() { return this.#lock.whenTrue(); }
    whenUnlocked() { return this.#lock.whenFalse(); }

    #matchesSkipped;

    get matchesSkipped() { return [...this.#matchesSkipped]; }
    set matchesSkipped(v) {
        v = util.ensure(v, "arr");
        this.clearSkippedMatches();
        this.addSkippedMatch(v);
    }
    clearSkippedMatches() {
        let matches = this.matchesSkipped;
        this.remSkippedMatch(matches);
        return matches;
    }
    hasSkippedMatch(k) { return this.#matchesSkipped.has(String(k)); }
    addSkippedMatch(...ks) {
        let r = util.Target.resultingForEach(ks, k => {
            k = String(k);
            if (this.hasSkippedMatch(k)) return false;
            this.#matchesSkipped.add(k);
            this.change("addSkippedMatch", null, k);
            return k;
        });
        this.saveMatchesSkipped();
        return r;
    }
    remSkippedMatch(...ks) {
        let r = util.Target.resultingForEach(ks, k => {
            k = String(k);
            if (!this.hasSkippedMatch(k)) return false;
            this.#matchesSkipped.delete(k);
            this.change("remSkippedMatch", k, null);
            return k;
        });
        this.saveMatchesSkipped();
        return r;
    }
    loadMatchesSkipped() {
        let matches = null;
        try {
            matches = JSON.parse(localStorage.getItem("matches-skipped"));
        } catch (e) {}
        this.matchesSkipped = matches;
    }
    saveMatchesSkipped() {
        localStorage.setItem("matches-skipped", JSON.stringify(this.matchesSkipped));
    }

    #team;
    get team() { return this.#team; }
    set team(v) {
        v = (v == null) ? null : Math.max(0, util.ensure(v, "int"));
        if (this.team == v) return;
        this.change("team", this.team, this.#team=v);
        this.saveTeam();
    }
    hasTeam() { return this.team != null; }
    loadTeam() {
        let team = null;
        try {
            team = JSON.parse(localStorage.getItem("team"));
        } catch (e) {}
        this.team = team;
    }
    saveTeam() {
        localStorage.setItem("team", JSON.stringify(this.team));
    }

    #hotswaps;
    get hotswaps() {
        let hotswaps = {};
        for (let i in this.#hotswaps)
            hotswaps[i] = this.#hotswaps[i];
        return hotswaps;
    }
    set hotswaps(v) {
        v = util.ensure(v, "obj");
        this.clearHotswaps();
        for (let i in v) this.setHotswap(i, v[i]);
    }
    clearHotswaps() {
        let hotswaps = this.hotswaps;
        for (let i in hotswaps) this.delHotswap(i);
        return hotswaps;
    }
    hasHotswap(i) { return i in this.#hotswaps; }
    getHotswap(i) {
        if (!this.hasHotswap(i)) return null;
        return this.#hotswaps[i];
    }
    setHotswap(i, team) {
        team = Math.max(0, util.ensure(team, "int"));
        if (this.getHotswap(i) == team) return team;
        [team, this.#hotswaps[i]] = [this.#hotswaps[i], team];
        this.change("setHotswap", team, this.#hotswaps[i]);
        this.saveHotswaps();
        return this.#hotswaps[i];
    }
    delHotswap(i) {
        if (!this.hasHotswap(i)) return null;
        let team = this.getHotswap(i);
        delete this.#hotswaps[i];
        this.change("delHotswap", team, null);
        this.saveHotswaps();
        return team;
    }
    loadHotswaps() {
        let hotswaps = null;
        try {
            hotswaps = JSON.parse(localStorage.getItem("hotswaps"));
        } catch (e) {}
        this.hotswaps = hotswaps;
    }
    saveHotswaps() {
        localStorage.setItem("hotswaps", JSON.stringify(this.hotswaps));
    }

    #qual;

    get qual() { return this.#qual; }
    set qual(v) {
        v = (v == null) ? null : Math.max(0, util.ensure(v, "int"));
        if (this.qual == v) return;
        this.change("qual", this.qual, this.#qual=v);
        this.saveQual();
    }
    hasQual() { return this.qual != null; }
    loadQual() {
        let qual = null;
        try {
            qual = JSON.parse(localStorage.getItem("qual"));
        } catch (e) {}
        this.qual = qual;
    }
    saveQual() {
        localStorage.setItem("qual", JSON.stringify(this.qual));
    }

    #teams;

    get teams() { return [...this.#teams]; }
    set teams(v) {
        v = util.ensure(v, "arr");
        for (let i = 0; i < 6; i++) this.setTeam(i, v[i]);
    }
    getTeam(i) {
        i = util.ensure(i, "int", -1);
        if (i < 0 || i >= 6) return null;
        return this.#teams[i];
    }
    setTeam(i, v) {
        i = util.ensure(i, "int", -1);
        if (i < 0 || i >= 6) return null;
        v = (v == null) ? null : Math.max(0, util.ensure(v, "int"));
        if (this.getTeam(i) == v) return v;
        [v, this.#teams[i]] = [this.getTeam(i), v];
        this.change("teams", v, this.getTeam(i));
        this.saveTeams();
        return this.getTeam(i);
    }
    loadTeams() {
        let teams = null;
        try {
            teams = JSON.parse(localStorage.getItem("teams"));
        } catch (e) {}
        this.teams = teams;
    }
    saveTeams() {
        localStorage.setItem("teams", JSON.stringify(this.teams));
    }

    #simulated;

    get simulated() { return this.#simulated; }
    set simulated(v) {
        v = !!v;
        if (this.simulated == v) return;
        this.change("simulated", this.simulated, this.#simulated=v);
        this.saveSimulated();
    }
    loadSimulated() {
        let simulated = null;
        try {
            simulated = JSON.parse(localStorage.getItem("simulated"));
        } catch (e) {}
        this.simulated = simulated;
    }
    saveSimulated() {
        localStorage.setItem("simulated", JSON.stringify(this.simulated));
    }

    #path;

    get path() { return this.#path; }
    set path(v) {
        v = util.ensure(v, "str");
        if (this.path == v) return;
        this.change("path", this.path, this.#path=v);
        this.savePath();
    }
    loadPath() {
        let path = null;
        try {
            path = JSON.parse(localStorage.getItem("path"));
        } catch (e) {}
        this.path = path;
    }
    savePath() {
        localStorage.setItem("path", JSON.stringify(this.path));
    }

    constructor() {
        super();

        this.#lock = new util.Resolver(false);
        this.#lock.addHandler("change-state", (f, t) => {
            this.change("lock-state", f, t);
            if (t) this.post("lock");
            else this.post("unlock");
        });
        this.#matchesSkipped = new Set();
        this.loadMatchesSkipped();
        this.#team = null;
        this.loadTeam();
        this.#hotswaps = {};
        this.loadHotswaps();
        this.#qual = null;
        this.loadQual();
        this.#teams = new Array(6).fill(null);
        this.loadTeams();
        this.#simulated = true;
        this.loadSimulated();
        this.#path = "";
        this.loadPath();

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

        let pwd = localStorage.getItem("pwd");
        if (pwd == null) {
            let v = prompt("Password:");
            if (v != null) localStorage.setItem("pwd", pwd = (v.length <= 0) ? null : v);
        }

        let apiKey = null;
        let eventKey = null;
        let scouters = [];
        let event = {};
        let eventRatings = {};
        let matches = {};
        let teams = [];
        let matchesScouted = [];
        let pitData = {};
        let pickList = [];

        const getBufferStr = match => {
            if ("k" in match) return match.k;
            match.k = Match.toBufferStr(match);
            return getBufferStr(match);
        };
        const getSkipped = match => {
            // return false;
            let k = getBufferStr(match);
            // if (match.id < 0)
                // return !this.hasSkippedMatch(k);
            return this.hasSkippedMatch(k);
        };

        const getTBAMatch = match => {
            if ((match.id+1) in matches) return matches[match.id+1];
            return null;
        };
        const getAutoMobility = match => {
            let tbamatch = getTBAMatch(match);
            if (tbamatch == null) return false;
            let teams = [
                ...tbamatch.alliances.red.team_keys.map(key => parseInt(key.substring(3))),
                ...tbamatch.alliances.blue.team_keys.map(key => parseInt(key.substring(3))),
            ];
            let values = [
                ...Array.from(new Array(3).keys()).map(i => ["No", "Yes"].indexOf(tbamatch.score_breakdown.red["autoLineRobot"+(i+1)])),
                ...Array.from(new Array(3).keys()).map(i => ["No", "Yes"].indexOf(tbamatch.score_breakdown.blue["autoLineRobot"+(i+1)])),
            ];
            if (!teams.includes(match.robot)) return false;
            let state = values[teams.indexOf(match.robot)];
            if (state < 0) return false;
            return [false, true][state];
        };
        const getEndgameClimb = match => {
            let safe = false;
            let pos = 0, tsMin = null, tsMax = null;
            match.teleopFrames.forEach(frame => {
                if (frame.type != "climb") return;
                pos = frame.state;
                tsMin = (tsMin == null) ? frame.ts : Math.min(tsMin, frame.ts);
                tsMax = (tsMax == null) ? frame.ts : Math.max(tsMax, frame.ts);
            });
            let tbamatch = getTBAMatch(match);
            if (tbamatch != null) {
                let teams = [
                    ...tbamatch.alliances.red.team_keys.map(key => parseInt(key.substring(3))),
                    ...tbamatch.alliances.blue.team_keys.map(key => parseInt(key.substring(3))),
                ];
                let values = [
                    ...Array.from(new Array(3).keys()).map(i => ["None", "Parked", "Onstage"].indexOf(tbamatch.score_breakdown.red["endGameRobot"+(i+1)])),
                    ...Array.from(new Array(3).keys()).map(i => ["None", "Parked", "Onstage"].indexOf(tbamatch.score_breakdown.blue["endGameRobot"+(i+1)])),
                ];
                if (teams.includes(match.robot)) {
                    let pos2 = values[teams.indexOf(match.robot)];;
                    if (pos2 >= 0) {
                        safe = true;
                        pos = pos2;
                    }
                }
            }
            return {
                state: pos,
                safe: safe,
                start: tsMin,
                stop: tsMax,
                len: (util.is(tsMin, "num") && util.is(tsMax, "num")) ? tsMax-tsMin : null,
            };
        };
        const getDisablePeriods = match => {
            let periods = [];
            match.globalFrames.forEach((frame, i) => {
                if (!frame.state) return;
                if (i+1 < match.globalFrames.length)
                    return periods.push({
                        start: frames.ts,
                        stop: match.globalFrames[i+1].ts,
                        len: match.globalFrames[i+1].ts-frame.ts,
                    });
                periods.push({
                    start: frame.ts,
                    stop: match.finishTime,
                    len: match.finishTime-frame.ts,
                });
            });
            return periods;
        };
        const getCyclePeriods = match => {
            let times = [];
            match.teleopFrames.forEach(frame => {
                if (!["speaker", "amp"].includes(frame.type)) return;
                times.push(frame.ts);
            });
            let periods = [];
            times.forEach((t, i) => {
                if (i <= 0) return;
                periods.push({
                    start: times[i-1],
                    stop: t,
                    len: t-times[i-1],
                });
            });
            return periods;
        };

        const computeAutoPickups = match => {
            let data = { success: 0, fail: 0, total: 0 };
            match.autoFrames.forEach(frame => {
                if (frame.type != "pickup") return;
                data.total++;
                if (frame.state.value)
                    data.success++;
                else data.fail++;
            });
            return data;
        };
        const computeAutoScores = match => {
            let data = {
                speaker: { success: 0, fail: 0, total: 0, score: 0 },
                amp: { success: 0, fail: 0, total: 0, score: 0 },
                success: 0, fail: 0, total: 0, score: 0,
            };
            match.autoFrames.forEach(frame => {
                if (!(frame.type in data)) return;
                data.total++;
                data[frame.type].total++;
                if (frame.state) {
                    data.success++;
                    data[frame.type].success++;

                    data.score += { speaker: 5, amp: 2 }[frame.type];
                    data[frame.type].score += { speaker: 5, amp: 2 }[frame.type];
                } else {
                    data.fail++;
                    data[frame.type].fail++;
                }
            });
            return data;
        };
        const computeAutoMobility = match => {
            let mobility = getAutoMobility(match);
            let data = { state: mobility, score: (!!mobility)*2 };
            return data;
        };
        const computeAuto = match => {
            let pickups = computeAutoPickups(match);
            let scores = computeAutoScores(match);
            let mobility = computeAutoMobility(match);
            return {
                pickups: pickups,
                scores: scores,
                mobility: mobility,
                score: scores.score+mobility.score,
            };
        };
        const computeTeleopPickups = match => {
            let data = {
                source: { success: 0, fail: 0, total: 0 },
                ground: { success: 0, fail: 0, total: 0 },
                success: 0, fail: 0, total: 0,
            };
            match.teleopFrames.forEach(frame => {
                if (!(frame.type in data)) return;
                data.total++;
                data[frame.type].total++;
                if (frame.state) {
                    data.success++;
                    data[frame.type].success++;
                } else {
                    data.fail++;
                    data[frame.type].fail++;
                }
            });
            return data;
        };
        const computeTeleopScores = match => {
            let data = {
                speaker: { success: 0, fail: 0, total: 0, score: 0 },
                amp: { success: 0, fail: 0, total: 0, score: 0 },
                success: 0, fail: 0, total: 0, score: 0,
            };
            match.teleopFrames.forEach(frame => {
                if (!(frame.type in data)) return;
                data.total++;
                data[frame.type].total++;
                if ((frame.type == "speaker") ? frame.state.value : frame.state) {
                    data.success++;
                    data[frame.type].success++;

                data.score += { speaker: 2, amp: 1 }[frame.type];
                data[frame.type].score += { speaker: 2, amp: 1 }[frame.type];
                } else {
                    data.fail++;
                    data[frame.type].fail++;
                }
            });
            return data;
        };
        const computeTeleop = match => {
            let pickups = computeTeleopPickups(match);
            let scores = computeTeleopScores(match);
            return {
                pickups: pickups,
                scores: scores,
                score: scores.score,
            };
        };
        const computeEndgameClimb = match => {
            let data = {
                climb: getEndgameClimb(match),
                harmony: { state: false, score: 0 },
                score: 0,
            };
            data.climb.score = [0, 1, 3][data.climb.state];
            data.harmony.state = !!match.endgameHarmony;
            data.harmony.score += data.harmony.state * 2;
            data.score += data.climb.score + data.harmony.score;
            return data;
        };
        const computeEndgameTrap = match => {
            let data = { state: !!match.endgameTrap, score: (!!match.endgameTrap)*5 };
            return data;
        };
        const computeEndgame = match => {
            let climb = computeEndgameClimb(match);
            let trap = computeEndgameTrap(match);
            return {
                climb: climb,
                trap: trap,
                score: climb.score+trap.score,
            };
        };
        const computeMatch = match => {
            let auto = computeAuto(match);
            let teleop = computeTeleop(match);
            let pickups = {
                source: {
                    success: teleop.pickups.source.success,
                    fail: teleop.pickups.source.fail,
                    total: teleop.pickups.source.total,
                },
                ground: {
                    success: auto.pickups.success+teleop.pickups.ground.success,
                    fail: auto.pickups.fail+teleop.pickups.ground.fail,
                    total: auto.pickups.total+teleop.pickups.ground.total,
                },
            };
            pickups.success = Object.values(pickups).map(v => v.success || 0).sum();
            pickups.fail = Object.values(pickups).map(v => v.fail || 0).sum();
            pickups.total = Object.values(pickups).map(v => v.total || 0).sum();
            let scores = {
                speaker: {
                    success: auto.scores.speaker.success+teleop.scores.speaker.success,
                    fail: auto.scores.speaker.fail+teleop.scores.speaker.fail,
                    total: auto.scores.speaker.total+teleop.scores.speaker.total,
                    score: auto.scores.speaker.score+teleop.scores.speaker.score,
                },
                amp: {
                    success: auto.scores.amp.success+teleop.scores.amp.success,
                    fail: auto.scores.amp.fail+teleop.scores.amp.fail,
                    total: auto.scores.amp.total+teleop.scores.amp.total,
                    score: auto.scores.amp.score+teleop.scores.amp.score,
                },
            };
            scores.success = Object.values(scores).map(v => v.success || 0).sum();
            scores.fail = Object.values(scores).map(v => v.fail || 0).sum();
            scores.total = Object.values(scores).map(v => v.total || 0).sum();
            scores.score = Object.values(scores).map(v => v.score || 0).sum();
            let endgame = computeEndgame(match);
            return {
                auto: auto,
                teleop: teleop,
                pickups: pickups,
                scores: scores,
                endgame: endgame,
                score: auto.score+teleop.score+endgame.score,
            };
        };
        const computeDisableTime = (...matches) => {
            let periods = [];
            util.Target.resultingForEach(matches, match => periods.push(...getDisablePeriods(match).map(period => period.len)));
            return median(periods);
        };
        const computeCycleTime = (...matches) => {
            let periods = [];
            util.Target.resultingForEach(matches, match => periods.push(...getCyclePeriods(match).map(period => period.len)));
            return median(periods);
        };
        const computeFullMatch = match => {
            let data = computeMatch(match);
            data.disable = computeDisableTime(match);
            data.cycle = computeCycleTime(match);
            return data;
        };

        const computeScouted = team => {
            let n1 = 0, n2 = 0, m = 0;
            matchesScouted.forEach(match => {
                if (match.robot != team) return;
                if (getSkipped(match)) return;
                if (getTBAMatch(match) == null) n2++;
                else n1++;
            });
            Object.values(matches).forEach(match => {
                let data = [
                    ...match.alliances.red.team_keys.map(key => parseInt(key.substring(3))),
                    ...match.alliances.blue.team_keys.map(key => parseInt(key.substring(3))),
                ];
                if (!data.includes(team)) return;
                m++;
            });
            return { scouted: n1, extra: n2, total: m };
        };
        const computeTeam = team => {
            const matches = matchesScouted.filter(match => {
                if (match.robot != team) return false;
                if (getSkipped(match)) return false;
                return true;
            });
            const comps = matches.map(match => computeFullMatch(match));

            let preloaded = {
                states: matches.map(match => !!match.preloaded),
            };
            preloaded.percent = (preloaded.states.length > 0) ? (preloaded.states.map(v => +!!v).sum() / preloaded.states.length) : null;

            let auto = {
                pickups: {
                    successes: comps.map(comp => comp.auto.pickups.success),
                    fails: comps.map(comp => comp.auto.pickups.fail),
                },
                scores: {
                    speaker: {
                        successes: comps.map(comp => comp.auto.scores.speaker.success),
                        fails: comps.map(comp => comp.auto.scores.speaker.fail),
                        scores: comps.map(comp => comp.auto.scores.speaker.score),
                    },
                    amp: {
                        successes: comps.map(comp => comp.auto.scores.amp.success),
                        fails: comps.map(comp => comp.auto.scores.amp.fail),
                        scores: comps.map(comp => comp.auto.scores.amp.score),
                    },
                },
                mobility: {
                    states: comps.map(comp => comp.auto.mobility.state),
                    scores: comps.map(comp => comp.auto.mobility.score),
                },
            };

            auto.pickups.success = median(auto.pickups.successes);
            auto.pickups.fail = median(auto.pickups.fails);
            auto.pickups.total = auto.pickups.success + auto.pickups.fail;

            auto.scores.speaker.success = median(auto.scores.speaker.successes);
            auto.scores.speaker.fail = median(auto.scores.speaker.fails);
            auto.scores.speaker.total = auto.scores.speaker.success + auto.scores.speaker.fail;
            auto.scores.speaker.score = median(auto.scores.speaker.scores);

            auto.scores.amp.success = median(auto.scores.amp.successes);
            auto.scores.amp.fail = median(auto.scores.amp.fails);
            auto.scores.amp.total = auto.scores.amp.success + auto.scores.amp.fail;
            auto.scores.amp.score = median(auto.scores.amp.scores);

            auto.scores.success = auto.scores.speaker.success + auto.scores.amp.success;
            auto.scores.fail = auto.scores.speaker.fail + auto.scores.amp.fail;
            auto.scores.total = auto.scores.success + auto.scores.fail;
            auto.scores.score = auto.scores.speaker.score + auto.scores.amp.score;

            auto.mobility.percent = (auto.mobility.states.length > 0) ? (auto.mobility.states.map(v => +!!v).sum() / auto.mobility.states.length) : null;
            auto.mobility.score = median(auto.mobility.scores);

            auto.score = auto.scores.score + auto.mobility.score;

            let teleop = {
                pickups: {
                    source: {
                        successes: comps.map(comp => comp.teleop.pickups.source.success),
                        fails: comps.map(comp => comp.teleop.pickups.source.fail),
                    },
                    ground: {
                        successes: comps.map(comp => comp.teleop.pickups.ground.success),
                        fails: comps.map(comp => comp.teleop.pickups.ground.fail),
                        scores: comps.map(comp => comp.teleop.scores.speaker.score),
                    },
                },
                scores: {
                    speaker: {
                        successes: comps.map(comp => comp.teleop.scores.speaker.success),
                        fails: comps.map(comp => comp.teleop.scores.speaker.fail),
                        scores: comps.map(comp => comp.teleop.scores.speaker.score),
                    },
                    amp: {
                        successes: comps.map(comp => comp.teleop.scores.amp.success),
                        fails: comps.map(comp => comp.teleop.scores.amp.fail),
                        scores: comps.map(comp => comp.teleop.scores.amp.score),
                    },
                },
            };

            teleop.pickups.source.success = median(teleop.pickups.source.successes);
            teleop.pickups.source.fail = median(teleop.pickups.source.fails);
            teleop.pickups.source.total = teleop.pickups.source.success + teleop.pickups.source.fail;

            teleop.pickups.ground.success = median(teleop.pickups.ground.successes);
            teleop.pickups.ground.fail = median(teleop.pickups.ground.fails);
            teleop.pickups.ground.total = teleop.pickups.ground.success + teleop.pickups.ground.fail;

            teleop.pickups.success = teleop.pickups.source.success + teleop.pickups.ground.success;
            teleop.pickups.fail = teleop.pickups.source.fail + teleop.pickups.ground.fail;
            teleop.pickups.total = teleop.pickups.success + teleop.pickups.fail;

            teleop.scores.speaker.success = median(teleop.scores.speaker.successes);
            teleop.scores.speaker.fail = median(teleop.scores.speaker.fails);
            teleop.scores.speaker.total = teleop.scores.speaker.success + teleop.scores.speaker.fail;
            teleop.scores.speaker.score = median(teleop.scores.speaker.scores);

            teleop.scores.amp.success = median(teleop.scores.amp.successes);
            teleop.scores.amp.fail = median(teleop.scores.amp.fails);
            teleop.scores.amp.total = teleop.scores.amp.success + teleop.scores.amp.fail;
            teleop.scores.amp.score = median(teleop.scores.amp.scores);

            teleop.scores.success = teleop.scores.speaker.success + teleop.scores.amp.success;
            teleop.scores.fail = teleop.scores.speaker.fail + teleop.scores.amp.fail;
            teleop.scores.total = teleop.scores.success + teleop.scores.fail;
            teleop.scores.score = teleop.scores.speaker.score + teleop.scores.amp.score;

            teleop.score = teleop.scores.score;

            let pickups = {
                source: {
                    success: teleop.pickups.source.success,
                    fail: teleop.pickups.source.fail,
                    total: teleop.pickups.source.total,
                },
                ground: {
                    success: auto.pickups.success+teleop.pickups.ground.success,
                    fail: auto.pickups.fail+teleop.pickups.ground.fail,
                    total: auto.pickups.total+teleop.pickups.ground.total,
                },
            };
            pickups.success = pickups.source.success + pickups.ground.success;
            pickups.fail = pickups.source.fail + pickups.ground.fail;
            pickups.total = pickups.success + pickups.fail;
            let scores = {
                speaker: {
                    success: auto.scores.speaker.success+teleop.scores.speaker.success,
                    fail: auto.scores.speaker.fail+teleop.scores.speaker.fail,
                    total: auto.scores.speaker.total+teleop.scores.speaker.total,
                    score: auto.scores.speaker.score+teleop.scores.speaker.score,
                },
                amp: {
                    success: auto.scores.amp.success+teleop.scores.amp.success,
                    fail: auto.scores.amp.fail+teleop.scores.amp.fail,
                    total: auto.scores.amp.total+teleop.scores.amp.total,
                    score: auto.scores.amp.score+teleop.scores.amp.score,
                },
            };
            scores.success = scores.speaker.success + scores.amp.success;
            scores.fail = scores.speaker.fail + scores.amp.fail;
            scores.total = scores.success + scores.fail;
            scores.score = scores.speaker.score + scores.amp.score;

            let endgame = {
                climb: {
                    climb: {
                        count: [0, 0, 0],
                        lens: [[], [], []],
                        scores: comps.map(comp => comp.endgame.climb.climb.score),
                    },
                    harmony: {
                        states: comps.map(comp => comp.endgame.climb.harmony.state),
                        scores: comps.map(comp => comp.endgame.climb.harmony.score),
                    },
                },
                trap: {
                    states: comps.map(comp => comp.endgame.trap.state),
                    scores: comps.map(comp => comp.endgame.trap.score),
                },
            };
            comps.forEach(comp => {
                endgame.climb.climb.count[comp.endgame.climb.climb.state]++;
                endgame.climb.climb.lens[comp.endgame.climb.climb.state].push(comp.endgame.climb.climb.len);
            });
            endgame.climb.climb.len = endgame.climb.climb.lens.map(lens => median(lens));
            endgame.climb.climb.score = median(endgame.climb.climb.scores);
            endgame.climb.harmony.percent = (endgame.climb.harmony.states.length > 0) ? (endgame.climb.harmony.states.map(v => +!!v).sum() / endgame.climb.harmony.states.length) : null;
            endgame.climb.harmony.score = median(endgame.climb.harmony.scores);
            endgame.climb.score = endgame.climb.climb.score + endgame.climb.harmony.score;
            endgame.trap.percent = (endgame.trap.states.length > 0) ? (endgame.trap.states.map(v => +!!v).sum() / endgame.trap.states.length) : null;
            endgame.trap.score = median(endgame.trap.scores);
            endgame.score = endgame.climb.score + endgame.trap.score;

            return {
                preloaded: preloaded,
                auto: auto,
                teleop: teleop,
                pickups: pickups,
                scores: scores,
                endgame: endgame,
                score: auto.score+teleop.score+endgame.score,
                notes: matches.map(match => { return { from: match.scouter, note: match.notes }; }).filter(note => note.note.length > 0),
            };
        };
        const computeFullTeam = team => {
            let data = computeTeam(team);
            let disablePeriods = [];
            let cyclePeriods = [];
            matchesScouted.forEach(match => {
                if (match.robot != team) return;
                if (getSkipped(match)) return;
                disablePeriods.push(...getDisablePeriods(match).map(period => period.len));
                cyclePeriods.push(...getCyclePeriods(match).map(period => period.len));
            });
            data.disable = median(disablePeriods);
            data.cycle = median(cyclePeriods);
            return data;
        };

        const makeMatchListing = match => {
            const k = getBufferStr(match);
            const comp = computeFullMatch(match);
            const showMap = () => {
                let elems = [], elem;

                elem = document.createElement("h3");
                elems.push({ elem: elem, ts: -1 });
                elem.style.zIndex = 1;
                elem.style.position = "sticky";
                elem.style.top = "0%";
                elem.innerHTML = "<button success style='flex-basis:100%;'>Success</button><button fail style='flex-basis:100%;'>Fail</button><button style='flex-basis:100%;'>All</button><button><ion-icon name='arrow-back'></ion-icon></button><button><ion-icon name='arrow-forward'></ion-icon></button>";
                let mode = "success", modeBtns = [elem.children[0], elem.children[1], elem.children[2]];
                modeBtns[0].addEventListener("click", e => {
                    mode = "success";
                    update();
                });
                modeBtns[1].addEventListener("click", e => {
                    mode = "fail";
                    update();
                });
                modeBtns[2].addEventListener("click", e => {
                    mode = "all";
                    update();
                });
                const getIndex = () => {
                    for (let i = 1; i < elems.length; i++) {
                        if (i+1 >= elems.length) return i;
                        if (elems[i+1].ts <= fieldTS) continue;
                        return i;
                    }
                    return 1;
                };
                elem.children[3].addEventListener("click", e => {
                    let i = getIndex()-1;
                    i = Math.min(elems.length-1, Math.max(1, i));
                    if (i < 1 || i >= elems.length) return;
                    fieldTS = elems[i].ts;
                    openFieldPopup();
                });
                elem.children[4].addEventListener("click", e => {
                    let i = getIndex()+1;
                    i = Math.min(elems.length-1, Math.max(1, i));
                    if (i < 1 || i >= elems.length) return;
                    fieldTS = elems[i].ts;
                    openFieldPopup();
                });

                elem = document.createElement("h3");
                elems.push({ elem: elem, ts: 0 });
                elem.innerHTML = "<span></span><span></span>";
                elem.children[0].textContent = util.formatTime(0);
                elem.children[1].textContent = "Auto";

                match.autoFrames.forEach(frame => {
                    elem = document.createElement("button");
                    elems.push({ elem: elem, ts: frame.ts });
                    elem.innerHTML = "<span></span><span></span><span></span>";
                    elem.children[0].textContent = util.formatTime(frame.ts);
                    elem.children[1].setAttribute(frame.type, "");
                    let name = util.formatText(frame.type), value = frame.state;
                    if (frame.type == "pickup") {
                        name += " @ "+(value.at < 3 ? "Wing" : "Mid")+" "+(value.at < 3 ? value.at+1 : value.at-2);
                        value = value.value;
                    }
                    elem.children[2].textContent = name;
                    elem.style.borderRight = "0.5rem solid "+["var(--r4)", "var(--g4)"][+!!value];
                });

                elem = document.createElement("h3");
                elems.push({ elem: elem, ts: match.teleopTime });
                elem.innerHTML = "<span></span><span></span>";
                elem.children[0].textContent = util.formatTime(match.teleopTime);
                elem.children[1].textContent = "Teleop";

                match.teleopFrames.forEach(frame => {
                    elem = document.createElement("button");
                    elems.push({ elem: elem, ts: frame.ts });
                    elem.innerHTML = "<span></span><span></span><span></span>";
                    elem.children[0].textContent = util.formatTime(frame.ts);
                    elem.children[1].setAttribute(frame.type, "");
                    if (frame.type == "climb") {
                        elem.children[2].textContent = ["None", "Park", "Onstage"][frame.state];
                        return;
                    }
                    elem.children[2].textContent = util.formatText(frame.type);
                    let value = frame.state;
                    if (frame.type == "speaker") value = value.value;
                    elem.style.borderRight = "0.5rem solid "+["var(--r4)", "var(--g4)"][+!!value];
                });

                this.eFieldPopupNav.style.minWidth = "";
                this.eFieldPopupNav.style.maxWidth = "";
                this.eFieldPopupNav.innerHTML = "";
                elems.forEach(elem => {
                    this.eFieldPopupNav.appendChild(elem.elem);
                    if (elem.ts < 0) return;
                    elem.elem.addEventListener("click", e => (fieldTS = elem.ts));
                });
                let ts = null;
                let id = setInterval(() => {
                    if (ts != fieldTS) {
                        ts = fieldTS;
                        openFieldPopup();
                    }
                    let all = true;
                    for (let elem of elems) {
                        if (this.eFieldPopupNav.contains(elem.elem)) continue;
                        all = false;
                        break;
                    }
                    if (!all) return clearInterval(id);
                    elems.forEach((elem, i) => {
                        elem.elem.style.opacity = (elem.ts <= fieldTS) ? "" : "50%";
                        elem.elem.style.outline = ((elem.ts <= fieldTS) && (i+1 >= elems.length || elems[i+1].ts > fieldTS)) ? "0.1rem solid var(--fg)" : "";
                    });
                }, 100);

                const update = () => {
                    modeBtns.forEach(btn => btn.classList.remove("this"));
                    modeBtns[["success", "fail", "all"].indexOf(mode)].classList.add("this");
                    heatmapNodes = [
                        { color: new util.Color(255, 0, 0), nodes: [] },
                        { color: new util.Color(0, 255, 0), nodes: [] },
                    ];
                    match.teleopFrames.filter(frame => (frame.type == "speaker")).forEach(frame => {
                        heatmapNodes[+!!frame.state.value].nodes.push({
                            ts: frame.ts,
                            x: frame.state.at.x,
                            y: frame.state.at.y,
                        });
                    });
                    heatmapNodes = heatmapNodes.filter((_, i) => {
                        return {
                            fail: [0],
                            success: [1],
                            all: [0, 1],
                        }[mode].includes(i);
                    });
                    canvasNodes = match.autoFrames.map(frame => {
                        if (frame.type == "pickup") {
                            let at = frame.state.at;
                            let x = [fieldSize.x/2-636.27+101.346, fieldSize.x/2][+(at >= 3)];
                            let y = [i=>(fieldSize.y/2-(2-i)*144.78), i=>(75.2856+(i-3)*167.64)][+(at >= 3)](at);
                            return { ts: frame.ts, x: x, y: y, group: at };
                        }
                        if (frame.type == "speaker") {
                            let x = fieldSize.x/2-636.27-101.4222/2;
                            return { ts: frame.ts, x: x, y: fieldSize.y/2-144.78, group: -1 };
                        }
                        if (frame.type == "amp") {
                            let x = 193.294;
                            return { ts: frame.ts, x: x, y: 0, group: -2 };
                        }
                        return null;
                    }).filter(node => node != null);
                    canvasNodes.unshift({ ts: 0, x: match.pos.x, y: match.pos.y });
                    canvasNodes = canvasNodes.map(node => {
                        return {
                            ts: node.ts,
                            x: (match.robotTeam == "r" ? fieldSize.x-node.x : node.x),
                            y: node.y,
                        };
                    });
                    openFieldPopup();
                }
                fieldTS = 0;
                update();
            };
            let elem = document.createElement("table");
            elem.classList.add("match-listing");
            if (match.robotTeam == "r") elem.setAttribute("red", "");
            if (match.robotTeam == "b") elem.setAttribute("blue", "");
            let rows = [];
            let datRows = [];
            for (let i = 0; i < 8; i++) {
                let row = document.createElement("tr");
                rows.push(row);
                elem.appendChild(row);
                if (i > 0) {
                    row.classList.add("dats");
                    if (i <= 1)
                        row.classList.add("special");
                }
                datRows.push([]);
                let block = false;
                let main = false;
                for (let j = 0; j < 13; j++) {
                    let dat = document.createElement("td");
                    row.appendChild(dat);
                    if (j == 0) {
                        if (i == 0 || i == 1) {
                            dat.innerHTML = "<button><ion-icon name='chevron-forward'></ion-icon></button>";
                            dat.children[0].addEventListener("click", e => {
                                if (elem.classList.contains("this"))
                                    elem.classList.remove("this");
                                else elem.classList.add("this");
                            });
                        } else if (i == 2) {
                            dat.innerHTML = "<button><ion-icon name='close'></ion-icon></button>";
                            dat.children[0].addEventListener("click", async e => {
                                const ans = confirm("Are you sure you want to remove this scouted match? This is not reversible!");
                                if (!ans) return;

                                await this.whenUnlocked();
                                this.lock();

                                try {
                                    console.log("📝:📀 matches: PYAW");
                                    let resp = await fetch("https://ppatrol.pythonanywhere.com/data/matches/"+match._t, {
                                        method: "DELETE",
                                        mode: "cors",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Password": pwd,
                                        },
                                        body: JSON.stringify({}),
                                    });
                                    if (resp.status != 200) throw resp.status;
                                } catch (e) {
                                    console.log("📝:📀 matches: PYAW ERR", e);
                                }

                                this.unlock();

                                this.refresh();
                            });
                        } else if (i == 3) {
                            dat.innerHTML = "<button><ion-icon></ion-icon></button>";
                            let icon = dat.children[0].children[0];
                            let v = null;
                            const update = () => {
                                if (!document.body.contains(icon)) return clearInterval(id);
                                let v2 = getSkipped(match);
                                if (v == v2) return;
                                v = v2;
                                icon.name = v ? "add" : "remove";
                            };
                            let id = setInterval(update, 100);
                            dat.children[0].addEventListener("click", e => {
                                if (this.hasSkippedMatch(k))
                                    this.remSkippedMatch(k);
                                else this.addSkippedMatch(k);
                                let ks = matchesScouted.map(match => getBufferStr(match));
                                this.matchesSkipped = this.matchesSkipped.filter(k => ks.includes(k));
                                update();
                            });
                        }
                        continue;
                    }
                    if (i > 0) {
                        if ([4, 8].includes(j)) {
                            dat.classList.add("dat");
                            dat.classList.add("k");
                            block = false;
                            main = false;
                            let text = [
                                ["Pickups", "Scores"],
                                ["Auto", "Auto"],
                                ["~Source", " Speaker"],
                                [" Ground", " Amp"],
                                ["Teleop", "Teleop"],
                                [" Source", " Speaker"],
                                [" Ground", " Amp"],
                            ][i-1][(j-4)/4]+":";
                            let text2 = text;
                            if (text[0] == " " || text[0] == "~") {
                                dat.classList.add("special");
                                text2 = text.substring(1);
                            } else main = i > 0;
                            if (text[0] == "~") block = true;
                            dat.textContent = text2;
                        } else if ([5, 6, 7, 9, 10, 11].includes(j)) {
                            dat.classList.add("dat");
                            dat.classList.add("v");
                            let k = j - 4 - 1 - Math.floor((j-4)/4)*4;
                            dat.classList.add("i"+k);
                            let [n, m] = [
                                [
                                    [
                                        [comp.pickups.total, comp.pickups.total],
                                        [comp.pickups.success, comp.pickups.total],
                                        [comp.pickups.fail, comp.pickups.total],
                                    ],
                                    [
                                        [comp.auto.pickups.total, comp.auto.pickups.total],
                                        [comp.auto.pickups.success, comp.auto.pickups.total],
                                        [comp.auto.pickups.fail, comp.auto.pickups.total],
                                    ],
                                    [
                                        [0, 0],
                                        [0, 0],
                                        [0, 0],
                                    ],
                                    [
                                        [comp.auto.pickups.total, comp.auto.pickups.total],
                                        [comp.auto.pickups.success, comp.auto.pickups.total],
                                        [comp.auto.pickups.fail, comp.auto.pickups.total],
                                    ],
                                    [
                                        [comp.teleop.pickups.total, comp.teleop.pickups.total],
                                        [comp.teleop.pickups.success, comp.teleop.pickups.total],
                                        [comp.teleop.pickups.fail, comp.teleop.pickups.total],
                                    ],
                                    [
                                        [comp.teleop.pickups.source.total, comp.teleop.pickups.source.total],
                                        [comp.teleop.pickups.source.success, comp.teleop.pickups.source.total],
                                        [comp.teleop.pickups.source.fail, comp.teleop.pickups.source.total],
                                    ],
                                    [
                                        [comp.teleop.pickups.ground.total, comp.teleop.pickups.ground.total],
                                        [comp.teleop.pickups.ground.success, comp.teleop.pickups.ground.total],
                                        [comp.teleop.pickups.ground.fail, comp.teleop.pickups.ground.total],
                                    ],
                                ],
                                [
                                    [
                                        [comp.scores.total, comp.scores.total],
                                        [comp.scores.success, comp.scores.total],
                                        [comp.scores.fail, comp.scores.total],
                                    ],
                                    [
                                        [comp.auto.scores.total, comp.auto.scores.total],
                                        [comp.auto.scores.success, comp.auto.scores.total],
                                        [comp.auto.scores.fail, comp.auto.scores.total],
                                    ],
                                    [
                                        [comp.auto.scores.speaker.total, comp.auto.scores.speaker.total],
                                        [comp.auto.scores.speaker.success, comp.auto.scores.speaker.total],
                                        [comp.auto.scores.speaker.fail, comp.auto.scores.speaker.total],
                                    ],
                                    [
                                        [comp.auto.scores.amp.total, comp.auto.scores.amp.total],
                                        [comp.auto.scores.amp.success, comp.auto.scores.amp.total],
                                        [comp.auto.scores.amp.fail, comp.auto.scores.amp.total],
                                    ],
                                    [
                                        [comp.teleop.scores.total, comp.teleop.scores.total],
                                        [comp.teleop.scores.success, comp.teleop.scores.total],
                                        [comp.teleop.scores.fail, comp.teleop.scores.total],
                                    ],
                                    [
                                        [comp.teleop.scores.speaker.total, comp.teleop.scores.speaker.total],
                                        [comp.teleop.scores.speaker.success, comp.teleop.scores.speaker.total],
                                        [comp.teleop.scores.speaker.fail, comp.teleop.scores.speaker.total],
                                    ],
                                    [
                                        [comp.teleop.scores.amp.total, comp.teleop.scores.amp.total],
                                        [comp.teleop.scores.amp.success, comp.teleop.scores.amp.total],
                                        [comp.teleop.scores.amp.fail, comp.teleop.scores.amp.total],
                                    ],
                                ],
                            ][Math.floor((j-4)/4)][i-1][k];
                            dat.textContent = n;
                            if (k == 0);
                            else if (k == 1 || k == 2) {
                                dat.appendChild(document.createElement("span"));
                                dat.lastChild.classList.add("p");
                                dat.lastChild.textContent = "("+((m == 0) ? 0 : Math.round(n/m*100))+"%)";
                            }
                        }
                        if (dat.classList.contains("dat")) {
                            datRows.at(-1).push(dat);
                            dat.innerHTML = "<span>"+dat.innerHTML+"</span>";
                            if (block) {
                                dat.children[0].style.textDecoration = "line-through";
                                dat.children[0].style.opacity = "50%";
                            }
                            if (main) {
                                dat.style.borderTop = "0.1rem solid var(--v8)";
                            } else {
                                dat.style.backgroundColor = "var(--v2)";
                            }
                            continue;
                        }
                    }
                    if (i == 0) {
                        if (j == 1) {
                            dat.textContent = (match.id < 0) ? "Practice" : match.id+1;
                            if (match.id < 0) dat.classList.add("practice");
                        } else if (j == 2) {
                            dat.textContent = match.robot;
                        } else if (j == 3) {
                            dat.innerHTML = "<span>@</span>";
                            dat.appendChild(document.createTextNode(match.scouter));
                        } else if (j == 9) {
                            let v = null;
                            let id = setInterval(() => {
                                if (!document.body.contains(dat)) return clearInterval(id);
                                let v2 = getSkipped(match);
                                if (v == v2) return;
                                v = v2;
                                dat.textContent = v ? "Skipped" : "";
                            }, 100);
                        } else if (j == 10) {
                            dat.textContent = "See Team Analytics";
                            dat.addEventListener("click", e => {
                                eNavButtons["team-analytics"].click();
                                this.team = match.robot;
                            });
                        } else if (j == 11) {
                            dat.textContent = "See Match Analytics";
                            dat.addEventListener("click", e => {
                                if (match.id < 0) return;
                                eNavButtons["match-analytics"].click();
                                this.qual = match.id;
                            });
                        } else if (j == 12) {
                            dat.textContent = "See Maps";
                            dat.addEventListener("click", showMap);
                        }
                        continue;
                    }
                    if (i == 1) {
                        if (j == 1) {
                            dat.textContent = (match.id < 0) ? "Practice" : match.id+1;
                            if (match.id < 0) dat.classList.add("practice");
                        } else if (j == 2) {
                            dat.textContent = match.robot;
                        } else if (j == 3) {
                            dat.innerHTML = "<span>@</span>";
                            dat.appendChild(document.createTextNode(match.scouter));
                        } else if (j == 12) {
                            if (match.preloaded) dat.setAttribute("yes", "");
                        }
                        continue;
                    }
                    if (i == 2) {
                        if (j == 2) {
                            dat.textContent = "frc"+match.robot;
                        } if (j == 3) {
                            dat.textContent = "See Team Analytics";
                            dat.addEventListener("click", e => {
                                eNavButtons["team-analytics"].click();
                                this.team = match.robot;
                            });
                        } else if (j == 12) {
                            if (comp.auto.mobility.state)
                                dat.setAttribute("yes", "");
                        }
                        continue;
                    }
                    if (i == 3) {
                        if (j == 2) {
                            let v = null;
                            let id = setInterval(() => {
                                if (!document.body.contains(dat)) return clearInterval(id);
                                let v2 = getSkipped(match);
                                if (v == v2) return;
                                v = v2;
                                dat.textContent = v ? "Skipped" : "";
                            }, 100);
                        } else if (j == 3) {
                            dat.textContent = "See Match Analytics";
                            dat.addEventListener("click", e => {
                                if (match.id < 0) return;
                                eNavButtons["match-analytics"].click();
                                this.qual = match.id;
                            });
                        } else if (j == 12) {
                            if (!comp.endgame.climb.climb.safe)
                                dat.setAttribute("no", "");
                            if (comp.endgame.climb.climb.state == 0);
                            else if (comp.endgame.climb.climb.state == 1) dat.setAttribute("park", "");
                            else if (comp.endgame.climb.climb.state == 2) dat.setAttribute("onstage", "");
                        }
                        continue;
                    }
                    if (i == 4) {
                        if (j == 3) {
                            dat.textContent = "See Maps";
                            dat.addEventListener("click", showMap);
                        } else if (j == 12) {
                            if (comp.endgame.trap.state) dat.setAttribute("yes", "");
                        }
                        continue;
                    }
                }
            }
            let v = null;
            let id = setInterval(() => {
                if (!document.body.contains(elem)) return clearInterval(id);
                let v2 = getSkipped(match);
                if (v == v2) return;
                v = v2;
                if (v) elem.classList.add("skip");
                else elem.classList.remove("skip");
            }, 100);
            let row = document.createElement("tr");
            elem.appendChild(row);
            let timeline = document.createElement("td");
            row.appendChild(timeline);
            timeline.colSpan = 13;
            let totalTime = Math.min(180000, Math.ceil(match.finishTime/15000)*15000);
            for (let i = 1; i < totalTime/15000; i++) {
                let ts = document.createElement("div");
                timeline.appendChild(ts);
                ts.classList.add("ts");
                ts.style.setProperty("--p", ((i*15000)/totalTime*100)+"%");
                ts.textContent = Math.floor(i/4)+":"+(""+((i%4)*15)).padStart("0", 2);
            }
            let ts = document.createElement("div");
            timeline.appendChild(ts);
            ts.classList.add("ts");
            ts.classList.add("special");
            const place = p => {
                ts.style.setProperty("--p", (p*100)+"%");
                let r1 = timeline.getBoundingClientRect();
                let r2 = ts.getBoundingClientRect();
                let x = r1.width*p;
                if (x+r2.width > r1.width)
                    ts.classList.add("flip");
                else ts.classList.remove("flip");
                ts.textContent = util.formatTime(p*totalTime);
            };
            place(0);
            timeline.addEventListener("mousemove", e => {
                let r = timeline.getBoundingClientRect();
                place((e.pageX-r.left)/r.width);
            });
            let items = [];
            items.push(
                {
                    type: "range",
                    subtype: "auto",
                    html: "Auto",
                    t0: 0, t1: match.teleopTime,
                },
            );
            match.globalFrames.forEach((frame, i) => {
                items.push({
                    type: "range",
                    subtype: "able",
                    html: frame.state ? "D" : "E",
                    init: elem => {
                        if (frame.state) elem.setAttribute("off", "");
                        else elem.setAttribute("on", "");
                    },
                    t0: frame.ts,
                    t1: ((i+1 < match.globalFrames.length) ? match.globalFrames[i+1].ts : totalTime),
                });
            });
            match.autoFrames.forEach(frame => {
                items.push({
                    type: "kf",
                    subtype: (frame.type == "pickup") ? "pickup" : "score",
                    html: "<ion-icon name='"+((frame.type == "pickup") ? "arrow-up" : "arrow-down")+"'></ion-icon>"+frame.type[0].toUpperCase(),
                    state: (frame.type == "pickup") ? frame.state.value : frame.state,
                    t: frame.ts,
                });
            });
            match.teleopFrames.forEach(frame => {
                items.push({
                    type: "kf",
                    subtype: (frame.type == "climb") ? "climb" : (frame.type == "source" || frame.type == "ground") ? "pickup" : "score",
                    html: "<ion-icon name='"+((frame.type == "climb") ? "airplane" : (frame.type == "source" || frame.type == "ground") ? "arrow-up" : "arrow-down")+"'></ion-icon>"+((frame.type == "climb") ? "NPO"[frame.state] : frame.type[0].toUpperCase()),
                    state: (frame.type == "climb") ? null : (frame.type == "speaker") ? frame.state.value : frame.state,
                    t: frame.ts,
                });
            });
            items.forEach(item => {
                let elem = document.createElement("div");
                timeline.appendChild(elem);
                elem.classList.add(item.type);
                elem.classList.add(item.subtype);
                elem.innerHTML = item.html;
                if (item.type == "kf") {
                    elem.innerHTML = "<div>"+item.html+"</div>";
                    elem.children[0].style.borderTop = (item.state != null) ? item.state ? "0.25rem solid var(--g3)" : "0.25rem solid var(--r3)" : "";
                    elem.style.setProperty("--p", (item.t/totalTime*100)+"%");
                }
                if (item.type == "range") {
                    elem.style.setProperty("--p0", (item.t0/totalTime*100)+"%");
                    elem.style.setProperty("--p1", (item.t1/totalTime*100)+"%");
                }
                if (item.init) item.init(elem);
            });
            row = document.createElement("tr");
            elem.appendChild(row);
            row.innerHTML = "<td>Cycle Time:</td><td></td>";
            row.children[0].style.fontSize = "0.75em";
            row.children[1].textContent = Math.round(comp.cycle/10)/100;
            let notes = document.createElement("td");
            row.insertBefore(notes, row.firstChild);
            notes.rowSpan = 5;
            notes.colSpan = 11;
            notes.textContent = match.notes;
            row = document.createElement("tr");
            elem.appendChild(row);
            row.innerHTML = "<td>Auto Score:</td><td></td>";
            row.children[0].style.fontSize = "0.75em";
            row.children[1].textContent = comp.auto.score;
            row = document.createElement("tr");
            elem.appendChild(row);
            row.innerHTML = "<td>Teleop Score:</td><td></td>";
            row.children[0].style.fontSize = "0.75em";
            row.children[1].textContent = comp.teleop.score;
            row = document.createElement("tr");
            elem.appendChild(row);
            row.innerHTML = "<td>Endgame Score:</td><td></td>";
            row.children[0].style.fontSize = "0.75em";
            row.children[1].textContent = comp.endgame.score;
            row = document.createElement("tr");
            elem.appendChild(row);
            row.innerHTML = "<td>Total Score:</td><td></td>";
            row.children[0].style.fontSize = "0.75em";
            row.children[1].textContent = comp.score;

            return elem;
        };
        
        const getPitKey = key => ((key in pitQueries) ? pitQueries[key] : null);
        const getPitValue = (data, key) => {
            const query = getPitKey(key);
            if (query == null) return data[key];
            if (query.type == "raw") return data[key];
            let hasFail = "fail" in query;
            if (query.type == "yn") {
                let v = determineYN(data[key]);
                if (v == null && hasFail) return query.fail;
                return v;
            }
            if (query.type.startsWith("number")) {
                let v = determineNumber(data[key]);
                if (query.type.startsWith("number-scale")) {
                    let range = determineDimensions(query.type.slice("number-scale".length));
                    if (v < range[0]) v = null;
                    if (v > range[1]) v = null;
                }
                if (!util.is(v, "num") && hasFail) return query.fail;
                return v;
            }
            if (query.type == "text") return determineText(data[key]);
            if (query.type == "dimensions") {
                let v = determineDimensions(data[key]);
                if ((!util.is(v[0], "num") || !util.is(v[1], "num")) && hasFail) return query.fail;
                return v;
            }
            return data[key];
        };
        const makePitDataListing = (data, cnf) => {
            cnf = util.ensure(cnf, "obj");
            let elems = [], elem, btn, table;

            elem = document.createElement("h3");
            elems.push(elem);
            elem.innerHTML = "<span>@</span>";
            if (cnf.collapsible) {
                elem.innerHTML = "<button><ion-icon name='chevron-forward'></ion-icon></button>"+elem.innerHTML;
                btn = elem.children[0];
            }
            elem.appendChild(document.createTextNode(getPitValue(data, "pit-scouter")));
            if (cnf.showTeam) {
                elem.appendChild(document.createElement("span"));
                elem.lastChild.classList.add("team");
                elem.lastChild.textContent = getPitValue(data, "team-number");
            }

            elem = table = document.createElement("table");
            elems.push(elem);
            for (let i = 0; i < 4; i++) {
                let row = document.createElement("tr");
                elem.appendChild(row);
                row.classList.add("pit");
                if (i <= 0) row.classList.add("t");
                for (let j = 0; j < 5; j++) {
                    let dat = document.createElement(["th", "td"][i%2]);
                    row.appendChild(dat);
                    dat.style.minWidth = dat.style.maxWidth = "calc(((100vw - 4rem) / 10) * "+[1.5, 5.5, 1, 1, 1][j]+")";
                    if (j >= 2) {
                        dat.classList.add("small");
                        if (j == 2) dat.classList.add("l");
                        if (i >= 3) dat.classList.add("b");
                    }
                    if (i % 2 == 0) {
                        dat.textContent = [
                            ["Drive", "Speaker", "Can Amp", "Can Trap", "Can Climb"],
                            ["Dimensions (in)", "Intake", "Can Under Stage", "Can Harmonize", "Climb Time"],
                        ][i/2][j];
                        continue;
                    }
                    if (j < 2) {
                        let k = [["drive-type", "speaker-scoring-range"], ["chassis-dimensions", "intake-mechanism"]][(i-1)/2][j];
                        const query = getPitKey(k);
                        let v = getPitValue(data, k);
                        if (query.type == "text") {
                            if (query.values.includes(v)) v = v.split("-").map(part => util.formatText(part)).join(" ");
                            else v = data[k];
                        } else if (query.type == "dimensions") v = util.is(v, "arr") ? v.join("x") : v;
                        dat.textContent = v;
                        continue;
                    }
                    let k = [["amp", "trap", "climb"], ["under-stage", "can-harmonize", "climb-time"]][(i-1)/2][j-2];
                    const query = getPitKey(k);
                    let v = getPitValue(data, k);
                    if (query.type != "yn") {
                        dat.classList.remove("small");
                        dat.textContent = v;
                        continue;
                    }
                    if (v == null) {
                        dat.textContent = data[k];
                        continue;
                    }
                    dat.setAttribute(v ? "yes" : "no", "");
                    dat.textContent = v ? "Yes" : "No";
                }
            }
            for (let i = 0; i < 4; i++) {
                let row = document.createElement("tr");
                elem.appendChild(row);
                row.classList.add("pit");
                if (i == 2) row.classList.add("t");
                for (let j = 0; j < 3; j++) {
                    let dat = document.createElement(["th", "td"][i%2]);
                    row.appendChild(dat);
                    dat.style.minWidth = dat.style.maxWidth = "calc(((100vw - 4rem) / 10) * "+[[1.5, 5.5, 3], [6.5, 2, 1]][Math.floor(i/2)][j]+")";
                    dat.colSpan = [[1, 1, 3], [2, 2, 1]][Math.floor(i/2)][j];
                    if (i % 2 == 0) {
                        dat.textContent = [
                            ["Weight (lbs)", "Shooter", "Pickup"],
                            ["Vision", "Vision System", "#Cameras"],
                        ][i/2][j];
                        continue;
                    }
                    let k = [["weight", "shooter-mechanism", "pickup-method"], ["vision", "vision-system", "number-of-cameras"]][(i-1)/2][j];
                    const query = getPitKey(k);
                    let v = getPitValue(data, k);
                    if (query.type == "text") v = v.split("-").map(part => util.formatText(part)).join(" ");
                    dat.textContent = v;
                }
            }
            for (let i = 0; i < 2; i++) {
                let row = document.createElement("tr");
                elem.appendChild(row);
                row.classList.add("pit");
                if (i <= 0) row.classList.add("t");
                if (i >= 1) row.classList.add("b");
                for (let j = 0; j < 4; j++) {
                    let dat = document.createElement(["th", "td"][i%2]);
                    row.appendChild(dat);
                    dat.style.minWidth = dat.style.maxWidth = "calc(((100vw - 4rem) / 10) * "+[1.5, 6.5, 1, 1][j]+")";
                    dat.colSpan = [1, 2, 1, 1][j];
                    if (i % 2 == 0) {
                        dat.textContent = ["Language", "Auton Paths", "Attitude", "Pit Organization"][j];
                        if (j >= 2) dat.classList.add("small");
                        continue;
                    }
                    let k = ["programming-language", "auton-paths", "attitude", "pit-organization"][j];
                    dat.textContent = getPitValue(data, k);
                }
            }

            let collapsed = false;
            const update = () => {
                if (btn) {
                    if (collapsed) btn.classList.add("this");
                    else btn.classList.remove("this");
                }
                if (collapsed) table.classList.add("this");
                else table.classList.remove("this");
            };
            update();
            if (btn) btn.addEventListener("click", e => {
                if (!cnf.collapsible) return;
                collapsed = !collapsed;
                update();
            });

            return elems;
        };

        let heatmapNodes = [];
        let canvasNodes = [];
        let fieldTS = 0;
        let doUpdateFieldPopup = false;
        const updateFieldPopup = () => {
            let r = this.eField.getBoundingClientRect();
            let scaleX = r.width/fieldSize.x;
            let scaleY = r.height/fieldSize.y;
            let scale = Math.min(scaleX, scaleY);
            this.eFieldCanvas.width = fieldSize.x;
            this.eFieldCanvas.height = fieldSize.y;
            this.eFieldBox.style.width = this.eFieldCanvas.style.width = (scale * fieldSize.x)+"px";
            this.eFieldBox.style.height = this.eFieldCanvas.style.height = (scale * fieldSize.y)+"px";
            if (scale <= 0) return;
            this.eFieldBox.innerHTML = "";
            heatmapNodes.forEach(nodes => {
                const heatmap = h337.create({
                    container: this.eFieldBox,
                    radius: Math.round(75*scale),
                    maxOpacity: 0.5,
                    minOpacity: 0,
                    gradient: {
                        "0.0": nodes.color.toHex(),
                        "1.0": nodes.color.toHex(),
                    },
                });
                nodes.nodes.filter(node => node.ts <= fieldTS).forEach(node => {
                    heatmap.addData({
                        x: Math.round(node.x*scale),
                        y: Math.round(node.y*scale),
                    });
                });
            });
            const ctx = this.eFieldCanvas.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            canvasNodes.sort((a, b) => a.ts-b.ts);
            let before = [], after = [];
            canvasNodes.forEach(node => [before, after][+(node.ts > fieldTS)].push(node));
            if (before.length > 0) after.unshift(before.at(-1));
            ctx.lineCap = ctx.lineJoin = "round";
            ctx.lineWidth = 3/scale;
            ctx.strokeStyle = "#0f04";
            ctx.beginPath();
            after.forEach((node, i) => {
                if (i <= 0) 
                    ctx.moveTo(node.x, node.y);
                else ctx.lineTo(node.x, node.y);
            });
            ctx.stroke();
            ctx.strokeStyle = "#0f0";
            ctx.beginPath();
            before.forEach((node, i) => {
                if (i <= 0) 
                    ctx.moveTo(node.x, node.y);
                else ctx.lineTo(node.x, node.y);
            });
            ctx.stroke();
            after.forEach((node, i) => {
                if (i <= 0) return ctx.fillStyle = "#0f04";
                ctx.beginPath();
                ctx.arc(node.x, node.y, 10/scale, 0, 2*Math.PI);
                ctx.fill();
            });
            before.forEach((node, i) => {
                if (i+1 >= before.length)
                    ctx.fillStyle = "#ff0";
                else ctx.fillStyle = "#0f0";
                ctx.beginPath();
                ctx.arc(node.x, node.y, 10/scale, 0, 2*Math.PI);
                ctx.fill();
            });
            heatmapNodes.forEach(nodes => {
                nodes.nodes.forEach(node => {
                    if (node.ts > fieldTS) return;
                    ctx.fillStyle = nodes.color.toHex();
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5/scale, 0, 2*Math.PI);
                    ctx.fill();
                });
            });
        };
        const openFieldPopup = () => {
            this.eFieldPopup.classList.add("this");
            updateFieldPopup();
        };
        const closeFieldPopup = () => {
            this.eFieldPopup.classList.remove("this");
        };
        this.addHandler("update", () => {
            pwd = localStorage.getItem("pwd");
            if (!this.eFieldPopup.classList.contains("this")) return;
            if (!doUpdateFieldPopup) return;
            updateFieldPopup();
        });

        let eNavButtons = {};

        this.addHandler("setup", async () => {

            this.addHandler("lock", () => {
                this.eRefresh.disabled = true;

                this.eServerConfigAPIKeyEdit.disabled = true;
                this.eServerConfigEventEdit.disabled = true;
                this.eServerConfigAccessPwdEdit.disabled = true;

                this.ePickListAdd.disabled = true;

                this.eAPISave.disabled = true;
            });
            this.addHandler("unlock", () => {
                this.eRefresh.disabled = false;

                this.eServerConfigAPIKeyEdit.disabled = false;
                this.eServerConfigEventEdit.disabled = false;
                this.eServerConfigAccessPwdEdit.disabled = false;

                this.ePickListAdd.disabled = false;

                this.eAPISave.disabled = false;
            });

            this.addHandler("pre-refresh", () => {
            });
            this.addHandler("post-refresh", () => {
                this.eServerConfigAPIKey.textContent = String(apiKey);
                this.eServerConfigEventName.textContent = util.ensure(event.name, "str", "None");
                this.eServerConfigEventKey.textContent = String(eventKey);
                this.eServerConfigAccessPwd.textContent = "*";
            });

            this.eRefresh = document.getElementById("refresh");
            this.eRefresh.addEventListener("click", e => {
                this.refresh();
            });

            Array.from(document.querySelectorAll("#nav > button:not(#refresh)")).forEach(btn => {
                eNavButtons[btn.id] = btn;
                btn.addEventListener("click", e => {
                    let page = localStorage.getItem("page");
                    localStorage.setItem("page", btn.id);
                    for (let id in eNavButtons) {
                        if (document.getElementById(id+"-page"))
                        document.getElementById(id+"-page").classList.remove("this");
                        eNavButtons[id].classList.remove("this");
                    }
                    if (document.getElementById(btn.id+"-page"))
                        document.getElementById(btn.id+"-page").classList.add("this");
                    btn.classList.add("this");
                    this.change("page", page, btn.id);
                });
            });

            this.eFieldPopup = document.getElementById("field-popup");
            this.eFieldPopupClose = document.getElementById("field-popup-close");
            this.eFieldPopupClose.addEventListener("click", closeFieldPopup);
            this.eFieldPopupNav = document.getElementById("field-popup-nav");
            this.eField = document.getElementById("field");
            this.eFieldBox = document.getElementById("field-box");
            this.eFieldCanvas = document.getElementById("field-canvas");
            new ResizeObserver(updateFieldPopup).observe(this.eField);
            updateFieldPopup();

            this.eServerConfigEvents = document.getElementById("server-config-events");
            this.eServerConfigEventsEnter = document.getElementById("server-config-events-enter");
            this.eServerConfigEventsCancel = document.getElementById("server-config-events-cancel");
            this.eServerConfigEventsConfirm = document.getElementById("server-config-events-confirm");

            this.eServerConfigAPIKey = document.getElementById("server-config-api-key");
            this.eServerConfigAPIKeyEdit = document.getElementById("server-config-api-key-edit");

            this.eServerConfigEventName = document.getElementById("server-config-event-name");
            this.eServerConfigEventKey = document.getElementById("server-config-event-key");
            this.eServerConfigEventEdit = document.getElementById("server-config-event-edit");

            this.eServerConfigAccessPwd = document.getElementById("server-config-pwd");
            this.eServerConfigAccessPwdEdit = document.getElementById("server-config-pwd-edit");

            this.eServerConfigAPIKeyEdit.addEventListener("click", async e => {
                let newKey = prompt("New API Key:");
                if (newKey == null) return;
                if (newKey.length <= 0) newKey = null;

                await this.whenUnlocked();
                this.lock();

                try {
                    console.log("📝:🔑 api-key: PYAW");
                    let resp = await fetch("https://ppatrol.pythonanywhere.com/data/apiKey", {
                        method: "POST",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                            "Password": pwd,
                        },
                        body: JSON.stringify({
                            v: newKey,
                        }),
                    });
                    if (resp.status != 200) throw resp.status;
                } catch (e) {
                    console.log("📝:🔑 api-key: PYAW ERR", e);
                }

                this.unlock();

                this.refresh();
            });

            this.eServerConfigEventEdit.addEventListener("click", async e => {
                await this.whenUnlocked();
                this.lock();

                let events = null;
                try {
                    console.log("🛜 events: TBA");
                    if (apiKey == null) throw "api-key";
                    let resp = await fetch("https://www.thebluealliance.com/api/v3/events/"+(new Date().getFullYear()), {
                        method: "GET",
                        headers: {
                            "Accept": "application/json",
                            "X-TBA-Auth-Key": apiKey,
                        },
                    });
                    if (resp.status != 200) throw resp.status;
                    resp = await resp.text();
                    // console.log("🛜 events: TBA = "+resp);
                    events = JSON.parse(resp);
                } catch (e) {
                    console.log("🛜 events: TBA ERR", e);
                }
                events = util.ensure(events, "arr");
                events = events.sort((a, b) => ((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 0))

                this.eServerConfigEventsConfirm.disabled = true;

                let key = null;

                this.eServerConfigEvents.classList.add("this");
                Array.from(this.eServerConfigEvents.querySelectorAll(":scope > h3")).forEach(elem => elem.remove());
                events.forEach(event => {
                    let elem = document.createElement("h3");
                    this.eServerConfigEvents.insertBefore(elem, this.eServerConfigEventsCancel.parentElement);
                    elem.innerHTML = "<span></span><span></span>";
                    elem.children[0].textContent = event.name;
                    elem.children[1].textContent = event.key;
                    elem.addEventListener("click", e => {
                        key = event.key;
                        Array.from(this.eServerConfigEvents.querySelectorAll(":scope > h3")).forEach(elem => elem.classList.remove("this"));
                        elem.classList.add("this");
                        this.eServerConfigEventsConfirm.disabled = false;
                    });
                });

                key = await new Promise((res, rej) => {
                    const resRef = res;
                    res = (...a) => {
                        this.eServerConfigEventsEnter.removeEventListener("click", onEnter);
                        this.eServerConfigEventsCancel.removeEventListener("click", onCancel);
                        this.eServerConfigEventsConfirm.removeEventListener("click", onConfirm);
                        resRef(...a);
                    };
                    const onEnter = () => {
                        let k = prompt("Event Key:");
                        if (k == null) return onCancel();
                        key = (k.length <= 0) ? null : k;
                        onConfirm();
                    };
                    const onCancel = () => res(null);
                    const onConfirm = () => res((key == null) ? "" : String(key));
                    this.eServerConfigEventsEnter.addEventListener("click", onEnter);
                    this.eServerConfigEventsCancel.addEventListener("click", onCancel);
                    this.eServerConfigEventsConfirm.addEventListener("click", onConfirm);
                });

                if (key != null) {
                    if (key == "") key = null;
                    try {
                        console.log("📝:🔑 event-key: PYAW");
                        let resp = await fetch("https://ppatrol.pythonanywhere.com/data/eventKey", {
                            method: "POST",
                            mode: "cors",
                            headers: {
                                "Content-Type": "application/json",
                                "Password": pwd,
                            },
                            body: JSON.stringify({
                                v: key,
                            }),
                        });
                        if (resp.status != 200) throw resp.status;
                    } catch (e) {
                        console.log("📝:🔑 event-key: PYAW ERR", e);
                    }
                }

                this.eServerConfigEvents.classList.remove("this");

                this.unlock();

                this.refresh();
            });

            this.eServerConfigAccessPwdEdit.addEventListener("click", async e => {
                let v = prompt("Password:");
                if (v == null) return;
                if (v.length <= 0) v = null;
                localStorage.setItem("pwd", pwd = v);
                await this.whenUnlocked();
                this.refresh();
            });

            this.eAPIMatches = document.getElementById("api-matches");
            this.eAPITeams = document.getElementById("api-teams");
            this.eAPIScouters = document.getElementById("api-scouters");
            this.eAPIScanners = document.getElementById("api-scanners");
            this.eAPIListing = document.getElementById("api-listing");

            let scouters2 = [];
            this.addHandler("post-refresh", () => (scouters2 = [...scouters]));
            setInterval(() => {
                if (this.locked) return;
                if (scouters.length == scouters2.length) {
                    let diff = false;
                    for (let i = 0; i < scouters.length; i++) {
                        for (let k in scouters[i]) {
                            if (scouters[i][k] == scouters2[i][k]) continue;
                            diff = true;
                            break;
                        }
                        for (let k in scouters2[i]) {
                            if (scouters2[i][k] == scouters[i][k]) continue;
                            diff = true;
                            break;
                        }
                        if (diff) break;
                    }
                    if (!diff) return;
                }
                postScouters();
            }, 5*1000);
            const postScouters = async () => {
                await this.whenUnlocked();
                this.lock();

                try {
                    console.log("📝:🔑 scouters: PYAW");
                    let resp = await fetch("https://ppatrol.pythonanywhere.com/data/scouters", {
                        method: "POST",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                            "Password": pwd,
                        },
                        body: JSON.stringify({
                            v: scouters.sort(sortScouter),
                        }),
                    });
                    if (resp.status != 200) throw resp.status;
                } catch (e) {
                    console.log("📝:🔑 scouters: PYAW ERR", e);
                }

                this.unlock();

                this.refresh();
            };

            let apiListing = null;
            const updateAPIListing = () => {
                localStorage.setItem("api-listing", apiListing);
                this.eAPIListing.innerHTML = "";
                this.eAPIMatches.classList.remove("this");
                this.eAPITeams.classList.remove("this");
                this.eAPIScouters.classList.remove("this");
                this.eAPIScanners.classList.remove("this");
                if (apiListing == "matches") {
                    this.eAPIMatches.classList.add("this");
                    Object.values(matches).sort((a, b) => a.match_number-b.match_number).forEach(match => {
                        let elem = document.createElement("table");
                        this.eAPIListing.appendChild(elem);
                        elem.classList.add("match");
                        for (let i = 0; i < 4; i++) {
                            let row = document.createElement("tr");
                            elem.appendChild(row);
                            for (let j = 0; j < (i < 3 ? 9 : 5); j++) {
                                let dat = document.createElement("td");
                                row.appendChild(dat);
                                if (j == 0) {
                                    if (i == 0) {
                                        dat.innerHTML = "<button><ion-icon name='chevron-forward'></ion-icon></button>";
                                        dat.children[0].addEventListener("click", e => {
                                            if (elem.classList.contains("this"))
                                                elem.classList.remove("this");
                                            else elem.classList.add("this");
                                        });
                                    }
                                    continue;
                                }
                                if (i == 0) {
                                    if (j == 1) {
                                        dat.textContent = match.key;
                                    } else if (j < 8) {
                                        let data = [
                                            ...match.alliances.red.team_keys.map(key => parseInt(key.substring(3))),
                                            ...match.alliances.blue.team_keys.map(key => parseInt(key.substring(3))),
                                        ];
                                        dat.textContent = data[j-2];
                                        if (data[j-2] == 6036) dat.classList.add("this");
                                    } else {
                                        dat.textContent = "See Analytics";
                                        dat.addEventListener("click", e => {
                                            eNavButtons["match-analytics"].click();
                                            this.qual = match.match_number-1;
                                        });
                                    }
                                    continue;
                                }
                                if (i == 1) {
                                    if (j == 1) {
                                        dat.textContent = "Auto Mobility";
                                    } else if (j < 8) {
                                        let value;
                                        if (!util.is(match.score_breakdown, "obj") || !("red" in match.score_breakdown) || !("blue" in match.score_breakdown))
                                            value = null;
                                        else value = [
                                            ...Array.from(new Array(3).keys()).map(i => match.score_breakdown.red["mobilityRobot"+(i+1)] == "Yes"),
                                            ...Array.from(new Array(3).keys()).map(i => match.score_breakdown.blue["mobilityRobot"+(i+1)] == "Yes"),
                                        ][j-2];
                                        if (value != null) {
                                            if (value) dat.setAttribute("yes", "");
                                            else dat.setAttribute("no", "");
                                        }
                                    }
                                    continue;
                                }
                                if (i == 2) {
                                    if (j == 1) {
                                        dat.textContent = "Onstage";
                                    } else if (j < 8) {
                                    }
                                    continue;
                                }
                                if (i == 3) {
                                    if (j == 1) {
                                        dat.textContent = "Scores";
                                    } else if (j < 8) {
                                        dat.colSpan = 3;
                                        if (!util.is(match.score_breakdown, "obj") || !("red" in match.score_breakdown) || !("blue" in match.score_breakdown))
                                            dat.textContent = "N/A";
                                        else dat.textContent = [
                                            match.score_breakdown.red.totalPoints,
                                            match.score_breakdown.blue.totalPoints,
                                        ][j-2];
                                    }
                                }
                            }
                        }
                    });
                    return;
                }
                if (apiListing == "teams") {
                    this.eAPITeams.classList.add("this");
                    teams.sort((a, b) => a.team_number-b.team_number).forEach(team => {
                        let elem = document.createElement("table");
                        this.eAPIListing.appendChild(elem);
                        elem.classList.add("team");
                        for (let i = 0; i < 1; i++) {
                            let row = document.createElement("tr");
                            elem.appendChild(row);
                            for (let j = 0; j < (i < 3 ? 8 : 4); j++) {
                                let dat = document.createElement("td");
                                row.appendChild(dat);
                                if (i == 0) {
                                    if (j == 0) {
                                        dat.textContent = team.team_number;
                                    } else if (j == 1) {
                                        dat.textContent = team.key;
                                    } else if (j == 2) {
                                        dat.textContent = team.nickname;
                                    } else {
                                        dat.textContent = ["See Analytics", ""][j-3];
                                        dat.addEventListener("click", e => {
                                            if (j-3 == 0) {
                                                eNavButtons["team-analytics"].click();
                                                this.team = team.team_number;
                                            }
                                        });
                                    }
                                    continue;
                                }
                            }
                        }
                    });
                    return;
                }
                if (apiListing == "scouters") {
                    this.eAPIScouters.classList.add("this");
                    this.eAPIListing.innerHTML = "<button><ion-icon name='add'></ion-icon></button>";
                    this.eAPIListing.children[0].addEventListener("click", e => {
                        let names = prompt("Add scouter(s):");
                        if (names == null) return;
                        names = names.split(",").map(name => name.trim());
                        scouters.push(...names.map(name => { return { name: name, role: "scouter" }; }));
                        scouters.sort(sortScouter);
                        updateAPIListing();
                    });
                    scouters.sort(sortScouter).forEach(scouter => {
                        let elem = document.createElement("div");
                        this.eAPIListing.appendChild(elem);
                        String(scouter.role).split("-").forEach(subrole => elem.classList.add(subrole));
                        elem.innerHTML = "<span></span><button><ion-icon name='ellipsis-vertical'></ion-icon></button><button><ion-icon name='close'></ion-icon></button>";
                        elem.children[0].textContent = scouter.name;
                        elem.children[1].addEventListener("click", e => {
                            let role = prompt(`Edit Role (${scouter.name} was ${scouter.role})`);
                            if (role == null) return;
                            if (!["scouter", "other", "dev"].includes(role)) return;
                            scouters[scouters.indexOf(scouter)].role = role;
                            updateAPIListing();
                        });
                        elem.children[2].addEventListener("click", e => {
                            scouters.splice(scouters.indexOf(scouter), 1);
                            updateAPIListing();
                        });
                    });
                    return;
                }
                if (apiListing == "scanners") {
                    this.eAPIScanners.classList.add("this");
                    this.eAPIListing.innerHTML = "<div><canvas></canvas></div><p><span>Scanners!</span><br>Scan here to open the scanner app on your phone! Remember, you must have internet connection (either through wifi or through service or hotspot) to access the scanner app</p>";
                    let canvas = this.eAPIListing.children[0].children[0];
                    let path = window.location.pathname.split("/");
                    path.pop();
                    path.push("scanner");
                    path = path.join("/");
                    new QRious({
                        element: canvas,
                        value: window.location.protocol+"//"+window.location.host+path,
                        size: 1000,
                    });
                    return;
                }
            };
            this.eAPIMatches.addEventListener("click", e => {
                apiListing = "matches";
                updateAPIListing();
            });
            this.eAPITeams.addEventListener("click", e => {
                apiListing = "teams";
                updateAPIListing();
            });
            this.eAPIScouters.addEventListener("click", e => {
                apiListing = "scouters";
                updateAPIListing();
            });
            this.eAPIScanners.addEventListener("click", e => {
                apiListing = "scanners";
                updateAPIListing();
            });
            this.addHandler("post-refresh", updateAPIListing);
            if (["matches", "teams"].includes(localStorage.getItem("api-listing"))) {
                apiListing = localStorage.getItem("api-listing");
                updateAPIListing();
            } else this.eAPIMatches.click();

            if (localStorage.getItem("page") in eNavButtons)
                eNavButtons[localStorage.getItem("page")].click();
            else eNavButtons["server-config"].click();

            this.eMasterListPage = document.getElementById("master-list-page");
            this.addHandler("post-refresh", () => {
                this.eMasterListPage.innerHTML = "";
                matchesScouted.sort((a, b) => a.id-b.id).forEach(match => this.eMasterListPage.appendChild(makeMatchListing(match)));
            });

            this.eTeamAnalyticsTeam = document.getElementById("team-analytics-team");
            const closeTeamAnalyticsDropdown = e => {
                if (this.eTeamAnalyticsTeam.contains(e.target)) return;
                if (this.eTeamAnalyticsDropdown.contains(e.target)) return;
                e.stopPropagation();
                document.body.removeEventListener("click", closeTeamAnalyticsDropdown, true);
                if (!this.eTeamAnalyticsDropdown.classList.contains("this")) return;
                this.eTeamAnalyticsTeam.click();
            };
            this.eTeamAnalyticsTeam.addEventListener("click", e => {
                if (this.eTeamAnalyticsDropdown.classList.contains("this")) {
                    document.body.removeEventListener("click", closeTeamAnalyticsDropdown, true);
                    this.eTeamAnalyticsDropdown.classList.remove("this");
                } else {
                    document.body.addEventListener("click", closeTeamAnalyticsDropdown, true);
                    this.eTeamAnalyticsDropdown.classList.add("this");
                    this.eTeamAnalyticsDropdownSearch.value = "";
                    this.eTeamAnalyticsDropdownSearch.focus();
                    updateTeamAnalyticsDropdown();
                }
            });
            const updateTeamAnalyticsDropdown = (c, f, t) => {
                if (c != null && !["team"].includes(c)) return;
                let query = this.eTeamAnalyticsDropdownSearch.value;
                let teams2 = teams;
                if (query.length > 0) {
                    const fuse = new Fuse(teams, { keys: ["team_number"] });
                    teams2 = fuse.search(query).map(item => item.item);
                }
                this.eTeamAnalyticsDropdownContent.innerHTML = "";
                teams2.sort((a, b) => a.team_number-b.team_number).forEach(team => {
                    let elem = document.createElement("button");
                    this.eTeamAnalyticsDropdownContent.appendChild(elem);
                    elem.textContent = team.team_number;
                    elem.addEventListener("click", e => {
                        this.eTeamAnalyticsTeam.click();
                        this.team = team.team_number;
                    });
                });
            };
            this.eTeamAnalyticsDropdown = document.getElementById("team-analytics-dropdown");
            this.eTeamAnalyticsDropdownSearch = document.getElementById("team-analytics-dropdown-search");
            this.eTeamAnalyticsDropdownSearch.addEventListener("input", updateTeamAnalyticsDropdown);
            this.eTeamAnalyticsDropdownSearch.addEventListener("keydown", e => {
                if (e.code != "Enter" && e.code != "Return") return;
                this.eTeamAnalyticsTeam.click();
                this.team = parseInt(this.eTeamAnalyticsDropdownSearch.value);
            });
            this.eTeamAnalyticsDropdownContent = document.getElementById("team-analytics-dropdown-content");
            this.eTeamAnalyticsNScouted = document.getElementById("team-analytics-n-scouted");
            this.eTeamAnalyticsNTotal = document.getElementById("team-analytics-n-total");
            this.eTeamAnalyticsNExtra = document.getElementById("team-analytics-n-extra");
            let eTeamAnalyticsHotswapSlots = Array.from(document.querySelectorAll(".team-analytics-hotswap-slot"));
            let eTeamAnalyticsHotswapSlotEdits = Array.from(document.querySelectorAll(".team-analytics-hotswap-slot-edit"));
            for (let i = 0; i < Math.min(eTeamAnalyticsHotswapSlots.length, eTeamAnalyticsHotswapSlotEdits.length); i++) {
                let slot = eTeamAnalyticsHotswapSlots[i];
                slot.addEventListener("click", e => {
                    this.team = this.hasHotswap(i) ? this.getHotswap(i) : this.getTeam(i);
                });
                let edit = eTeamAnalyticsHotswapSlotEdits[i];
                edit.addEventListener("click", e => {
                    const team = prompt("Hotswap Slot "+(i+1)+":");
                    if (team == null) return;
                    if (team.length <= 0)
                        return this.delHotswap(i);
                    this.setHotswap(i, parseInt(team));
                });
            }
            const updateTeamAnalyticsHeader = () => {
                this.eTeamAnalyticsTeam.textContent = this.hasTeam() ? this.team : "None";
                updateTeamAnalyticsDropdown();
                const scouted = computeScouted(this.team);
                this.eTeamAnalyticsNScouted.textContent = scouted.scouted;
                this.eTeamAnalyticsNTotal.textContent = scouted.total;
                this.eTeamAnalyticsNExtra.textContent = scouted.extra;
                for (let i = 0; i < Math.min(eTeamAnalyticsHotswapSlots.length, eTeamAnalyticsHotswapSlotEdits.length); i++) {
                    let slot = eTeamAnalyticsHotswapSlots[i];
                    slot.textContent = this.hasHotswap(i) ? this.getHotswap(i) : (this.getTeam(i) != null) ? this.getTeam(i) : "None";
                    let edit = eTeamAnalyticsHotswapSlotEdits[i];
                    slot.style.opacity = edit.style.opacity = (this.hasHotswap(i) && this.getTeam(i) != null) ? "" : "50%";
                }
            };
            this.addHandler("post-refresh", updateTeamAnalyticsHeader);
            this.addHandler("change", updateTeamAnalyticsHeader);
            this.eTeamAnalyticsAutoTable = document.getElementById("team-analytics-auto-table");
            this.eTeamAnalyticsTeleopTable = document.getElementById("team-analytics-teleop-table");
            this.eTeamAnalyticsTotalTable = document.getElementById("team-analytics-total-table");
            this.eTeamAnalyticsEndgameTable = document.getElementById("team-analytics-endgame-table");
            this.eTeamAnalyticsScoresTable = document.getElementById("team-analytics-scores-table");
            this.eTeamAnalyticsMiscTable = document.getElementById("team-analytics-misc-table");
            this.eTeamAnalyticsAPITable = document.getElementById("team-analytics-api-table");
            this.eTeamAnalyticsNotesTable = document.getElementById("team-analytics-notes-table");
            const updateTeamAnalyticsTables = () => {
                const comp = computeFullTeam(this.team);
                [this.eTeamAnalyticsAutoTable, this.eTeamAnalyticsTeleopTable, this.eTeamAnalyticsTotalTable].forEach((elem, ii) => {
                    elem.innerHTML = "";
                    for (let i = 0; i < 6; i++) {
                        let row = document.createElement("tr");
                        elem.appendChild(row);
                        row.classList.add("dats");
                        if (i % 3 == 0)
                            row.classList.add("special");
                        for (let j = 0; j < 4; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            dat.classList.add("dat");
                            if (j == 0) {
                                dat.classList.add("k");
                                dat.textContent = ["Pickups", "Source", "Ground", "Scores", "Speaker", "Amp"][i]+":";
                                if (i % 3 > 0) dat.classList.add("special");
                                if (ii == 0 && i == 1)
                                    dat.innerHTML = "<span style='opacity:50%;text-decoration:line-through;'>"+dat.innerHTML+"</span>";
                                continue;
                            }
                            let k = j-1;
                            dat.classList.add("v");
                            dat.classList.add("i"+k);
                            let data = [
                                [
                                    comp.auto.pickups, { success: 0, fail: 0, total: 0 }, comp.auto.pickups,
                                    comp.auto.scores, comp.auto.scores.speaker, comp.auto.scores.amp,
                                ],
                                [
                                    comp.teleop.pickups, comp.teleop.pickups.source, comp.teleop.pickups.ground,
                                    comp.teleop.scores, comp.teleop.scores.speaker, comp.teleop.scores.amp,
                                ],
                                [
                                    comp.pickups, comp.pickups.source, comp.pickups.ground,
                                    comp.scores, comp.scores.speaker, comp.scores.amp,
                                ],
                            ][ii][i];
                            let n = data[["total", "success", "fail"][k]];
                            let m = data.total;
                            dat.textContent = n;
                            if (k == 0);
                            else if (k == 1 || k == 2) {
                                dat.appendChild(document.createElement("span"));
                                dat.lastChild.classList.add("p");
                                dat.lastChild.textContent = "("+(Math.round(((m > 0) ? n/m : 0)*10000)/100)+"%)";
                            }
                            if (ii == 0 && i == 1)
                                dat.innerHTML = "<span style='opacity:50%;text-decoration:line-through;'>"+dat.innerHTML+"</span>";
                        }
                    }
                });
                this.eTeamAnalyticsEndgameTable.innerHTML = "";
                for (let i = 0; i < 4; i++) {
                    let row = document.createElement("tr");
                    this.eTeamAnalyticsEndgameTable.appendChild(row);
                    if (i > 0) row.classList.add("eg");
                    for (let j = 0; j < 3; j++) {
                        let dat = document.createElement((i > 0) ? "td" : "th");
                        row.appendChild(dat);
                        if (j > 0) dat.style.minWidth = "6em";
                        else dat.style.width = "100%";
                        if (i <= 0) {
                            dat.textContent = ["Status", "#Times", "Time (s)"][j];
                            continue;
                        }
                        if (j <= 0) {
                            dat.textContent = ["None", "Parked", "Onstage"][i-1];
                            continue;
                        }
                        if (j == 1) {
                            dat.textContent = comp.endgame.climb.climb.count[i-1];
                            continue;
                        }
                        dat.textContent = (i < 3) ? "N/A" : Math.round(comp.endgame.climb.climb.len[i-1]/10)/100;
                    }
                }
                this.eTeamAnalyticsScoresTable.innerHTML = "";
                for (let i = 0; i < 4; i++) {
                    let row = document.createElement("tr");
                    this.eTeamAnalyticsScoresTable.appendChild(row);
                    row.classList.add("score");
                    if (i+1 < 4);
                    else row.classList.add("tot");
                    for (let j = 0; j < 3; j++) {
                        let dat = document.createElement("td");
                        row.appendChild(dat);
                        if (j == 0) {
                            dat.textContent = ["Auto", "Teleop", "Endgame", "Total"][i];
                            continue;
                        }
                        dat.classList.add("v"+(j-1));
                        let scores = [
                            [comp.auto.scores.speaker.score, comp.auto.scores.amp.score, comp.auto.mobility.score],
                            [comp.teleop.scores.speaker.score, comp.teleop.scores.amp.score],
                            [comp.endgame.climb.climb.score, comp.endgame.climb.harmony.score, comp.endgame.trap.score],
                            [comp.score],
                        ][i];
                        dat.textContent = (j == 1) ? scores.sum() : (i+1 < 4) ? scores.join("+") : "";
                    }
                }
                this.eTeamAnalyticsMiscTable.innerHTML = "";
                for (let i = 0; i < 4; i++) {
                    let row = document.createElement("tr");
                    this.eTeamAnalyticsMiscTable.appendChild(row);
                    for (let j = 0; j < 2; j++) {
                        let dat = document.createElement("td");
                        row.appendChild(dat);
                        if (j <= 0) {
                            dat.textContent = ["Disable time (s)", "Cycle time (s)", "Preload Chance", "Trap Chance"][i];
                            continue;
                        }
                        if (i == 0 || i == 1) {
                            dat.textContent = Math.round(comp[["disable", "cycle"][i]]/10)/100;
                            continue;
                        }
                        if (i == 2 || i == 3) {
                            let o = [comp.preloaded, comp.endgame.trap][i-2];
                            dat.textContent = ((o.percent == null) ? 0 : (Math.round(o.percent*10000)/100))+"%";
                            continue;
                        }
                    }
                }
                this.eTeamAnalyticsAPITable.innerHTML = "";
                for (let i = 0; i < 4; i++) {
                    let row = document.createElement("tr");
                    this.eTeamAnalyticsAPITable.appendChild(row);
                    for (let j = 0; j < 2; j++) {
                        let dat = document.createElement("td");
                        row.appendChild(dat);
                        if (i < 3) {
                            if (j <= 0) {
                                dat.textContent = ["OPR", "DPR", "CCWM"][i];
                                continue;
                            }
                            dat.textContent = Math.round((util.ensure(util.ensure(eventRatings[["oprs", "dprs", "ccwms"][i]], "obj")["frc"+this.team], "num"))*100)/100;
                            continue;
                        }
                        if (j >= 1) {
                            dat.remove();
                            continue;
                        }
                        dat.colSpan = 2;
                        dat.style.color = "var(--a)";
                        dat.style.textDecoration = "underline";
                        dat.style.cursor = "pointer";
                        dat.textContent = "Show Scoring Maps";
                        dat.addEventListener("click", e => {
                            heatmapNodes = [];
                            canvasNodes = [];
                            this.eFieldPopupNav.style.minWidth = "7.5em";
                            this.eFieldPopupNav.style.maxWidth = "7.5em";
                            this.eFieldPopupNav.innerHTML = "<h3 style='flex-direction:column;align-items:stretch;'><button success style='flex-basis:100%;'>Success</button><button fail style='flex-basis:100%;'>Fail</button><button style='flex-basis:100%;'>All</button><button style='flex-basis:100%;'>Fold Map</button></h3>";
                            const elem = this.eFieldPopupNav.children[0];
                            let mode = "success", modeBtns = [elem.children[0], elem.children[1], elem.children[2]];
                            let fold = false, foldBtn = elem.children[3];
                            modeBtns[0].addEventListener("click", e => {
                                mode = "success";
                                update();
                            });
                            modeBtns[1].addEventListener("click", e => {
                                mode = "fail";
                                update();
                            });
                            modeBtns[2].addEventListener("click", e => {
                                mode = "all";
                                update();
                            });
                            foldBtn.addEventListener("click", e => {
                                fold = !fold;
                                update();
                            });
                            const update = () => {
                                modeBtns.forEach(btn => btn.classList.remove("this"));
                                modeBtns[["success", "fail", "all"].indexOf(mode)].classList.add("this");
                                foldBtn.classList.remove("this");
                                if (fold) foldBtn.classList.add("this");
                                heatmapNodes = [
                                    { color: new util.Color(255, 0, 0), nodes: [] },
                                    { color: new util.Color(0, 255, 0), nodes: [] },
                                ];
                                matchesScouted.filter(match => {
                                    if (match.robot != this.team) return;
                                    if (getSkipped(match)) return;
                                    match.teleopFrames.forEach(frame => {
                                        if (frame.type != "speaker") return;
                                        let x = frame.state.at.x;
                                        let y = frame.state.at.y;
                                        if (fold && x > fieldSize.x/2) x = fieldSize.x-x;
                                        heatmapNodes[+!!frame.state.value].nodes.push({
                                            x: x, y: y,
                                            ts: 0,
                                        });
                                    });
                                });
                                heatmapNodes = heatmapNodes.filter((_, i) => {
                                    return {
                                        fail: [0],
                                        success: [1],
                                        all: [0, 1],
                                    }[mode].includes(i);
                                });
                                openFieldPopup();
                            };
                            fieldTS = 1;
                            update();
                        });
                    }
                }
                this.eTeamAnalyticsNotesTable.innerHTML = "";
                comp.notes.forEach(note => {
                    let row = document.createElement("tr");
                    this.eTeamAnalyticsNotesTable.appendChild(row);
                    row.classList.add("note");
                    let dat;
                    dat = document.createElement("td");
                    row.appendChild(dat);
                    dat.innerHTML = "<span>@</span>";
                    dat.appendChild(document.createTextNode(note.from));
                    dat = document.createElement("td");
                    row.appendChild(dat);
                    dat.textContent = note.note;
                });
            };
            this.addHandler("post-refresh", updateTeamAnalyticsTables);
            this.addHandler("change", updateTeamAnalyticsTables);
            this.eTeamAnalyticsPitData = document.getElementById("team-analytics-pit-data");
            const updateTeamAnalyticsPitData = (c, f, t) => {
                if (c != null && !["team"].includes(c)) return;
                this.eTeamAnalyticsPitData.innerHTML = "";
                for (let t in pitData) {
                    let data = pitData[t];
                    if (getPitValue(data, "team-number") != this.team) continue;
                    makePitDataListing(data).forEach(elem => this.eTeamAnalyticsPitData.appendChild(elem));
                }
            };
            this.addHandler("post-refresh", updateTeamAnalyticsPitData);
            this.addHandler("change", updateTeamAnalyticsPitData);
            this.eTeamAnalyticsMatches = document.getElementById("team-analytics-matches");
            const updateTeamAnalyticsMatches = (c, f, t) => {
                if (c != null && !["team"].includes(c)) return;
                Array.from(this.eTeamAnalyticsMatches.querySelectorAll(":scope > table")).forEach(elem => elem.remove());
                matchesScouted.sort((a, b) => a.id-b.id).forEach(match => {
                    if (match.robot != this.team) return;
                    if (getSkipped(match)) return;
                    this.eTeamAnalyticsMatches.appendChild(makeMatchListing(match));
                });
            };
            this.addHandler("post-refresh", updateTeamAnalyticsMatches);
            this.addHandler("change", updateTeamAnalyticsMatches);

            this.eMatchAnalyticsTable = document.getElementById("match-analytics-table");
            let ignore = false;
            const updateMatchAnalyticsTable = (c, f, t) => {
                if (c != null && !["qual", "teams", "simulated"].includes(c)) return;
                if (ignore) return;
                let tbamatch = null;
                ignore = true;
                if (this.hasQual()) {
                    if ((this.qual+1) in matches) {
                        tbamatch = matches[this.qual+1];
                        this.teams = [
                            ...tbamatch.alliances.red.team_keys.map(key => parseInt(key.substring(3))),
                            ...tbamatch.alliances.blue.team_keys.map(key => parseInt(key.substring(3))),
                        ];
                    } else this.teams = new Array(6).fill(null);
                } else {
                    this.qual = null;
                    this.simulated = true;
                }
                ignore = false;
                let theTeams = this.teams;
                this.eMatchAnalyticsTable.innerHTML = "";
                const comps = theTeams.map(team => computeFullTeam(team));
                for (let i = 0; i < 32; i++) {
                    let row = document.createElement("tr");
                    this.eMatchAnalyticsTable.appendChild(row);
                    if (i == 0) {
                        for (let j = -1; j < 6; j++) {
                            let dat = document.createElement("th");
                            row.appendChild(dat);
                            if (j % 3 == 2) dat.classList.add("border");
                            if (j >= 0) dat.colSpan = 2;
                            if (j < 0) {
                                dat.innerHTML = "<button>SIM</button><button>HIS</button>";
                                dat.children[+!this.simulated].classList.add("this");
                                dat.children[1].disabled = !this.hasQual();
                                for (let i = 0; i < 2; i++)
                                    dat.children[i].addEventListener("click", e => {
                                        this.simulated = !i;
                                    });
                                continue;
                            }
                            dat.textContent = "See Analytics";
                            if (j >= 0)
                                dat.addEventListener("click", e => {
                                    eNavButtons["team-analytics"].click();
                                    this.team = theTeams[j];
                                });
                        }
                        continue;
                    }
                    if (i == 1) {
                        for (let j = -1; j < 6; j++) {
                            let dat = document.createElement("th");
                            row.appendChild(dat);
                            if (j % 3 == 2) dat.classList.add("border");
                            if (j >= 0) dat.colSpan = 2;
                            dat.innerHTML = "<button></button><div><input placeholder='Enter #' autocapitalize='false' autocomplete='off' spellcheck='false'><div></div></div>";
                            let btn = dat.children[0], dropdown = dat.children[1], input = dropdown.children[0], content = dropdown.children[1];
                            btn.textContent = (j < 0) ? this.hasQual() ? (this.qual+1) : "Custom" : (theTeams[j] == null) ? "None" : theTeams[j];
                            const f = e => {
                                if (btn.contains(e.target)) return;
                                if (dropdown.contains(e.target)) return;
                                document.body.removeEventListener("click", f, true);
                                if (!dropdown.classList.contains("this")) return;
                                btn.click();
                            };
                            btn.addEventListener("click", e => {
                                if (dropdown.classList.contains("this")) {
                                    dropdown.classList.remove("this");
                                    document.body.removeEventListener("click", f, true);
                                } else {
                                    dropdown.classList.add("this");
                                    document.body.addEventListener("click", f, true);
                                    input.value = "";
                                    input.focus();
                                    update();
                                }
                            });
                            let btns = (j < 0) ? Object.keys(matches).sort((a, b) => parseInt(a)-parseInt(b)) : teams.sort((a, b) => a.team_number-b.team_number).map(team => String(team.team_number));
                            btns = [null, ...btns];
                            input.addEventListener("input", e => update());
                            input.addEventListener("keydown", e => {
                                if (e.code != "Enter" && e.code != "Return") return;
                                btn.click();
                                if (j < 0) {
                                    this.qual = util.ensure(parseInt(input.value)-1, "int", null);
                                    return;
                                }
                                this.qual = null;
                                this.setTeam(j, util.ensure(parseInt(input.value), "int", null));
                            });
                            const update = () => {
                                content.innerHTML = "";
                                let query = input.value;
                                let btns2 = btns;
                                if (query.length > 0)  {
                                    const fuse = new Fuse(btns, { keys: [""] });
                                    btns2 = fuse.search(query).map(item => item.item);
                                }
                                btns2.forEach(k => {
                                    content.appendChild(document.createElement("button"));
                                    content.lastChild.textContent = (k == null) ? (j < 0) ? "Custom" : "None" : k;
                                    content.lastChild.addEventListener("click", e => {
                                        btn.click();
                                        if (j < 0) {
                                            this.qual = util.ensure(parseInt(k)-1, "int", null);
                                            return;
                                        }
                                        this.qual = null;
                                        this.setTeam(j, util.ensure(parseInt(k), "int", null));
                                    });
                                });
                            };
                            update();
                        }
                        continue;
                    }
                    if (i == 5 || i == 12 || i == 19) {
                        row.appendChild(document.createElement("td"));
                        row.appendChild(document.createElement("td"));
                        row.lastChild.colSpan = 12;
                        row.lastChild.classList.add("header");
                        row.lastChild.textContent = { 5: "Auto", 12: "Teleop", 19: "Endgame" }[i];
                        continue;
                    }
                    if (i >= 2 && i <= 4) {
                        if (!this.simulated || i == 3) row.remove();
                        for (let j = -1; j < 6; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j % 3 == 2) dat.classList.add("border");
                            if (j >= 0) dat.colSpan = 2;
                            if (j < 0) {
                                dat.textContent = ["Scouted", "Drive", "Preload%"][i-2];
                                continue;
                            }
                            if (i == 2) {
                                dat.innerHTML = new Array(3).fill("<span></span>").join("<span>/</span>");
                                const scouted = computeScouted(theTeams[j]);
                                dat.children[0].textContent = scouted.scouted;
                                dat.children[2].textContent = scouted.total;
                                dat.children[4].textContent = scouted.extra;
                                continue;
                            }
                            if (i == 3) {
                                dat.textContent = "N/A";
                                continue;
                            }
                            if (i == 4) {
                                dat.classList.add("yn");
                                let percent = (comps[j].preloaded.percent == null) ? 0 : comps[j].preloaded.percent;
                                if (percent > 0.5) dat.setAttribute("yes", "");
                                dat.textContent = (Math.round(percent*10000)/100)+"%";
                                continue;
                            }
                        }
                        continue;
                    }
                    if (i == 9) {
                        for (let j = -1; j < 6; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j % 3 == 2) dat.classList.add("border");
                            if (j >= 0) dat.colSpan = 2;
                            if (j < 0) {
                                dat.textContent = "Mobility";
                                continue;
                            }
                            dat.classList.add("yn");
                            dat.classList.add("special");
                            if (!this.simulated) {
                                let mobility = false;
                                if (tbamatch != null) mobility = tbamatch.score_breakdown[["red", "blue"][Math.floor(j/3)]]["autoLineRobot"+(j%3+1)] == "Yes";
                                dat.textContent = mobility ? "Yes" : "No";
                                if (mobility) dat.setAttribute("yes", "");
                                continue;
                            }
                            const comp = comps[j];
                            let percent = (comp.auto.mobility.percent == null) ? 0 : comp.auto.mobility.percent;
                            dat.textContent = (Math.round(percent*10000)/100)+"%";
                            if (percent > 0.5) dat.setAttribute("yes", "");
                        }
                        continue;
                    }
                    let ii;
                    ii = (i >= 6 && i <= 8) ? 0 : (i >= 13 && i <= 16) ? 1 : -1;
                    if (ii >= 0) {
                        row.classList.add("dats");
                        let jj = i - [6, 13][ii];
                        let special = [
                            [false, true, true],
                            [false, false, true, true],
                        ][ii][jj];
                        if (special) row.classList.add("special");
                        if (!this.simulated && !special) row.remove();
                        for (let j = -1; j < 12; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            dat.classList.add("dat");
                            if (j % 6 == 5) dat.classList.add("border");
                            if (j < 0) {
                                dat.classList.add("k");
                                dat.textContent = [
                                    ["Pickup", "Speaker", "Amp"],
                                    ["Source", "Ground", "Speaker", "Amp"],
                                ][ii][jj];
                                continue;
                            }
                            if (!this.simulated) {
                                if (j % 6 != 0) {
                                    dat.remove();
                                    continue;
                                } else dat.colSpan = 6;
                                row.classList.add("override");
                                dat.classList.add("v");
                                dat.classList.add("i1");
                                dat.classList.add("border");
                                dat.textContent = [
                                    [
                                        0,
                                        (tbamatch == null) ? 0 : tbamatch.score_breakdown[["red", "blue"][Math.floor(j/6)]].autoSpeakerNoteCount,
                                        (tbamatch == null) ? 0 : tbamatch.score_breakdown[["red", "blue"][Math.floor(j/6)]].autoAmpNoteCount,
                                    ],
                                    [
                                        0, 0,
                                        (tbamatch == null) ? 0 : tbamatch.score_breakdown[["red", "blue"][Math.floor(j/6)]].teleopSpeakerNoteCount,
                                        (tbamatch == null) ? 0 : tbamatch.score_breakdown[["red", "blue"][Math.floor(j/6)]].teleopAmpNoteCount,
                                    ],
                                ][ii][jj];
                                continue;
                            }
                            let k = j % 2;
                            dat.classList.add("v");
                            dat.classList.add("i"+(k+1));
                            const comp = comps[Math.floor(j/2)];
                            let n = [
                                [
                                    [comp.auto.pickups.success, comp.auto.pickups.fail],
                                    [comp.auto.scores.speaker.success, comp.auto.scores.speaker.fail],
                                    [comp.auto.scores.amp.success, comp.auto.scores.amp.fail],
                                ],
                                [
                                    [comp.teleop.pickups.source.success, comp.teleop.pickups.source.fail],
                                    [comp.teleop.pickups.ground.success, comp.teleop.pickups.ground.fail],
                                    [comp.teleop.scores.speaker.success, comp.teleop.scores.speaker.fail],
                                    [comp.teleop.scores.amp.success, comp.teleop.scores.amp.fail],
                                ],
                            ][ii][jj][k];
                            let m = [
                                [
                                    comp.auto.pickups.total,
                                    comp.auto.scores.speaker.total,
                                    comp.auto.scores.amp.total,
                                ],
                                [
                                    comp.teleop.pickups.source.total,
                                    comp.teleop.pickups.ground.total,
                                    comp.teleop.scores.speaker.total,
                                    comp.teleop.scores.amp.total,
                                ],
                            ][ii][jj];
                            dat.textContent = n;
                            // dat.appendChild(document.createElement("span"));
                            // dat.lastChild.classList.add("p");
                            // dat.lastChild.textContent = "("+((m > 0) ? (Math.round(n/m*10000)/100) : 0)+"%)";
                        }
                        continue;
                    }
                    ii = (i >= 10 && i <= 11) ? 0 : (i >= 17 && i <= 18) ? 1 : (i >= 25 && i <= 26) ? 2 : -1;
                    if (ii >= 0) {
                        row.classList.add("dats");
                        let jj = i - [10, 17, 25][ii];
                        if (jj > 0) row.classList.add("special");
                        if (!this.simulated) {
                            if (jj <= 0) {
                                row.remove();
                                continue;
                            }
                        }
                        for (let j = -1; j < [6, 2][jj]; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j % [3, 1][jj] == [2, 0][jj]) dat.classList.add("border");
                            if (j >= 0) dat.colSpan = [2, 6][jj];
                            if (j < 0) {
                                dat.classList.add("dat");
                                dat.classList.add("k");
                                if (jj <= 0) dat.classList.add("special");
                                dat.textContent = ["Scores", "ΣScores"][jj];
                                continue;
                            }
                            dat.classList.add("dat");
                            dat.classList.add("v");
                            dat.classList.add("i0");
                            let score = 0;
                            if (jj > 0) {
                                if (this.simulated)
                                    score = comps.slice(j*3, (j+1)*3).map(comp => comp[["auto", "teleop", "endgame"][ii]].score).sum();
                                else {
                                    if (tbamatch != null) {
                                        let breakdown = tbamatch.score_breakdown[["red", "blue"][j]];
                                        score = [
                                            breakdown.autoPoints,
                                            breakdown.teleopTotalNotePoints,
                                            breakdown.endGameTotalStagePoints+breakdown.endGameNoteInTrapPoints,
                                        ][ii];
                                    }
                                }
                            } else score = comps[j][["auto", "teleop", "endgame"][ii]].score;
                            dat.textContent = score;
                        }
                        continue;
                    }
                    if ([20, 21, 22].includes(i)) {
                        if (!this.simulated) {
                            row.remove();
                            continue;
                        }
                        let ii = i-20;
                        row.classList.add("dats");
                        row.classList.add("override");
                        for (let j = -1; j < 12; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j % 6 == 5) dat.classList.add("border");
                            if (j < 0) {
                                dat.textContent = ["None", "Park", "Onstage"][ii];
                                continue;
                            }
                            if (j % 2 == 0) {
                                dat.classList.add("dat");
                                dat.classList.add("v");
                                dat.classList.add("i0");
                                let n = comps[Math.floor(j/2)].endgame.climb.climb.count[ii];
                                let m = comps[Math.floor(j/2)].endgame.climb.climb.count.sum();
                                dat.textContent = n;
                                dat.appendChild(document.createElement("span"));
                                dat.lastChild.classList.add("p");
                                dat.lastChild.textContent = "("+(Math.round(((m > 0) ? (n/m) : 0)*10000)/100)+"%)";
                                continue;
                            }
                            dat.textContent = (ii < 2) ? "N/A" : Math.round(comps[Math.floor(j/2)].endgame.climb.climb.len[ii]/10)/100;
                        }
                        continue;
                    }
                    if (i == 23) {
                        if (this.simulated) {
                            row.remove();
                            continue;
                        }
                        for (let j = -1; j < 12; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j % 6 == 5) dat.classList.add("border");
                            if (j < 0) {
                                dat.textContent = "Climb";
                                continue;
                            }
                            if (!this.simulated) {
                                if (j % 2 == 1) {
                                    dat.remove();
                                    continue;
                                }
                                if (Math.floor(j/2) % 3 == 2) dat.classList.add("border");
                                dat.colSpan = 2;
                                dat.classList.add("eg");
                                let k = (tbamatch == null) ? 0 : ["None", "Parked", "Onstage"].indexOf(tbamatch.score_breakdown[["red", "blue"][Math.floor(j/6)]]["endGameRobot"+(Math.floor(j/2)%3+1)]);
                                if (k == 0);
                                else if (k == 1) dat.setAttribute("park", "");
                                else if (k == 2) dat.setAttribute("onstage", "");
                                continue;
                            }
                            dat.classList.add("border2");
                            let m = comps[Math.floor(j/2)].endgame.climb.climb.count.sum();
                            let percents = comps[Math.floor(j/2)].endgame.climb.climb.count.map(v => (m > 0) ? (v/m) : 0);
                            let len = comps[Math.floor(j/2)].endgame.climb.climb.len;
                            let k = 0;
                            for (let kk = 0; kk < 3; kk++) {
                                if (percents[kk] <= 0) continue;
                                if (percents[kk] < percents[k]) continue;
                                k = kk;
                            }
                            if (j % 2 == 0) {
                                dat.classList.add("eg");
                                if (k == 0);
                                else if (k == 1) dat.setAttribute("park", "");
                                else if (k == 2) dat.setAttribute("onstage", "");
                                continue;
                            }
                            dat.textContent = (k < 2) ? "N/A" : Math.round(len[k]/10)/100;
                        }
                        continue;
                    }
                    if (i == 24) {
                        for (let j = -1; j < 6; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j % 3 == 2) dat.classList.add("border");
                            if (j >= 0) dat.colSpan = 2;
                            if (j < 0) {
                                dat.textContent = this.simulated ? "Trap%" : "Trap";
                                continue;
                            }
                            if (!this.simulated) {
                                if (j % 3 > 0) {
                                    dat.remove();
                                    continue;
                                }
                                dat.colSpan = 6;
                                dat.classList.add("border");
                                dat.textContent = (tbamatch == null) ? 0 : tbamatch.score_breakdown[["red", "blue"][Math.floor(j/6)]].endGameNoteInTrapPoints;
                                continue;
                            }
                            dat.classList.add("yn");
                            let percent = comps[j].endgame.trap.percent;
                            dat.textContent = ((percent == null) ? 0 : (Math.round(percent*10000)/100))+"%";
                            if (percent > 0.5) dat.setAttribute("yes", "");
                        }
                        continue;
                    }
                    if (i == 27) {
                        for (let j = -1; j < 2; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j >= 0) dat.colSpan = 6;
                            if (j < 0) {
                                continue;
                            }
                            dat.classList.add("border");
                            dat.classList.add("header");
                            dat.style.backgroundColor = "var(--"+"rb"[j]+"3)";
                            dat.textContent = "Total Score";
                        }
                        continue;
                    }
                    if ([28, 29, 30, 31].includes(i)) {
                        let ii = i-28;
                        row.classList.add("dats");
                        if (ii >= 3) row.classList.add("special");
                        for (let j = -1; j < 4; j++) {
                            let dat = document.createElement("td");
                            row.appendChild(dat);
                            if (j < 0) {
                                dat.classList.add("dat");
                                dat.classList.add("k");
                                dat.textContent = ["Auto", "Teleop", "Endgame", "ΣScores"][ii];
                                continue;
                            }
                            dat.classList.add("border");
                            dat.colSpan = [4, 2][j%2];
                            let k = Math.floor(j/2);
                            if (j % 2 == 1) {
                                if (ii == 0) {
                                    dat.style.textAlign = "center";
                                    dat.style.fontWeight = 700;
                                    dat.textContent = "Notes Scored";
                                    continue;
                                }
                                if (ii == 1) {
                                    dat.rowSpan = 3;
                                    dat.style.textAlign = "center";
                                    if (!this.simulated) {
                                        if (tbamatch == null) {
                                            dat.textContent = 0;
                                            continue;
                                        }
                                        let breakdown = tbamatch.score_breakdown[["red", "blue"][Math.floor(j/2)]];
                                        dat.textContent = breakdown.autoSpeakerNoteCount+breakdown.autoAmpNoteCount+breakdown.teleopSpeakerNoteAmplifiedCount+breakdown.teleopSpeakerNoteCount+!!breakdown.trapCenterStage+!!breakdown.trapStageLeft+!!breakdown.trapStageRight;
                                        continue;
                                    }
                                    dat.textContent = comps.slice(k*3, (k+1)*3).map(comp => 
                                        comp.auto.scores.speaker.success + comp.auto.scores.amp.success +
                                        comp.teleop.scores.speaker.success + comp.teleop.scores.amp.success +
                                        !!comp.endgame.trap.state
                                    ).sum();
                                    continue;
                                }
                                dat.remove();
                                continue;
                            }
                            dat.classList.add("dat");
                            dat.classList.add("v");
                            dat.classList.add("i0");
                            let score = 0;
                            if (this.simulated) {
                                if (ii < 3) score = comps.slice(k*3, (k+1)*3).map(comp => comp[["auto", "teleop", "endgame"][ii]].score).sum();
                                else score = comps.slice(k*3, (k+1)*3).map(comp => ["auto", "teleop", "endgame"].map(k => comp[k].score).sum()).sum();
                            } else {
                                if (tbamatch != null) {
                                    let breakdown = tbamatch.score_breakdown[["red", "blue"][Math.floor(j/2)]];
                                    score = [
                                        breakdown.autoPoints,
                                        breakdown.teleopTotalNotePoints,
                                        breakdown.endGameTotalStagePoints+breakdown.endGameNoteInTrapPoints,
                                        breakdown.totalPoints,
                                    ][ii];
                                }
                            }
                            dat.textContent = score;
                        }
                        continue;
                    }
                }
            };
            this.addHandler("post-refresh", updateMatchAnalyticsTable);
            this.addHandler("change", updateMatchAnalyticsTable);

            this.ePitDataPage = document.getElementById("pit-data-page");
            const updatePitDataPage = () => {
                this.ePitDataPage.innerHTML = "";
                let listings = {};
                for (let t in pitData) {
                    let data = pitData[t];
                    let team = getPitValue(data, "team-number");
                    listings[team] = [];
                    makePitDataListing(data, { collapsible: true, showTeam: true }).forEach(elem => listings[team].push(elem));
                }
                Object.keys(listings).sort((a, b) => parseInt(a)-parseInt(b)).forEach(team => listings[team].forEach(elem => this.ePitDataPage.appendChild(elem)));
            };
            this.addHandler("post-refresh", updatePitDataPage);

            this.ePickListPage = document.getElementById("pick-list-page");
            const getIndex = y => {
                let rows = Array.from(this.ePickListTable.querySelectorAll("tr.item"));
                for (let i = 0; i < rows.length; i++) {
                    let r = rows[i].getBoundingClientRect();
                    if (y < r.top+r.height/2) return i;
                }
                return rows.length;
            };
            let line = document.createElement("tr");
            line.classList.add("line");
            line.innerHTML = "<td colspan='8'></td>";
            let pickList2 = [];
            this.addHandler("post-refresh", () => (pickList2 = [...pickList]));
            setInterval(() => {
                if (this.locked) return;
                if (pickList.length == pickList2.length) {
                    let diff = false;
                    for (let i = 0; i < pickList.length; i++) {
                        if (pickList[i] == pickList2[i]) continue;
                        diff = true;
                        break;
                    }
                    if (!diff) return;
                }
                postPickList();
            }, 5*1000);
            const postPickList = async () => {                
                await this.whenUnlocked();
                this.lock();

                try {
                    console.log("📝:🔑 pick-list: PYAW");
                    let resp = await fetch("https://ppatrol.pythonanywhere.com/data/pickList", {
                        method: "POST",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                            "Password": pwd,
                        },
                        body: JSON.stringify({
                            v: pickList,
                        }),
                    });
                    if (resp.status != 200) throw resp.status;
                } catch (e) {
                    console.log("📝:🔑 pick-list: PYAW ERR", e);
                }

                this.unlock();

                this.refresh();
            };
            const dragIn = e => {
                e.preventDefault();
                line.remove();
                let i = getIndex(e.pageY);
                if (i+1 < this.ePickListTable.children[0].children.length)
                    this.ePickListTable.children[0].insertBefore(line, this.ePickListTable.children[0].children[i+1]);
                else this.ePickListTable.children[0].appendChild(line);
            };
            const dragOut = e => {
                e.preventDefault();
                line.remove();
            };
            const drop = e => {
                e.preventDefault();
                let team = util.ensure(parseInt(e.dataTransfer.getData("text/plain")), "int");
                setTimeout(() => {
                    pickList.splice(pickList.indexOf(team), 1);
                    let i = getIndex(e.pageY);
                    pickList.splice(i, 0, team);
                    dragOut(e);
                    updatePickListTable();
                }, 100);
            };
            this.ePickListPage.addEventListener("dragenter", dragIn);
            this.ePickListPage.addEventListener("dragover", dragIn);
            this.ePickListPage.addEventListener("dragleave", dragOut);
            this.ePickListPage.addEventListener("dragend", dragOut);
            this.ePickListPage.addEventListener("drop", drop);
            this.ePickListAdd = document.getElementById("pick-list-add");
            this.ePickListAdd.addEventListener("click", e => {
                let team = prompt("Team:");
                if (team == null) return;
                team = util.ensure(parseInt(team), "int");
                if (this.locked) return;
                pickList.unshift(team);
                updatePickListTable();
            });
            this.ePickListTable = document.getElementById("pick-list-table");
            let ids = new Set();
            const updatePickListTable = () => {
                [...ids].forEach(id => {
                    clearTimeout(id);
                    ids.delete(id);
                });
                Array.from(this.ePickListTable.querySelectorAll("tr.item")).forEach(elem => elem.remove());
                pickList.forEach((team, k) => {
                    const comp = computeFullTeam(team);
                    const scouted = computeScouted(team);
                    let row = document.createElement("tr");
                    this.ePickListTable.children[0].appendChild(row);
                    row.classList.add("item");
                    row.draggable = true;
                    row.addEventListener("dragstart", e => {
                        if (!this.ePickListTable.contains(row)) return;
                        let id = setTimeout(() => {
                            ids.delete(id);
                            row.remove();
                        }, 50);
                        ids.add(id);
                        e.dataTransfer.setData("text/plain", String(team));
                    });
                    row.addEventListener("dragend", e => {
                        let id = setTimeout(() => {
                            if (this.ePickListTable.contains(row)) return;
                            ids.delete(id);
                            if (k+2 < this.ePickListTable.children[0].children.length)
                                this.ePickListTable.children[0].insertBefore(row, this.ePickListTable.children[k+2]);
                            else this.ePickListTable.children[0].appendChild(row);
                        }, 50);
                        ids.add(id);
                    });
                    for (let i = 0; i < 8; i++) {
                        let dat = document.createElement("td");
                        row.appendChild(dat);
                        if (i == 0) {
                            dat.innerHTML = "<span></span><button><ion-icon name='close'></ion-icon></button><button><ion-icon name='pencil'></ion-icon></button>";
                            dat.children[0].textContent = k+1;
                            dat.children[1].addEventListener("click", e => {
                                const ans = confirm(`Are you sure you want to remove this team (#${team} in place ${k+1}) from your pick list?`);
                                if (!ans) return;
                                if (this.locked) return;
                                pickList.splice(pickList.indexOf(team), 1);
                                updatePickListTable();
                            });
                            dat.children[2].addEventListener("click", e => {
                                let t = prompt(`Replace this team (#${team} in place ${k+1}) with team:`);
                                if (t == null) return;
                                t = util.ensure(parseInt(t), "int");
                                if (this.locked) return;
                                pickList[pickList.indexOf(team)] = t;
                                updatePickListTable();
                            });
                            continue;
                        }
                        if (i == 1) {
                            dat.textContent = team;
                            dat.addEventListener("click", e => {
                                eNavButtons["team-analytics"].click();
                                this.team = team;
                            });
                            continue;
                        }
                        if (i == 2) {
                            dat.innerHTML = new Array(3).fill("<span></span>").join("<span>/</span>");
                            for (let j = 0; j < dat.children.length; j += 2) dat.children[j].textContent = scouted[["scouted", "total", "extra"][j/2]];
                            continue;
                        }
                        if (i >= 3 && i <= 6) {
                            dat.textContent = [
                                comp.auto.score,
                                comp.teleop.score,
                                comp.endgame.score,
                                comp.score,
                            ][i-3];
                            continue;
                        }
                        if (i == 7) {
                            dat.innerHTML = new Array(comp.notes.length).fill("<span></span>").join("<span></span>");
                            for (let j = 0; j < dat.children.length; j += 2) dat.children[j].textContent = comp.notes[j/2].note;
                            continue;
                        }
                    }
                });
            };
            this.addHandler("post-refresh", updatePickListTable);

            this.eAPISave = document.getElementById("api-save");
            this.eAPISave.addEventListener("click", async e => {
                const ans = confirm("Are you sure you want to save this data? It could potentially erase anyone else that was editing this!");
                if (!ans) return;

                await this.whenUnlocked();
                this.lock();

                try {
                    console.log("📝:🔑 /"+this.path+": PYAW");
                    let resp = await fetch("https://ppatrol.pythonanywhere.com/data/"+this.path, {
                        method: "POST",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                            "Password": pwd,
                        },
                        body: JSON.stringify({
                            v: JSON.parse(this.eAPIInput.value.replaceAll("\t", "  ")),
                        }),
                    });
                    if (resp.status != 200) throw resp.status;
                } catch (e) {
                    console.log("📝:🔑 /"+this.path+": PYAW ERR", e);
                }

                this.unlock();

                this.refresh();
            });
            this.eAPIPath = document.getElementById("api-path");
            this.eAPIPath.addEventListener("change", e => {
                this.path = this.eAPIPath.value;
            });
            this.eAPIInput = document.getElementById("api-input");
            this.eAPIDisplay = document.getElementById("api-display");
            this.eAPIDisplayContent = document.getElementById("api-display-content");
            const updateAPIDisplay = () => {
                this.eAPIPath.value = this.path;
                let value = this.eAPIInput.value;
                if (value.endsWith("\n")) value += " ";
                this.eAPIDisplayContent.innerHTML = "\n"+value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
                Prism.highlightElement(this.eAPIDisplayContent);
            };
            this.eAPIInput.addEventListener("input", updateAPIDisplay);
            this.eAPIInput.addEventListener("keydown", e => {
                if (e.code != "Tab") return;
                e.preventDefault();
                let value = this.eAPIInput.value;
                let before = value.slice(0, this.eAPIInput.selectionStart);
                let after = value.slice(this.eAPIInput.selectionEnd, value.length);
                let tab = "  ";
                let pos = this.eAPIInput.selectionEnd + tab.length;
                this.eAPIInput.value = before+tab+after;
                this.eAPIInput.selectionStart = this.eAPIInput.selectionEnd = pos;
                updateAPIDisplay();
            });
            this.eAPIInput.addEventListener("scroll", e => {
                this.eAPIDisplay.scrollTop = this.eAPIInput.scrollTop;
                this.eAPIDisplay.scrollLeft = this.eAPIInput.scrollLeft;
            });
            const updateAPIDisplayFully = async (c, f, t) => {
                if (c != null && !["path"].includes(c)) return;
                let apiData = null;
                try {
                    console.log("🛜 /"+this.path+": PYAW");
                    let resp = await fetch("https://ppatrol.pythonanywhere.com/data/"+this.path, {
                        method: "GET",
                        mode: "cors",
                        headers: {
                            "Password": pwd,
                            "Clean": true,
                        },
                    });
                    if (resp.status != 200) throw resp.status;
                    apiData = await resp.text();
                } catch (e) {
                    console.log("🛜 /"+this.path+": PYAW ERR", e);
                    apiData = null;
                }
                apiData = util.ensure(apiData, "str");
                this.eAPIInput.value = apiData.replaceAll("\t", "  ");
                updateAPIDisplay();
            };
            this.addHandler("post-refresh", updateAPIDisplayFully);
            this.addHandler("change", updateAPIDisplayFully);

            this.refresh();

        });

        this.addHandler("refresh", async () => {
            await this.whenUnlocked();
            this.lock();
            this.post("pre-refresh");

            await Promise.all([
                async () => {
                    try {
                        console.log("🛜 api-key: PYAW");
                        let resp = await fetch("https://ppatrol.pythonanywhere.com/data/apiKey", {
                            method: "GET",
                            mode: "cors",
                            headers: {
                                "Password": pwd,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        console.log("🛜 api-key: PYAW = "+resp);
                        apiKey = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 api-key: PYAW ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 api-key: LS");
                            apiKey = JSON.parse(localStorage.getItem("api-key"));
                        } catch (e) {
                            console.log("🛜 api-key: LS ERR", e);
                            apiKey = null;
                        }
                    }
                    apiKey = (apiKey == null) ? null : String(apiKey);
                    localStorage.setItem("api-key", JSON.stringify(apiKey));
                },
                async () => {
                    try {
                        console.log("🛜 event-key: PYAW");
                        let resp = await fetch("https://ppatrol.pythonanywhere.com/data/eventKey", {
                            method: "GET",
                            mode: "cors",
                            headers: {
                                "Password": pwd,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        console.log("🛜 event-key: PYAW = "+resp);
                        eventKey = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 event-key: PYAW ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 event-key: LS");
                            eventKey = JSON.parse(localStorage.getItem("event-key"));
                        } catch (e) {
                            console.log("🛜 event-key: LS ERR", e);
                            eventKey = null;
                        }
                    }
                    eventKey = (eventKey == null) ? null : String(eventKey);
                    localStorage.setItem("event-key", JSON.stringify(eventKey));
                },
                async () => {
                    try {
                        console.log("🛜 scouters: PYAW");
                        let resp = await fetch("https://ppatrol.pythonanywhere.com/data/scouters", {
                            method: "GET",
                            mode: "cors",
                            headers: {
                                "Password": pwd,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 scouters: PYAW = "+resp);
                        scouters = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 scouters: PYAW ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 scouters: LS");
                            scouters = JSON.parse(localStorage.getItem("scouters"));
                        } catch (e) {
                            console.log("🛜 scouters: LS ERR", e);
                            scouters = null;
                        }
                    }
                    scouters = util.ensure(scouters, "arr").map(scouter => util.ensure(scouter, "obj")).sort(sortScouter);
                    localStorage.setItem("scouters", JSON.stringify(scouters));
                },
                async () => {
                    try {
                        console.log("🛜 matches-scouted: PYAW");
                        let resp = await fetch("https://ppatrol.pythonanywhere.com/data/matches", {
                            method: "GET",
                            mode: "cors",
                            headers: {
                                "Password": pwd,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 matches-scouted: PYAW = "+resp);
                        matchesScouted = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 matches-scouted: PYAW ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 matches-scouted: LS");
                            matchesScouted = JSON.parse(localStorage.getItem("matches-scouted"));
                        } catch (e) {
                            console.log("🛜 matches-scouted: LS ERR", e);
                            matchesScouted = null;
                        }
                    }
                    matchesScouted = util.ensure(matchesScouted, "obj");
                    matchesScouted = Object.keys(matchesScouted).map(t => {
                        let match = matchesScouted[t];
                        match._t = t;
                        return match;
                    });
                    localStorage.setItem("matches-scouted", JSON.stringify(matchesScouted));
                    matchesScouted.sort((a, b) => a.id-b.id);
                },
                async () => {
                    try {
                        console.log("🛜 pit: PYAW");
                        let resp = await fetch("https://ppatrol.pythonanywhere.com/data/pit", {
                            method: "GET",
                            mode: "cors",
                            headers: {
                                "Password": pwd,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 pit: PYAW = "+resp);
                        pitData = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 pit: PYAW ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 pit: LS");
                            pitData = JSON.parse(localStorage.getItem("pit"));
                        } catch (e) {
                            console.log("🛜 pit: LS ERR", e);
                            pitData = null;
                        }
                    }
                    pitData = util.ensure(pitData, "obj");
                    localStorage.setItem("pit", JSON.stringify(pitData));
                },
                async () => {
                    try {
                        console.log("🛜 pick-list: PYAW");
                        let resp = await fetch("https://ppatrol.pythonanywhere.com/data/pickList", {
                            method: "GET",
                            mode: "cors",
                            headers: {
                                "Password": pwd,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 pick-list: PYAW = "+resp);
                        pickList = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 pick-list: PYAW ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 pick-list: LS");
                            pickList = JSON.parse(localStorage.getItem("pick-list"));
                        } catch (e) {
                            console.log("🛜 pick-list: LS ERR", e);
                            pickList = null;
                        }
                    }
                    pickList = util.ensure(pickList, "arr").map(v => util.ensure(v, "int"));
                    localStorage.setItem("pick-list", JSON.stringify(pickList));
                },
            ].map(f => f()));
            await Promise.all([
                async () => {
                    try {
                        console.log("🛜 event: TBA");
                        if (apiKey == null) throw "api-key";
                        if (eventKey == null) throw "event-key";
                        let resp = await fetch("https://www.thebluealliance.com/api/v3/event/"+eventKey, {
                            method: "GET",
                            headers: {
                                "Accept": "application/json",
                                "X-TBA-Auth-Key": apiKey,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 event: TBA = "+resp);
                        event = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 event: TBA ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 event: LS");
                            event = JSON.parse(localStorage.getItem("event"));
                        } catch (e) {
                            console.log("🛜 event: LS ERR", e);
                            event = null;
                        }
                    }
                    event = util.ensure(event, "obj");
                    localStorage.setItem("event", JSON.stringify(event));
                },
                async () => {
                    try {
                        console.log("🛜 event-ratings: TBA");
                        if (apiKey == null) throw "api-key";
                        if (eventKey == null) throw "event-key";
                        let resp = await fetch("https://www.thebluealliance.com/api/v3/event/"+eventKey+"/oprs", {
                            method: "GET",
                            headers: {
                                "Accept": "application/json",
                                "X-TBA-Auth-Key": apiKey,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 event-ratings: TBA = "+resp);
                        eventRatings = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 event-ratings: TBA ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 event-ratings: LS");
                            eventRatings = JSON.parse(localStorage.getItem("event-ratings"));
                        } catch (e) {
                            console.log("🛜 event-ratings: LS ERR", e);
                            eventRatings = null;
                        }
                    }
                    eventRatings = util.ensure(eventRatings, "obj");
                    localStorage.setItem("event-ratings", JSON.stringify(eventRatings));4
                },
                async () => {
                    try {
                        console.log("🛜 matches: TBA");
                        if (apiKey == null) throw "api-key";
                        if (eventKey == null) throw "event-key";
                        let resp = await fetch("https://www.thebluealliance.com/api/v3/event/"+eventKey+"/matches", {
                            method: "GET",
                            headers: {
                                "Accept": "application/json",
                                "X-TBA-Auth-Key": apiKey,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 matches: TBA = "+resp);
                        matches = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 matches: TBA ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 matches: LS");
                            matches = JSON.parse(localStorage.getItem("matches"));
                        } catch (e) {
                            console.log("🛜 matches: LS ERR", e);
                            matches = null;
                        }
                    }
                    matches = util.ensure(matches, "arr");
                    localStorage.setItem("matches", JSON.stringify(matches));
                    let matches2 = {};
                    matches.forEach(match => {
                        if (match.comp_level != "qm") return;
                        matches2[match.match_number] = match;
                    });
                    matches = matches2;
                },
                async () => {
                    try {
                        console.log("🛜 teams: TBA");
                        if (apiKey == null) throw "api-key";
                        if (eventKey == null) throw "event-key";
                        let resp = await fetch("https://www.thebluealliance.com/api/v3/event/"+eventKey+"/teams", {
                            method: "GET",
                            headers: {
                                "Accept": "application/json",
                                "X-TBA-Auth-Key": apiKey,
                            },
                        });
                        if (resp.status != 200) throw resp.status;
                        resp = await resp.text();
                        // console.log("🛜 teams: TBA = "+resp);
                        teams = JSON.parse(resp);
                    } catch (e) {
                        console.log("🛜 teams: TBA ERR", e);
                        try {
                            throw "LS IGNORE";
                            console.log("🛜 teams: LS");
                            teams = JSON.parse(localStorage.getItem("teams"));
                        } catch (e) {
                            console.log("🛜 teams: LS ERR", e);
                            teams = null;
                        }
                    }
                    teams = util.ensure(teams, "arr");
                    localStorage.setItem("teams", JSON.stringify(teams));
                },
            ].map(f => f()));

            // pickList = teams.map(team => team.team_number);

            if (1) {
                let c = [];
                teams.map(team => team.team_number).sort((a, b) => a-b).forEach(team => {
                    const comp = computeFullTeam(team);
                    c.push([team, comp.score]);
                });
                console.log(c.map(line => line.map(v => String(v).padEnd(4, " ")).join("\t")).join("\n"));
            }

            if (0) {
                matchesScouted = [];
                let profiles = {};
                Object.values(matches).forEach((match, i) => {
                    let teams = [
                        ...match.alliances.red.team_keys.map(key => parseInt(key.substring(3))),
                        ...match.alliances.blue.team_keys.map(key => parseInt(key.substring(3))),
                    ];
                    teams.forEach((team, j) => {
                        if (!(team in profiles))
                            profiles[team] = {
                                source: Math.random(),
                                ground: Math.random(),
                                speaker: Math.random(),
                                amp: Math.random(),
                                climb: Math.random(),
                                trap: Math.random(),
                                auto: Math.random(),
                                teleop: Math.random(),
                                cycle: Math.random(),
                            };
                        const profile = profiles[team];
                        // 60% chance of able to source
                        const canSource = profile.source < 0.6;
                        const sourceFailChance = canSource ? util.lerp(0, 0.25, profile.source/0.6) : 1;
                        // 90% chance of able to ground
                        const canGround = profile.ground < 0.9;
                        const groundFailChance = canGround ? util.lerp(0, 0.25, profile.ground/0.9) : 1;
                        // 80% chance of able to speaker
                        const canSpeaker = profile.speaker < 0.8;
                        const speakerFailChance = canSpeaker ? util.lerp(0, 0.25, profile.speaker/0.8) : 1;
                        // 60% chance of able to amp
                        const canAmp = profile.amp < 0.6;
                        const ampFailChance = canAmp ? util.lerp(0, 0.25, profile.amp/0.6) : 1;
                        // 30% chance of able to climb
                        const canClimb = profile.climb < 0.3;
                        const climbState = Math.max(0, canClimb ? Math.ceil(2*(1-profile.climb/0.3))-(+(Math.random()<0.3)) : 0);
                        // 30% chance of able to trap
                        const canTrap = profile.trap < 0.3;
                        const trapFailChance = canTrap ? (profile.trap/0.3) : 1;
                        // 90% chance of able to move during auto
                        const autoMobility = profile.auto < 0.9;
                        // 70% chance of able to pickup during auto
                        const autoPickups = autoMobility && profile.auto < 0.7;
                        // auto cycle time 5-7.5s
                        const autoCycleTime = autoPickups ? util.lerp(5, 7.5, profile.auto/0.7) : 0;
                        // teleop cycle time 9-12s
                        const teleopCycleTime = util.lerp(9, 12, Math.random());
                        // 15s auto
                        const l_auto = 15+util.lerp(-2,2,Math.random());
                        // 2min auto
                        const l_teleop = 2*60+util.lerp(-2,2,Math.random());
                        // 3-5s climb
                        const l_climb = util.lerp(3, 15, Math.random());
                        // generation
                        let t = util.lerp(0.25, 1, Math.random()), trying = "score";
                        let autoFrames = [];
                        while (t < l_auto) {
                            // trying to pickup
                            if (trying == "pickup") {
                                if (!autoMobility) break;
                                if (!autoPickups) break;
                                // cant pickup from ground
                                if (!canGround) break;
                                // deciding fail
                                let x = Math.random();
                                autoFrames.push({
                                    ts: t*1000,
                                    type: "pickup",
                                    state: {
                                        at: -1,
                                        value: x >= groundFailChance,
                                    },
                                });
                                // fail = 0.5-1s delay until retry
                                if (x < groundFailChance)
                                    t += util.lerp(0.5,1,Math.random());
                                // success = cycle_time/2 delay until score
                                else {
                                    trying = "score";
                                    t += autoCycleTime/2 + util.lerp(-1,1,Math.random());
                                }
                            }
                            // trying to score
                            if (trying == "score") {
                                // cant score speaker nor amp
                                if (!canSpeaker && !canAmp) break;
                                // deciding action
                                let action = null;
                                if (canSpeaker && canAmp) {
                                    // twice as likely to fail speaker than amp
                                    action = (Math.abs(speakerFailChance-2*ampFailChance) < 0.1) ? "amp" : "speaker";
                                    if (Math.random() < 0.25) action = { speaker: "amp", amp: "speaker" }[action];
                                }
                                else if (canSpeaker) action = "speaker";
                                else if (canAmp) action = "amp";
                                // deciding fail
                                let y = { speaker: speakerFailChance, amp: ampFailChance }[action];
                                let x = Math.random();
                                autoFrames.push({
                                    ts: t*1000,
                                    type: action,
                                    state: x >= y,
                                });
                                // fail = lost note, oh well, continue on
                                // success = cool, continue on
                                trying = "pickup";
                                t += autoCycleTime/2 + util.lerp(-1,1,Math.random());
                            }
                        }
                        t = Math.max(t, l_auto);
                        let teleopFrames = [];
                        while (t < l_auto+l_teleop) {
                            // trying to pickup
                            if (trying == "pickup") {
                                // cant pickup from ground nor source
                                if (!canGround && !canSource) break;
                                // deciding action
                                let action = null;
                                if (canSource && canGround) {
                                    // twice as likely to fail ground than source
                                    action = (Math.abs(groundFailChance-2*sourceFailChance) < 0.1) ? "source" : "ground";
                                    if (Math.random() < 0.25) action = { source: "ground", ground: "source" }[action];
                                }
                                else if (canSource) action = "source";
                                else if (canGround) action = "ground";
                                // deciding fail
                                let y = { source: sourceFailChance, ground: groundFailChance }[action];
                                let x = Math.random();
                                teleopFrames.push({
                                    ts: t*1000,
                                    type: action,
                                    state: x >= y,
                                });
                                // fail = 0.5-1s delay until retry
                                if (x < y)
                                    t += util.lerp(0.5,1,Math.random());
                                // success = cycle_time/2 delay until score
                                else {
                                    trying = "score";
                                    t += teleopCycleTime/2 + util.lerp(-1,1,Math.random());
                                }
                            }
                            // trying to score
                            if (trying == "score") {
                                // cant score speaker nor amp
                                if (!canSpeaker && !canAmp) break;
                                // deciding action
                                let action = null;
                                if (canSpeaker && canAmp) {
                                    // twice as likely to fail speaker than amp
                                    action = (Math.abs(speakerFailChance-2*ampFailChance) < 0.1) ? "amp" : "speaker";
                                    if (Math.random() < 0.25) action = { speaker: "amp", amp: "speaker" }[action];
                                }
                                else if (canSpeaker) action = "speaker";
                                else if (canAmp) action = "amp";
                                // deciding fail
                                let y = { speaker: speakerFailChance, amp: ampFailChance }[action];
                                let x = Math.random();
                                teleopFrames.push({
                                    ts: t*1000,
                                    type: action,
                                    state: (action == "speaker") ? { pos: {}, value: (x >= y) } : (x >= y),
                                });
                                // fail = lost note, oh well, continue on
                                // success = cool, continue on
                                trying = "pickup";
                                t += teleopCycleTime/2 + util.lerp(-1,1,Math.random());
                            }
                        }
                        t = Math.max(t, l_auto+l_teleop);
                        if (canClimb) {
                            for (let i = 0; i < climbState; i++) {
                                let p = (climbState > 1) ? (i/(climbState-1)) : 0;
                                teleopFrames.push({
                                    ts: util.lerp(t, t+l_climb, p)*1000,
                                    type: "climb",
                                    state: 1+i,
                                });
                            }
                        }
                        let match = {
                            id: i,
                            robot: team,
                            robotTeam: (j < 3) ? "r" : "b",

                            pos: [0, 0],
                            preloaded: true,

                            globalFrames: [{ ts: 0, type: "disable", state: false }],

                            autoFrames: autoFrames,
                            autoMobility: autoMobility,

                            teleopTime: l_auto*1000,
                            teleopFrames: teleopFrames,

                            endgameTrap: canTrap && (Math.random() < trapFailChance),
                            endgameHarmony: false,

                            finishTime: (l_auto+l_teleop+l_climb)*1000,

                            notes: new Array(Math.floor(util.lerp(10, 30, Math.random()))).fill(null).map(_ => (new Array(8).fill(" ").join("")+util.BASE64)[Math.floor((64+8)*Math.random())]).join(""),
                        };
                        matchesScouted.push(match);
                    });
                });
            }

            this.post("post-refresh");
            this.unlock();
        });
    }

    start() { this.post("start"); }

    setup() { this.post("setup"); }

    update(delta) { this.post("update", delta); }

    async refresh() { await this.postResult("refresh"); }
}