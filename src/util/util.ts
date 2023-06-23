export namespace util {
    export function natural_join(a: any[], connector: "and" | "or" = "and"): string {
        if (a.length == 0) return ""
        if (a.length == 1) return a.toString()
        if (a.length == 2) return `${a[0]} ${connector} ${a[1]}`

        return a.slice(0, -1).join(", ") + `, ${connector} ` + a[a.length - 1]
    }

    export function natural_order(a: number, b: number): number {
        return a - b
    }

    export function comap<T, U>(cmp: (a: U, b: U) => number, f: (T) => U): (a: T, b: T) => number {
        return (a, b) => cmp(f(a), f(b))
    }

    export function capitalize(s: string): string {
        return s ? s[0].toUpperCase() + s.slice(1) : ""
    }
}