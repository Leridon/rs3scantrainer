"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.checkaccess = exports.findParentMatch = exports.timegap = exports.shoutboxtime = exports.lowname = exports.coldiff = exports.compatBtoa = exports.compatAtob = exports.padLeft = exports.urlArgs = exports.jsonTryDecode = exports.smallu = exports.roundx = exports.OldDom = exports.showModalDropdown = exports.modalDropdown = exports.coltohex = exports.pagepopup = exports.spacednr = exports.rgbToInt = exports.addzeros = exports.dlpagejson = exports.dlpageJsonAsync = exports.dlpagepost = exports.nicetime = exports.listdate = exports.filedownload = exports.stringdownload = exports.initArray = exports.uuid = exports.delay = exports.startCaps = exports.copyToClipboard = void 0;
function copyToClipboard(str) {
    var el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}
exports.copyToClipboard = copyToClipboard;
function startCaps(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
exports.startCaps = startCaps;
function delay(t) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (done) { return setTimeout.apply(void 0, __spreadArray([done, t], args, false)); })];
        });
    });
}
exports.delay = delay;
function uuid() {
    //https://gist.github.com/jcxplorer/823878
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-";
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
}
exports.uuid = uuid;
//because js still has no proper way for this (ie11)
function initArray(l, val) {
    var r = [];
    r.length = l;
    for (var a = 0; a < l; a += 1) {
        r[a] = val;
    }
    return r;
}
exports.initArray = initArray;
function stringdownload(filename, text) {
    filedownload(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
}
exports.stringdownload = stringdownload;
function filedownload(filename, url) {
    var element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
exports.filedownload = filedownload;
function listdate(time) {
    var fullmonthnames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var d = new Date(time);
    return d.getDate() + " " + fullmonthnames[d.getMonth()] + " " + d.getFullYear();
}
exports.listdate = listdate;
function nicetime(time) {
    if (time < 0) {
        return "--:--";
    }
    return (time >= 1000 * 60 * 60 ? Math.floor(time / 1000 / 60 / 60) + ":" : "") + addzeros(Math.floor(time / 1000 / 60) % 60, 2) + ":" + addzeros(Math.floor(time / 1000) % 60, 2);
}
exports.nicetime = nicetime;
function dlpagepost(url, data, func, errorfunc) {
    var req = new XMLHttpRequest();
    if (func) {
        req.onload = function () { func(req.responseText); };
    }
    if (errorfunc) {
        req.onerror = errorfunc;
    }
    var post = "";
    var b = "";
    for (var a in data) {
        var valstr;
        if (typeof data[a] == "object") {
            valstr = JSON.stringify(data[a]);
        }
        else {
            valstr = data[a] + "";
        }
        post += b + encodeURIComponent(a) + "=" + encodeURIComponent(valstr);
        b = "&";
    }
    req.open("POST", url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(post);
}
exports.dlpagepost = dlpagepost;
function dlpageJsonAsync(url, obj) {
    return new Promise(function (done, fail) { return dlpagejson(url, obj, done, fail); });
}
exports.dlpageJsonAsync = dlpageJsonAsync;
function dlpagejson(url, obj, func, errorfunc) {
    var req = new XMLHttpRequest();
    req.onload = function () {
        var obj = null;
        try {
            obj = JSON.parse(req.responseText);
        }
        catch (e) { }
        if (obj == null) {
            if (errorfunc) {
                errorfunc();
            }
            return;
        }
        if (func) {
            func(obj);
        }
    };
    if (errorfunc) {
        req.onerror = errorfunc;
    }
    if (obj) {
        req.open("POST", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.send(JSON.stringify(obj));
    }
    else {
        req.open("GET", url, true);
        req.send();
    }
}
exports.dlpagejson = dlpagejson;
function addzeros(str, l, ch, after) {
    if (ch === void 0) { ch = "0"; }
    if (after === void 0) { after = false; }
    str = str + "";
    if (str.length == l) {
        return str;
    }
    if (str.length > l && !after) {
        return str.slice(-l);
    }
    if (str.length > l && after) {
        return str.slice(0, l);
    }
    if (str.length < l) {
        while (str.length < l) {
            str = (after ? str : "") + ch + (after ? "" : str);
        }
        return str;
    }
}
exports.addzeros = addzeros;
function rgbToInt(r, g, b) {
    return (r << 16) + (g << 8) + b;
}
exports.rgbToInt = rgbToInt;
function spacednr(nr) {
    var a, b, r, neg;
    nr = Math.floor(nr);
    if (nr < 0) {
        neg = true;
        nr = -nr;
    }
    else {
        neg = false;
    }
    var str = "" + nr;
    r = "";
    b = str.length - 1;
    for (a = 0; str[b - a]; a += 1) {
        if (a % 3 == 0 && a != 0) {
            r = "," + r;
        }
        r = str.slice(b - a, b - a + 1) + r;
    }
    return (neg ? "-" : "") + r;
}
exports.spacednr = spacednr;
function pagepopup(pagename, w, h) {
    return window.open(location.origin + "/apps/alt1/help/" + pagename, undefined, "width=" + w + ",height=" + h);
}
exports.pagepopup = pagepopup;
function coltohex(col, g, b) {
    if (g != undefined && b != undefined) {
        col = rgbToInt(col, g, b);
    } //allow rgb input
    return "#" + addzeros((col & 0xffffff).toString(16), 6);
}
exports.coltohex = coltohex;
function modalDropdown(func, names, values, selected) {
    //remove old fake select
    if (OldDom.id("selectoverlay")) {
        OldDom.id("selectoverlay").removeme();
    }
    var el = document.createElement("div");
    el.id = "selectoverlay";
    el.removeme = function () { el.parentNode.removeChild(el); };
    el.select = function (elcl) {
        var val = elcl.getAttribute("data-value");
        el.removeme();
        func && func(val);
    };
    var container = document.createElement("div");
    container.className = "selectoverlayinner";
    var _loop_1 = function (a) {
        var opt = document.createElement("div");
        opt.classList.add("selectoverlayoption");
        if (values[a] == selected) {
            opt.classList.add("isselected");
        }
        opt.setAttribute("data-value", values[a]);
        opt.onclick = function () { return el.select(opt); };
        opt.innerText = names[a];
        container.appendChild(opt);
    };
    for (var a = 0; a < names.length; a++) {
        _loop_1(a);
    }
    el.appendChild(container);
    return el;
}
exports.modalDropdown = modalDropdown;
function showModalDropdown(func, names, values, selected) {
    var el = modalDropdown(func, names, values, selected);
    document.body.appendChild(el);
    return el;
}
exports.showModalDropdown = showModalDropdown;
var OldDom;
(function (OldDom) {
    function toggleclass(el, classname, state) {
        if (typeof el == "string") {
            el = id(el);
        }
        if (state == undefined) {
            state = !el.classList.contains(classname);
        }
        if (state) {
            el.classList.add(classname);
        }
        else {
            el.classList.remove(classname);
        }
        return state;
    }
    OldDom.toggleclass = toggleclass;
    function id(id, sub) {
        if (sub) {
            return id.ownerDocument.getElementById(sub);
        }
        else {
            return document.getElementById(id);
        }
    }
    OldDom.id = id;
    function cl(cl) {
        return document.getElementsByClassName(cl);
    }
    OldDom.cl = cl;
    function clear(el) {
        if (typeof el == "string") {
            el = document.getElementById(el);
        }
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
    OldDom.clear = clear;
    function select(obj, selected) {
        var frag = document.createDocumentFragment();
        var add = function (value, name) { frag.appendChild(div({ tag: "option", value: value, selected: selected == value ? "" : null }, [name])); };
        if (Array.isArray(obj)) {
            for (var a = 0; a < obj.length; a++) {
                add(a, obj[a]);
            }
        }
        else {
            for (var a_1 in obj) {
                add(a_1, obj[a_1]);
            }
        }
        return frag;
    }
    OldDom.select = select;
    ;
    //export function div<TAG extends string>(...args: ARG<TAG>): AlphaString<TAG> extends never ? HTMLDivElement : AlphaString<TAG> extends keyof Eltypes ? Eltypes[AlphaString<TAG>] : Element {
    function div() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var classname = "";
        var attr;
        var children = null;
        var tag = "";
        var tagarg = "";
        var childfrag = null;
        var el;
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
        if (typeof arguments[argi] == "object" && !Array.isArray(arguments[argi]) && !(arguments[argi] instanceof DocumentFragment)) {
            attr = arguments[argi++];
        }
        if (typeof arguments[argi] == "object" && Array.isArray(arguments[argi])) {
            children = arguments[argi++];
        }
        else if (typeof arguments[argi] == "object" && arguments[argi] instanceof DocumentFragment) {
            childfrag = arguments[argi++];
        }
        if (classname) {
            attr["class"] = classname;
        }
        //start actual work
        tag = attr && attr.tag || tag || "div";
        if (tag == "input" && tagarg) {
            attr.type = tagarg;
        }
        if (tag == "frag") {
            el = document.createDocumentFragment();
        }
        else {
            el = (attr && attr.namespace ? document.createElementNS(attr.namespace, tag) : document.createElement(tag));
        }
        if (attr) {
            for (var a in attr) {
                if (attr[a] === false || attr[a] == null || a == "tag" || a == "namespace") {
                    continue;
                }
                if (a.substr(0, 2) == "on") {
                    el[a] = attr[a];
                }
                else if (el instanceof Element) {
                    el.setAttribute(a, attr[a] || "");
                }
            }
        }
        if (children != null && children != undefined) {
            if (!Array.isArray(children)) {
                children = [children];
            }
            for (var a in children) {
                if (children[a] == null) {
                    continue;
                }
                if (typeof children[a] != "object") {
                    el.appendChild(document.createTextNode(children[a].toString()));
                }
                else {
                    el.appendChild(children[a]);
                }
            }
        }
        else if (childfrag != null) {
            el.appendChild(childfrag);
        }
        return el;
    }
    OldDom.div = div;
    function frag() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var el = document.createDocumentFragment();
        for (var a = 0; a < arguments.length; a++) {
            if (arguments[a] == null) {
                continue;
            }
            if (typeof arguments[a] != "object") {
                el.appendChild(document.createTextNode(arguments[a].toString()));
            }
            else {
                el.appendChild(arguments[a]);
            }
        }
        return el;
    }
    OldDom.frag = frag;
    function put(el, content) {
        if (typeof el == "string") {
            var selected = id(el);
            if (!selected) {
                return;
            }
            el = selected;
        }
        clear(el);
        el.appendChild(content);
    }
    OldDom.put = put;
    function elmap() {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var r = {};
        for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
            var k = keys_1[_a];
            r[k] = null;
        }
        return r;
    }
    OldDom.elmap = elmap;
})(OldDom = exports.OldDom || (exports.OldDom = {}));
function roundx(a, b) {
    return Math.round(a / b) * b;
}
exports.roundx = roundx;
function smallu(nr, gp) {
    if (isNaN(nr)) {
        return "-";
    }
    nr = Math.round(nr);
    var sign = (nr < 0 ? "-" : "");
    nr = Math.abs(nr);
    if (nr >= 1000000000000000) {
        return sign + "quite a bit";
    }
    if (nr % 1) {
        if (nr < 100) {
            return sign + (nr + "00").slice(0, 4);
        }
        nr = Math.floor(nr);
    }
    var nrstr = nr + "";
    var original = nrstr;
    if (nrstr.length <= 3) {
        return sign + nrstr + (gp ? "gp" : "");
    }
    if (nrstr.length == 4) {
        return sign + nrstr.slice(0, 1) + "," + nrstr.slice(1, 4) + (gp ? "gp" : "");
    }
    if (nrstr.length % 3 != 0) {
        nrstr = nrstr.slice(0, nrstr.length % 3) + "." + nrstr.slice(nrstr.length % 3, 3);
    }
    else {
        nrstr = nrstr.slice(0, 3);
    }
    if (original.length <= 6) {
        return sign + nrstr + "k";
    }
    if (original.length <= 9) {
        return sign + nrstr + "m";
    }
    if (original.length <= 12) {
        return sign + nrstr + "b";
    }
    if (original.length <= 15) {
        return sign + nrstr + "t";
    }
    return "error";
}
exports.smallu = smallu;
function jsonTryDecode(str) {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return null;
    }
}
exports.jsonTryDecode = jsonTryDecode;
function urlArgs(url) {
    if (!url) {
        url = document.location.search;
    }
    var reg = /(\?|&)(.*?)(=(.*?))?(?=$|&)/g;
    var r = {};
    for (var m; m = reg.exec(url);) {
        r[m[2]] = m[4];
    }
    return r;
}
exports.urlArgs = urlArgs;
function padLeft(str, n, char) {
    if (char === void 0) { char = "0"; }
    str = str + "";
    while (str.length < n) {
        str = char + str;
    }
    return str;
}
exports.padLeft = padLeft;
//because nodejs doesnt have these...
function compatAtob(str) {
    if (typeof atob != "undefined") {
        return atob(str);
    }
    else {
        return Buffer.from(str, "base64").toString("binary");
    }
}
exports.compatAtob = compatAtob;
//because nodejs doesnt have these...
function compatBtoa(str) {
    if (typeof btoa != "undefined") {
        return btoa(str);
    }
    else {
        return Buffer.from(str, "binary").toString("base64");
    }
}
exports.compatBtoa = compatBtoa;
//compare color
function coldiff(r1, g1, b1, r2, g2, b2) {
    var r3 = Math.abs(r1 - r2);
    var g3 = Math.abs(g1 - g2);
    var b3 = Math.abs(b1 - b2);
    return r3 + g3 + b3;
}
exports.coldiff = coldiff;
function lowname(name, validate, keeplook) {
    name = name.replace(/\+/g, " ");
    name = name.replace(/\%20/g, " ");
    name = name.replace(/[^\w \-]/g, "");
    if (!keeplook) {
        name = name.replace(/[ +_\-]/g, "_").toLowerCase();
    }
    if (validate) {
        name = name.replace(/^[ _\-]+/, ""); //cut down whitespace at start
        name = name.replace(/[ _\-]+$/, ""); //cut down whitespace at end
        name = name.replace(/[ _\-]{2,}/, function (a) { return "__________".slice(0, a.length); }); //replace more than one whitespace with _'s
        if (name.length > 12 || name == "") {
            return "";
        }
    }
    return name;
}
exports.lowname = lowname;
var monthnames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function shoutboxtime(time, mode) {
    if (mode === void 0) { mode = "full"; }
    var d = new Date(time);
    var now = new Date();
    var yday = new Date();
    yday.setDate(yday.getDate() - 1);
    var r = "";
    if (mode != "date" && +now - +d < 1000 * 60 * 60) {
        r = timegap(+now - +d) + " ago";
    }
    else {
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
        }
        else if (mode != "date" && (mode != "short")) {
            r += ", " + addzeros(d.getHours() + "", 2) + ":" + addzeros(d.getMinutes() + "", 2);
        }
    }
    return r;
}
exports.shoutboxtime = shoutboxtime;
function timegap(milsec) {
    var sec = Math.abs(milsec / 1000);
    if (sec < 2) {
        return "one second";
    }
    if (sec < 60) {
        return Math.floor(sec) + " seconds";
    }
    if (sec < 2 * 60) {
        return "one minute";
    }
    if (sec < 60 * 60) {
        return Math.floor(sec / 60) + " minutes";
    }
    if (sec < 2 * 60 * 60) {
        return "one hour";
    }
    if (sec < 24 * 60 * 60) {
        return Math.floor(sec / 60 / 60) + " hours";
    }
    if (sec < 2 * 24 * 60 * 60) {
        return "one day";
    }
    if (sec < 31 * 24 * 60 * 60) {
        return Math.floor(sec / 24 / 60 / 60) + " days";
    }
    if (sec < 2 * 31 * 24 * 60 * 60) {
        return "one month";
    }
    if (sec < 365 * 24 * 60 * 60) {
        return Math.floor(sec / 31 / 24 / 60 / 60) + " months";
    }
    if (sec < 2 * 365 * 24 * 60 * 60) {
        return "one year";
    }
    return Math.floor(sec / 365 / 24 / 60 / 60) + " years";
}
exports.timegap = timegap;
function findParentMatch(el, cssrule) {
    while (el) {
        if (el.matches(cssrule)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}
exports.findParentMatch = findParentMatch;
function checkaccess(frame) {
    var e;
    try {
        //@ts-ignore
        e = frame.contentWindow || frame.window;
        //allow frame to deny acces
        if (e.denyaccess) {
            return false;
        }
        e.document;
        return e;
    }
    catch (e) {
        return false;
    }
}
exports.checkaccess = checkaccess;
