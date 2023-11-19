import {Clues, ClueStep, Solution} from "../../../lib/runescape/clues";
import Properties from "../widgets/Properties";
import {TileMarker} from "../../../lib/gamemap/TileMarker";
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import Widget from "../../../lib/ui/Widget";
import LightButton from "../widgets/LightButton";
import {PathEditor} from "../pathedit/PathEditor";
import {Application} from "../../application";
import dig_area = Clues.digSpotArea;
import shortcuts from "../../../data/shortcuts";
import GameLayer from "../../../lib/gamemap/GameLayer";
import * as tippy from "tippy.js";

export default class OverviewLayer extends GameLayer {
    constructor(private clues: ClueStep[], private app: Application) {
        super();

        let spots: {
            clue: ClueStep,
            spot: TileCoordinates,
            marker: TileMarker
        }[] = clues.flatMap(clue =>
            // It's 2023 and there's still no expression-level switch or pattern matching
            ((solution: Solution): TileCoordinates[] => {
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

        // Rendering individual markers is slow, potentially faster alternative: https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet
        this.on("add", () => {
            let instances = spots.map(({clue, spot, marker}) => {
                let props = new Properties()
                props.named("Id", c().text(clue.id))
                props.named("Clue", c().text(clue.clue))
                props.named("Spot", c().text(`${spot.x}|${spot.y}|${spot.level}`))

                /*
                marker.marker.bindTooltip(props.raw(), {
                    interactive: true,
                    direction: "top",
                })*/

                return tippy.default(marker.marker.getElement(), {
                    content: () => c("<div style='background: rgb(10, 31, 41); border: 2px solid white'></div>").append(props).container.get()[0],
                })
            })

            tippy.createSingleton(instances, {
                interactive: true,
                interactiveBorder: 20,
                interactiveDebounce: 0.5,
                arrow: true,
                appendTo: () => document.body,
                delay: 0,
                animation: false,
            })
        })
    }
}