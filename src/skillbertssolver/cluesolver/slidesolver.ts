import { delay, addzeros } from "../oldlib";

var mapw = 5;
var maph = 5;
var mapv = [mapw, maph];

type MapPoint = { cx: number, cy: number, f: boolean, p: boolean, x: number, y: number };
export type SlideMove = { x1: number, y1: number, x2: number, y2: number };
type Point = { x: number, y: number };

class Map {
	tiles: MapPoint[] = [];
	inverted: MapPoint[] = [];
	empty: MapPoint;
	moves: SlideMove[] = [];
	constructor(order: number[]) {
		if (order.length != mapw * maph) { throw "invalid import"; }
		for (var a = 0; a < order.length; a++) {
			var tile: MapPoint = {
				f: false,
				p: false,
				cx: (a % mapw), cy: Math.floor(a / mapw),
				x: (order[a] % mapw), y: Math.floor(order[a] / mapw)
			};
			this.tiles[tile.cx + tile.cy * mapw] = tile;
			this.inverted[tile.x + tile.y * mapw] = tile;
		}
		this.empty = this.inverted[this.inverted.length - 1];
	}
	clog() { clogmap(this); }
	getMinMoves() {
		var n = 0;
		for (var a = 0; a < this.inverted.length; a++) {
			var tile = this.inverted[a];
			if (tile == this.empty) { continue; }
			n += Math.abs(tile.cx - tile.x) + Math.abs(tile.cy - tile.y);
		}
		return n;
	}
	clone() {
		var r = new Map(this.toList());
		for (var a = 0; a < this.inverted.length; a++) {
			r.inverted[a].f = this.inverted[a].f;
			r.inverted[a].p = this.inverted[a].p;
		}
		return r;
	}
	getv(v: number[]) { return this.tiles[v[0] + v[1] * mapw]; }
	get(x: number, y: number) { return this.tiles[x + y * mapw]; }
	getinv(x: number, y: number) { return this.inverted[x + y * mapw]; }
	getinvv(v: number[]) { return this.inverted[v[0] + v[1] * mapw]; }
	movetile(tile: MapPoint, x: number, y: number, avoid: Point[] = []) {
		while (tile.cx != x || tile.cy != y) {
			var targets: Point[] = [];
			if (x < tile.cx) { targets.push({ x: tile.cx - 1, y: tile.cy }); }
			if (y < tile.cy) { targets.push({ x: tile.cx, y: tile.cy - 1 }); }
			if (x > tile.cx) { targets.push({ x: tile.cx + 1, y: tile.cy }); }
			if (y > tile.cy) { targets.push({ x: tile.cx, y: tile.cy + 1 }); }

			var c = avoid.concat({ x: tile.cx, y: tile.cy });
			this.moveempty(targets, c);
			this.swaptiles(tile, this.empty);
		}
	}
	moveempty(targets: Point[], avoid: Point[]) {
		var solutionscore = Infinity;
		var solution: Point[] | null = null;
		for (var a = 0; a < targets.length; a++) {
			var b = this.moveemptyrecur(avoid, [{ x: this.empty.cx, y: this.empty.cy }], { x: targets[a].x, y: targets[a].y }, 0, 10);
			if (b && b.score < solutionscore) { solutionscore = b.score; solution = b.locs; }
		}
		if (!solution) { throw new Error("Can't pathfind to required spot"); }

		for (var a = 1; a < solution.length; a++) {
			this.swaptiles(this.empty, solution[a].x, solution[a].y);
		}
	}
	moveemptyrecur(avoid: Point[], locs: Point[], target: Point, score: number, n: number): { score: number, locs: Point[] } | null {
		if (n == 0) { return null; }//to far recur
		var loc = locs[locs.length - 1];
		for (let a = 0; a < locs.length - 1; a++) { if (locs[a].x == loc.x && locs[a].y == loc.y) { return null; } }
		if (this.get(loc.x, loc.y).f) { return null; }//make sure we dont move finished parts

		for (let a in avoid) {
			if (loc.x == avoid[a].x && loc.y == avoid[a].y) { return null; }
		}

		var offpathscore = 0.7;
		if (loc.x == target.x && loc.y == target.y) { return { score, locs }; }
		var b = Infinity;
		var c: { score: number, locs: Point[] } | null = null;
		if (loc.x != 0) {
			var a = this.moveemptyrecur(avoid, locs.concat({ x: loc.x - 1, y: loc.y }), target, score + 1 + offpathscore * (this.get(loc.x - 1, loc.y).cx - this.get(loc.x - 1, loc.y).x), n - 1);
			if (a && a.score < b) { b = a.score; c = a; }
		}
		if (loc.y != 0) {
			var a = this.moveemptyrecur(avoid, locs.concat({ x: loc.x, y: loc.y - 1 }), target, score + 1 + offpathscore * (this.get(loc.x, loc.y - 1).cy - this.get(loc.x, loc.y - 1).y), n - 1);
			if (a && a.score < b) { b = a.score; c = a; }
		}
		if (loc.x != mapw - 1) {
			var a = this.moveemptyrecur(avoid, locs.concat({ x: loc.x + 1, y: loc.y }), target, score + 1 - offpathscore * (this.get(loc.x + 1, loc.y).cx - this.get(loc.x + 1, loc.y).x), n - 1);
			if (a && a.score < b) { b = a.score; c = a; }
		}
		if (loc.y != maph - 1) {
			var a = this.moveemptyrecur(avoid, locs.concat({ x: loc.x, y: loc.y + 1 }), target, score + 1 - offpathscore * (this.get(loc.x, loc.y + 1).cy - this.get(loc.x, loc.y + 1).y), n - 1);
			if (a && a.score < b) { b = a.score; c = a; }
		}

		return c;
	}
	swaptiles(x1: number, y1: number, x2: number, y2: number): void;
	swaptiles(p1: { cx: number, cy: number }, x2: number, y2: number): void;
	swaptiles(p1: { cx: number, cy: number }, p2: { cx: number, cy: number }): void;
	swaptiles() {
		var i = 0;//lil argument shuffle
		var x1: number, y1: number, x2: number, y2: number;
		if (typeof arguments[i] == "object") { x1 = arguments[i].cx; y1 = arguments[i].cy; i += 1; } else { x1 = arguments[i]; y1 = arguments[i + 1]; i += 2; }
		if (typeof arguments[i] == "object") { x2 = arguments[i].cx; y2 = arguments[i].cy; i += 1; } else { x2 = arguments[i]; y2 = arguments[i + 1]; i += 2; }

		//make sure 1st coordinate is the empty
		if (this.get(x2, y2) == this.empty) { let a = x1; let b = y1; x1 = x2; y1 = y2; x2 = a; y2 = b; }

		//update map
		var a = this.get(x1, y1);
		var b = this.get(x2, y2);
		var ia = this.tiles.indexOf(a);
		var ib = this.tiles.indexOf(b);
		this.tiles[ia] = b;
		this.tiles[ib] = a;
		a.cx = x2; a.cy = y2;
		b.cx = x1; b.cy = y1;

		if (x1 == x2 && y1 == y2) { console.warn("Same tile swapped"); return; }
		if (Math.abs(x1 - x2) + Math.abs(y1 - y2) != 1) { console.warn("Non adjecent swapped"); }

		//add to movelist
		this.moves.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
	}
	clearpath(x: number, y: number, clearstart: boolean) {
		if (clearstart) {//clear start location as well
			this.get(x, y).f = false; this.get(x, y).p = false;
			this.get(x + 1, y).f = false; this.get(x + 1, y).p = false;
			this.get(x, y + 1).f = false; this.get(x, y + 1).p = false;
			this.get(x + 1, y + 1).f = false; this.get(x + 1, y + 1).p = false;
		}

		while (x < mapw - 2 || y < maph - 2) {
			//pathfind to next
			var a: [number, number] | null = null;//best move vector
			var b = 0;//best score
			if (x < mapw - 2) {//right
				var c = 0;
				if (!this.get(x + 2, y).f) { c++; }
				if (!this.get(x + 2, y + 1).f) { c++; }
				if (c >= b) { b = c; a = [1, 0]; }
			}
			if (y < maph - 2) {//down
				c = 0;
				if (!this.get(x, y + 2).f) { c++; }
				if (!this.get(x + 1, y + 2).f) { c++; }
				if (c >= b) { b = c; a = [0, 1]; }
			}
			//TODO these can actually be null
			x += a![0];
			y += a![1];

			//break through
			this.get(x, y).f = false; this.get(x, y).p = false;
			this.get(x + 1, y).f = false; this.get(x + 1, y).p = false;
			this.get(x, y + 1).f = false; this.get(x, y + 1).p = false;
			this.get(x + 1, y + 1).f = false; this.get(x + 1, y + 1).p = false;
		}
	}

