import Widget from "lib/ui/Widget";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import LightButton from "../widgets/LightButton";
import {ScanTreeBuilder} from "./ScanEditor";
import {Observable} from "lib/properties/Observable";
import {ScanTree} from "../../../lib/cluetheory/scans/ScanTree";
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;

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

        this.builder.augmented.subscribe((tree) => {if(tree) this.update(tree)}, true)
    }

    private update(tree: AugmentedScanTree) {
        this.list.empty()

        c("<div class='row'>")
            .append(c("<div class='col-3' style='text-align: center'>").text("#"))
            .append(c("<div class='col-3' style='text-align: center'>").text("x"))
            .append(c("<div class='col-3' style='text-align: center'>").text("y"))
            .append(c("<div class='col-3' style='text-align: center'>").text("Floor"))
            .appendTo(this.list)

        tree.raw.spot_ordering.forEach((v, i) => {
            c("<div class='row'>")
                .append(c("<div class='col-3' style='text-align: center'>").text(i + 1))
                .append(c("<div class='col-3' style='text-align: center'>").text(v.x))
                .append(c("<div class='col-3' style='text-align: center'>").text(v.y))
                .append(c("<div class='col-3' style='text-align: center'>").text(v.level ?? 0))
                .appendTo(this.list)
        })
    }

}
