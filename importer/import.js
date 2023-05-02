"use strict";
exports.__esModule = true;
var fs = require("fs");
var original_data = require("./clues.js");
var coordsets = require("./coords.js");
var imported = [];
function sextantToCoord(comp) {
    var sextant = {
        offsetx: 2440,
        offsetz: 3161,
        degreespertile: 1.875
    };
    return {
        x: sextant.offsetx + Math.round((60 * comp.longitude.degrees + comp.longitude.minutes) * (comp.longitude.direction == "west" ? -1 : 1) / sextant.degreespertile),
        y: sextant.offsetz + Math.round((60 * comp.latitude.degrees + comp.latitude.minutes) * (comp.latitude.direction == "south" ? -1 : 1) / sextant.degreespertile)
    };
}
var seen = new Set();
function parseSimpleSolution(obj) {
    return {
        type: "simple",
        coordinates: {
            x: obj.x,
            y: obj.z
        },
        answer: obj.answer
    };
}
function parseVariant(obj) {
    return {
        id: obj.subid,
        name: obj.subidtext,
        solution: parseSimpleSolution(obj)
    };
}
function parseSolution(obj) {
    if (obj.subid)
        return { type: "variants", variants: [parseVariant(obj)] };
    else
        return parseSimpleSolution(obj);
}
function spotsFor(id) {
    return coordsets.filter(function (e) { return e.clueid == id; }).map(function (e) {
        return {
            x: e.x,
            y: e.z,
            level: e.level
        };
    });
}
var n = 0;
var _loop_1 = function (obj) {
    if (seen.has(obj.clueid)) {
        imported.find(function (e) { return e.id == obj.clueid; }).solution
            .variants.push(parseVariant(obj));
        return "continue";
    }
    seen.add(obj.clueid);
    switch (obj.type) {
        case "simple": {
            var imp = {
                type: "simple",
                id: obj.clueid,
                tier: null,
                clue: obj.clue,
                solution: parseSolution(obj)
            };
            imported.push(imp);
            break;
        }
        case "anagram": {
            var imp = {
                type: "anagram",
                clue: obj.clue,
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            };
            imported.push(imp);
            break;
        }
        case "cryptic": {
            var imp = {
                type: "cryptic",
                clue: obj.clue,
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            };
            imported.push(imp);
            break;
        }
        case "img": {
            var imp = {
                type: "image",
                clue: "The map shows where to go.",
                image: obj.clue,
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            };
            imported.push(imp);
            break;
        }
        case "emote": {
            var imp = {
                type: "emote",
                clue: obj.clue,
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            };
            imported.push(imp);
            break;
        }
        case "scan": {
            var imp = {
                type: "scan",
                clue: obj.clue,
                tier: null,
                id: obj.clueid,
                solution: {
                    type: "coordset",
                    candidates: spotsFor(obj.scan)
                },
                range: parseInt(obj.clue.match("Orb scan range: (\\d+) paces")[1]),
                scantext: obj.scantext
            };
            imported.push(imp);
            break;
        }
        case "action": {
            var imp = {
                type: "skilling",
                clue: obj.clue,
                tier: "master",
                id: obj.clueid,
                solution: parseSolution(obj)
            };
            imported.push(imp);
            break;
        }
        default: {
            if (n < 10) {
                console.log(obj.clueid + obj.type);
            }
            n++;
        }
    }
};
for (var _i = 0, original_data_1 = original_data; _i < original_data_1.length; _i++) {
    var obj = original_data_1[_i];
    _loop_1(obj);
}
var compass_main = {
    clue: "The compass shows where you need to go.",
    id: 399,
    solution: {
        type: "coordset",
        candidates: spotsFor(0)
    },
    tier: "elite",
    type: "compass"
};
var compass_arc = {
    clue: "The compass shows where you need to go on the arc.",
    id: 400,
    solution: {
        type: "coordset",
        candidates: spotsFor(50)
    },
    tier: "master",
    type: "compass"
};
imported.push(compass_main);
imported.push(compass_arc);
// Extract coordinates from wiki:
// (\d+) degrees (\d+) minutes (north|south).*\n.*(\d+) degrees (\d+) minutes (east|west).*\n.*tier = (Hard)
// List:
// { coordinate: {longitude: { degrees: "$1", minutes: "$2", direction: "$3" }, latitude: {degrees: "$4", minutes: "$5", direction: "$6"}}, tier: "$7" },\n
var coordinates = [
    { clue: "00 degrees 00 minutes north, 7 degrees 13 minutes west", tier: "Hard" },
    { clue: "00 degrees 05 minutes south, 1 degrees 13 minutes east", tier: "Medium" },
    { clue: "00 degrees 13 minutes south, 4 degrees 00 minutes east", tier: "Medium" },
    { clue: "00 degrees 18 minutes south, 9 degrees 28 minutes east", tier: "Medium" },
    { clue: "00 degrees 20 minutes south, 3 degrees 15 minutes east", tier: "Medium" },
    { clue: "00 degrees 31 minutes south, 7 degrees 43 minutes east", tier: "Medium" },
    { clue: "00 degrees 50 minutes north, 4 degrees 16 minutes east", tier: "Medium" },
    { clue: "01 degrees 18 minutes south, 4 degrees 15 minutes east", tier: "Medium" },
    { clue: "01 degrees 24 minutes north, 8 degrees 05 minutes west", tier: "Hard" },
    { clue: "01 degrees 26 minutes north, 8 degrees 01 minutes east", tier: "Medium" },
    { clue: "01 degrees 35 minutes south, 7 degrees 28 minutes east", tier: "Medium" },
    { clue: "02 degrees 33 minutes north, 8 degrees 45 minutes east", tier: "Hard" },
    { clue: "02 degrees 50 minutes north, 6 degrees 20 minutes east", tier: "Medium" },
    { clue: "02 degrees 50 minutes north, 1 degrees 46 minutes east", tier: "Medium" },
    { clue: "03 degrees 03 minutes south, 5 degrees 03 minutes east", tier: "Hard" },
    { clue: "03 degrees 35 minutes south, 3 degrees 35 minutes east", tier: "Medium" },
    { clue: "03 degrees 39 minutes south, 3 degrees 58 minutes east", tier: "Hard" },
    { clue: "03 degrees 45 minutes south, 2 degrees 45 minutes east", tier: "Hard" },
    { clue: "04 degrees 00 minutes south, 2 degrees 46 minutes east", tier: "Medium" },
    { clue: "04 degrees 03 minutes south, 3 degrees 11 minutes east", tier: "Hard" },
    { clue: "04 degrees 05 minutes south, 4 degrees 24 minutes east", tier: "Hard" },
    { clue: "04 degrees 13 minutes north, 2 degrees 45 minutes east", tier: "Medium" },
    { clue: "04 degrees 16 minutes south, 6 degrees 16 minutes east", tier: "Hard" },
    { clue: "04 degrees 41 minutes north, 3 degrees 09 minutes west", tier: "Hard" },
    { clue: "05 degrees 20 minutes south, 4 degrees 28 minutes east", tier: "Medium" },
    { clue: "05 degrees 37 minutes north, 1 degrees 15 minutes east", tier: "Hard" },
    { clue: "05 degrees 43 minutes north, 3 degrees 05 minutes east", tier: "Medium" },
    { clue: "05 degrees 50 minutes south, 0 degrees 05 minutes east", tier: "Hard" },
    { clue: "06 degrees 00 minutes south, 1 degrees 48 minutes east", tier: "Hard" },
    { clue: "06 degrees 11 minutes south, 5 degrees 07 minutes east", tier: "Hard" },
    { clue: "06 degrees 31 minutes north, 1 degrees 46 minutes west", tier: "Medium" },
    { clue: "07 degrees 05 minutes north, 0 degrees 56 minutes east", tier: "Medium" },
    { clue: "07 degrees 22 minutes north, 4 degrees 15 minutes east", tier: "Hard" },
    { clue: "07 degrees 33 minutes north, 5 degrees 00 minutes east", tier: "Medium" },
    { clue: "07 degrees 41 minutes north, 6 degrees 00 minutes east", tier: "Hard" },
    { clue: "07 degrees 43 minutes south, 2 degrees 26 minutes east", tier: "Hard" },
    { clue: "08 degrees 03 minutes north, 1 degrees 16 minutes east", tier: "Hard" },
    { clue: "08 degrees 05 minutes south, 5 degrees 56 minutes east", tier: "Hard" },
    { clue: "08 degrees 26 minutes south, 0 degrees 28 minutes east", tier: "Hard" },
    { clue: "08 degrees 33 minutes north, 1 degrees 39 minutes west", tier: "Medium" },
    { clue: "09 degrees 22 minutes north, 2 degrees 24 minutes west", tier: "Hard" },
    { clue: "09 degrees 33 minutes north, 2 degrees 15 minutes east", tier: "Medium" },
    { clue: "09 degrees 48 minutes north, 7 degrees 39 minutes east", tier: "Medium" },
    { clue: "11 degrees 03 minutes north, 1 degrees 20 minutes east", tier: "Medium" },
    { clue: "11 degrees 05 minutes north, 0 degrees 45 minutes west", tier: "Medium" },
    { clue: "11 degrees 41 minutes north, 4 degrees 58 minutes east", tier: "Medium" },
    { clue: "12 degrees 48 minutes north, 0 degrees 20 minutes east", tier: "Hard" },
    { clue: "13 degrees 46 minutes north, 1 degrees 01 minutes east", tier: "Hard" },
    { clue: "14 degrees 54 minutes north, 9 degrees 13 minutes east", tier: "Medium" },
    { clue: "15 degrees 48 minutes north, 3 degrees 52 minutes east", tier: "Hard" },
    { clue: "16 degrees 20 minutes north, 2 degrees 45 minutes east", tier: "Hard" },
    { clue: "16 degrees 30 minutes north, 6 degrees 28 minutes east", tier: "Hard" },
    { clue: "16 degrees 35 minutes north, 7 degrees 01 minutes east", tier: "Hard" },
    { clue: "17 degrees 50 minutes north, 8 degrees 30 minutes east", tier: "Hard" },
    { clue: "18 degrees 03 minutes north, 5 degrees 16 minutes east", tier: "Hard" },
    { clue: "18 degrees 22 minutes north, 6 degrees 33 minutes east", tier: "Hard" },
    { clue: "19 degrees 43 minutes north, 5 degrees 07 minutes east", tier: "Hard" },
    { clue: "20 degrees 05 minutes north, 1 degrees 52 minutes east", tier: "Hard" },
    { clue: "20 degrees 07 minutes north, 8 degrees 33 minutes east", tier: "Hard" },
    { clue: "20 degrees 33 minutes north, 5 degrees 48 minutes east", tier: "Hard" },
    { clue: "21 degrees 24 minutes north, 7 degrees 54 minutes east", tier: "Hard" },
    { clue: "22 degrees 30 minutes north, 3 degrees 01 minutes east", tier: "Medium" },
    { clue: "22 degrees 35 minutes north, 9 degrees 18 minutes east", tier: "Hard" },
    { clue: "22 degrees 45 minutes north, 6 degrees 33 minutes east", tier: "Hard" },
    { clue: "24 degrees 26 minutes north, 6 degrees 24 minutes east", tier: "Hard" },
    { clue: "24 degrees 56 minutes north, 2 degrees 28 minutes east", tier: "Hard" },
    { clue: "24 degrees 58 minutes north, 8 degrees 43 minutes east", tier: "Hard" },
    { clue: "25 degrees 03 minutes north, 7 degrees 05 minutes east", tier: "Hard" },
    { clue: "25 degrees 03 minutes north, 3 degrees 24 minutes east", tier: "Hard" },
];
var next_id = 401;
for (var _a = 0, coordinates_1 = coordinates; _a < coordinates_1.length; _a++) {
    var coord = coordinates_1[_a];
    var match = coord.clue.match("(\\d+) degrees (\\d+) minutes (north|south), (\\d+) degrees (\\d+) minutes (east|west)");
    var gielecoords = {
        latitude: {
            degrees: Number(match[1]),
            minutes: Number(match[2]),
            direction: match[3]
        },
        longitude: {
            degrees: Number(match[4]),
            minutes: Number(match[5]),
            direction: match[6]
        }
    };
    var clue = {
        clue: coord.clue,
        coordinates: gielecoords,
        id: next_id,
        solution: {
            type: "simple",
            coordinates: sextantToCoord(gielecoords),
            answer: "Dig at the indicated spot."
        },
        tier: coord.tier.toLowerCase(),
        type: "coordinates"
    };
    imported.push(clue);
    next_id++;
}
{
    var do_not_exist_anymore = [
        33
    ];
    var _loop_2 = function (id) {
        var i = imported.findIndex(function (e) { return e.id == id; });
        imported.slice(i, i + 1);
    };
    for (var _b = 0, do_not_exist_anymore_1 = do_not_exist_anymore; _b < do_not_exist_anymore_1.length; _b++) {
        var id = do_not_exist_anymore_1[_b];
        _loop_2(id);
    }
}
imported.findIndex;
var ids = new Map([
    ["easy", []],
    ["medium", []],
    ["hard", [
            287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302,
            28, 30, 39, 139, 240, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
            160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178,
            255, 226, 228, 229, 230, 231, 232, 235, 243, //emotes
        ]],
    ["elite", [349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367,]],
    ["master", [
            368, 369, 370, 371,
            233, 234, 236, 237, 238, 239, 240, 241, 242, 244, 245, 246, //emotes
        ]],
]);
ids.forEach(function (ids, tier) {
    var _loop_3 = function (id) {
        imported.find(function (c) { return c.id == id; }).tier = tier;
    };
    for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
        var id = ids_1[_i];
        _loop_3(id);
    }
});
for (var _c = 0, imported_1 = imported; _c < imported_1.length; _c++) {
    var clue = imported_1[_c];
    if (!clue.tier)
        console.log("Tier missing: " + clue.id + ", " + clue.type + ", " + clue.clue);
}
fs.writeFileSync("data.json.js", JSON.stringify(imported, null, 2));
