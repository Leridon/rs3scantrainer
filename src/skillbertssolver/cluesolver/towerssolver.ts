
import { TowersReadState } from "./towersreader";

export function solveTowers(state: TowersReadState) {
	var size = 5;
	var grid = new Grid(size, state.filled);
	//rows
	for (var y = 0; y < size; y++) {
		var slots: number[] = []
		for (var x = 0; x < size; x++) { slots.push(x + size * y); }
		grid.groups.push(new Group(grid, slots, state.left[y], state.right[y], "row" + y));
	}
	//cols
	for (var x = 0; x < size; x++) {
		var slots: number[] = []
		for (var y = 0; y < size; y++) { slots.push(x + size * y); }
		grid.groups.push(new Group(grid, slots, state.top[x], state.bot[x], "col" + x));
	}
	grid.run();
	console.log(grid);
	return grid;
}

export function renderTowers(ctx: CanvasRenderingContext2D, buf: ImageData, grid: Grid, solindex: number) {
	ctx.putImageData(buf.toDrawableData(), 0, 0);

	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (var y = 0; y < grid.size; y++) {
		for (var x = 0; x < grid.size; x++) {
			var n = grid.solutions[solindex][x + y * grid.size] + 1;
			var tx = 25 + x * 44 + 22;
			var ty = 25 + y * 44 + 22;
			ctx.font = "28px sans-serif";
			ctx.fillStyle = "rgb(10,31,41)";
			ctx.fillRect(tx - 10, ty - 10, 20, 20);
			ctx.fillStyle = "#fff";
			ctx.fillText("" + n, tx, ty);
			var cur = grid.prefilled[x + y * 5];
			if (cur != -1) {
				var d = n - cur;
				if (d < -1) { d += 5; }
				if (d != 0) {
					ctx.font = "16px sans-serif";
					ctx.fillStyle = "#aaa";
					ctx.fillText((d > 0 ? "+" + d : "" + d), tx + 13, ty + 15);
				}
			}
		}
	}
}

export class Grid {
	size: number;
	prefilled: number[] = [];
	certain: number[] = [];
	opts: number[][] = [];
	groups: Group[] = [];
	statestack: { certain: number[], opts: number[][] }[] = [];
	solutions: number[][] = [];
	solvestates: number[][] = [];
	constructor(size: number, prefilled: number[]) {
		this.prefilled = prefilled;
		this.size = size;
		for (var a = 0; a < size * size; a++) {
			this.certain[a] = -1;
			this.opts[a] = [];
			for (var b = 0; b < size; b++) {
				this.opts[a][b] = b;
			}
		}
	}
	isDone() {
		for (var a = 0; a < this.size * this.size; a++) {
			if (this.certain[a] == -1) { return false; }
		}
		return true;
	}
	run() {
		this.recur();
		this.solutions = [];
		for (var a = 0; a < this.solvestates.length; a++) {
			if (this.solvestates[a].find(function (s) { return s == -1; }) == null) {
				this.solutions.push(this.solvestates[a]);
			}
		}
	}
	recur() {
		this.logicRun();
		if (!this.addState()) { return; }
		if (!this.isDone()) {
			for (var a = 0; a < this.size * this.size; a++) {
				if (this.opts[a].length != 1) {
					for (var b = 0; b < this.opts[a].length; b++) {
						this.pushState();
						try {
							this.opts[a] = [this.opts[a][b]];
							this.setSlot(a, this.opts[a][0]); this.recur();
						}
						catch (e) { }
						this.popState();
					}
				}
			}
		}
	}
	addState() {
		var exists = false;
		top: for (var a = 0; a < this.solvestates.length; a++) {
			var match = true;
			for (var b = 0; b < this.size * this.size; b++) {
				if (this.solvestates[a][b] != this.certain[b]) { continue top; }
			}
			return false;
		}
		this.solvestates.push(this.certain.slice());
		console.log("state");
		this.print();
		return true;
	}
	logicRun() {
		for (var go = true; go;) {
			go = false;
			for (var a = 0; a < this.groups.length; a++) {
				var g = this.groups[a];
				if (g.stale) { continue; }
				var n = this.groups[a].removeOpts();
				if (n != 0) { go = true; }
			}
		}
	}
	invalidateSlot(index: number) {
		for (var a = 0; a < this.groups.length; a++) {
			if (this.groups[a].slots.indexOf(index) != -1) {
				this.groups[a].stale = false;
			}
		}
	}
	printAll() {
		var str = "";
		for (var y = 0; y < this.size; y++) {
			for (var a = 0; a < this.size; a++) {
				for (var x = 0; x < this.size; x++) {
					str += (this.opts[x + this.size * y].indexOf(a) == -1 ? "." : a) + " ";
				}
				str += "\n";
			}
			str += "\n";
		}
		console.log(str);
	}
	print() {
		var str = "";
		for (var y = 0; y < this.size; y++) {
			for (var x = 0; x < this.size; x++) {
				var opts = this.opts[x + this.size * y];
				if (opts.length == 0) { str += "><"; }
				else if (opts.length == 1) { str += opts[0] + " "; }
				else if (opts.length == 2) { str += "" + opts[0] + opts[1]; }
				else { str += "? "; }
				str += " ";
			}
			str += "\n";
		}
		console.log(str);
	}
	pushState() {
		var state = {
			certain: this.certain.slice(),
			opts: this.opts.map(function (opt) { return opt.slice(); })
		};
		this.statestack.push(state);
		//console.log("push");
		//this.print();
	}
	popState() {
		var state = this.statestack.pop()!;
		this.certain = state.certain;
		this.opts = state.opts;
		//console.log("pop");
		//this.print();
	}

