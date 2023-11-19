import {MethodPack} from "./MethodPack";
import {SolvingMethods} from "./methods";
import Method = SolvingMethods.Method;
import {TileCoordinates, TileRectangle} from "../../lib/runescape/coordinates";
import tr = TileRectangle.tr;

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

type Pack = {
    id: number,
    is_builtin: boolean,
    author: string,
    description: string,
    timestamp: number,
    methods: MethodInPack[]
}

type M2 = {
    pack: Pack,
    method: MethodInPack,
    is_favourite: boolean
}


class MethodPackManager {

    private packs: Pack[] = []
    private favourites: {clue: number | TileCoordinates, method: MethodId}[] = []

    // Save method packs in indexed db, localstorage is too small

    all(): Pack[] {
        return [...this.packs]
    }

    createPack(name: String): Pack {
        let n: Pack = {
            id: null,
            is_builtin: false,
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


    setFavorite(method: M2) {

    }

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