
import {
    ctx,

    listen,
    width, height, pressedKeys, lastT, debug
} from './engine'

import type { TypeEq, AssertTrue } from './type-jihad'
import { assertNever } from './util'


type Bomb = {
    kind: 'bomb',
    x: number,
    y: number,
    deleted: boolean,
    splash: number,
    playerId: number,
    time: number
}

type Splash = {
    kind: 'splash',
    x: number,
    y: number,
    deleted: boolean,
    direction: 'x' | 'y',
    time: number
}

type Bonus = { kind: 'bonus-bomb',   x: number, y: number, deleted: boolean }
           | { kind: 'bonus-speed',  x: number, y: number, deleted: boolean }
           | { kind: 'bonus-splash', x: number, y: number, deleted: boolean }

type GameObject = Bomb
                | Splash
                | Bonus

type TileType = { kind: 'wall' }
              | { kind: 'dirt' }
              | { kind: 'grass' }

type AABB = { x: number, y: number, w: number, h: number }

type Player = {
    id: number,
    x: number,
    y: number,
    bonuses: {
        splash: number,
        speed: number,
        bombs: number
    }
}

const rows = 13;
const cols = 19;

let sq: number;
let hOffset: number;
let wOffset: number;

const grid: TileType[] = [];
const players: Player[] = [];
const objects: GameObject[][] = [];
const toAdd: GameObject[] = [];
const toDestroy: { x: number, y: number }[] = [];

const PlayerMul = 0.5;
const BombTime = 3000;
const SplashTime = 333;

const SpeedBonus = 0.33;

let dbgObjs: { x: number, y: number }[] | undefined = undefined;

export function setup() {

    initPlayers();
    initGrid();

    listen('resize', onResize);
}

export function tearDown() {
}

export function draw(dt: number) {
    ctx.clearRect(0, 0, width, height);

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

function onResize() {
    sq = Math.min(
        width / cols | 0,
        height / rows | 0,
        50
    ) | 0;

    const h = sq * rows;
    const w = sq * cols;

    hOffset = (height - h) * 0.33 | 0;
    wOffset = (width - w) / 2 | 0;
}

function move(player: Player, dt: number) {
    const [dx, dy] = getInput(player);

    const speed = getSpeed(player);
    player.x += dx * dt * speed / 1000;
    player.y += dy * dt * speed / 1000;

    const px = player.x | 0;
    const py = player.y | 0;

    collectBonusIfAny(player, px, py);
    collisionCheck(player, px, py, dx, dy);

    if (pressedKeys.SPACE) {
        const existing = select(px, py, 'bomb');
        const placedBombs = selectAll(x => x.kind === 'bomb' && x.playerId === player.id);

        if (!existing && placedBombs.length < getBombsCount(player)) {
            const splash = getSplash(player);
            toAdd.push({ kind: 'bomb', x: px, y: py, deleted: false, playerId: 1, splash, time: lastT });
        }
    }
}

function collectBonusIfAny(player: Player, px: number, py: number) {
    // check current square
    const obj = select(px, py);
    if (obj) {
        switch (obj.kind) {
            case 'bomb':        break;
            case 'splash':      break; // TODO: die

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
                assertNever(obj);
        }
    }
}

function collisionCheck(player: Player, px: number, py: number, dx: number, dy: number) {
    // check the direction we are heading
    const sz = PlayerMul * sq;
    const playerAABBB: AABB = {
        x: player.x * sq - sz / 2,
        y: player.y * sq - sz / 2,
        w: sz,
        h: sz
    };

    const targets = dx
        ? [[dx + px, -1 + py], [dx + px, 0 + py], [dx + px, 1 + py]] as const
        : [[-1 + px, dy + py], [0 + px, dy + py], [1 + px, dy + py]] as const;

    if (debug) {
        dbgObjs = targets.map(([x, y]) => ({ x, y }));
    }

    for (const [x, y] of targets) {
        const aabb: AABB = {
            x: x * sq,
            y: y * sq,
            w: sq,
            h: sq
        };

        if (hasOverlap(playerAABBB, aabb)) {
            const gridObj = grid[x + y * cols]!;
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
                    if (lastT - o.time > BombTime) {
                        explode(o);
                    }

                    break;
                }

                case 'splash': {
                    if (lastT - o.time > SplashTime) {
                        o.deleted = true;
                    }

                    break;
                }

                case 'bonus-bomb':
                case 'bonus-speed':
                case 'bonus-splash':
                    break;

                default:
                    assertNever(o);
            }
        }
    }
}

