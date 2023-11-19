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