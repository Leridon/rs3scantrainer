import {SlideReader} from "./ui/neosolving/cluereader/SliderReader";
import {captureHoldScreen, ImageDetect, ImgRef, ImgRefData} from "@alt1/base";
import {Sliders} from "./ui/neosolving/puzzles/Sliders";
import SliderPuzzle = Sliders.SliderPuzzle;
import parseSliderImage = SlideReader.parseSliderImage;
import getThemeImageUrl = SlideReader.getThemeImageUrl;
import {NisModal} from "../lib/ui/NisModal";
import LightButton from "./ui/widgets/LightButton";

export async function makeshift_main(): Promise<void> {

  /*
  await (new class extends NisModal {
    render() {
      super.render()

      new LightButton("Do")
        .onClick(async () => {
          const res = await SlideReader.read(new ImgRefData(await ImageDetect.imageDataFromUrl("assets/test.png")), {x: 0, y: 0}, "bridge")

          const tiles = SliderPuzzle.getState(res)

          for (let y = 0; y < 5; y++) {
            console.log(tiles.slice(y * 5, (y + 1) * 5).join(", "));
          }

          console.log(res)
        }).appendTo(this.body)
    }
  }).show()*/


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