	tiledist(tile1: MapPoint, to?: number[]) {
		if (!to) { to = [tile1.x, tile1.y]; }
		return Math.abs(tile1.cx - to[0]) + Math.abs(tile1.cy - to[1]);
	}

	toList() {
		var r: number[] = [];
		for (var a = 0; a < this.tiles.length; a++) {
			r.push(this.tiles[a].x + this.tiles[a].y * mapw);
		}
		return r;
	}
}

export abstract class SlideSolver {
	initialState: number[];
	bestsolution: SlideMove[] | null = null;
	solving = false;
	maxfreeze = 50;
	onupdate: (() => any) | null = null;
	stopSolve = () => { };
	constructor(tiles: number[]) {
		this.initialState = tiles;
	}

	async startSolve(timelimit: number) {
		this.stopSolve();
		let stop = false;
		this.stopSolve = () => {
			stop = true;
			this.solving = false;
			this.onupdate?.();
		}
		this.solving = true;
		let endtime = Date.now() + timelimit;
		while (!stop) {
			let t = Date.now();
			while (Date.now() - t < this.maxfreeze) {
				this.solveStep();
			}
			this.onupdate?.();
			//go of the thread for a bit so ui gets a chance
			await delay(10);
			if (Date.now() > endtime) {
				this.stopSolve();
			}
		}
	}

