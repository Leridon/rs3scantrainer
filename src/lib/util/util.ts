import * as L from "leaflet"
import * as leaflet from "leaflet";

export namespace util {

    export function natural_join(a: any[], connector: "and" | "or" = "and"): string {
        if (a.length == 0) return ""
        if (a.length == 1) return a.toString()
        if (a.length == 2) return `${a[0]} ${connector} ${a[1]}`

        return a.slice(0, -1).join(", ") + `, ${connector} ` + a[a.length - 1]
    }

    export function plural(n: number, word: string, postfix: string = "s") : string {
        let s = `${n} ${word}`

        if(n != 1) s += postfix

        return s
    }

    export namespace Order {

        export function natural_order(a: number, b: number): number {
            return a - b
        }

        export function comap<T, U>(cmp: (a: U, b: U) => number, f: (T) => U): (a: T, b: T) => number {
            return (a, b) => cmp(f(a), f(b))
        }

        export function reverse<T>(cmp: (a: T, b: T) => number): (a: T, b: T) => number {
            return (a, b) => -cmp(a, b)
        }
    }


    export function capitalize(s: string): string {
        return s ? s[0].toUpperCase() + s.slice(1) : ""
    }

    /**
     * Helper function to easily allow negative indexing to access elements at the back of array
     */
    export function index<T>(array: T[], index: number): T {
        return array[(array.length + index) % array.length]
    }

    export function minIndex(array: number[]): number {
        return array.indexOf(Math.min(...array))
    }

    export function shorten_integer_list(l: number[], f: ((_: number) => string) = (n => n.toString())): string[] {
        l.sort(Order.natural_order)

        let res: string[] = []

        let start_range = l[0]
        let last = start_range

        for (let i = 1; i < l.length; i++) {
            let n = l[i]

            if (n <= last + 1) last = n
            else {
                if (last == start_range) res.push(f(last))
                else if (last == start_range + 1) res.push(f(start_range), f(last))
                else res.push(`${f(start_range)} - ${f(last)}`)

                start_range = n
                last = n
            }
        }

        if (last == start_range) res.push(f(last))
        else if (last == start_range + 1) res.push(f(start_range), f(last))
        else res.push(`${f(start_range)} - ${f(last)}`)

        return res
    }

    export function convert_bounds(bounds: L.Bounds): L.LatLngBounds {
        return leaflet.latLngBounds([
            [bounds.getTopLeft().y, bounds.getTopLeft().x],
            [bounds.getBottomRight().y, bounds.getBottomRight().x],
        ])
    }

    export function compose<T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) {
        return fns.reduce((prevFn, nextFn) => value => nextFn(prevFn(value)), fn1);
    }

    export function swap<A, B>(a: A, b: B): [B, A] {
        return [b, a]
    }

    export function count<A>(a: A[], p: (_: A) => boolean): number {
        return a.reduce((x, y) => x + (p(y) ? 1 : 0), 0)
    }

    /**
     * This generic type can be used to ensure a defined type is a subtype of another type statically.
     * I'm 99% percent sure this already exists in some way, but could not find it.
     */
    export type ensure_subtype<Supertype, T extends Supertype> = T
}