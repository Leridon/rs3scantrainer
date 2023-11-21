import {MethodPack} from "./MethodPack";
import {SolvingMethods} from "./methods";
import Method = SolvingMethods.Method;
import {TileCoordinates} from "../../lib/runescape/coordinates";
import KeyValueStore from "../../lib/util/KeyValueStore";
import {uuid} from "../../oldlib";
import {ClueIndex} from "../../data/ClueIndex";

type M_base = {
    for: { clue: number, alternative?: string, spot?: TileCoordinates },
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
    id: string,
    author: string,
    timestamp: number,
    name: string,
    description: string,
    methods: MethodInPack[]
}

type ActivePack = {
    pack: Pack,
    type: "default" | "local"
}

type M2 = {
    pack: ActivePack,
    method: MethodInPack
}


let default_scan_method_pack: Pack

export class MethodPackManager {
    public initialized: Promise<void>

    private local_pack_store = KeyValueStore.instance().variable<ActivePack[]>("data/local_methods")

    private default_packs: ActivePack[]
    private local_packs: ActivePack[]

    private index: ClueIndex<{ methods: M2[] }>

    constructor() {
        this.default_packs = [
            {type: "default", pack: default_scan_method_pack}
        ]

        this.initialized = this.local_pack_store.get().then(v => {this.local_packs = v})
    }

    private save(): Promise<void> {
        return this.local_pack_store.set(this.local_packs)
    }

    private invalidateIndex(): void {
        this.index.filtered().forEach(c => c.methods = [])

        this.all().forEach(p => {
            p.pack.methods.forEach(m => {
                this.index.get(m.method.for.clue).methods.push({
                    pack: p,
                    method: m
                })
            })
        })
    }

    all(): ActivePack[] {
        return [...this.default_packs, ...this.local_packs]
    }

    createPack(name: string): ActivePack {
        let n: ActivePack = {
            type: "local",
            pack: {
                author: "Anonymous",
                id: uuid(),
                name: name,
                description: "",
                timestamp: null, // TODO
                methods: []
            }
        }

        this.local_packs.push(n)

        this.save()

        return n
    }

    copyPack(pack: MethodPack) {

    }

    deletePack() {

    }

    createMethod(pack_id: string, method: Method) {

    }

    deleteMethod(pack_id: string, method_id: string) {}

    getForClue(id: number, alternantive?: string, coordinates?: TileCoordinates): M2[] {
        // TODO: Include alternative and coordinates

        return this.index.get(id).methods
    }
}