	foundSolution(moves: SlideMove[]) {
		moves = optimisemoves(moves);
		if (!this.bestsolution || moves.length < this.bestsolution.length) {
			this.bestsolution = moves;
			console.log(this.bestsolution.length);
		}
	}

	solveStep() { }
}

export class SlideSolverRandom extends SlideSolver {
	firstrun = true;
	solveStep() {
		var first = this.firstrun;
		this.firstrun = false;
		var steps = 0;
		var map = new Map(this.initialState);
		while (true) {
			var actions = calcmap(map);
			if (actions.length == 0) { break; }
			actions.sort(function (a, b) { return b.score - a.score; });
			var n = (first ? 0 : Math.floor(actions.length * Math.random()));
			var action = actions[n];
			try { action.f(map); }
			catch{ break; }//TODO still cehck skillbertssolver paths even if this is dead end
			if (steps++ > 50) {
				console.log("failed to solve puzzle, over 50 actions attempted");
				return null;
			};
		}
		console.log(map.moves.length);
		if (map.getMinMoves() == 0) { this.foundSolution(map.moves); }
	}
}

type SolveMove = { dist: number, cost: number, h: number, map: Map, previous: SolveMove | null, score: number, n: string };

function backtracesolution(move: SolveMove) {
	var winmoves: SlideMove[] = [];
	var node: SolveMove | null = move;
	do {
		winmoves = ([] as SlideMove[]).concat(node.map.moves, winmoves);
	} while (node = node.previous)
	winmoves = optimisemoves(winmoves);
	return winmoves;
}

//new semi-Astar solver, turned out to perform worse than the random solver
export class SlideSolverAStar extends SlideSolver {
	biasses = [1, 0.7, 0.6, 0.55, 0.5];
	biasindex = 0;
	moves: SolveMove[] = [];
	bias = -1;

