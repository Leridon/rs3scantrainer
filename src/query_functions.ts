import {type Application} from "./application";
import {import_object} from "./util/exportString";
import {MapRectangle} from "./model/coordinates";
import {Path} from "./model/pathing";
import movement_state = Path.movement_state;
import step = Path.step;
import {Browser} from "leaflet";


function compose<A, B, C>(f: (_: A) => B, g: (_: B) => C): (_: A) => C {
    return (a: A) => g(f(a))
}

function is_json_string(s: string): boolean {
    return ['{', '['].indexOf(s.charAt(0)) >= 0
}

function auto_json<T extends object>(import_settings: { expected_type: string, expected_version: number } = null): (par: string) => T {

    function decode(s: string): string {
        if (is_json_string(s)) return s
        else {

            console.log("Decoding:")
            console.log(s)

            return atob(s)
        }
    }

    let parser = (par: string): object => {
        const json_string = decode(par)

        if (!is_json_string(json_string)) throw new Error("Parameter is not a json string")

        return JSON.parse(json_string)
    }

    if (import_settings) {
        // Import settings are set, add check for exported object

        parser = compose(parser, (obj: object): T => {
            if ("hash" in obj && "value" in obj && Object.keys(obj).length == 2) {
                let exported_object = obj as {
                    hash: number,
                    value: string
                }

                return import_object(import_settings.expected_type, import_settings.expected_version, exported_object)
            } else return obj as T
        })
    }

    return parser as (_: string) => T
}

export function extract_query_function(parameters: URLSearchParams): (_: Application) => any {
    function sarg(name: string, optional: boolean = true): string {
        let parameter = parameters.get(name)

        if (parameter == null) {
            if (optional) return null
            else throw new Error(`${name} is missing`)
        }

        return parameter
    }

    function arg<T>(name: string, optional: boolean = true, parser: (_: string) => T): T {
        let parameter = sarg(name, optional)

        return parameter != null ? parser(parameter) : null
    }

    try {
        if (parameters.has("load_path_editor")) {
            let target = arg("path_target", true, auto_json<MapRectangle>())
            let start_state = arg("path_start_state", true, auto_json<movement_state>())
            let path = arg("path_steps", true, auto_json<step[]>({expected_type: "path", expected_version: 0})) || []

            return (app: Application) => {
                app.map.path_editor.load({
                    target: target,
                    start_state: start_state,
                    steps: path
                }, {
                    save_handler: null,
                    close_handler: () => {
                    }
                })
            }
        }
    } catch (e) {
        console.error("Query error:")
        console.error(e)

        return null
    }

    // load path editor (target?, start?, path?)
    // load method
    //

    return null
}

export namespace ShareableLinks {
    function path(){
        if(window) return window.location.origin + window.location.pathname
        else return "https://leridon.github.io/cluetrainer-live/"
    }

    export function to_path(path: Path.raw): string {
        let url = window.location.origin + window.location.pathname + "?load_path_editor"
        if(path.target) url += `&path_target=${encodeURI(JSON.stringify(path.target))}`
        if(path.start_state) url += `&path_start_state=${encodeURI(JSON.stringify(path.start_state))}`
        url += `&path_steps=${encodeURI(Path.export_path(path))}`

        return url
    }
}
