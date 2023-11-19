import {MethodPack} from "./MethodPack";
import {SolvingMethods} from "./methods";
import Method = SolvingMethods.Method;
import {TileCoordinates} from "../../lib/runescape/coordinates";

type M = {
    for: number | { spot: TileCoordinates },
    method: Method
}


class MethodPackManager {

    private pack_index: {}[]

    // Save method packs in indexed db, localstorage is too small

    get(): { is_local: boolean, pack: MethodPack }[] {


        return null
    }

    createPack(name: String): MethodPack {

    }

    copyPack(pack: MethodPack) {

    }

    deletePack() {

    }

    createMethod(pack_id: string, method: Method) {

    }

    deleteMethod(pack_id: string, method_id: string) {}


    setFavorite(clue_id: number, method_id: { pack: string, method: string }) {

    }

    getForClue(id: number): { id: { pack: string, method: string }, favourite: boolean, method: Method }[] {

    }
}