	constructor(state: number[]) {
		super(state);
		this.incrementBias();
		var init = new Map(state);
		let dist = init.getMinMoves();
		this.moves.push({ map: init, cost: 0, dist: dist, h: dist, previous: null, score: 0, n: "" });
	}
	incrementBias() {
		this.bias = this.biasses[Math.min(this.biasses.length - 1, this.biasindex++)];
	}
	solveStep() {
		var best = this.moves.shift()!;//TODO actually check moves length first?
		//console.log("ss.newimport(" + JSON.stringify(best.map.toList()) + ");");
		//console.log({ states: moves.length + 1, bestf: best.dist + best.cost });
		var actions = calcmap(best.map);
		var foundany = false;
		for (var action of actions) {
			var map = best.map.clone();
			try { action.f(map); }
			catch{ continue; }
			var dist = map.getMinMoves();
			var move = {
				map: map, cost: best.cost + map.moves.length, dist: dist, h: best.cost + map.moves.length + dist, previous: best, score: action.score,
				n: best.n + " | " + action.n
			};
			//console.log({ f: move.dist + move.cost, cost: move.cost, left: move.dist, score: move.score.toFixed(2), n: action.n });
			if (dist == 0) {
				foundany = true;
				this.foundSolution(backtracesolution(move));
			}
			this.moves.push(move);
		}
		if (foundany) {
			this.incrementBias();
			console.log(this.bias);
		}
		this.moves.sort((a, b) => (a.cost * (1 - this.bias) + a.dist * this.bias) - (b.cost * (1 - this.bias) + b.dist * this.bias));
	}
}

/**
 * works but not good enough
 * also still need to make it a proper anytime solver
 */
export class SlideSolverBeam extends SlideSolver {
	moves: SolveMove[] = [];
	bias = 0;//0normal,1distonly
	beamsize: number;
	constructor(state: number[], beamsize = 50) {
		super(state);
		this.beamsize = beamsize;
		var init = new Map(state);
		let dist = init.getMinMoves();
		this.moves.push({ map: init, cost: 0, dist: dist, h: dist, previous: null, score: 0, n: "" });
	}
	found(move: SolveMove) {
		var winmoves = backtracesolution(move);
		console.log("solution found: " + winmoves.length + " moves");
		if (!this.bestsolution || winmoves.length < this.bestsolution.length) {
			this.bestsolution = winmoves;
		}
	}
	solveStep() {
		for (let a = 0; a < 50; a++) {
			var newmoves: SolveMove[] = [];
			var bestsofar = null as SolveMove | null;
			for (let move of this.moves) {
				var actions = calcmap(move.map);
				for (var action of actions) {
					var map = move.map.clone();
					try { action.f(map); }
					catch{ continue; }
					let dist = map.getMinMoves();
					let h = move.cost + map.moves.length + dist;
					var newmove: SolveMove = {
						map: map,
						cost: move.cost + map.moves.length,
						dist: dist,
						h: h,
						previous: move,
						score: action.score,
						n: move.n + " | " + action.n
					};
					if (dist == 0) {
						this.foundSolution(backtracesolution(newmove));
					}
					if (!bestsofar || h < bestsofar.h) {
						bestsofar = newmove;
					}
					newmoves.push(newmove);
				}
			}
			newmoves.sort((a, b) => (a.cost * (1 - this.bias) + a.dist) - (b.cost * (1 - this.bias) + b.dist));
			if (this.bestsolution) { newmoves = newmoves.filter(m => m.h < this.bestsolution!.length); }
			if (newmoves.length > this.beamsize) { newmoves.length = this.beamsize; }
			if (bestsofar) {
				console.log(bestsofar.n, bestsofar);
				clogmap(bestsofar.map);
			}
			this.moves = newmoves;
		}
	}
}

