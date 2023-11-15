import Widget from "lib/ui/Widget";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import LightButton from "../widgets/LightButton";
import {ScanTreeBuilder} from "./ScanEditor";
import {Observable} from "lib/properties/Observable";
import {ScanTree} from "../../../lib/cluetheory/scans/ScanTree";
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {C} from "../../../lib/ui/constructors";
import span = C.span;

export default class SpotOverview extends Widget {
    list: Widget
    reselect_button: LightButton

    spot_order: Observable<TileCoordinates[]>

    constructor(private builder: ScanTreeBuilder) {
        super()

        /*
        this.reselect_button = new LightButton("Select new spot numbering")
            .on("click", (e) => {
                if (this.interaction) {
                    this.interaction.deactivate()
                    this.interaction = null
                } else this.startSelection()
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))*/

        this.append(this.list = c("<div>"))

        this.builder.augmented.subscribe((tree) => {if (tree) this.update(tree)}, true)
    }

    private update(tree: AugmentedScanTree) {
        this.list.empty()

        c("<div class='row'>")
            .append(c("<div class='col-2' style='text-align: center'>"))
            .append(c("<div class='col-2' style='text-align: center'>").text("#"))
            .append(c("<div class='col-3' style='text-align: center'>").text("Spot"))
            .append(c("<div class='col-3' style='text-align: center'>").text("Timing"))
            .append(c("<div class='col-2' style='text-align: center'>"))
            .appendTo(this.list)

        tree.raw.spot_ordering.forEach((v, i) => {
            let timing = c("<div class='col-3' style='text-align: center'>")

            tree.state.timing_analysis.spots.find(t => TileCoordinates.eq2(t.spot, v)).timings.forEach((t, i) => {
                if (i != 0) timing.append(span(" | "))

                let s = span(t.ticks.toString() + "t")

                if (t.incomplete) s.css("color", "red").tooltip("Incomplete path")

                timing.append(s)
            })

            c("<div class='row'>")
                .append(c("<div class='col-2' style='text-align: center'>"))
                .append(c("<div class='col-2' style='text-align: center'>").text(i + 1))
                .append(c("<div class='col-3' style='text-align: center'>").text(TileCoordinates.toString(v)))
                .append(timing)
                .append(c("<div class='col-2' style='text-align: center'>"))
                .appendTo(this.list)
        })

        c("<div class='row'>")
            .append(c("<div class='col-2' style='text-align: center'>"))
            .append(c("<div class='col-2' style='text-align: center'>"))
            .append(c("<div class='col-3' style='text-align: center'>").text("Average"))
            .append(c("<div class='col-3' style='text-align: center'>").text(tree.state.timing_analysis.average.toFixed(2) + "t"))
            .append(c("<div class='col-2' style='text-align: center'>"))
            .appendTo(this.list)
    }

}
