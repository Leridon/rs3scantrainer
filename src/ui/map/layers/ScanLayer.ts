import * as leaflet from "leaflet";
import {Box, boxPolygon, eq, MapCoordinate} from "../../../model/coordinates";
import {ScanStep, SetSolution} from "../../../model/clues";
import {ImageButton} from "../CustomControl";
import {blue_icon, GameMapControl, TileMarker} from "../map";
import {ScanEquivalenceClasses} from "../../../model/scans/scans";
import {ActiveLayer, LayerInteraction, TileMarkerWithActive} from "../activeLayer";
import {Application} from "../../../application";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import ScanEditPanel from "../../scanedit/ScanEditPanel";
import {ScanTree2} from "../../../model/scans/ScanTree2";
import {cloneDeep} from "lodash";
import {Constants} from "../../../constants";
import ScanSpot = ScanTree2.ScanSpot;
import tree = ScanTree2.tree;
import {indirect, resolve} from "../../../model/methods";
import resolved_scan_tree = ScanTree2.resolved_scan_tree;
import indirect_scan_tree = ScanTree2.indirect_scan_tree;


export class SpotPolygon extends leaflet.FeatureGroup {
    polygon: leaflet.Polygon
    label: leaflet.Tooltip
    active: boolean

    constructor(private _spot: ScanSpot) {
        super()

        this.active = true

        this.update()
    }

    spot() {
        return this._spot
    }

    setSpot(spot: ScanSpot) {
        this._spot = spot
        this.update()
    }

    update() {
        if (this.polygon) {
            this.polygon.remove()
            this.polygon = null
        }

        if (!this._spot.is_virtual) {

            this.polygon = boxPolygon(this._spot.area)

            this.label = leaflet.tooltip({
                interactive: false,
                permanent: true,
                className: "area-name",
                offset: [0, 0],
                direction: "center",
                content: this._spot.name
            })

            this.polygon
                .setStyle({
                    color: Constants.colors.scan_area,
                    fillColor: Constants.colors.scan_area,
                    interactive: false,
                })
                .bindTooltip(this.label)
                .addTo(this)

            this.updateOpacity()
        }
    }

    updateOpacity() {
        if (this.polygon) {
            let opacity = this.active ? 1 : 0.2

            this.polygon.setStyle(
                Object.assign(this.polygon.options, {
                    opacity: opacity,
                    fillOpacity: opacity * 0.2,
                }))

            this.label.setOpacity(opacity)
        }
    }

    setActive(active: boolean) {
        this.active = active

        this.updateOpacity()
    }
}

class ScanRadiusTileMarker extends TileMarker {
    range_polygon: leaflet.FeatureGroup

    constructor(spot: MapCoordinate, private range: number) {
        super(spot);

        this.update()
    }

    update() {
        if (this.range_polygon) this.range_polygon.remove()

        this.range_polygon = leaflet.featureGroup().addTo(this)

        let center = this.getSpot()

        let inner: Box = {
            topleft: {x: center.x - this.range, y: center.y + this.range},
            botright: {x: center.x + this.range, y: center.y - this.range}
        }

        let outer: Box = {
            topleft: {x: center.x - 2 * this.range, y: center.y + 2 * this.range},
            botright: {x: center.x + 2 * this.range, y: center.y - 2 * this.range}
        }

        boxPolygon(inner).setStyle({color: "green", fillOpacity: 0}).addTo(this.range_polygon)
        boxPolygon(outer).setStyle({color: "yellow", fillOpacity: 0, dashArray: [5, 5]}).addTo(this.range_polygon)
    }

    setRange(range: number) {
        this.range = range
        this.update()
    }
}

class ClickMapInteraction extends LayerInteraction<ScanLayer> {

    constructor(layer: ScanLayer, private handlers: {
        "click": (p: MapCoordinate) => void
    }) {
        super(layer);
    }

    private _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "click": (e) => {
            console.log("Click")
            this.handlers.click({x: Math.round(e.latlng.lng), y: Math.round(e.latlng.lat)})
        }
    }

    cancel() {
        this.layer.getMap().map.off(this._maphooks)
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
    }
}


export class ScanLayer extends ActiveLayer {
    protected markers: TileMarkerWithActive[]

    public events = new TypedEmitter<{
        "dig_spot_clicked": TileMarkerWithActive
    }>

    tile_marker: ScanRadiusTileMarker = null

