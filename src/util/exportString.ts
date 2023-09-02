function cyrb53(str: string, seed: number = 0): number {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function export_string<T>(type: string, version: number, value: T): string {
    let obj = JSON.stringify({
        type: type,
        version: version,
        value: value
    })

    return btoa(JSON.stringify({
        hash: cyrb53(obj),
        value: obj
    }))
}

export function import_object<T>(expected_type: string, expected_version: number, o: {
    hash: number,
    value: string
}): T {

    if (cyrb53(o.value) != o.hash) throw new Error()

    let o2: {
        type: string,
        version: number,
        value: T
    } = JSON.parse(o.value)

    if (o2.type != expected_type || o2.version != expected_version) throw new Error()

    return o2.value
}

export function import_string<T>(expected_type: string, expected_version: number, str: string): T {
    let o: {
        hash: number,
        value: string
    } = JSON.parse(atob(str))

    if (cyrb53(o.value) != o.hash) throw new Error()

    let o2: {
        type: string,
        version: number,
        value: T
    } = JSON.parse(o.value)

    if (o2.type != expected_type || o2.version != expected_version) throw new Error()

    return o2.value
}