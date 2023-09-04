import {type Application} from "./application";
import {Path} from "./model/pathing";
import step = Path.step;
import {ExportImport} from "./util/exportString";
import * as lodash from "lodash"
import {identity} from "lodash";
/*
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
            let target = arg("path_target", true, ExportImport.imp<MapRectangle>())
            let start_state = arg("path_start_state", true, ExportImport.imp<movement_state>())
            let path = arg("path_steps", true, ExportImport.imp<step[]>({expected_type: "path", expected_version: 0})) || []

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
}*/

export namespace QueryLinks {
    type Command<T extends Record<string, any>> = {
        name: string,
        parser: {
            [P in keyof T]?: (_: string) => T[P];
        },
        instantiate: (arg: T) => (_: Application) => void
    }

    type QueryInvocation<T> = {
        name: string,
        arg: T
    }

    export namespace Commands {
        export const load_path: Command<Path.raw> = {
            name: "load_path",
            parser: {
                steps: ExportImport.imp<step[]>({expected_type: "path", expected_version: 0}),
            },
            instantiate: (arg: Path.raw) => (app: Application): void => {
                app.map.path_editor.load(arg, {
                    save_handler: null,
                    close_handler: () => {
                    }
                })
            },
        }

        export const index = [
            load_path
        ]

        export function invocation<T>(command: Command<T>, arg: T): QueryInvocation<T> {
            return {
                name: command.name,
                arg: arg
            }
        }
    }

    namespace QueryInvocation {
        import imp = ExportImport.imp;

        export function toQuery<T>(query: QueryInvocation<T>): URLSearchParams {
            return new URLSearchParams({
                "ctr_query": exp(null, true, true)(query)
            })
        }

        export function fromQuery(params: URLSearchParams): QueryInvocation<any> {
            let query = params.get("ctr_query")

            if (!query) return null

            return imp()(query) as QueryInvocation<any>
        }

        export function resolve<T>(query: QueryInvocation<T>): (_: Application) => void {
            let command = (Commands.index.find(c => c.name == query.name) as Command<T>)

            let cloned_arg = lodash.clone(query.arg)

            for (let key of Object.keys(command.parser)) {
                cloned_arg[key] = (command.parser[key] || identity)(query.arg[key])
            }

            return command.instantiate(query.arg)
        }
    }

    export function link<T>(command: Command<T>, arg: T): string {
        return `${get_path()}?${QueryInvocation.toQuery(Commands.invocation(command, arg)).toString()}`
    }

    export function get_from_params(parameters: URLSearchParams): (_: Application) => void {
        let invocation = QueryInvocation.fromQuery(parameters)
        if (!invocation) return null
        return QueryInvocation.resolve(invocation)
    }

    import exp = ExportImport.exp;

    function get_path() {
        if (window) return window.location.origin + window.location.pathname
        else return "https://leridon.github.io/rs3scantrainer/"
    }
}
