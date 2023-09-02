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
        minutespertile: 1.875
    };
    return {
        x: sextant.offsetx + Math.round((60 * comp.longitude.degrees + comp.longitude.minutes) * (comp.longitude.direction == "west" ? -1 : 1) / sextant.minutespertile),
        y: sextant.offsetz + Math.round((60 * comp.latitude.degrees + comp.latitude.minutes) * (comp.latitude.direction == "south" ? -1 : 1) / sextant.minutespertile)
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
    return Array.from(coordsets.filter(function (e) { return e.clueid == id; }).map(function (e) {
        return {
            x: e.x,
            y: e.z,
            level: e.level
        };
    }));
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
console.log("Volcano");
console.log(JSON.stringify(imported.find(function (c) { return c.id == 367; })));
console.log("Deep Wilderness");
console.log(JSON.stringify(imported.find(function (c) { return c.id == 36; })));
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
console.log("Compass");
console.log(compass_main.solution.candidates.map(function (e) { return JSON.stringify(e); }).join(",\n"));
imported.push(compass_arc);
// Extract coordinates from wiki:
// (\d+) degrees (\d+) minutes (north|south).*\n.*(\d+) degrees (\d+) minutes (east|west).*\n.*tier = (Hard)
// List:
// { coordinate: {longitude: { degrees: "$1", minutes: "$2", direction: "$3" }, latitude: {degrees: "$4", minutes: "$5", direction: "$6"}}, tier: "$7" },\n
var coordinates = [
    { clue: "00 degrees 00 minutes north, 07 degrees 13 minutes west", tier: "Hard" },
    { clue: "00 degrees 05 minutes south, 01 degrees 13 minutes east", tier: "Medium" },
    { clue: "00 degrees 13 minutes south, 14 degrees 00 minutes east", tier: "Medium" },
    { clue: "00 degrees 18 minutes south, 09 degrees 28 minutes east", tier: "Medium" },
    { clue: "00 degrees 20 minutes south, 23 degrees 15 minutes east", tier: "Medium" },
    { clue: "00 degrees 31 minutes south, 17 degrees 43 minutes east", tier: "Medium" },
    { clue: "00 degrees 50 minutes north, 24 degrees 16 minutes east", tier: "Medium" },
    { clue: "01 degrees 18 minutes south, 14 degrees 15 minutes east", tier: "Medium" },
    { clue: "01 degrees 24 minutes north, 08 degrees 05 minutes west", tier: "Hard" },
    { clue: "01 degrees 26 minutes north, 08 degrees 01 minutes east", tier: "Medium" },
    { clue: "01 degrees 35 minutes south, 07 degrees 28 minutes east", tier: "Medium" },
    { clue: "02 degrees 33 minutes north, 28 degrees 45 minutes east", tier: "Hard" },
    { clue: "02 degrees 50 minutes north, 06 degrees 20 minutes east", tier: "Medium" },
    { clue: "02 degrees 50 minutes north, 21 degrees 46 minutes east", tier: "Medium" },
    { clue: "03 degrees 03 minutes south, 05 degrees 03 minutes east", tier: "Hard" },
    { clue: "03 degrees 35 minutes south, 13 degrees 35 minutes east", tier: "Medium" },
    { clue: "03 degrees 39 minutes south, 13 degrees 58 minutes east", tier: "Hard" },
    { clue: "03 degrees 45 minutes south, 22 degrees 45 minutes east", tier: "Hard" },
    { clue: "04 degrees 00 minutes south, 12 degrees 46 minutes east", tier: "Medium" },
    { clue: "04 degrees 03 minutes south, 03 degrees 11 minutes east", tier: "Hard" },
    { clue: "04 degrees 05 minutes south, 04 degrees 24 minutes east", tier: "Hard" },
    { clue: "04 degrees 13 minutes north, 12 degrees 45 minutes east", tier: "Medium" },
    { clue: "04 degrees 16 minutes south, 16 degrees 16 minutes east", tier: "Hard" },
    { clue: "04 degrees 41 minutes north, 03 degrees 09 minutes west", tier: "Hard" },
    { clue: "05 degrees 20 minutes south, 04 degrees 28 minutes east", tier: "Medium" },
    { clue: "05 degrees 37 minutes north, 31 degrees 15 minutes east", tier: "Hard" },
    { clue: "05 degrees 43 minutes north, 23 degrees 05 minutes east", tier: "Medium" },
    { clue: "05 degrees 50 minutes south, 10 degrees 05 minutes east", tier: "Hard" },
    { clue: "06 degrees 00 minutes south, 21 degrees 48 minutes east", tier: "Hard" },
    { clue: "06 degrees 11 minutes south, 15 degrees 07 minutes east", tier: "Hard" },
    { clue: "06 degrees 31 minutes north, 01 degrees 46 minutes west", tier: "Medium" },
    { clue: "07 degrees 05 minutes north, 30 degrees 56 minutes east", tier: "Medium" },
    { clue: "07 degrees 22 minutes north, 14 degrees 15 minutes east", tier: "Hard" },
    { clue: "07 degrees 33 minutes north, 15 degrees 00 minutes east", tier: "Medium" },
    { clue: "07 degrees 41 minutes north, 06 degrees 00 minutes east", tier: "Hard" },
    { clue: "07 degrees 43 minutes south, 12 degrees 26 minutes east", tier: "Hard" },
    { clue: "08 degrees 03 minutes north, 31 degrees 16 minutes east", tier: "Hard" },
    { clue: "08 degrees 05 minutes south, 15 degrees 56 minutes east", tier: "Hard" },
    { clue: "08 degrees 26 minutes south, 10 degrees 28 minutes east", tier: "Hard" },
    { clue: "08 degrees 33 minutes north, 01 degrees 39 minutes west", tier: "Medium" },
    { clue: "09 degrees 22 minutes north, 02 degrees 24 minutes west", tier: "Hard" },
    { clue: "09 degrees 33 minutes north, 02 degrees 15 minutes east", tier: "Medium" },
    { clue: "09 degrees 48 minutes north, 17 degrees 39 minutes east", tier: "Medium" },
    { clue: "11 degrees 03 minutes north, 31 degrees 20 minutes east", tier: "Medium" },
    { clue: "11 degrees 05 minutes north, 00 degrees 45 minutes west", tier: "Medium" },
    { clue: "11 degrees 41 minutes north, 14 degrees 58 minutes east", tier: "Medium" },
    { clue: "12 degrees 48 minutes north, 20 degrees 20 minutes east", tier: "Hard" },
    { clue: "13 degrees 46 minutes north, 21 degrees 01 minutes east", tier: "Hard" },
    { clue: "14 degrees 54 minutes north, 09 degrees 13 minutes east", tier: "Medium" },
    { clue: "15 degrees 48 minutes north, 13 degrees 52 minutes east", tier: "Hard" },
    { clue: "16 degrees 20 minutes north, 12 degrees 45 minutes east", tier: "Hard" },
    { clue: "16 degrees 30 minutes north, 16 degrees 28 minutes east", tier: "Hard" },
    { clue: "16 degrees 35 minutes north, 27 degrees 01 minutes east", tier: "Hard" },
    { clue: "17 degrees 50 minutes north, 08 degrees 30 minutes east", tier: "Hard" },
    { clue: "18 degrees 03 minutes north, 25 degrees 16 minutes east", tier: "Hard" },
    { clue: "18 degrees 22 minutes north, 16 degrees 33 minutes east", tier: "Hard" },
    { clue: "19 degrees 43 minutes north, 25 degrees 07 minutes east", tier: "Hard" },
    { clue: "20 degrees 05 minutes north, 21 degrees 52 minutes east", tier: "Hard" },
    { clue: "20 degrees 07 minutes north, 18 degrees 33 minutes east", tier: "Hard" },
    { clue: "20 degrees 33 minutes north, 15 degrees 48 minutes east", tier: "Hard" },
    { clue: "21 degrees 24 minutes north, 17 degrees 54 minutes east", tier: "Hard" },
    { clue: "22 degrees 30 minutes north, 03 degrees 01 minutes east", tier: "Medium" },
    { clue: "22 degrees 35 minutes north, 19 degrees 18 minutes east", tier: "Hard" },
    { clue: "22 degrees 45 minutes north, 26 degrees 33 minutes east", tier: "Hard" },
    { clue: "24 degrees 26 minutes north, 26 degrees 24 minutes east", tier: "Hard" },
    { clue: "24 degrees 56 minutes north, 22 degrees 28 minutes east", tier: "Hard" },
    { clue: "24 degrees 58 minutes north, 18 degrees 43 minutes east", tier: "Hard" },
    { clue: "25 degrees 03 minutes north, 17 degrees 05 minutes east", tier: "Hard" },
    { clue: "25 degrees 03 minutes north, 23 degrees 24 minutes east", tier: "Hard" },
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
        33,
        36, 37, 38,
        104,
        5, 12, 11, 13, 15, 16, 129, 325, 333, 344, 345, 346, 347, 348, 319, 286 // question scrolls
    ];
    var _loop_2 = function (id) {
        var i = imported.findIndex(function (e) { return e.id == id; });
        imported.splice(i, 1);
    };
    for (var _b = 0, do_not_exist_anymore_1 = do_not_exist_anymore; _b < do_not_exist_anymore_1.length; _b++) {
        var id = do_not_exist_anymore_1[_b];
        _loop_2(id);
    }
}
var ids = new Map([
    ["easy", [
            0, 2, 8, 49, 50, 54, 55, 56, 63, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 95, 96, 99, 100, 101, 102, 103, 105, 106, 107, 108, 110, 111, 112, 113, 115, 116, 117, 118, 119, 121, 123, 124, 125, 126, 127, 130, 131, 132, 133, 134, 135, 136, 137, 138, 179, 180, 182, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284
        ]],
    ["medium", [
            44, 45, 48, 51, 52, 53, 57, 58, 60, 61, 62
        ]],
    ["hard", [
            287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302,
            28, 30, 39, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
            160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178,
            225, 226, 228, 229, 230, 231, 232, 235, 243,
            40, 41, 42, 43, 46, 47, 59,
        ]],
    ["elite", [349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367,]],
    ["master", [
            368, 369, 370, 371,
            233, 234, 236, 237, 238, 239, 240, 241, 242, 244, 245, 246,
            303, 306, 307, 308, 309, 310, 311, 312, 314, 315, 316, 317
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
