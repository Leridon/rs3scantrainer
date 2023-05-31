export namespace util {
    export function natural_join(a: any[]): string {
        if (a.length == 0) return ""

        if (a.length == 1) return a.toString()

        return a.slice(0, -1).join(", ") + ", and " + a[a.length - 1]
    }
}