    constructor(protected clue: ScanStep, protected app: Application,
                options: {
                    show_edit_button?: boolean,
                    show_equivalence_classes_button?: boolean
                } = {}
    ) {
        super()

        this.markers = (clue.solution as SetSolution).candidates.map((e) => {
            let m = new TileMarkerWithActive(e).withMarker().withX("#B21319")

            m.on("click", (e) => this.events.emit("dig_spot_clicked", m))

            return m
        })

        this.markers.forEach((m) => m.addTo(this))

        this.set_remaining_candidates(clue.solution.candidates)

        if (!window.alt1) {  // Only if not Alt1, because is laggs heavily inside

            if (options.show_equivalence_classes_button)
                this.addControl(new ImageButton("assets/icons/eqclasses.png", {
                    "click": (e) => {
                        this.setEquivalenceClassesEnabled(!this.draw_equivalence_classes)
                    }
                }, {
                    title: "Toggle equivalence classes."
                }).setPosition("topright"))

            if (options.show_edit_button && !app.in_alt1)
                this.addControl(new ImageButton("assets/icons/edit.png", {
                    "click": (e) => this.map.setActiveLayer(new ScanEditLayer(this.clue, this.app, indirect(this.getTree())))
                }, {
                    title: "Edit scan route (Advanced)"
                }).setPosition("topright"))
        }
    }

    _meerkats: boolean = true

    setMeerkats(value: boolean) {
        this._meerkats = value
        if (this.tile_marker) this.tile_marker.setRange(this.clue.range + (value ? 5 : 0))
    }

    override loadDefaultInteraction() {
        console.log("Loading default")

        let self = this

        new ClickMapInteraction(this, {
            "click": (p) => {
                if (self.tile_marker) {
                    let old = self.tile_marker.getSpot()

                    self.tile_marker.remove()
                    self.tile_marker = null

                    if (eq(p, old)) return
                }

                self.tile_marker = new ScanRadiusTileMarker(p, self.clue.range + (self._meerkats ? 5 : 0))
                    .withX("white")
                    .withMarker(blue_icon)
                    .on("click", () => self.tile_marker.remove())
                    .addTo(self)
            }
        }).activate()
    }

    getTree(): resolved_scan_tree {
        return null
    }

    setSpotOrder(ordering: MapCoordinate[]) {
        this.markers.forEach((m) => {
            let i = ordering.findIndex((s) => eq(m.getSpot(), s))

            if (i >= 0) m.withLabel((i + 1).toString(), "spot-number-on-map", [0, 10])
            else m.removeLabel()
        })
    }

    activate(map: GameMapControl) {
        super.activate(map);
    }

    remaining_candidates: MapCoordinate[] = this.clue.solution.candidates

    set_remaining_candidates(spots: MapCoordinate[]) {
        this.remaining_candidates = spots
        this.invalidateEquivalenceClasses()
    }

    private draw_equivalence_classes: boolean = false
    private equivalence_classes: ScanEquivalenceClasses = null

    protected invalidateEquivalenceClasses() {
        if (this.equivalence_classes) {
            this.equivalence_classes.getClasses().forEach((c) => {
                let p = c.getPolygon()
                if (p) p.remove()
            })

            this.equivalence_classes = null
        }

        if (this.draw_equivalence_classes) this.createEquivalenceClasses()
    }

    private createEquivalenceClasses() {
        this.equivalence_classes = new ScanEquivalenceClasses(this.remaining_candidates, this.clue.range + 5)

        this.equivalence_classes.getClasses().forEach((c) => {
            c.getPolygon().addTo(this)
        })
    }

    protected setEquivalenceClassesEnabled(enabled: boolean) {
        this.draw_equivalence_classes = enabled

        this.invalidateEquivalenceClasses() // Redraw
    }

    private equivalenceClassesEnabled() {
        return this.draw_equivalence_classes
    }

    getMarker(i: number): TileMarkerWithActive {
        return this.markers[i - 1]
    }
}

type step = {
    type: "ability",
    ability: "surge" | "dive"
    from: MapCoordinate,
    to: MapCoordinate
} | {
    type: "redclick",
    where: MapCoordinate,
} | {
    type: "teleport",
    id: string,
    subid?: string
}

export type path = {
    description: string,
    clip: any
    sections: step[][],
}

export class ScanEditLayer extends ScanLayer {
    private edit_panel: ScanEditPanel

    constructor(clue: ScanStep, app: Application, tree: indirect_scan_tree | null) {
        super(clue, app, {
            show_edit_button: false,
            show_equivalence_classes_button: true
        })

        if (tree == null) {
            tree = {
                areas: [],
                assumes_meerkats: true,
                clue: clue.id,
                methods: [],
                root: null,
                spot_ordering: clue.solution.candidates,
                type: "scantree"
            }
        }

        this.setMeerkats(tree.assumes_meerkats)

        this.edit_panel = new ScanEditPanel(this, this.clue, resolve<ScanStep, tree>(cloneDeep(tree)))
    }

    activate(map: GameMapControl) {
        super.activate(map)

        this.app.sidepanels.methods_panel.showSection("scanedit")
    }

    deactivate() {
        super.deactivate()
    }

    highlightedCandidates(): MapCoordinate[] {
        return this.markers.filter((m) => m.isActive()).map((m) => m.getSpot())
    }

    highlightCandidates(spots: MapCoordinate[]) {
        this.markers.forEach((m) => m.setActive(spots.some((c) => eq(c, m.getSpot()))))
    }
}