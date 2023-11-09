import {ActiveLayer} from "../activeLayer";
import {Clues, ClueStep, Solution} from "../../runescape/clues";
import Properties from "../../../trainer/ui/widgets/Properties";
import {TileMarker} from "../TileMarker";
import {TileCoordinates} from "../../runescape/coordinates";
import Widget from "../../ui/Widget";
import LightButton from "../../../trainer/ui/widgets/LightButton";
import {PathEditor} from "../../../trainer/ui/pathedit/PathEditor";
import {Application} from "../../../trainer/application";
import dig_area = Clues.digSpotArea;
import shortcuts from "../../../data/shortcuts";

export default class OverviewLayer extends ActiveLayer {
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

        this.on("add", () => {
            spots.forEach(({clue, spot, marker}) => {
                let props = new Properties()
                props.named("id", c().text(clue.id))
                props.named("clue", c().text(clue.clue))
                props.named("spot", c().text(`${spot.x}|${spot.y}|${spot.level}`))
                props.row(new LightButton("Load path editor")
                    .on("click", () => {
                        new PathEditor(this, this.app.template_resolver, {
                                teleports: this.app.data.teleports.getAll(),
                                shortcuts: shortcuts
                            }, {
                                initial: [],
                                target: dig_area(spot)
                            }
                        )
                    }))

                Widget.wrap($(marker.marker.getElement())).addTippy(props, {
                    interactive: true,
                    animation: false,
                    appendTo: () => document.body
                })
            })
        })
    }
}