import {SolvingMethods} from "./methods";
import Method = SolvingMethods.Method;
import KeyValueStore from "../../lib/util/KeyValueStore";
import {uuid} from "../../oldlib";
import {ClueSpotIndex} from "../../data/ClueIndex";
import {Clues} from "../../lib/runescape/clues";
import {default_scan_method_pack} from "../../data/methods";
import {clue_data} from "../../data/clues";
import {TileCoordinates} from "../../lib/runescape/coordinates";
import {ewent, Ewent} from "../../lib/reactive";
import * as lodash from "lodash";
import {util} from "../../lib/util/util";
import timestamp = util.timestamp;

export type Pack = {
    type: "default" | "local" | "imported"
    local_id: string,
    original_id: string,
    author: string,
    timestamp: number,
    name: string,
    description: string,
    methods: Method[]
}

export type AugmentedMethod<
    method_t extends Method = Method,
    step_t extends Clues.Step = Clues.Step
> = { method: method_t, pack?: Pack, clue?: step_t }

export class MethodPackManager {
    public initialized: Promise<void>

    private local_pack_store = KeyValueStore.instance().variable<Pack[]>("data/local_methods")

    private default_packs: Pack[]
    private local_packs: Pack[] = []

    pack_set_changed: Ewent.Real<Pack[]> = ewent()

    private index_created: Promise<void>

    private method_index: ClueSpotIndex<{ methods: AugmentedMethod[] }>
        = ClueSpotIndex.simple(clue_data.index).with(() => ({methods: []}))

    constructor() {
        this.default_packs = [
            default_scan_method_pack
        ]

        this.initialized = this.local_pack_store.get().then(async v => {
            this.local_packs = v || []
        })

        this.invalidateIndex()

        this.pack_set_changed.on(() => this.invalidateIndex())
    }

    private save(): Promise<void> {
        return this.local_pack_store.set(this.local_packs)
    }

    private invalidateIndex(): void {

        this.index_created = new Promise(async (resolve) => {
            this.method_index.forEach(e => e.methods = []);

            (await this.all()).forEach(p => {
                p.methods.forEach(m => {
                    this.method_index.get(m.for.clue, m.for.spot).methods.push({
                        method: m,
                        pack: p,
                        clue: clue_data.index.get(m.for.clue).clue
                    })
                })
            })

            resolve()
        })

    }

    async all(): Promise<Pack[]> {
        await this.initialized
        return [...this.default_packs, ...this.local_packs]
    }

    /**
     * Clones and saves the given pack locally.
     * The pack is copied and gets a new id.
     *
     * The copied and modified pack is returned
     *
     * @param pack
     */
    async create(pack: Pack): Promise<Pack> {
        pack = lodash.cloneDeep(pack)
        pack.local_id = uuid()
        pack.original_id = pack.local_id
        pack.type = "local"
        pack.timestamp = timestamp()

        this.local_packs.push(pack)

        await this.save()

        this.pack_set_changed.trigger(await this.all())

        return pack
    }

    /**
     * Clones and saves the given pack locally as an imported pack.
     * The pack is copied, but keeps its id.
     *
     * The copied pack is returned
     *
     * @param pack
     */
    async import(pack: Pack): Promise<Pack> {
        pack = lodash.cloneDeep(pack)

        pack.local_id = uuid()
        pack.type = "imported"

        this.local_packs.push(pack)

        await this.save()

        this.pack_set_changed.trigger(await this.all())

        return pack
    }

    async getPack(local_id: string): Promise<Pack> {
        return (await this.all()).find(p => p.local_id == local_id)
    }

    async deletePack(pack: Pack) {
        if (pack.type == "default") {
            console.log("Attempting to delete default pack")
            return
        }

        let i = this.local_packs.findIndex(p => p.local_id == pack.local_id)

        if (i < 0) {
            console.log("Attempting to delete non-existing pack")
            return
        }

        this.local_packs.splice(i, 1)

        await this.save()

        this.pack_set_changed.trigger(await this.all())
    }

    async updatePack(pack: Pack, f: (_: Pack) => any): Promise<void> {
        if (pack.type != "local") return

        f(pack)

        pack.timestamp = timestamp()

        this.save()
    }

    async updateMethod(method: AugmentedMethod): Promise<void> {
        let pack = this.local_packs.find(p => p.type == "local" && p.local_id == method.pack.local_id)

        let i = pack.methods.findIndex(m => m.id == method.method.id)

        pack.methods[i] = method.method

        method.method.timestamp = pack.timestamp = timestamp()

        this.save()
    }

    createMethod(method: AugmentedMethod) {
        let pack = this.local_packs.find(p => p.type == "local" && p.local_id == method.pack.local_id)

        pack.methods.push(method.method)

        pack.timestamp = timestamp()

        this.save()
    }

    deleteMethod(method: AugmentedMethod) {
        let pack = this.local_packs.find(p => p.type == "local" && p.local_id == method.pack.local_id)

        let i = pack.methods.findIndex(m => m.id == method.method.id)

        pack.methods.splice(i, 1)

        pack.timestamp = timestamp()

        this.save()
    }

    async getForClue(id: number, spot_alternative?: TileCoordinates): Promise<AugmentedMethod[]> {
        await this.index_created

        return this.method_index.get(id, spot_alternative).methods
    }
}
