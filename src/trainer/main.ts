import {util} from "../lib/util/util";
import Order = util.Order;
import {Clues, ClueType} from "../lib/runescape/clues";
import ExportStringModal from "./ui/widgets/modals/ExportStringModal";
import {clue_data} from "../data/clues";
import shortcuts from "../data/shortcuts";

export async function makeshift_main(): Promise<string> {
    let output = ""


    /*
        let cmp = Order.chain(
            Order.comap(Order.natural_order, (c: Clues.Step) => [null, "easy", "medium", "hard", "elite", "master"].indexOf(c.tier)),
            Order.comap(Order.natural_order, (c: Clues.Step) => c.id),
        )

        for (let type of ClueType.all) {
            let obj = clues.filter(c => c.type == type).sort(cmp)

            const allKeys = ["id", "type", "tier"]
            JSON.stringify(obj, (key, value) => {
                allKeys.push(key)
                return value
            });

            await ExportStringModal.do(JSON.stringify(obj, allKeys, 4))
        }*/

    let maps = clue_data.all.filter(c => c.type == "map")

    //console.log(`Length: ${c["map"].length}`)


    return output
    // return JSON.stringify(await Promise.all(old_methods.map(async m => await translate(m))), null, 4)
}