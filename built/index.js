var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define("util", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cacheCellGet = exports.assertNever = exports.onlyKey = exports.uuid = exports.clamp = exports.isTruthy = void 0;
    function isTruthy(x) {
        return !!x;
    }
    exports.isTruthy = isTruthy;
    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }
    exports.clamp = clamp;
    function uuid() {
        return crypto.randomUUID();
    }
    exports.uuid = uuid;
    function onlyKey(x) {
        const keys = Object.keys(x);
        return keys.length === 1 ? keys[0] : undefined;
    }
    exports.onlyKey = onlyKey;
    function assertNever(x) {
        throw new Error(`Not a never ${JSON.stringify(x)}`);
    }
    exports.assertNever = assertNever;
    function cacheCellGet(cell, key, f) {
        if (cell.key !== key || cell.value === undefined) {
            cell.key = key;
            cell.value = f();
            ;
        }
        return cell.value;
    }
    exports.cacheCellGet = cacheCellGet;
});
define("keyboard", ["require", "exports", "util"], function (require, exports, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.keyToSigil = exports.normaliseShortcut = exports.KeyMap = void 0;
    exports.KeyMap = {
        F1: 'F1',
        F2: 'F2',
        F3: 'F3',
        F4: 'F4',
        F5: 'F5',
        F6: 'F6',
        F7: 'F7',
        F8: 'F8',
        F9: 'F9',
        F10: 'F10',
        F11: 'F11',
        F12: 'F12',
        Digit1: '1',
        Digit2: '2',
        Digit3: '3',
        Digit4: '4',
        Digit5: '5',
        Digit6: '6',
        Digit7: '7',
        Digit8: '8',
        Digit9: '9',
        Digit0: '0',
        KeyA: 'A',
        KeyB: 'B',
        KeyC: 'C',
        KeyD: 'D',
        KeyE: 'E',
        KeyF: 'F',
        KeyG: 'G',
        KeyH: 'H',
        KeyI: 'I',
        KeyJ: 'J',
        KeyK: 'K',
        KeyL: 'L',
        KeyM: 'M',
        KeyN: 'N',
        KeyO: 'O',
        KeyP: 'P',
        KeyQ: 'Q',
        KeyR: 'R',
        KeyS: 'S',
        KeyT: 'T',
        KeyU: 'U',
        KeyV: 'V',
        KeyW: 'W',
        KeyX: 'X',
        KeyY: 'Y',
        KeyZ: 'Z',
        ShiftLeft: 'SHIFT',
        ShiftRight: 'SHIFT',
        ControlLeft: 'CTRL',
        ControlRight: 'CTRL',
        AltLeft: 'ALT',
        AltRight: 'ALT',
        MetaLeft: 'META',
        MetaRight: 'META',
        Escape: 'ESC',
        Tab: 'TAB',
        Backspace: 'BACKSPACE',
        Delete: 'DELETE',
        Enter: 'ENTER',
        CapsLock: 'CAPSLOCK',
        Space: 'SPACE',
        Home: 'HOME',
        End: 'END',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        Minus: '-',
        Equal: '=',
        BracketLeft: '[',
        BracketRight: ']',
        Semicolon: ';',
        Quote: '\'',
        Backslash: '\\',
        Backquote: '`',
        Comma: ',',
        Period: '.',
        Slash: '/',
    };
    function normaliseShortcut(sc) {
        const prio = ['META', 'CTRL', 'ALT', 'SHIFT'];
        return sc
            .toUpperCase()
            .split(/\s*\+\s*/g)
            .sort((x, y) => {
            const idx1 = prio.indexOf(x) === -1 ? x.charCodeAt(0) : prio.indexOf(x);
            const idx2 = prio.indexOf(y) === -1 ? y.charCodeAt(0) : prio.indexOf(y);
            return idx1 - idx2;
        })
            .join('+');
    }
    exports.normaliseShortcut = normaliseShortcut;
    function keyToSigil(k) {
        return [
            k.metaKey && 'META',
            k.ctrlKey && 'CTRL',
            k.altKey && 'ALT',
            k.shiftKey && 'SHIFT',
            exports.KeyMap[k.code] || k.code
        ]
            .filter(util_1.isTruthy)
            .join('+');
    }
    exports.keyToSigil = keyToSigil;
});
define("engine", ["require", "exports", "keyboard", "util"], function (require, exports, keyboard_1, util_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeDebugMsg = exports.addDebugMsg = exports.raise = exports.unlisten = exports.listen = exports.toggleRun = exports.toggleDebug = exports.removeShortcuts = exports.registerShortcuts = exports.setGameObject = exports.setup = exports.isMac = exports.clickY = exports.clickX = exports.mouseY = exports.mouseX = exports.pressedKeys = exports.dt = exports.lastT = exports.debug = exports.height = exports.width = exports.ctx = exports.canvas = void 0;
    let game;
    let drawGame;
    exports.debug = false;
    const frameWindow = 1000;
    let frameRateBuffer = [];
    exports.lastT = 0;
    exports.dt = 0;
    let gameStop = false;
    exports.pressedKeys = {};
    exports.isMac = /Mac/.test(navigator.userAgent);
    let KbShortcuts = new Map();
    const eventRegistry = {};
    function setup() {
        exports.canvas = document.getElementById('gameCanvas');
        exports.ctx = exports.canvas.getContext('2d');
        if (exports.ctx === null) {
            // Cannot initialise the context, show the banner message and exit
            document.getElementById('cannotInitBanner').style.display = null;
            return;
        }
        resize();
        window.onresize = resize;
        window.requestAnimationFrame(draw);
        window.addEventListener('keydown', keydownListener);
        window.addEventListener('keyup', keyupListener);
        window.addEventListener('keydown', e => {
            // do nothing if the originating element is input unless the pressed key is ESC
            // in case of ESC, the element should lose focus
            if (e.target.tagName === 'INPUT') {
                if (keyboard_1.KeyMap[e.code] === 'ESC') {
                    e.target.blur();
                }
                return;
            }
            const sigil = (0, keyboard_1.keyToSigil)(e);
            const handler = KbShortcuts.get(sigil);
            if (handler && (!e.repeat || handler.repeat)) {
                handler.fn();
                // TODO: this should be configurable
                e.preventDefault();
            }
        });
        window.addEventListener('mousemove', e => {
            // TODO: should clip left/top too (e.g. if the canvas is in the middle of the screen)
            exports.mouseX = (0, util_2.clamp)(e.pageX, 0, exports.width);
            exports.mouseY = (0, util_2.clamp)(e.pageY, 0, exports.height);
        });
        exports.canvas.addEventListener('mousedown', e => {
            if (e.button !== 0) {
                return;
            }
            exports.clickX = e.offsetX;
            exports.clickY = e.offsetY;
            raise({ kind: 'mousedown', clickX: exports.clickX, clickY: exports.clickY, button: e.button === 0 ? 'primary' : 'secondary', preventDefault: false });
        });
        exports.canvas.addEventListener('contextmenu', e => {
            exports.clickX = e.offsetX;
            exports.clickY = e.offsetY;
            const customEvent = {
                kind: 'mousedown',
                clickX: exports.clickX,
                clickY: exports.clickY,
                button: e.button === 0 ? 'primary' : 'secondary',
                preventDefault: false
            };
            raise(customEvent);
            if (customEvent.preventDefault) {
                e.preventDefault();
                return false;
            }
            return undefined;
        });
        // listen on the window for mouse-up, otherwise the event is not received if clicked outside of the window or canvas
        window.addEventListener('mouseup', e => {
            if (e.button !== 0 && e.button !== 2) {
                return;
            }
            raise({ kind: 'mouseup', clickX: exports.clickX, clickY: exports.clickY, button: e.button === 0 ? 'primary' : 'secondary' });
            exports.clickX = undefined;
            exports.clickY = undefined;
        });
        exports.canvas.addEventListener('touchstart', e => {
            exports.clickX = exports.mouseX = e.touches[0].clientX;
            exports.clickY = exports.mouseY = e.touches[0].clientY;
        });
        exports.canvas.addEventListener('touchmove', e => {
            // TODO: should clip
            exports.mouseX = e.touches[0].clientX;
            exports.mouseY = e.touches[0].clientY;
        });
        window.addEventListener('touchend', () => {
            exports.clickX = undefined;
            exports.clickY = undefined;
        });
    }
    exports.setup = setup;
    function setGameObject(newGame) {
        game?.tearDown();
        game = newGame;
        game.setup();
        drawGame = game.draw;
        resize();
    }
    exports.setGameObject = setGameObject;
    function registerShortcuts(shortcuts) {
        for (const [fn, sc, repeat] of shortcuts) {
            const fixed = (0, keyboard_1.normaliseShortcut)(sc);
            KbShortcuts.set(fixed, { fn, repeat: repeat ?? false });
        }
    }
    exports.registerShortcuts = registerShortcuts;
    function removeShortcuts(shortcuts) {
        for (const [_, sc] of shortcuts) {
            const fixed = (0, keyboard_1.normaliseShortcut)(sc);
            KbShortcuts.delete(fixed);
        }
    }
    exports.removeShortcuts = removeShortcuts;
    function toggleDebug() {
        exports.debug = !exports.debug;
    }
    exports.toggleDebug = toggleDebug;
    function toggleRun() {
        gameStop = !gameStop;
        !gameStop && window.requestAnimationFrame(draw);
    }
    exports.toggleRun = toggleRun;
    function listen(e, f) {
        eventRegistry[e] = eventRegistry[e] || [];
        eventRegistry[e].push(f);
    }
    exports.listen = listen;
    function unlisten(e, f) {
        eventRegistry[e] = eventRegistry[e]?.filter(x => x !== f); // TYH
    }
    exports.unlisten = unlisten;
    function raise(e) {
        eventRegistry[e.kind]?.forEach(fn => fn(e)); // TYH
    }
    exports.raise = raise;
    function resize() {
        // if setup fails, etc
        if (!exports.canvas) {
            return;
        }
        exports.width = exports.canvas.clientWidth;
        exports.height = exports.canvas.clientHeight;
        // we need to set proper width / height of the canvas, as it's 300x150 by default
        // also, make sure that it takes into account high dpi displays
        const devicePixelRatio = window.devicePixelRatio ?? 1;
        exports.canvas.width = exports.width * devicePixelRatio;
        exports.canvas.height = exports.height * devicePixelRatio;
        // calling resize (by extension `scale`) multiple times is fine and does not add up,
        // as setting width/height of the canvas resets the context & its matrix
        exports.ctx.scale(devicePixelRatio, devicePixelRatio);
        raise({ kind: 'resize' });
    }
    function keydownListener(e) {
        const code = keyboard_1.KeyMap[e.code] || e.code;
        // tab has a special meaning; if it is fired point-blank, we cancel the default behaviour
        // otherwise, the keyup event might never be received if the window loses focus
        if (e.code === 'Tab' && e.target === document.body) {
            e.preventDefault();
        }
        exports.pressedKeys[code] = true;
        const customEvent = {
            kind: 'keydown',
            key: {
                altKey: e.altKey,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey,
                ctrlKey: e.ctrlKey,
                code: e.code,
                key: e.key,
                repeat: e.repeat,
            },
            preventDefault: false
        };
        raise(customEvent);
        if (customEvent.preventDefault) {
            e.preventDefault();
        }
    }
    function keyupListener(e) {
        const code = keyboard_1.KeyMap[e.code] || e.code;
        // when holding the meta (command) key, key-up events are not fired sans CapsLock
        // so we need to clear all pressed keys here
        if (exports.isMac && code === 'META') {
            const keys = Object.keys(exports.pressedKeys);
            for (const k of keys) {
                if (k !== 'CAPSLOCK') {
                    delete exports.pressedKeys[k];
                }
            }
        }
        delete exports.pressedKeys[code];
    }
    let DebugMessages = [
        () => {
            const fps = frameRateBuffer.length / frameWindow * 1000 | 0;
            return `w:${exports.width} h:${exports.height} fps:${fps}`;
        },
        () => {
            let min, max;
            if (frameRateBuffer.length) {
                max = frameRateBuffer.reduce((x, y) => x > y ? x : y);
                min = frameRateBuffer.reduce((x, y) => x < y ? x : y);
            }
            return `min:${min?.toFixed(2)} max:${max?.toFixed(2)}`;
        },
        () => {
            return `x:${exports.mouseX} y:${exports.mouseY}`;
        },
        () => {
            return exports.clickX && `cx:${exports.clickX} cy:${exports.clickY}`;
        },
        () => {
            const keys = Object.keys(exports.pressedKeys);
            return keys.length && `keys:${keys.join(', ')}`;
        }
    ];
    function addDebugMsg(f) {
        DebugMessages.push(f);
    }
    exports.addDebugMsg = addDebugMsg;
    function removeDebugMsg(f) {
        DebugMessages = DebugMessages.filter(x => x !== f);
    }
    exports.removeDebugMsg = removeDebugMsg;
    function drawDebug() {
        exports.ctx.fillStyle = 'darkred';
        exports.ctx.font = '10px monospace';
        const msg = DebugMessages
            .map(f => f())
            .filter(util_2.isTruthy);
        for (let i = 0; i < msg.length; ++i) {
            exports.ctx.fillText(msg[i], exports.width - 130, (i + 1) * 10);
        }
    }
    function updateFrameStats(dt) {
        frameRateBuffer.push(dt);
        const [frames] = frameRateBuffer.reduceRight(([fs, sum], x) => x + sum < frameWindow ? [fs + 1, x + sum] : [fs, frameWindow], [0, 0]);
        frameRateBuffer.splice(0, frameRateBuffer.length - frames);
    }
    function draw(t) {
        exports.dt = t - exports.lastT;
        exports.lastT = t;
        updateFrameStats(exports.dt);
        drawGame(exports.dt);
        exports.debug && drawDebug();
        if (!gameStop) {
            window.requestAnimationFrame(draw);
        }
    }
});
define("type-jihad", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("game", ["require", "exports", "engine", "util"], function (require, exports, engine_1, util_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assert_allBonuses = exports.draw = exports.tearDown = exports.setup = void 0;
    const rows = 13;
    const cols = 19;
    let sq;
    let hOffset;
    let wOffset;
    const grid = [];
    const players = [];
    const objects = [];
    const toAdd = [];
    const toDestroy = [];
    const PlayerMul = 0.5;
    const BombTime = 3000;
    const SplashTime = 333;
    const SpeedBonus = 0.33;
    let dbgObjs = undefined;
    function setup() {
        initPlayers();
        initGrid();
        (0, engine_1.listen)('resize', onResize);
    }
    exports.setup = setup;
    function tearDown() {
    }
    exports.tearDown = tearDown;
    function draw(dt) {
        engine_1.ctx.clearRect(0, 0, engine_1.width, engine_1.height);
        dbgObjs = undefined;
        // tick
        for (const player of players) {
            move(player, dt);
        }
        tickObjects();
        commitChanges();
        // draw
        drawBackground();
        drawGrid();
        drawObjects();
        drawDebugObjects();
        for (const player of players) {
            drawPlayer(player);
        }
    }
    exports.draw = draw;
    function onResize() {
        sq = Math.min(engine_1.width / cols | 0, engine_1.height / rows | 0, 50) | 0;
        const h = sq * rows;
        const w = sq * cols;
        hOffset = (engine_1.height - h) * 0.33 | 0;
        wOffset = (engine_1.width - w) / 2 | 0;
    }
    function move(player, dt) {
        const [dx, dy] = getInput(player);
        const speed = getSpeed(player);
        player.x += dx * dt * speed / 1000;
        player.y += dy * dt * speed / 1000;
        const px = player.x | 0;
        const py = player.y | 0;
        collectBonusIfAny(player, px, py);
        collisionCheck(player, px, py, dx, dy);
        if (engine_1.pressedKeys.SPACE) {
            const existing = select(px, py, 'bomb');
            const placedBombs = selectAll(x => x.kind === 'bomb' && x.playerId === player.id);
            if (!existing && placedBombs.length < getBombsCount(player)) {
                const splash = getSplash(player);
                toAdd.push({ kind: 'bomb', x: px, y: py, deleted: false, playerId: 1, splash, time: engine_1.lastT });
            }
        }
    }
    function collectBonusIfAny(player, px, py) {
        // check current square
        const obj = select(px, py);
        if (obj) {
            switch (obj.kind) {
                case 'bomb': break;
                case 'splash': break; // TODO: die
                case 'bonus-bomb': {
                    player.bonuses.bombs += 1;
                    obj.deleted = true;
                    break;
                }
                case 'bonus-speed': {
                    player.bonuses.speed += 1;
                    obj.deleted = true;
                    break;
                }
                case 'bonus-splash': {
                    player.bonuses.splash += 1;
                    obj.deleted = true;
                    break;
                }
                default:
                    (0, util_3.assertNever)(obj);
            }
        }
    }
    function collisionCheck(player, px, py, dx, dy) {
        // check the direction we are heading
        const sz = PlayerMul * sq;
        const playerAABBB = {
            x: player.x * sq - sz / 2,
            y: player.y * sq - sz / 2,
            w: sz,
            h: sz
        };
        const targets = dx
            ? [[dx + px, -1 + py], [dx + px, 0 + py], [dx + px, 1 + py]]
            : [[-1 + px, dy + py], [0 + px, dy + py], [1 + px, dy + py]];
        if (engine_1.debug) {
            dbgObjs = targets.map(([x, y]) => ({ x, y }));
        }
        for (const [x, y] of targets) {
            const aabb = {
                x: x * sq,
                y: y * sq,
                w: sq,
                h: sq
            };
            if (hasOverlap(playerAABBB, aabb)) {
                const gridObj = grid[x + y * cols];
                const obj = select(x, y, 'bomb');
                if (gridObj.kind === 'wall' || gridObj.kind === 'dirt' || obj) {
                    const fx = dx > 0
                        ? playerAABBB.x + playerAABBB.w - aabb.x
                        : aabb.x + aabb.w - playerAABBB.x;
                    const fy = dy > 0
                        ? playerAABBB.y + playerAABBB.w - aabb.y
                        : aabb.y + aabb.w - playerAABBB.y;
                    player.x += (fx * -dx) / sq;
                    player.y += (fy * -dy) / sq;
                }
            }
        }
    }
    function tickObjects() {
        for (const arr of objects) {
            if (!arr) {
                continue;
            }
            for (const o of arr) {
                if (o.deleted) {
                    continue;
                }
                switch (o.kind) {
                    case 'bomb': {
                        if (engine_1.lastT - o.time > BombTime) {
                            explode(o);
                        }
                        break;
                    }
                    case 'splash': {
                        if (engine_1.lastT - o.time > SplashTime) {
                            o.deleted = true;
                        }
                        break;
                    }
                    case 'bonus-bomb':
                    case 'bonus-speed':
                    case 'bonus-splash':
                        break;
                    default:
                        (0, util_3.assertNever)(o);
                }
            }
        }
    }
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    function explode(b) {
        // remove the bomb from the objects
        b.deleted = true;
        for (const [dx, dy] of directions) {
            let x = b.x;
            let y = b.y;
            let splash = b.splash + 1;
            while (splash) {
                const tile = grid[y * cols + x];
                if (tile.kind === 'wall') {
                    break;
                }
                const direction = dx ? 'x' : 'y';
                toAdd.push({ kind: 'splash', x, y, deleted: false, direction, time: engine_1.lastT });
                // TODO: destroying happen at the end of the `tick` loop as other bombs should be stopped as well
                if (tile.kind === 'dirt') {
                    toDestroy.push({ x, y });
                    break;
                }
                const existingBomb = select(x, y, 'bomb');
                if (existingBomb) {
                    explode(existingBomb);
                }
                --splash;
                x += dx;
                y += dy;
            }
        }
    }
    function drawGrid() {
        engine_1.ctx.lineWidth = 2;
        for (let y = 0; y < rows; ++y) {
            for (let x = 0; x < cols; ++x) {
                const tile = grid[y * cols + x];
                const style = tile.kind === 'wall' ? 'grey' :
                    tile.kind === 'grass' ? 'seagreen'
                        : 'burlywood'; //burlywood, saddlebrown
                engine_1.ctx.fillStyle = style;
                engine_1.ctx.fillRect(x * sq + wOffset, y * sq + hOffset, sq, sq);
            }
        }
    }
    function drawObjects() {
        for (const arr of objects) {
            if (!arr) {
                continue;
            }
            for (const o of arr) {
                drawObject(o);
            }
        }
    }
    function drawObject(o) {
        switch (o.kind) {
            case 'bomb': {
                const isOdd = (engine_1.lastT - o.time) / 250 & 1;
                const mul = isOdd ? 0.75 : 0.65;
                const center = (sq - sq * mul) / sq / 2;
                engine_1.ctx.fillStyle = 'red';
                engine_1.ctx.fillRect((o.x + center) * sq + wOffset, (o.y + center) * sq + hOffset, sq * mul, sq * mul);
                break;
            }
            case 'splash': {
                const mul = 0.65;
                const mulX = o.direction === 'x' ? 1 : mul;
                const mulY = o.direction === 'y' ? 1 : mul;
                const tx = (sq - sq * mulX) / sq / 2;
                const ty = (sq - sq * mulY) / sq / 2;
                engine_1.ctx.fillStyle = 'red';
                engine_1.ctx.fillRect((o.x + tx) * sq + wOffset, (o.y + ty) * sq + hOffset, sq * mulX, sq * mulY);
                break;
            }
            case 'bonus-bomb': {
                const mul = 0.5;
                const center = (sq - sq * mul) / sq / 2;
                engine_1.ctx.fillStyle = 'coral';
                engine_1.ctx.fillRect((o.x + center) * sq + wOffset, (o.y + center) * sq + hOffset, sq * mul, sq * mul);
                break;
            }
            case 'bonus-speed': {
                engine_1.ctx.fillStyle = 'coral';
                engine_1.ctx.fillRect((o.x + 0.25) * sq + wOffset, (o.y + 0.6) * sq + hOffset, sq * 0.1, sq * 0.2);
                engine_1.ctx.fillRect((o.x + 0.45) * sq + wOffset, (o.y + 0.4) * sq + hOffset, sq * 0.1, sq * 0.4);
                engine_1.ctx.fillRect((o.x + 0.65) * sq + wOffset, (o.y + 0.2) * sq + hOffset, sq * 0.1, sq * 0.6);
                break;
            }
            case 'bonus-splash': {
                engine_1.ctx.fillStyle = 'coral';
                engine_1.ctx.fillRect((o.x + 0.27) * sq + wOffset, (o.y + 0.35) * sq + hOffset, sq * 0.08, sq * 0.3);
                engine_1.ctx.fillRect((o.x + 0.45) * sq + wOffset, (o.y + 0.2) * sq + hOffset, sq * 0.1, sq * 0.6);
                engine_1.ctx.fillRect((o.x + 0.65) * sq + wOffset, (o.y + 0.35) * sq + hOffset, sq * 0.08, sq * 0.3);
                break;
            }
            default: {
                (0, util_3.assertNever)(o);
            }
        }
    }
    function drawDebugObjects() {
        if (dbgObjs) {
            for (const obj of dbgObjs) {
                engine_1.ctx.lineWidth = 2;
                engine_1.ctx.strokeStyle = 'red';
                engine_1.ctx.strokeRect(obj.x * sq + 1 + wOffset, obj.y * sq + 1 + hOffset, sq - 2, sq - 2);
            }
        }
    }
    function drawBackground() {
        engine_1.ctx.fillStyle = '#000';
        engine_1.ctx.fillRect(0, 0, engine_1.width, engine_1.height);
    }
    function drawPlayer(player) {
        engine_1.ctx.fillStyle = 'lightgrey';
        const sz = sq * PlayerMul;
        engine_1.ctx.fillRect(player.x * sq - (sz / 2) + wOffset, player.y * sq - (sz / 2) + hOffset, sz, sz);
    }
    function getInput(player) {
        if (player.id === 1) {
            switch (true) {
                case engine_1.pressedKeys.RIGHT: return [1, 0];
                case engine_1.pressedKeys.LEFT: return [-1, 0];
                case engine_1.pressedKeys.UP: return [0, -1];
                case engine_1.pressedKeys.DOWN: return [0, 1];
            }
            return [0, 0];
        }
        return [0, 0];
    }
    function initGrid() {
        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < cols; ++j) {
                // the boundaries
                if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
                    grid.push({ kind: 'wall' });
                    continue;
                }
                // the beams
                if (i % 2 === 0 && j % 2 === 0) {
                    grid.push({ kind: 'wall' });
                    continue;
                }
                const tile = random() < 0.9
                    ? { kind: 'dirt' }
                    : { kind: 'grass' };
                grid.push(tile);
            }
        }
        // clean up the area around the player
        for (const player of players) {
            const px = player.x | 0;
            const py = player.y | 0;
            [px, px + 1, px - 1]
                .flatMap(x => [py, py + 1, py - 1].map(y => [x, y]))
                .forEach(([x, y]) => {
                if (grid[x + y * cols].kind === 'dirt') {
                    grid[x + y * cols] = { kind: 'grass' };
                }
            });
        }
    }
    function initPlayers() {
        const player = {
            id: 1,
            x: 1.5,
            y: 1.5,
            bonuses: {
                bombs: 0,
                speed: 0,
                splash: 0
            },
        };
        // let playerSpeed = 1.5;
        players.push(player);
    }
    function select(x, y, kind) {
        const arr = objects[y * cols + x];
        if (!arr) {
            return undefined;
        }
        for (const o of arr) {
            if (o.deleted) {
                continue;
            }
            if (o.kind === kind || kind === undefined) {
                return o;
            }
        }
        return undefined;
    }
    function selectAll(f) {
        const ret = [];
        for (const arr of objects) {
            if (!arr) {
                continue;
            }
            for (const o of arr) {
                if (o.deleted) {
                    continue;
                }
                if (f(o)) {
                    ret.push(o);
                }
            }
        }
        return ret;
    }
    function getSpeed(player) {
        return 1.5 + player.bonuses.speed * SpeedBonus;
    }
    function getBombsCount(player) {
        return player.bonuses.bombs + 1;
    }
    function getSplash(player) {
        return player.bonuses.splash + 1;
    }
    function commitChanges() {
        // remove deteled objects
        for (const arr of objects) {
            if (!arr) {
                continue;
            }
            for (let i = 0; i < arr.length; ++i) {
                if (arr[i].deleted) {
                    arr.splice(i, 1);
                    // move one index back due to deletion
                    i--;
                }
            }
        }
        // destroy dirt
        for (const obj of toDestroy) {
            const tile = grid[obj.y * cols + obj.x];
            // in case of many bombs, might already be destroyed by another bomb
            if (tile.kind !== 'dirt') {
                continue;
            }
            grid[obj.y * cols + obj.x] = { kind: 'grass' };
            const bonus = rollBonus();
            if (bonus) {
                toAdd.push({ kind: bonus, x: obj.x, y: obj.y, deleted: false });
            }
        }
        // add the new ones
        for (const o of toAdd) {
            const arr = objects[o.y * cols + o.x] ?? (objects[o.y * cols + o.x] = []);
            arr.push(o);
        }
        // empty the `toAdd` & `toDestroy` arrays
        toAdd.length = 0;
        toDestroy.length = 0;
    }
    const bonuses = ['bonus-bomb', 'bonus-speed', 'bonus-splash'];
    exports.assert_allBonuses = true;
    function rollBonus() {
        if (random() < 0.7) {
            return undefined;
        }
        const idx = Math.floor(random() * bonuses.length);
        return bonuses[idx];
    }
    const RandArray = new Uint32Array(1);
    function random() {
        return crypto.getRandomValues(RandArray)[0] / 2 ** 32;
    }
    function hasOverlap(a, b) {
        return b.x < a.x + a.w
            && a.x < b.x + b.w
            && b.y < a.y + a.h
            && a.y < b.y + b.h;
    }
});
define("index", ["require", "exports", "game", "engine"], function (require, exports, Game, engine_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Game = __importStar(Game);
    let KbShortcuts = [
        [engine_2.toggleDebug, '['],
    ];
    window.onload = function () {
        (0, engine_2.setup)();
        (0, engine_2.registerShortcuts)(KbShortcuts);
        (0, engine_2.setGameObject)(Game);
    };
});
