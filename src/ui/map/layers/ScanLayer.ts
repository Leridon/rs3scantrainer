import * as leaflet from "leaflet";
import {boxPolygon, eq, MapCoordinate} from "../../../model/coordinates";
import {ScanStep, SetSolution} from "../../../model/clues";
import {ImageButton} from "../CustomControl";
import {blue_icon, GameMapControl, green_icon, red_icon, TileMarker, yellow_icon} from "../map";
import {complementSpot} from "../../../model/scans/scans";
import {ActiveLayer, LayerInteraction, TileMarkerWithActive} from "../activeLayer";
import {Application} from "../../../application";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import ScanEditPanel from "../../scanedit/ScanEditPanel";
import {ScanTree2} from "../../../model/scans/ScanTree2";
import {cloneDeep} from "lodash";
import {Constants} from "../../../constants";
import {indirect, resolve} from "../../../model/methods";
import ScanSpot = ScanTree2.ScanSpot;
import tree = ScanTree2.tree;
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

    constructor(spot: MapCoordinate, private range: number, private complement: boolean) {
        super(spot);

        this.update()
    }

    update() {
        if (this.range_polygon) this.range_polygon.remove()

        this.range_polygon = leaflet.featureGroup().addTo(this)

        let center = this.getSpot()

        if (this.complement) {
            boxPolygon({
                topleft: {x: center.x - (this.range + 15), y: center.y + (this.range + 15)},
                botright: {x: center.x + (this.range + 15), y: center.y - (this.range + 15)}
            }).setStyle({color: "blue", fillOpacity: 0}).addTo(this.range_polygon)
        } else {
            boxPolygon({
                topleft: {x: center.x - this.range, y: center.y + this.range},
                botright: {x: center.x + this.range, y: center.y - this.range}
            }).setStyle({color: "green", fillOpacity: 0}).addTo(this.range_polygon)
            boxPolygon({
                topleft: {x: center.x - 2 * this.range, y: center.y + 2 * this.range},
                botright: {x: center.x + 2 * this.range, y: center.y - 2 * this.range}
            }).setStyle({color: "yellow", fillOpacity: 0, dashArray: [5, 5]}).addTo(this.range_polygon)
        }

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
    private marker_layer: leaflet.FeatureGroup
    private complement_layer: leaflet.FeatureGroup

    protected markers: TileMarkerWithActive[]
    protected complement_markers: TileMarkerWithActive[]

    public events = new TypedEmitter<{
        "dig_spot_clicked": TileMarkerWithActive
    }>

    tile_marker: ScanRadiusTileMarker = null
    complement_tile_marker: ScanRadiusTileMarker = null

    constructor(public clue: ScanStep, public app: Application,
                options: {
                    show_edit_button?: boolean
                } = {}
    ) {
        super()

        this.marker_layer = leaflet.featureGroup().addTo(this)
        this.complement_layer = leaflet.featureGroup().addTo(this)

        this.markers = (clue.solution as SetSolution).candidates.map((e) => {
            let m = new TileMarkerWithActive(e).withMarker().withX("#B21319").addTo(this.marker_layer)

            m.on("click", (e) => this.events.emit("dig_spot_clicked", m))

            return m
        })

        this.complement_markers = (clue.solution as SetSolution).candidates.map((e) => {
            return new TileMarkerWithActive(complementSpot(e)).withMarker().withX("#B21319").addTo(this.complement_layer)
        })

        if (!window.alt1) {  // Only if not Alt1, because is laggs heavily inside
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
        if (this.complement_tile_marker) this.complement_tile_marker.setRange(this.clue.range + (value ? 5 : 0))
    }

    override loadDefaultInteraction() {
        let self = this

        new ClickMapInteraction(this, {
            "click": (p) => {
                if (self.tile_marker && eq(p, self.tile_marker.getSpot())
                    || self.complement_tile_marker && eq(p, self.complement_tile_marker.getSpot())) self.removeMarker()
                else self.setMarker(p)
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

        this.complement_markers.forEach((m) => {
            let i = ordering.findIndex((s) => eq(m.getSpot(), complementSpot(s)))

            if (i >= 0) m.withLabel((i + 1).toString(), "spot-number-on-map", [0, 10])
            else m.removeLabel()
        })
    }

    activate(map: GameMapControl) {
        super.activate(map);

        map.map.fitBounds(this.marker_layer.getBounds().pad(0.1), {maxZoom: 4})

        map.setFloor(Math.min(...this.clue.solution.candidates.map((c) => c.level)))
    }

    highlightedCandidates(): MapCoordinate[] {
        return this.markers.filter((m) => m.isActive()).map((m) => m.getSpot())
    }

    highlightCandidates(spots: MapCoordinate[]) {
        this.markers.forEach((m) => m.setActive(spots.some((c) => eq(c, m.getSpot()))))
        this.complement_markers.forEach((m) => m.setActive(spots.some((c) => eq(complementSpot(c), m.getSpot()))))
    }

    removeMarker() {
        if (this.tile_marker) {
            this.tile_marker.remove()
            this.tile_marker = null
        }

        if (this.complement_tile_marker) {
            this.complement_tile_marker.remove()
            this.complement_tile_marker = null
        }
    }

    setMarker(spot: MapCoordinate) {
        this.removeMarker()

        let complement = Math.floor(spot.y / 6400) != Math.floor(this.clue.solution.candidates[0].y / 6400)

        this.tile_marker = new ScanRadiusTileMarker(spot, this.clue.range + (this._meerkats ? 5 : 0), complement)
            .withX("white")
            .withMarker(blue_icon)
            .on("click", () => this.tile_marker.remove())
            .addTo(this)

        this.complement_tile_marker = new ScanRadiusTileMarker(complementSpot(spot), this.clue.range + (this._meerkats ? 5 : 0), complement)
            .withX("white")
            .withMarker(blue_icon)
            .on("click", () => this.tile_marker.remove())
            .addTo(this)
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

    constructor(clue: ScanStep, app: Application, private tree: indirect_scan_tree | null) {
        super(clue, app, {
            show_edit_button: false
        })

        if (tree == null) {
            this.tree = {
                areas: [],
                assumes_meerkats: true,
                clue: clue.id,
                methods: [],
                root: null,
                spot_ordering: clue.solution.candidates,
                type: "scantree"
            }
        }

        this.setMeerkats(this.tree.assumes_meerkats)
    }

    activate(map: GameMapControl) {
        super.activate(map)

        this.edit_panel = new ScanEditPanel(this, this.clue, resolve<ScanStep, tree>(cloneDeep(this.tree)))

        this.app.sidepanels.methods_panel.showSection("scanedit")
    }

    deactivate() {
        super.deactivate()

        this.edit_panel.container.empty()
        this.edit_panel = null
    }
}