namespace FastMap {
	//layout
	//[mapw*maph]=layout
	//+0=heuristic
	//+1=blackpos
	const blackindex = (maph - 1) * mapw + (mapw - 1);
	const statesize = mapw * maph + 2;
	const costoffset = mapw * maph + 0;
	const blackposoffset = mapw * maph + 1;
	function create(map: number[]) {
		let m = new Uint32Array([...map, 0]);
		m[costoffset] = minmoves(m);
	}
	function move(map: Uint32Array, to: number) {
		let clone = map.slice();
		let oldblack=clone[blackposoffset];
		clone[oldblack] = clone[to];
		clone[to] = blackindex;
		let dif=oldblack-to;
	}
	function minmoves(map: Uint32Array) {
		let cost = 0;
		for (let a = 0; a < map.length; a++) {
			let x1 = a % mapw;
			let y1 = (a / mapw) | 0;
			let tile = map[a];
			let x2 = tile % mapw;
			let y2 = (tile / mapw) | 0;
			cost += Math.abs(x1 - x2);
			cost += Math.abs(y1 - y2);
		}
		return cost;
	}
	function solve(mapin: number[]) {
		let map = create(mapin);
		var states = {}
	}
	export class SlideSolverAfkBeam extends SlideSolver {
		constructor(p) {
			super(p);
		}

		solveStep() {
			this.initialState;
		}

	}
}


function clogmap(map: Map) {
	for (let y = 0; y < maph; y++) {
		//let str = y + " ";
		let str = "";
		for (let x = 0; x < mapw; x++) {
			str += " ";
			let v = map.inverted[x + y * mapw];
			str += (v.p ? "x" : "_");
			str += (v.f ? "x" : "_");
			str += "" + v.cx + v.cy;
		}
		console.log(str);
	}
}

