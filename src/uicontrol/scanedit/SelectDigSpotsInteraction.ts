import {LayerInteraction, TileMarkerWithActive} from "../map/activeLayer";
import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import {eq, MapCoordinate} from "../../model/coordinates";
import {ScanEditLayer} from "../map/layers/ScanLayer";


export default class SelectDigSpotsInteraction extends LayerInteraction<ScanEditLayer> {
    events = new TypedEmitter<{
        "changed": MapCoordinate[],
        "done": MapCoordinate[]
    }>()

    selection: MapCoordinate[]

    constructor(layer: ScanEditLayer) {
        super(layer);
    }

    start() {
        this.selection = []

        let self = this
        this.layer.events.on("dig_spot_clicked", self._hook)
    }

    cancel() {
        let self = this
        this.layer.events.off("dig_spot_clicked", self._hook)

        this.events.emit("done", this.selection)
    }

    private _hook = (m: TileMarkerWithActive) => {
        let s = m.getSpot()

        console.log(s)

        let i = this.selection.findIndex((e) => eq(e, s))

        if (i >= 0) this.selection.splice(i, 1)
        else this.selection.push(s)

        this.events.emit("changed", this.selection)
    }
}