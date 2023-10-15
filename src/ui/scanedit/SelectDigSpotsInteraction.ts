import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import {MapCoordinate} from "../../model/coordinates";
import LayerInteraction from "../map/interactions/LayerInteraction";
import {TileMarker} from "../map/TileMarker";
import Widget from "../widgets/Widget";
import TopControl from "../map/TopControl";
import {ActiveLayer} from "../map/activeLayer";

class SelectDigSpotsTopControl extends TopControl {
    status: JQuery
    save_btn: JQuery

    constructor(private parent: SelectDigSpotsInteraction) {
        super();

        this.addClass("nis-map-control").css("padding", "5px")

        this.container.text("Click digspots on the map to select/deselect them.")
        this.status = $("<div></div>").appendTo(this.container)
        $("<span>")

        let control_row = $("<div style='text-align: center'></div>").appendTo(this.container)

        this.save_btn = $("<div class='lightbutton'>Finish</div>")
            .on("click", () => this.parent.finish())
            .appendTo(control_row)

        $("<div class='lightbutton'>Cancel</div>")
            .on("click", () => this.parent.abort())
            .appendTo(control_row)

        parent.events.on("changed", (v) => this.update(v.length))

        this.update(0)
    }

    update(n: number) {
        //this.status.text(`${n}/${this.parent.layer.clue.solution.candidates.length} spots selected.`)

        /*TODO if (n == this.parent.layer.clue.solution.candidates.length) this.save_btn.text("Save")
        else this.save_btn.text("Finish")*/
    }
}

export default class SelectDigSpotsInteraction extends LayerInteraction<ActiveLayer> {
    events = new TypedEmitter<{
        "changed": MapCoordinate[],
        "done": MapCoordinate[],
        "cancelled": null
    }>()

    selection: MapCoordinate[]

    constructor(layer: ActiveLayer) {
        super(layer);
    }

    start() {
        this.selection = []
        this._finished_properly = false

        let self = this
        //this.layer.events.on("dig_spot_clicked", self._hook)
    }

    cancel() {
        let self = this
        //this.layer.events.off("dig_spot_clicked", self._hook)

        if (!this._finished_properly) this.events.emit("cancelled", null)
    }

    _finished_properly: boolean = false

    finish() {
        this._finished_properly = true
        this.events.emit("done", this.selection)
        this.deactivate()
    }

    abort() {
        this.events.emit("cancelled", null)
        this.deactivate()
    }

    private _hook = (m: TileMarker) => {
        let s = m.getSpot()

        let i = this.selection.findIndex((e) => MapCoordinate.eq(e, s))

        if (i >= 0) this.selection.splice(i, 1)
        else this.selection.push(s)

        this.events.emit("changed", this.selection)
    }

    _controlBar: SelectDigSpotsTopControl = null


    getTopControl(): Widget {
        if (!this._controlBar) this._controlBar = new SelectDigSpotsTopControl(this)

        return this._controlBar
    }
}