import {MethodPack} from "./MethodPack";
import {SolvingMethods} from "./methods";
import Method = SolvingMethods.Method;
import {TileCoordinates} from "../../lib/runescape/coordinates";
import methods from "../../data/methods";

type M_base = {
    for: number | TileCoordinates,
    name: string,
    description: string,
}

type M = M_base


type MethodInPack = {
    id: number,
    method: M
}

type MethodId = {
    pack: number,
    method: number
}

type PackId = {
    type: "default"
    id: string
} | {
    type: "local",
    id: number
}

type Pack = {
    author: string,
    timestamp: number,
    description: string,
    methods: MethodInPack[]
}

type PackWithId = {
    pack: Pack,
    id: PackId
}

type M2 = {
    pack: Pack,
    method: MethodInPack,
    is_favourite: boolean
}


let default_scan_method_pack: Pack

class MethodPackManager {
    private default_packs: PackWithId[]

    private packs: Pack[] = []

    // Save method packs in indexed db, localstorage is too small

    constructor() {
        this.default_packs = [
            {id: {type: "default", id: "default-scan-methods"}, pack: default_scan_method_pack}
        ]
    }

    all(): PackWithId[] {
        return [...this.default_packs]
    }

    createPack(name: String): Pack {
        let n: Pack = {
            id: null,
            author: "",
            description: "",
            timestamp: 0,
            methods: []
        }

        this.packs.push(n)

        return n
    }

    importPack(string: string): Pack {

    }

    copyPack(pack: MethodPack) {

    }

    deletePack() {

    }

    createMethod(pack_id: string, method: Method) {

    }

    deleteMethod(pack_id: string, method_id: string) {}

    getForClue(id: number | TileCoordinates): M2[] {
        // TODO: Probably best to have an internal index as a lookup table
        return this.packs.flatMap(p => p.methods.filter(m => id_match(m.method.for, id))
            .map(m => ({
                pack: p,
                method: m,
                is_favourite: false // TODO
            }))
        )
    }
}

function id_match(a: number | TileCoordinates, b: number | TileCoordinates): boolean {
    // TODO!
    return true
}