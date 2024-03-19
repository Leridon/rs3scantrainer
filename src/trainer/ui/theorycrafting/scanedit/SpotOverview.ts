import Widget from "../../../../lib/ui/Widget";
import {TileCoordinates} from "../../../../lib/runescape/coordinates/TileCoordinates";
import LightButton from "../../widgets/LightButton";
import {ScanTreeBuilder} from "./ScanEditor";
import {ScanTree} from "../../../../lib/cluetheory/scans/ScanTree";
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {C} from "../../../../lib/ui/constructors";
import span = C.span;
import {Observable} from "../../../../lib/reactive";
import vbox = C.vbox;

export default class SpotOverview extends Widget {
    list: Widget
    reselect_button: LightButton

    spot_order: Observable<TileCoordinates[]>

    constructor(private builder: ScanTreeBuilder) {
        super()

        this.css("font-family", "monospace")

        /*
        this.reselect_button = new LightButton("Select new spot numbering")
            .onClick((e) => {
                if (this.interaction) {
                    this.interaction.deactivate()
                    this.interaction = null
                } else this.startSelection()
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))*/

        this.append(this.list = c("<div style='display: flex; flex-direction: column'></div>"))

        this.builder.augmented.subscribe((tree) => {if (tree) this.update(tree)}, true)
    }

    private update(tree: AugmentedScanTree) {
        this.list.empty()

        c("<div class='row'>")
            .append(c("<div class='col-2' style='text-align: center'>").text("#"))
            .append(c("<div class='col-6' style='text-align: center'>").text("Spot"))
            .append(c("<div class='col-4' style='text-align: center'>").text("Timing"))
            .appendTo(this.list)

        /*
        vbox(
            ...tree.raw.ordered_spots.map((v, i) => {
                let timing = c("<div class='col-4' style='text-align: center'>")

                tree.state.timing_analysis.spots.find(t => TileCoordinates.eq2(t.spot, v)).timings.forEach((t, i) => {
                    if (i != 0) timing.append(span(" | "))

                    let s = span(t.ticks.toString() + "t")

                    if (t.incomplete) s.css("color", "red").tooltip("Incomplete path")

                    timing.append(s)
                })

                return c("<div class='row'>")
                    .append(c("<div class='col-2' style='text-align: center'>").text(i + 1))
                    .append(c("<div class='col-6' style='text-align: center'>").text(TileCoordinates.toString(v)))
                    .append(timing)
            })
        ).css2({
            "overflow-y": "auto",
            "overflow-x": "hidden",
            "max-height": "50vh"
        })
            .appendTo(this.list)
*/

        c("<div class='row'>")
            .append(c("<div class='col-2' style='text-align: center'>"))
            .append(c("<div class='col-6' style='text-align: center'>").text("Average"))
            .append(c("<div class='col-4' style='text-align: center'>").text(tree.state.timing_analysis.average.toFixed(2) + "t"))
            .appendTo(this.list)
    }

}