function calcmap(map: Map) {
	var dirms = [[1, 0, 0, 1], [0, 1, 1, 0]];
	var mirms = [[1, 0, 0, 1], [-1, 0, 0, 1]];
	var actions: { score: number, n: string, f: (map: Map) => void }[] = [];
	var tutmode = false;

	//clear map
	for (var y = 0; y < maph; y++) {
		for (var x = 0; x < mapw; x++) {
			var tile = map.get(x, y);
			tile.f = false;
			tile.p = false;
		}
	}

	for (var y = 0; y < maph; y++) {//top-left
		for (var x = 0; x < mapw; x++) {
			if ((x == 0 || map.get(x - 1, y).f) && (y == 0 || map.get(x, y - 1).f)) {
				var tile = map.get(x, y);
				if (tile.cx == tile.x && tile.cy == tile.y) { tile.f = true; }
				else { tile.p = true; }
			}
		}
	}
	if (!tutmode) {//only go to top left in tut mode
		for (y = 0; y < maph; y++) {//top-right
			for (x = mapw - 1; x >= 0; x--) {
				if ((x == mapw - 1 || map.get(x + 1, y).f) && (y == 0 || map.get(x, y - 1).f)) {
					var tile = map.get(x, y);
					if (tile.cx == tile.x && tile.cy == tile.y) { tile.f = true; }
					else { tile.p = true; }
				}
			}
		}
		for (y = maph - 1; y >= 0; y--) {//bottom-left
			for (x = 0; x < mapw; x++) {
				if ((x == 0 || map.get(x - 1, y).f) && (y == maph - 1 || map.get(x, y + 1).f)) {
					var tile = map.get(x, y);
					if (tile.cx == tile.x && tile.cy == tile.y) { tile.f = true; }
					else { tile.p = true; }
				}
			}
		}
	}
	map.get(mapw - 1, maph - 1).p = false;
	var tutpenalty = 0;

	//time for math =D
	for (var a = 0; a < dirms.length; a++) {
		var dirm = dirms[a];
		var size = vmpr(mapv, dirm);
		for (var u = 0; u < size[1] - 2; u++) {
			var gapstart = 0;
			var numdone = 0;
			for (var v = 0; v < size[0]; v++) {
				var v1 = vmpr([v, u], dirm);
				if (!map.getv(v1).f) { gapstart = v; numdone++; }
			}
			if (numdone == 0) { continue; }//keep going if row is done
			if (numdone == 2) { gapstart--; }//make sure its on top, also give positive x pref when only 1 is missing
			if (numdone >= 3) { break; }//stop if row is not ready

			if (gapstart == size[0] - 1) { gapstart--; }//make sure the gap stays inside the puzzle
			if (tutmode && gapstart != size[0] - 2) { break; }//break if tut mode and not last row/column
			var d = u + 1;//breakout start outside the fix area
			//make sure both tiles of the fix are free
			var tile = map.getv(vmpr([gapstart, d - 1], dirm)); tile.f = false; tile.p = false;
			var tile = map.getv(vmpr([gapstart + 1, d - 1], dirm)); tile.f = false; tile.p = false;
			var gaploc = vmpr([gapstart + 0.5, d - 1], dirm);
			//break open a way to the end spot, [gapstart,d] = topleft breakout coordinate
			var gappos = vmpr([gapstart, d], dirm);
			map.clearpath(gappos[0], gappos[1], true);

			//clear end spot
			map.get(mapw - 2, maph - 2).f = false; map.get(mapw - 2, maph - 2).p = false;
			map.get(mapw - 2, maph - 1).f = false; map.get(mapw - 2, maph - 1).p = false;
			map.get(mapw - 1, maph - 2).f = false; map.get(mapw - 1, maph - 2).p = false;
			map.get(mapw - 1, maph - 1).f = false; map.get(mapw - 1, maph - 1).p = false;

			if (tutmode && a != 0) { tutpenalty = -350; }

			//add to action list
			for (var b = 0; b < mirms.length; b++) {
				var mirm = mirms[b];
				var va = [
					vsum(gaploc, vmpr(vmpr([-0.5, 0], mirm), dirm)),
					vsum(gaploc, vmpr(vmpr([0.5, 0], mirm), dirm)),
					vsum(gaploc, vmpr(vmpr([-0.5, 1], mirm), dirm)),
					vsum(gaploc, vmpr(vmpr([0.5, 1], mirm), dirm)),
					vsum(gaploc, vmpr(vmpr([-0.5, 2], mirm), dirm)),
					vsum(gaploc, vmpr(vmpr([0.5, 2], mirm), dirm)),
				];

				if (map.getv(va[0]) == map.getinvv(va[0])) {
					if (map.getv(va[1]) == map.empty && map.getv(va[3]) == map.getinvv(va[1])) {
						actions.push({
							score: tutpenalty + 20, n: "0X,-1,-- " + va[0], f: function (va: number[][], map: Map) {
								map.movetile(map.getv(va[3]), va[1][0], va[1][1], [{ x: va[0][0], y: va[0][1] }]);
							}.bind(null, va)
						});
					}
					else if (map.getv(va[2]) == map.getinvv(va[1]) || map.getv(va[3]) == map.getinvv(va[1])) {
						actions.push({
							score: tutpenalty + 5 - 0.3 * map.tiledist(map.getv(va[1])), n: "0-,1-,-- || 0-,-1,-- " + va[0], f: function (va: number[][], map: Map) {
								map.movetile(map.getinvv(va[1]), va[5][0], va[5][1], [{ x: va[0][0], y: va[0][1] }]);
								map.movetile(map.getinvv(va[0]), va[1][0], va[1][1], [{ x: va[5][0], y: va[5][1] }]);
								map.movetile(map.getinvv(va[1]), va[3][0], va[3][1], [{ x: va[1][0], y: va[1][1] }]);
								map.movetile(map.getinvv(va[1]), va[1][0], va[1][1]);
							}.bind(null, va)
						});
					}
					else {
						actions.push({
							score: tutpenalty + 5 - 0.3 * map.tiledist(map.getv(va[1])), n: "0-,--,-- " + va[0], f: function (va: number[][], map: Map) {
								map.movetile(map.getinvv(va[0]), va[1][0], va[1][1]);
								map.movetile(map.getinvv(va[1]), va[3][0], va[3][1], [{ x: va[1][0], y: va[1][1] }]);
								map.movetile(map.getinvv(va[1]), va[1][0], va[1][1]);
							}.bind(null, va)
						});
					}
				}
				else if (map.getv(va[0]) == map.getinvv(va[1])) {
					if (map.getv(va[1]) == map.getinvv(va[0])) {
						actions.push({
							score: tutpenalty + 5 - 0.4 * map.tiledist(map.empty, va[2]), n: "10,--,-- " + va[0], f: function (va: number[][], map: Map) {
								map.movetile(map.getinvv(va[0]), va[0][0], va[0][1]);
								map.movetile(map.getinvv(va[1]), va[4][0], va[4][1], [{ x: va[0][0], y: va[0][1] }]);
								map.movetile(map.getinvv(va[0]), va[1][0], va[1][1], [{ x: va[4][0], y: va[4][1] }]);
								map.movetile(map.getinvv(va[1]), va[3][0], va[3][1], [{ x: va[1][0], y: va[1][1] }]);
								map.movetile(map.getinvv(va[1]), va[1][0], va[1][1]);
							}.bind(null, va)
						});
					}
					else if (map.getv(va[1]) == map.empty && map.getv(va[3]) == map.getinvv(va[0])) {
						actions.push({
							score: tutpenalty + 10, n: "1X,-0,-- " + va[0], f: function (va: number[][], map: Map) {
								map.movetile(map.getinvv(va[1]), va[1][0], va[1][1], [{ x: va[3][0], y: va[3][1] }]);
								map.movetile(map.getinvv(va[0]), va[5][0], va[5][1], [{ x: va[1][0], y: va[1][1] }]);
								map.movetile(map.getinvv(va[1]), va[0][0], va[0][1], [{ x: va[5][0], y: va[5][1] }]);
								map.movetile(map.getinvv(va[0]), va[2][0], va[2][1], [{ x: va[0][0], y: va[0][1] }]);
								map.movetile(map.getinvv(va[0]), va[0][0], va[0][1]);
							}.bind(null, va)
						});
					}
					else {
						actions.push({
							score: tutpenalty + 5 - 0.3 * map.tiledist(map.getinvv(va[0])), n: "1-,--,-- " + va[0], f: function (va: number[][], map: Map) {
								map.movetile(map.getinvv(va[0]), va[2][0], va[2][1], [{ x: va[0][0], y: va[0][1] }]);
								map.movetile(map.getinvv(va[0]), va[0][0], va[0][1]);
							}.bind(null, va)
						});
					}
				}
				else if (map.getv(va[0]) == map.empty && map.getv(va[2]) == map.getinvv(va[0]) && map.getv(va[3]) == map.getinvv(va[1])) {
					actions.push({
						score: tutpenalty + 19, n: "X-,01,-- " + va[0], f: function (va: number[][], map: Map) {
							map.movetile(map.getinvv(va[0]), va[0][0], va[0][1], [{ x: va[3][0], y: va[3][1] }]);
							map.movetile(map.getinvv(va[1]), va[5][0], va[5][1], [{ x: va[0][0], y: va[0][1] }]);
							map.movetile(map.getinvv(va[0]), va[1][0], va[1][1], [{ x: va[5][0], y: va[5][1] }]);
							map.movetile(map.getinvv(va[1]), va[3][0], va[3][1], [{ x: va[1][0], y: va[1][1] }]);
							map.movetile(map.getinvv(va[1]), va[1][0], va[1][1]);
						}.bind(null, va)
					});
				}
				else {
					//TODO do we need this?
					var score = tutpenalty + 5;
					score -= 0.3 * map.tiledist(map.getinvv(va[1]), va[0]) + 0.3 * map.tiledist(map.getinvv(va[0]), va[2]);
					score -= 0.1 * map.tiledist(map.getinvv(va[1]), [map.empty.cx, map.empty.cy]);
					score += (map.tiledist(map.getinvv(va[1]), va[0]) <= map.tiledist(map.getinvv(va[0]), va[0]) ? 0 : -10);
					actions.push({
						score: score, n: "--,--,-- " + va[0], f: function (va: number[][], map: Map) {
							map.movetile(map.getinvv(va[1]), va[0][0], va[0][1]);
						}.bind(null, va)
					});
				}
			}
			break;
		}
	}

	for (x = 0; x < mapw; x++) {
		for (y = 0; y < maph; y++) {
			if (map.get(x, y).p) {
				var score = 4;
				score += (tutmode ? -100 - 100 * y : 0);
				score -= 0.3 * map.tiledist(map.getinv(x, y));
				score -= 0.1 * map.tiledist(map.getinv(x, y), [0, 0]);
				score -= 0.1 * map.tiledist(map.empty, [x, y])
				score += (x >= mapw - 2 && y >= maph - 2 ? -100 : 0);
				actions.push({ score: score, n: x + "," + y, f: function (x: number, y: number, map: Map) { map.movetile(map.getinv(x, y), x, y); }.bind(null, x, y) });
				if ((x == 0 || map.get(x - 1, y).f) && (y == 0 || map.get(x, y - 1).f)) { map.clearpath(x, y, false); }
				else if ((x == 0 || map.get(x - 1, y).f) && (y == maph - 1 || map.get(x, y + 1).f)) { map.clearpath(x, y - 1, false); }
				else if ((x == mapw - 1 || map.get(x + 1, y).f) && (y == 0 || map.get(x, y - 1).f)) { map.clearpath(x - 1, y, false); }
			}
		}
	}

	return actions;
}