	setSlot(slot: number, n: number) {
		this.certain[slot] = n;
		for (var a = 0; a < this.groups.length; a++) {
			var g = this.groups[a];
			if (g.slots.indexOf(slot) == -1) { continue; }
			var done = true;
			for (var b = 0; b < this.size; b++) {
				var cslot = g.slots[b];
				var certain = this.certain[cslot];
				if (certain == -1) { done = false; }
				if (cslot == slot) { continue; }
				var i = this.opts[cslot].indexOf(n);
				if (certain == n) { console.log("dead end (number already in group)"); throw "invalidgrid"; }
				if (i != -1) {
					this.opts[cslot].splice(i, 1);
					this.invalidateSlot(cslot);
					if (this.opts[cslot].length == 1) {
						this.setSlot(cslot, this.opts[cslot][0]);
					}
				}
			}
			if (done) {
				var down = 0;
				var up = 0;
				for (var b = 0, max = -1; b < this.size; b++) {
					var certain = this.certain[g.slots[b]]
					if (certain > max) { max = certain; up++; }
				}
				for (var b = this.size - 1, max = -1; b >= 0; b--) {
					var certain = this.certain[g.slots[b]]
					if (certain > max) { max = certain; down++; }
				}
				if (up != g.up || down != g.down) {
					console.log("dead end (doesn't match side number)");
					throw new Error("invalidgrid");
				}
			}
		}
	}
}

class Group {
	map: Grid;
	name: string;
	slots: number[];
	up: number;
	down: number;
	stale: boolean;
	vals: number[] = [];
	numbers: boolean[] = [];

	constructor(map, slots, up, down, name) {
		this.map = map;
		this.name = name;
		this.slots = slots;
		this.up = up;
		this.down = down;
		this.stale = false;
		this.vals = [];
		this.numbers = [];
		for (var a = 0; a < this.map.size; a++) {
			this.vals[a] = -1;
			this.numbers[a] = true;
		}
	}

	recur(index: number, vals: number[], numbers: boolean[], dirup: boolean, target: number) {
		//recur done, check outcome
		if (index == this.map.size) {
			var min = -1;
			var n = 0;
			if (dirup) {
				for (var a = 0; a < this.map.size; a++) {
					if (vals[a] > min) {
						min = vals[a];
						n++;
					}
				}
			}
			else {
				for (var a = this.map.size - 1; a >= 0; a--) {
					if (vals[a] > min) {
						min = vals[a];
						n++;
					}
				}
			}
			return n == target;
		}
		//forcing this one to check
		if (vals[index] != -1) {
			return this.recur(index + 1, vals, numbers, dirup, target);
		}


		//only one opt, continue
		var slot = this.slots[index];
		var v = this.map.certain[slot];
		if (v != -1) {
			if (!numbers[v]) { return false; }
			vals[index] = v;
			numbers[v] = false;
			var r = this.recur(index + 1, vals, numbers, dirup, target);
			vals[index] = -1;
			numbers[v] = true;
			return r;
		}
		//check all opts
		for (var b = 0; b < this.map.size; b++) {
			if (!numbers[b]) { continue; }
			if (this.map.opts[slot].indexOf(b) == -1) { continue; }
			numbers[b] = false;
			vals[index] = b;
			var r = this.recur(index + 1, vals, numbers, dirup, target);
			vals[index] = -1;
			numbers[b] = true;
			if (r) { return true; }
		}
		return false;
	}

	removeOpts() {
		var removed = 0;
		for (var a = 0; a < this.map.size; a++) {
			var index = this.slots[a]
			if (this.map.certain[index] != -1) { continue; }
			var opts = this.map.opts[index];
			for (var b = opts.length - 1; b >= 0; b--) {
				var n = opts[b];
				this.vals[a] = n;
				this.numbers[n] = false;
				if (!this.recur(0, this.vals, this.numbers, true, this.up) || !this.recur(0, this.vals, this.numbers, false, this.down)) {
					opts.splice(b, 1);
					removed++;
				}
				this.numbers[n] = true;
				this.vals[a] = -1;
			}
			if (opts.length == 1) {
				this.map.setSlot(index, opts[0]);
			}
			if (removed != 0) {
				this.map.invalidateSlot(index);
			}
		}
		this.stale = true;
		return removed;
	}
}