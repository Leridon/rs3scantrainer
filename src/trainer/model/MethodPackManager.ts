import {SolvingMethods} from "./methods";
import Method = SolvingMethods.Method;
import KeyValueStore from "../../lib/util/KeyValueStore";
import {uuid} from "../../oldlib";
import {ClueIndex} from "../../data/ClueIndex";
import {Clues} from "../../lib/runescape/clues";
import {default_scan_method_pack} from "../../data/methods";
import {clue_data} from "../../data/clues";
import {TileCoordinates} from "../../lib/runescape/coordinates";
import {ewent, Ewent} from "../../lib/reactive";
import * as lodash from "lodash";

export type Pack = {
    type: "default" | "local" | "imported"
    id: string,
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

    private index: ClueIndex<{ methods: AugmentedMethod[] }> = clue_data.index.with(() => ({methods: []}))

    constructor() {
        this.default_packs = [
            default_scan_method_pack
        ]

        this.initialized = this.local_pack_store.get().then(v => {
            this.local_packs = v || []
            this.invalidateIndex()
        })
    }

    private save(): Promise<void> {
        return this.local_pack_store.set(this.local_packs)
    }

    private async invalidateIndex(): Promise<void> {

        // TODO: For multi-spot clues there needs to be a hashed index to find methods by spot

        this.index.filtered().forEach(c => c.methods = []);

        (await this.all()).forEach(p => {
            p.methods.forEach(m => {
                this.index.get(m.for?.clue)?.methods?.push({
                    method: m,
                    pack: p,
                    clue: clue_data.index.get(m.for.clue).clue
                })
            })
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
        pack.id = uuid()
        pack.type = "local"

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
        pack.type = "imported"

        this.local_packs.push(pack)

        await this.save()

        this.pack_set_changed.trigger(await this.all())

        return pack
    }

    async deletePack(pack: Pack) {
        if (pack.type == "default") {
            console.log("Attempting to delete default pack")
            return
        }

        let i = this.local_packs.findIndex(p => p.id == pack.id)

        if(i < 0) {
            console.log("Attempting to delete non-existing pack")
            return
        }

        this.local_packs.splice(i, 1)

        await this.save()

        this.pack_set_changed.trigger(await this.all())
    }

    createMethod(pack_id: string, method: Method) {

    }

    deleteMethod(pack_id: string, method_id: string) {}

    async getForClue(id: number, spot_alterantive?: TileCoordinates): Promise<AugmentedMethod[]> {
        await this.initialized

        let ms = this.index.get(id).methods

        if (spot_alterantive)
            return ms.filter(m => TileCoordinates.eq2(m.method.for.spot, spot_alterantive))
        else
            return ms
    }
}
