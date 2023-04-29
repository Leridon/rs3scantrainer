import {ClueType} from "../clues";

export let clues = require("./data.json.js")

export function byType(type: ClueType) {
    return clues.filter((e) => e.type == type)
}