const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
function explode(b: Bomb) {

    // remove the bomb from the objects
    b.deleted = true;

    for (const [dx, dy] of directions) {
        let x = b.x;
        let y = b.y;
        let splash = b.splash + 1;

        while (splash) {
            const tile = grid[y * cols + x]!;

            if (tile.kind === 'wall') {
                break;
            }

            const direction = dx ? 'x' : 'y';
            toAdd.push({ kind: 'splash', x, y, deleted: false, direction, time: lastT });

            // TODO: destruction happens at the end of the `tick` as other bombs should be
            // stopped by this dirt as well
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
    ctx.lineWidth = 2;
    for (let y = 0; y < rows; ++y) {
        for (let x = 0; x < cols; ++x) {
            const tile = grid[y * cols + x]!;

            const style = tile.kind === 'wall'  ? 'grey'  :
                          tile.kind === 'grass' ? 'seagreen'
                                                : 'burlywood'; //burlywood, saddlebrown

            ctx.fillStyle = style;
            ctx.fillRect(
                x * sq + wOffset,
                y * sq + hOffset,
                sq,
                sq
            );
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

function drawObject(o: GameObject) {
    switch (o.kind) {
        case 'bomb': {
            const isOdd = (lastT - o.time) / 250 & 1;
            const mul = isOdd ? 0.75 : 0.65;
            const center = (sq - sq * mul) / sq / 2;

            ctx.fillStyle = 'red';
            ctx.fillRect(
                (o.x + center) * sq + wOffset,
                (o.y + center) * sq + hOffset,
                sq * mul,
                sq * mul
            );

            break;
        }

        case 'splash': {
            const mul = 0.65;
            const mulX = o.direction === 'x' ? 1 : mul;
            const mulY = o.direction === 'y' ? 1 : mul;
            const tx = (sq - sq * mulX) / sq / 2;
            const ty = (sq - sq * mulY) / sq / 2;

            ctx.fillStyle = 'red';
            ctx.fillRect(
                (o.x + tx) * sq + wOffset,
                (o.y + ty) * sq + hOffset,
                sq * mulX,
                sq * mulY
            );

            break;
        }

        case 'bonus-bomb': {
            const mul = 0.5;
            const center = (sq - sq * mul) / sq / 2;

            ctx.fillStyle = 'coral';
            ctx.fillRect(
                (o.x + center) * sq + wOffset,
                (o.y + center) * sq + hOffset,
                sq * mul,
                sq * mul
            );

            break;
        }

        case 'bonus-speed': {

            ctx.fillStyle = 'coral';
            ctx.fillRect(
                (o.x + 0.25) * sq + wOffset,
                (o.y + 0.6) * sq + hOffset,
                sq * 0.1,
                sq * 0.2
            );
            ctx.fillRect(
                (o.x + 0.45) * sq + wOffset,
                (o.y + 0.4) * sq + hOffset,
                sq * 0.1,
                sq * 0.4
            );
            ctx.fillRect(
                (o.x + 0.65) * sq + wOffset,
                (o.y + 0.2) * sq + hOffset,
                sq * 0.1,
                sq * 0.6
            );
            break;
        }

        case 'bonus-splash': {

            ctx.fillStyle = 'coral';
            ctx.fillRect(
                (o.x + 0.27) * sq + wOffset,
                (o.y + 0.35) * sq + hOffset,
                sq * 0.08,
                sq * 0.3
            );
            ctx.fillRect(
                (o.x + 0.45) * sq + wOffset,
                (o.y + 0.2) * sq + hOffset,
                sq * 0.1,
                sq * 0.6
            );
            ctx.fillRect(
                (o.x + 0.65) * sq + wOffset,
                (o.y + 0.35) * sq + hOffset,
                sq * 0.08,
                sq * 0.3
            );
            break;
        }

        default: {
            assertNever(o);
        }
    }
}

function drawDebugObjects() {
    if (dbgObjs) {
        for (const obj of dbgObjs) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.strokeRect(
                obj.x * sq + 1 + wOffset,
                obj.y * sq + 1 + hOffset,
                sq - 2,
                sq - 2
            );
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
}

function drawPlayer(player: Player) {
    ctx.fillStyle = 'lightgrey';

    const sz = sq * PlayerMul;
    ctx.fillRect(
        player.x * sq - (sz / 2) + wOffset,
        player.y * sq - (sz / 2) + hOffset,
        sz,
        sz
    );
}

function getInput(player: Player): [dx: number, dy: number] {

    if (player.id === 1) {
        switch (true) {
            case pressedKeys.RIGHT: return [ 1,  0];
            case pressedKeys.LEFT:  return [-1,  0];
            case pressedKeys.UP:    return [ 0, -1];
            case pressedKeys.DOWN:  return [ 0,  1];
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

            const tile: TileType = random() < 0.9
                ? { kind: 'dirt' }
                : { kind: 'grass' };
            grid.push(tile);
        }
    }

    // clean up the area around the player
    for (const player of players) {
        const px = player.x | 0;
        const py = player.y | 0;

        for (let dx = -1; dx <= 1; ++dx) {
            for (let dy = -1; dy <= 1; ++dy) {
                const x = px + dx;
                const y = py + dy;

                if (grid[x + y * cols]!.kind === 'dirt') {
                    grid[x + y * cols] = { kind: 'grass' };
                }
            }
        }
    }
}

function initPlayers() {
    const player: Player = {
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

function select<T extends GameObject['kind']>(x: number, y: number, kind?: T): Extract<GameObject, { kind: T }> | undefined {
    const arr = objects[y * cols + x];
    if (!arr) {
        return undefined;
    }

    for (const o of arr) {
        if (o.deleted) {
            continue;
        }

        if (o.kind === kind || kind === undefined) {
            return o as Extract<GameObject, { kind: T }>;
        }
    }

    return undefined;
}

function selectAll(f: (o: GameObject) => boolean) {
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

function getSpeed(player: Player) {
    return 1.5 + player.bonuses.speed * SpeedBonus;
}

function getBombsCount(player: Player) {
    return player.bonuses.bombs + 1;
}

function getSplash(player: Player) {
    return player.bonuses.splash + 1;
}

function commitChanges() {
    // remove deteled objects
    for (const arr of objects) {
        if (!arr) {
            continue;
        }

        for (let i = 0; i < arr.length; ++i) {
            if (arr[i]!.deleted) {
                arr.splice(i, 1);

                // move one index back due to deletion
                i--;
            }
        }
    }

    // destroy dirt
    for (const obj of toDestroy) {
        const tile = grid[obj.y * cols + obj.x]!;

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

const bonuses = [ 'bonus-bomb', 'bonus-speed', 'bonus-splash' ] as const;
export const assert_allBonuses: AssertTrue<TypeEq<Bonus['kind'], typeof bonuses[number]>> = true;

function rollBonus(): Bonus['kind'] | undefined {
    if (random() < 0.7) {
        return undefined;
    }

    const idx = Math.floor(random() * bonuses.length);
    return bonuses[idx];
}

const RandArray = new Uint32Array(1);
function random() {
    return crypto.getRandomValues(RandArray)[0]! / 2**32;
}

function hasOverlap(a: AABB, b: AABB) {
    return  b.x < a.x + a.w
         && a.x < b.x + b.w
         && b.y < a.y + a.h
         && a.y < b.y + b.h;
}
