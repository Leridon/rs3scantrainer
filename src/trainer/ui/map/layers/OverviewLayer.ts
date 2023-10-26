import {ActiveLayer} from "../activeLayer";
import {ClueStep, Solution} from "lib/runescape/clues";
import Properties from "../../widgets/Properties";
import {TileMarker} from "../TileMarker";
import {MapCoordinate} from "lib/runescape/coordinates";
import Widget from "../../widgets/Widget";
import * as tippy from "tippy.js";
import LightButton from "../../widgets/LightButton";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import dig_area = ScanTree.dig_area;
import {PathEditor} from "trainer/ui/pathedit/PathEditor";

export default class OverviewLayer extends ActiveLayer {
    constructor(private clues: ClueStep[]) {
        super();

        let spots: {
            clue: ClueStep,
            spot: MapCoordinate,
            marker: TileMarker
        }[] = clues.flatMap(clue =>
            // It's 2023 and there's still no expression-level switch or pattern matching
            ((solution: Solution): MapCoordinate[] => {
                switch (solution.type) {
                    case "simple":
                        return [solution.coordinates]
                    case "variants":
                        return solution.variants.map(v => v.solution.coordinates)
                    case "coordset":
                        return solution.candidates
                }
            })(clue.solution).map(s => {
                return {
                    clue: clue,
                    spot: s,
                    marker: new TileMarker(s).withMarker().addTo(this)
                }
            })
        )

        this.on("add", () => {
            spots.forEach(({clue, spot, marker}) => {
                let props = new Properties()
                props.named("id", c().text(clue.id))
                props.named("clue", c().text(clue.clue))
                props.named("spot", c().text(`${spot.x}|${spot.y}|${spot.level}`))
                props.row(new LightButton("Load path editor")
                    .on("click", () => {
                        new PathEditor(this.getMap().main_layer).load([], {
                            target: dig_area(spot)
                        })
                    }))

                Widget.wrap($(marker.marker.getElement())).addTippy(props, {
                    interactive: true,
                    appendTo: () => document.body
                })
            })

            tippy.createSingleton(spots.map(m => tippy.default(m.marker.marker.getElement())), {
                delay: 0,
            })
        })
    }
}