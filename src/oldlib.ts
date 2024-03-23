export function copyToClipboard(str: string) {
	var el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
}

export function startCaps(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function delay(t: number, ...args) {
	return new Promise(done => setTimeout(done, t, ...args));
}

export function uuid() {
	//https://gist.github.com/jcxplorer/823878
	var uuid = "", i, random;
	for (i = 0; i < 32; i++) {
		random = Math.random() * 16 | 0;

		if (i == 8 || i == 12 || i == 16 || i == 20) {
			uuid += "-"
		}
		uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
	}
	return uuid;
}

//because js still has no proper way for this (ie11)
export function initArray<T>(l: number, val: T): T[] {
	var r: T[] = [];
	r.length = l;
	for (var a = 0; a < l; a += 1) { r[a] = val; }
	return r;
}


export function stringdownload(filename: string, text: string) {
	filedownload(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
}

export function filedownload(filename: string, url: string) {
	var element = document.createElement('a');
	element.setAttribute('href', url);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

export function listdate(time: number) {
	var fullmonthnames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var d = new Date(time);
	return d.getDate() + " " + fullmonthnames[d.getMonth()] + " " + d.getFullYear();
}

export function nicetime(time: number) {
	if (time < 0) { return "--:--"; }
	return (time >= 1000 * 60 * 60 ? Math.floor(time / 1000 / 60 / 60) + ":" : "") + addzeros(Math.floor(time / 1000 / 60) % 60, 2) + ":" + addzeros(Math.floor(time / 1000) % 60, 2);
}

export function dlpagepost(url: string, data: { [name: string]: string }, func: (res: string) => any, errorfunc?: (err: any) => any) {
	var req = new XMLHttpRequest();
	if (func) { req.onload = function () { func(req.responseText); } }
	if (errorfunc) { req.onerror = errorfunc; }
	var post = "";
	var b = "";
	for (let a in data) {
		var valstr;
		if (typeof data[a] == "object") { valstr = JSON.stringify(data[a]); }
		else { valstr = data[a] + ""; }
		post += b + encodeURIComponent(a) + "=" + encodeURIComponent(valstr);
		b = "&";
	}
	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send(post);
}

export function dlpageJsonAsync<T>(url: string, obj: object) {
	return new Promise<T>((done, fail) => dlpagejson(url, obj, done, fail));
}

export function dlpagejson<D = any>(url: string, obj: any, func: (data: D) => any, errorfunc?: () => any) {
	var req = new XMLHttpRequest();
	req.onload = function () {
		var obj = null;
		try { obj = JSON.parse(req.responseText); }
		catch (e) { }
		if (obj == null) {
			if (errorfunc) { errorfunc(); }
			return;
		}
		if (func) { func(obj); }
	}
	if (errorfunc) { req.onerror = errorfunc; }
	if (obj) {
		req.open("POST", url, true);
		req.setRequestHeader("Content-type", "application/json");
		req.send(JSON.stringify(obj));
	} else {
		req.open("GET", url, true);
		req.send();
	}
}

export function addzeros(str: string | number, l: number, ch = "0", after = false) {
	str = str + "";
	if (str.length == l) { return str; }
	if (str.length > l && !after) { return str.slice(-l); }
	if (str.length > l && after) { return str.slice(0, l); }
	if (str.length < l) {
		while (str.length < l) {
			str = (after ? str : "") + ch + (after ? "" : str);
		}
		return str;
	}
}

export function rgbToInt(r: number, g: number, b: number) {
	return (r << 16) + (g << 8) + b;
}

export function spacednr(nr: number) {
	var a, b, r, neg;
	nr = Math.floor(nr);
	if (nr < 0) { neg = true; nr = -nr; } else { neg = false; }
	var str = "" + nr;
	r = "";
	b = str.length - 1;
	for (a = 0; str[b - a]; a += 1) { if (a % 3 == 0 && a != 0) { r = "," + r; } r = str.slice(b - a, b - a + 1) + r; }
	return (neg ? "-" : "") + r;
}

export function pagepopup(pagename: string, w: number, h: number) {
	return window.open(location.origin + "/apps/alt1/help/" + pagename, undefined, "width=" + w + ",height=" + h);
}

export function coltohex(col: number, g?: number, b?: number) {
	if (g != undefined && b != undefined) { col = rgbToInt(col, g, b); }//allow rgb input
	return "#" + addzeros((col & 0xffffff).toString(16), 6);
}

export function modalDropdown(func: (val: string) => any, names: string[], values: string[], selected?: string) {
	type Eltype = HTMLDivElement & { removeme: () => void, select: (el: HTMLElement) => void };
	//remove old fake select
	if (OldDom.id("selectoverlay")) { (OldDom.id("selectoverlay") as Eltype).removeme(); }

	let el = document.createElement("div") as Eltype;
	el.id = "selectoverlay";
	el.removeme = function () { el.parentNode!.removeChild(el); }
	el.select = function (elcl: HTMLElement) {
		var val = elcl.getAttribute("data-value")!;
		el.removeme();
		func && func(val);
	}

	let container = document.createElement("div");
	container.className = "selectoverlayinner"
	for (let a = 0; a < names.length; a++) {
		let opt = document.createElement("div");
		opt.classList.add("selectoverlayoption");
		if (values[a] == selected) { opt.classList.add("isselected"); }
		opt.setAttribute("data-value", values[a]);
		opt.onclick = () => el.select(opt);
		opt.innerText = names[a];
		container.appendChild(opt);
	}
	el.appendChild(container);
	return el;
}
export function showModalDropdown(func: (v: string) => void, names: string[], values: string[], selected?: string) {
	var el = modalDropdown(func, names, values, selected);
	document.body.appendChild(el);
	return el;
}

export namespace OldDom {
	export function toggleclass(el: string | HTMLElement, classname: string, state?: boolean) {
		if (typeof el == "string") { el = id(el)!; }
		if (state == undefined) { state = !el.classList.contains(classname); }
		if (state) { el.classList.add(classname); }
		else { el.classList.remove(classname); }
		return state;
	}

	export function id(id: string): HTMLElement;
	export function id(frame: HTMLElement, id: string): HTMLElement;
	export function id(id: string | HTMLElement, sub?: string): HTMLElement {
		if (sub) { return (id as HTMLElement).ownerDocument.getElementById(sub)!; }
		else { return document.getElementById(id as string)!; }
	}

	export function cl(cl: string) {
		return document.getElementsByClassName(cl);
	}

	export function clear(el: Element | string) {
		if (typeof el == "string") { el = document.getElementById(el)!; }
		while (el.firstChild) { el.removeChild(el.firstChild); }
	}

	export function select<T extends { [key: string]: string }>(obj: T, selected: keyof T) {
		var frag = document.createDocumentFragment();
		var add = function (value: number | string, name: string) { frag.appendChild(div({ tag: "option", value: value, selected: selected == value ? "" : null }, [name])); }
		if (Array.isArray(obj)) { for (var a = 0; a < obj.length; a++) { add(a, obj[a]); } }
		else { for (let a in obj) { add(a, obj[a]); } }
		return frag;
	}

	type ARG<TAG extends string> =
		[] |
		[objAttr: ObjAttr, arrChildren?: ArrCh] |
		[strClass: StrClass<any, TAG, any>, arrChildren?: ArrCh] |
		[arrChildren: ArrCh] |
		[strClass: StrClass<any, TAG, any>, objAttr?: ObjAttr, arrChildren?: ArrCh]

	interface Eltypes extends HTMLElementTagNameMap {
		frag: DocumentFragment
	}

	type ObjAttr = { [prop: string]: any };
	type ArrCh = (HTMLElement | string | null | undefined | Text | number)[];
	type AlphaString<T extends string> = T extends `${string}${"/" | ":"}${string}` ? never : T;
	type StrEl<T extends string> = "" | `:${T}`;
	type StrSubtype<T extends string> = "" | `/${T}`;
	type StrClass<CLASS extends string = string, TAG extends string = string, TYPE extends string = string> = `${CLASS}${StrEl<TAG>}${StrSubtype<TYPE>}` | string;

	//export function div<TAG extends string>(...args: ARG<TAG>): AlphaString<TAG> extends never ? HTMLDivElement : AlphaString<TAG> extends keyof Eltypes ? Eltypes[AlphaString<TAG>] : Element {
	export function div<HTMLTAG extends HTMLElement = HTMLDivElement>(...args: ARG<any>): HTMLTAG {
		var classname = "";
		var attr: { [atr: string]: string | false };
		var children: any[] | null = null;
		var tag = "";
		var tagarg = "";
		var childfrag: DocumentFragment | null = null;
		var el: Element | DocumentFragment;
		//reorder arguments
		var argi = 0;
		if (typeof arguments[argi] == "string") {
			var typedata = arguments[argi++].split(":");
			classname = typedata[0];
			var tagdata = typedata[1] ? typedata[1].split("/") : [];
			tag = tagdata[0];
			tagarg = tagdata[1];
		}
		attr = {};
		if (typeof arguments[argi] == "object" && !Array.isArray(arguments[argi]) && !(arguments[argi] instanceof DocumentFragment)) { attr = arguments[argi++]; }
		if (typeof arguments[argi] == "object" && Array.isArray(arguments[argi])) { children = arguments[argi++]; }
		else if (typeof arguments[argi] == "object" && arguments[argi] instanceof DocumentFragment) { childfrag = arguments[argi++]; }
		if (classname) { attr["class"] = classname; }

		//start actual work
		tag = attr && attr.tag || tag || "div";
		if (tag == "input" && tagarg) { attr.type = tagarg; }
		if (tag == "frag") { el = document.createDocumentFragment(); }
		else {
			el = (attr && attr.namespace ? document.createElementNS(attr.namespace, tag) : document.createElement(tag));
		}
		if (attr) {
			for (var a in attr) {
				if (attr[a] === false || attr[a] == null || a == "tag" || a == "namespace") { continue; }
				if (a.substr(0, 2) == "on") { el[a] = attr[a]; }
				else if (el instanceof Element) { el.setAttribute(a, attr[a] || ""); }
			}
		}
		if (children != null && children != undefined) {
			if (!Array.isArray(children)) { children = [children]; }
			for (var a in children) {
				if (children[a] == null) { continue; }
				if (typeof children[a] != "object") { el.appendChild(document.createTextNode(children[a].toString())); }
				else { el.appendChild(children[a]); }
			}
		}
		else if (childfrag != null) {
			el.appendChild(childfrag);
		}
		return el as any;
	}

	export function frag(...args: (HTMLElement | string | number | DocumentFragment | null)[]) {
		var el = document.createDocumentFragment();
		for (var a = 0; a < arguments.length; a++) {
			if (arguments[a] == null) { continue; }
			if (typeof arguments[a] != "object") { el.appendChild(document.createTextNode(arguments[a].toString())); }
			else { el.appendChild(arguments[a]); }
		}
		return el;
	}

	export function put(el: HTMLElement | string, content: Node) {
		if (typeof el == "string") {
			var selected = id(el);
			if (!selected) { return; }
			el = selected;
		}
		clear(el);
		el.appendChild(content);
	}

	type ElementMap<T extends string[]> = { [key in T[number]]: { getValue?: () => any, setValue?: (v: any) => any, value?: string } & HTMLElement };
	export function elmap<T extends string[]>(...keys: T) {
		var r = {} as ElementMap<T>;
		for (let k of keys) { r[k] = null; }
		return r;
	}
}

export function roundx(a: number, b: number) {
	return Math.round(a / b) * b;
}


export function smallu(nr: number, gp?: boolean) {
	if (isNaN(nr)) { return "-"; }
	nr = Math.round(nr);
	var sign = (nr < 0 ? "-" : "");
	nr = Math.abs(nr);
	if (nr >= 1000000000000000) { return sign + "quite a bit" }
	if (nr % 1) {
		if (nr < 100) { return sign + (nr + "00").slice(0, 4); }
		nr = Math.floor(nr);
	}
	var nrstr = nr + "";
	var original = nrstr;
	if (nrstr.length <= 3) { return sign + nrstr + (gp ? "gp" : ""); }
	if (nrstr.length == 4) { return sign + nrstr.slice(0, 1) + "," + nrstr.slice(1, 4) + (gp ? "gp" : ""); }
	if (nrstr.length % 3 != 0) { nrstr = nrstr.slice(0, nrstr.length % 3) + "." + nrstr.slice(nrstr.length % 3, 3); }
	else { nrstr = nrstr.slice(0, 3); }
	if (original.length <= 6) { return sign + nrstr + "k" }
	if (original.length <= 9) { return sign + nrstr + "m" }
	if (original.length <= 12) { return sign + nrstr + "b" }
	if (original.length <= 15) { return sign + nrstr + "t" }
	return "error";
}

export function jsonTryDecode(str: string) {
	try { return JSON.parse(str); }
	catch (e) { return null; }
}

export function urlArgs(url?: string): { [id: string]: string } {
	if (!url) { url = document.location.search; }
	var reg = /(\?|&)(.*?)(=(.*?))?(?=$|&)/g;
	var r = {};
	for (var m; m = reg.exec(url);) {
		r[m[2]] = m[4];
	}
	return r;
}

export function padLeft(str: string | number, n: number, char = "0") {
	str = str + "";
	while (str.length < n) { str = char + str; }
	return str;
}


//because nodejs doesnt have these...
export function compatAtob(str: string) {
	if (typeof atob != "undefined") { return atob(str); }
	else { return Buffer.from(str, "base64").toString("binary"); }
}

//because nodejs doesnt have these...
export function compatBtoa(str: string) {
	if (typeof btoa != "undefined") { return btoa(str); }
	else { return Buffer.from(str, "binary").toString("base64"); }

}

//compare color
export function coldiff(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
	var r3 = Math.abs(r1 - r2);
	var g3 = Math.abs(g1 - g2);
	var b3 = Math.abs(b1 - b2);
	return r3 + g3 + b3;
}

export function lowname(name: string, validate?: boolean, keeplook?: boolean) {
	name = name.replace(/\+/g, " ");
	name = name.replace(/\%20/g, " ");
	name = name.replace(/[^\w \-]/g, "");
	if (!keeplook) { name = name.replace(/[ +_\-]/g, "_").toLowerCase(); }
	if (validate) {
		name = name.replace(/^[ _\-]+/, "");//cut down whitespace at start
		name = name.replace(/[ _\-]+$/, "");//cut down whitespace at end
		name = name.replace(/[ _\-]{2,}/, function (a) { return "__________".slice(0, a.length); });//replace more than one whitespace with _'s
		if (name.length > 12 || name == "") { return ""; }
	}
	return name;
}

var monthnames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function shoutboxtime(time: number, mode = "full" as "full" | "short" | "date") {
	var d = new Date(time);
	var now = new Date();
	var yday = new Date();
	yday.setDate(yday.getDate() - 1);
	var r = "";
	if (mode != "date" && +now - +d < 1000 * 60 * 60) {
		r = timegap(+now - +d) + " ago";
	} else {
		//check if it was today or yday in local time
		var todayyday = false;
		if (d.getDate() == now.getDate() && d.getMonth() == now.getMonth() && d.getFullYear() == now.getFullYear()) {
			r = "Today";
			todayyday = true;
		}
		else if (d.getDate() == yday.getDate() && d.getMonth() == yday.getMonth() && d.getFullYear() == yday.getFullYear()) {
			r = "Yesterday";
			todayyday = true;
		}
		else {
			r = d.getDate() + " " + monthnames[d.getMonth()];
		}

		//more precise, add year, time or neither
		if (+d < +now - 1000 * 60 * 60 * 24 * 90) {
			r += " " + d.getFullYear();
		} else if (mode != "date" && (mode != "short")) {
			r += ", " + addzeros(d.getHours() + "", 2) + ":" + addzeros(d.getMinutes() + "", 2);
		}
	}
	return r;
}

export function timegap(milsec: number) {
	var sec = Math.abs(milsec / 1000);
	if (sec < 2) { return "one second" }
	if (sec < 60) { return Math.floor(sec) + " seconds"; }
	if (sec < 2 * 60) { return "one minute"; }
	if (sec < 60 * 60) { return Math.floor(sec / 60) + " minutes"; }
	if (sec < 2 * 60 * 60) { return "one hour" }
	if (sec < 24 * 60 * 60) { return Math.floor(sec / 60 / 60) + " hours"; }
	if (sec < 2 * 24 * 60 * 60) { return "one day"; }
	if (sec < 31 * 24 * 60 * 60) { return Math.floor(sec / 24 / 60 / 60) + " days"; }
	if (sec < 2 * 31 * 24 * 60 * 60) { return "one month"; }
	if (sec < 365 * 24 * 60 * 60) { return Math.floor(sec / 31 / 24 / 60 / 60) + " months"; }
	if (sec < 2 * 365 * 24 * 60 * 60) { return "one year"; }
	return Math.floor(sec / 365 / 24 / 60 / 60) + " years";
}

export function findParentMatch(el: HTMLElement | null, cssrule: string) {
	while (el) {
		if (el.matches(cssrule)) { return el; }
		el = el.parentElement;
	}
	return null;
}

export function checkaccess(frame: HTMLIFrameElement | Window) {
	var e;
	try {
		//@ts-ignore
		e = frame.contentWindow || frame.window;
		//allow frame to deny acces
		if (e.denyaccess) { return false; }
		e.document;
		return e;
	} catch (e) {
		return false;
	}
}