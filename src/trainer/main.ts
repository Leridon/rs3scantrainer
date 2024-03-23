import {util} from "../lib/util/util";
import Order = util.Order;
import {Clues, ClueType} from "../lib/runescape/clues";
import ExportStringModal from "./ui/widgets/modals/ExportStringModal";
import {clue_data} from "../data/clues";
import cleanedJSON = util.cleanedJSON;
import {TileArea} from "../lib/runescape/coordinates/TileArea";
import {TileCoordinates, TileRectangle} from "../lib/runescape/coordinates";

export async function makeshift_main(): Promise<void> {
  /* let output = ""

   for (let step of clue_data.all) {
       if (step.solution?.type == "search") {
           if ("x" in step.solution.spot) {
               step.solution.spot = TileRectangle.fromTile(step.solution.spot as unknown as TileCoordinates)
           }
       }
   }

   new ExportStringModal(JSON.stringify(clue_data.all, (key, value) => {
       if ((key == "range" || key == "area") && value["topleft"]) return TileArea.fromRect(value)

       return value
   }, 4)).show()*/


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


  //console.log(`Length: ${c["map"].length}`)

  // return JSON.stringify(await Promise.all(old_methods.map(async m => await translate(m))), null, 4)
}