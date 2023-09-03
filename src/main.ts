import {clues} from "./data/clues";
import {export_string} from "./util/exportString";
import {type CompassStep} from "./model/clues";

export function export_path(p): string {
    return export_string("path", 0, p.steps)
}

function path() {
    if (window) return window.location.origin + window.location.pathname
    else return "https://leridon.github.io/rs3scantrainer/"
}

export function to_path(path): string {
    let url = "https://leridon.github.io/rs3scantrainer/" + "?load_path_editor"
    if (path.target) url += `&path_target=${encodeURI(JSON.stringify(path.target))}`
    if (path.start_state) url += `&path_start_state=${encodeURI(JSON.stringify(path.start_state))}`
    if (path.steps.length > 0) url += `&path_steps=${encodeURI(export_path(path))}`

    return url
}

function dig_area(spot) {
    return {
        topleft: {x: spot.x - 1, y: spot.y + 1},
        botright: {x: spot.x + 1, y: spot.y - 1},
        level: spot.level
    }
}

console.log("Welcome")

let compass = clues.find(c => c.id == 399) as CompassStep

compass.solution.candidates.forEach(spot => {
    let query_link = to_path({
        target: dig_area(spot),
        steps: []
    })

    console.log(`${spot.x}, ${spot.y}, ${spot.level}, ${query_link}`)
})