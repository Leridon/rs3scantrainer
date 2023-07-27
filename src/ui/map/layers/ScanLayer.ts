import * as leaflet from "leaflet";
import {boxPolygon, MapCoordinate, Vector2} from "../../../model/coordinates";
import {ScanStep, SetSolution} from "../../../model/clues";
import {ImageButton} from "../CustomControl";
import {blue_icon, GameMapControl,} from "../map";
import {complementSpot} from "../../../model/scans/scans";
import {ActiveLayer} from "../activeLayer";
import {Application} from "../../../application";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import ScanEditPanel from "../../scanedit/ScanEditPanel";
import {ScanTree} from "../../../model/scans/ScanTree";
import {cloneDeep} from "lodash";
import {Constants} from "../../../constants";
import {indirect, resolve} from "../../../model/methods";
import ScanSpot = ScanTree.ScanSpot;
import tree = ScanTree.tree;
import resolved_scan_tree = ScanTree.resolved_scan_tree;
import indirect_scan_tree = ScanTree.indirect_scan_tree;
import SimpleClickInteraction from "../interactions/SimpleClickInteraction";
import {TileMarker} from "../TileMarker";


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

    constructor(spot: MapCoordinate, private range: number, private is_complement: boolean) {
        super(spot);

        this.update()
    }

    update() {
        if (this.range_polygon) {
            this.range_polygon.remove()
            this.range_polygon = null
        }

        this.range_polygon = leaflet.featureGroup().addTo(this)

        if (this.is_complement) {
            boxPolygon({
                topleft: {x: this.spot.x - (this.range + 15), y: this.spot.y + (this.range + 15)},
                botright: {x: this.spot.x + (this.range + 15), y: this.spot.y - (this.range + 15)}
            }).setStyle({
                interactive: false
            }).setStyle({color: "blue", fillOpacity: 0}).addTo(this.range_polygon)
        } else {
            boxPolygon({
                topleft: {x: this.spot.x - this.range, y: this.spot.y + this.range},
                botright: {x: this.spot.x + this.range, y: this.spot.y - this.range}
            }).setStyle({
                interactive: false
            }).setStyle({color: "green", fillOpacity: 0}).addTo(this.range_polygon)
            boxPolygon({
                topleft: {x: this.spot.x - 2 * this.range, y: this.spot.y + 2 * this.range},
                botright: {x: this.spot.x + 2 * this.range, y: this.spot.y - 2 * this.range}
            }).setStyle({
                interactive: false
            }).setStyle({color: "yellow", fillOpacity: 0, dashArray: [5, 5]}).addTo(this.range_polygon)
        }
    }

    setRange(range: number) {
        this.range = range
        this.update()
    }
}


export class ScanLayer extends ActiveLayer {
    private marker_layer: leaflet.FeatureGroup
    private complement_layer: leaflet.FeatureGroup

    protected markers: TileMarker[]
    protected complement_markers: TileMarker[]

    public events = new TypedEmitter<{
        "dig_spot_clicked": TileMarker
    }>

    tile_marker: ScanRadiusTileMarker
    complement_tile_marker: ScanRadiusTileMarker

    constructor(public clue: ScanStep, public app: Application,
                options: {
                    show_edit_button?: boolean
                } = {}
    ) {
        super()

        this.tile_marker = null
        this.complement_tile_marker = null

        this.marker_layer = leaflet.featureGroup().addTo(this)
        this.complement_layer = leaflet.featureGroup().addTo(this)

        this.markers = (clue.solution as SetSolution).candidates.map((e) => {
            let m = new TileMarker(e).withMarker().withX("#B21319").addTo(this.marker_layer)

            m.on("click", (e) => this.events.emit("dig_spot_clicked", m))

            return m
        })

        this.complement_markers = (clue.solution as SetSolution).candidates.map((e) => {
            return new TileMarker(complementSpot(e)).withMarker().withX("#B21319").addTo(this.complement_layer)
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

        return new SimpleClickInteraction(this, {
            "click": (p: MapCoordinate) => {
                if ((self.tile_marker && Vector2.eq(p, self.tile_marker.getSpot()))
                    || (self.complement_tile_marker && Vector2.eq(p, self.complement_tile_marker.getSpot()))) {
                    console.log("Removing 1")
                    self.removeMarker()
                } else {
                    self.setMarker(p)
                }
            }
        })
    }

    getTree(): resolved_scan_tree {
        return null
    }

    setSpotOrder(ordering: MapCoordinate[]) {
        this.markers.forEach((m) => {
            let i = ordering.findIndex((s) => Vector2.eq(m.getSpot(), s))

            if (i >= 0) m.withLabel((i + 1).toString(), "spot-number-on-map", [0, 10])
            else m.removeLabel()
        })

        this.complement_markers.forEach((m) => {
            let i = ordering.findIndex((s) => Vector2.eq(m.getSpot(), complementSpot(s)))

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
        this.markers.forEach((m) => m.setActive(spots.some((c) => Vector2.eq(c, m.getSpot()))))
        this.complement_markers.forEach((m) => m.setActive(spots.some((c) => Vector2.eq(complementSpot(c), m.getSpot()))))
    }

    removeMarker() {
        console.log("Removing")

        if (this.tile_marker) {
            this.tile_marker.remove()
            this.tile_marker = null
        }

        if (this.complement_tile_marker) {
            this.complement_tile_marker.remove()
            this.complement_tile_marker = null
        }
    }

    setMarker(spot: MapCoordinate, include_marker: boolean = true, removeable: boolean = true) {
        this.removeMarker()

        console.log("Adding")

        let complement = Math.floor(spot.y / 6400) != Math.floor(this.clue.solution.candidates[0].y / 6400)

        this.tile_marker = new ScanRadiusTileMarker(spot, this.clue.range + (this._meerkats ? 5 : 0), complement)
            .addTo(this)

        this.complement_tile_marker = new ScanRadiusTileMarker(complementSpot(spot), this.clue.range + (this._meerkats ? 5 : 0), complement)
            .addTo(this)

        if (include_marker) {
            this.tile_marker.withX("white").withMarker(blue_icon)
            this.complement_tile_marker.withX("white").withMarker(blue_icon)
        }

        if (removeable) {
            this.tile_marker.on("click", (e) => {
                leaflet.DomEvent.stopPropagation(e)
                this.removeMarker()
            })
            this.complement_tile_marker.on("click", (e) => {
                leaflet.DomEvent.stopPropagation(e)
                this.removeMarker()
            })
        }
    }
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
                root: ScanTree.init_leaf(clue.solution.candidates),
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