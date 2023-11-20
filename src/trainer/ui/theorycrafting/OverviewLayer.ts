import {Clues, ClueStep, ClueTier, ClueType, Solution} from "../../../lib/runescape/clues";
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
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import {SmallImageButton} from "../widgets/SmallImageButton";
import sibut = SmallImageButton.sibut;
import {storage} from "../../../lib/util/storage";
import spacer = C.spacer;
import ControlWithHeader from "../map/ControlWithHeader";
import {Constants} from "trainer/constants";
import span = C.span;

class FilterControl extends GameMapControl<ControlWithHeader> {

    private filter = new storage.Variable("preferences/cluefilters",
        {
            tiers: {
                easy: true,
                medium: true,
                hard: true,
                elite: true,
                master: true
            },
            types: {
                compass: true,
                coordinates: true,
                cryptic: true,
                emote: true,
                image: true,
                scan: true,
                simple: true,
                skilling: true,
            }
        }
    )

    buttons: {
        type: { [key: ClueType]: SmallImageButton },
        tier: { [key: ClueTier]: SmallImageButton },
    } = {type: {}, tier: {}}

    constructor() {
        super({
            type: "floating",
            position: "top-left"
        }, new ControlWithHeader("Clue Filter"))

        this.content.body.append(
            hbox(
                span("Tier"),
                sibut("assets/icons/sealedeasy.png", null),
                sibut("assets/icons/sealedmedium.png", null),
                sibut("assets/icons/sealedhard.png", null),
                sibut("assets/icons/sealedelite.png", null),
                sibut("assets/icons/sealedmaster.png", null),
                spacer()
            ).addClass("ctr-filter-control-row"),
            hbox(
                span("Type"),
                sibut(Constants.icons.types.simple, null),
                sibut(Constants.icons.types.cryptic, null),
                sibut(Constants.icons.types.anagram, null),
                sibut(Constants.icons.types.emote, null),
                sibut(Constants.icons.types.coordinates, null),
                sibut(Constants.icons.types.image, null),
                sibut(Constants.icons.types.scan, null),
                sibut(Constants.icons.types.compass, null),
                sibut(Constants.icons.types.skilling, null),
                spacer()
            ).addClass("ctr-filter-control-row"),
        )
    }
}

export default class OverviewLayer extends GameLayer {
    constructor(private clues: ClueStep[], private app: Application) {
        super();

        new FilterControl().addTo(this)

        // TODO: Only render one marker per Scan

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