export function movesToString(movelist: SlideMove[]) {
	var str = "";
	for (var a = 0; a < movelist.length; a++) {
		if (movelist[a].x1 > movelist[a].x2) { str += "0"; }
		if (movelist[a].y1 > movelist[a].y2) { str += "1"; }
		if (movelist[a].x1 < movelist[a].x2) { str += "2"; }
		if (movelist[a].y1 < movelist[a].y2) { str += "3"; }
	}
	return str;
}

function optimisemoves(movelist: SlideMove[]) {
	if (movelist.length == 0) { return movelist; }

	var trans = ["0321", "1230", "1230", "1230", "0321", "1230", "1230", "1230"];//0321,1
	var back = [[-1, 0], [0, -1], [1, 0], [0, 1]];
	var str = movesToString(movelist);

	while (true) {
		var len = str.length;
		for (var a = 0; a < trans.length; a++) {
			str = str.replace(/\d/g, function (b) { return trans[a][b as any]; });

			str = str.replace(/02/g, "");
			str = str.replace(/0123012/g, "10321");
			str = str.replace(/2123003212/g, "321123");
			str = str.replace(/1230032121/g, "032112");
			str = str.replace(/123003212/g, "0321123");
			str = str.replace(/3300122123000/g, "2303001");
			str = str.replace(/123030122/g, "3012123");
		}
		if (str.length == len) { break; }
	}

	var l = [movelist[0].x1, movelist[0].y1];
	var r: SlideMove[] = [];
	for (a = 0; a < str.length; a++) {
		r[a] = { x1: l[0], y1: l[1], x2: l[0] + back[str[a] as any][0], y2: l[1] + back[str[a] as any][1] };
		l = [r[a].x2, r[a].y2];
	}

	return r;
}

//vector-matrix product
function vmpr(v: number[], m: number[]) {
	var r: number[] = [];
	var vl = v.length;
	for (var a = 0; a < vl; a++) {
		r[a] = 0;
		for (var b = 0; b * vl < m.length; b++) {
			r[a] += v[b] * m[a + b * vl];
		}
	}
	return r;
}

function mmpr(m1: number[], m2: number[]) {
	var size = Math.sqrt(m1.length);
	var r: number[] = [];
	for (var b = 0; b < size; b++) {
		for (var a = 0; a < size; a++) {
			r[a + size * b] = 0;
			for (var c = 0; c < size; c++) {
				r[a + size * b] += m1[c + size * b] * m2[a + size * c];
			}
		}
	}
	return r;
}

function vsum(v1: number[], v2: number[]) {
	var r: number[] = [];
	for (var a in v1) {
		r[a] = v1[a] + v2[a];
	}
	return r;
}
