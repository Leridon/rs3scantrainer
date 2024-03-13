import {Application} from "../../application";
import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {ClueSpotIndex} from "../../../lib/runescape/clues/ClueIndex";
import {clue_data} from "../../../data/clues";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {FilterControl} from "./Filtering";
import {ClueOverviewMarker} from "./OverviewMarker";
import {Clues} from "../../../lib/runescape/clues";
import ClueSpot = Clues.ClueSpot;
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {DisplayedRouteFilterEdit} from "./DisplayedRouteFilter";
import TheoryCrafter from "./TheoryCrafter";
import * as leaflet from "leaflet"
import ControlWithHeader from "../map/ControlWithHeader";

export default class OverviewLayer extends GameLayer {
    filter_control: FilterControl

    public marker_index: ClueSpotIndex<{
        markers: ClueOverviewMarker[],
        route_display: leaflet.Layer
    }>

    update_promise: Promise<any> = Promise.resolve()

    constructor(private app: TheoryCrafter) {
        super();

        this.filter_control = new FilterControl(MethodPackManager.instance(), m => app.editMethod(m)).addTo(this)

        new GameMapControl({
                type: "floating", position: "top-right"
            }, new ControlWithHeader("Show routes")
                .setContent(
                    new DisplayedRouteFilterEdit()
                        .setValue({type: "none"})
                        .onCommit(filter => {

                        })
                ).css("width", "200px")
        ).addTo(this)

        this.marker_index = clue_data.spot_index.with(() => ({markers: [], route_display: null}))

        this.on("add", () => {
            this.filter_control.filtered_index_updated.on(() => this.updateVisibleMarkersByFilter())
            this.updateVisibleMarkersByFilter()
        })
    }

    private async updateVisibleMarkersByFilter() {
        await this.update_promise

        this.update_promise = Promise.all(this.marker_index.flat().map(async c => {
                let visible = this.filter_control.index.get(ClueSpot.toId(c.for)).visible

                if (!visible && c.markers.length > 0) {
                    c.markers.forEach(c => c.remove())
                    c.markers = []
                } else if (visible && c.markers.length == 0) {
                    c.markers = ClueOverviewMarker.forClue(c.for, MethodPackManager.instance(), m => this.app.editMethod(m))
                    c.markers.forEach(m => m.addTo(this))
                }
            })
        )
    }
}
