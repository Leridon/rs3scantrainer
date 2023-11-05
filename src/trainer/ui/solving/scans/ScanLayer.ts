import * as leaflet from "leaflet";
import {TileCoordinates} from "../../../../lib/runescape/coordinates/TileCoordinates";
import {blue_icon} from "../../../../lib/gamemap/GameMap";
import {ScanTree} from "../../../../lib/cluetheory/scans/ScanTree";
import {Constants} from "../../../constants";
import ScanRegion = ScanTree.ScanRegion;
import {TileMarker} from "../../../../lib/gamemap/TileMarker";
import {ActiveOpacityGroup, OpacityGroup} from "../../../../lib/gamemap/layers/OpacityLayer";
import {boxPolygon} from "../../polygon_helpers";
import {Scans} from "../../../../lib/runescape/clues/scans";
import GameLayer from "../../../../lib/gamemap/GameLayer";
import {Observable, observe, observe_combined} from "../../../../lib/properties/Observable";
import complementSpot = Scans.complementSpot;
import {GameMapContextMenuEvent, GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";

export class ScanRegionPolygon extends ActiveOpacityGroup {
    polygon: leaflet.Polygon
    label: leaflet.Tooltip

    constructor(private _spot: ScanRegion) {
        super(1, 0.2)

        this.update()
    }

    spot() {
        return this._spot
    }

    setRegion(spot: ScanRegion) {
        this._spot = spot
        this.update()
    }

    update() {
        if (this.polygon) {
            this.polygon.remove()
            this.polygon = null

            this.label.remove()
            this.label = null
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

        this.setActive(this.isActive())
    }
}

export class ScanRadiusMarker extends OpacityGroup {
    constructor(public spot: TileCoordinates,
                private range: number,
                include_marker: boolean,
                is_complement: boolean) {
        super();

        if (include_marker) new TileMarker(this.spot).withX("white").withMarker(blue_icon).addTo(this)

        if (is_complement) {
            boxPolygon({
                topleft: {x: this.spot.x - (this.range + 15), y: this.spot.y + (this.range + 15)},
                botright: {x: this.spot.x + (this.range + 15), y: this.spot.y - (this.range + 15)}
            }).setStyle({
                interactive: false
            }).setStyle({color: "blue", fillOpacity: 0}).addTo(this)
        } else {
            boxPolygon({
                topleft: {x: this.spot.x - this.range, y: this.spot.y + this.range},
                botright: {x: this.spot.x + this.range, y: this.spot.y - this.range}
            }).setStyle({
                interactive: false
            }).setStyle({color: "green", fillOpacity: 0}).addTo(this)
            boxPolygon({
                topleft: {x: this.spot.x - 2 * this.range, y: this.spot.y + 2 * this.range},
                botright: {x: this.spot.x + 2 * this.range, y: this.spot.y - 2 * this.range}
            }).setStyle({
                interactive: false
            }).setStyle({color: "yellow", fillOpacity: 0, dashArray: [5, 5]}).addTo(this)
        }
    }
}

class ScanDigSpotMarker extends ActiveOpacityGroup {
    index: Observable<number | null> = observe(null)

    private main: TileMarker
    private complement: TileMarker

    constructor(public readonly spot: TileCoordinates) {
        super(1, 0.2);

        this.main = new TileMarker(spot).withMarker().withX("#B21319").addTo(this)
        this.complement = new TileMarker(complementSpot(spot)).withMarker().withX("#B21319").addTo(this)

        this.index.subscribe(i => {
            if (i == null) {
                this.main.removeLabel()
                this.complement.removeLabel()
            } else {
                this.main.withLabel(i.toString(), "spot-number-on-map", [0, 10])
                this.complement.withLabel(i.toString(), "spot-number-on-map", [0, 10])
            }
        })
    }
}


export class ScanLayer extends GameLayer {
    protected digSpotMarkers: ScanDigSpotMarker[] = []

    private custom_marker: ScanRadiusMarker = null

    marker_spot: Observable<{ coordinates: TileCoordinates, with_marker: boolean, click_to_remove: boolean } | null> = observe(null)
    scan_range: Observable<number> = observe(20)

    spots: Observable<TileCoordinates[]> = observe([])
    spot_order: Observable<TileCoordinates[]> = observe([])
    active_spots: Observable<TileCoordinates[]> = observe([])

    constructor(options: {
                    show_edit_button?: boolean
                } = {}
    ) {
        super()

        observe_combined({range: this.scan_range, spot: this.marker_spot}).subscribe(({range, spot}) => {
            if (this.custom_marker) {
                this.custom_marker.remove()
                this.custom_marker = null
            }

            if (spot) {
                let is_complement = Math.floor(spot.coordinates.y / 6400) != Math.floor(this.spots.get()[0].y / 6400)

                this.custom_marker = new ScanRadiusMarker(spot.coordinates, range, spot.with_marker, is_complement).addTo(this)

                if (spot.click_to_remove) {
                    this.custom_marker.on("click", (e) => {
                        leaflet.DomEvent.stopPropagation(e)
                        this.marker_spot.set(null)
                    })
                }
            }
        })

        // Set spots => Full update
        this.spots.subscribe((spots) => {
            this.digSpotMarkers.forEach(m => m.remove())

            this.digSpotMarkers = spots.map(s => {
                let marker = new ScanDigSpotMarker(s)
                    .setActive(this.active_spots.get().some(a => TileCoordinates.eq(a, s)))
                    .addTo(this)

                let i = this.spot_order.get().findIndex((a) => TileCoordinates.eq(a, s))

                if (i >= 0) marker.index.set(i + 1)

                return marker
            })
        })

        // Set Visible Spots => Set Opacity
        this.active_spots.subscribe((spots) => {
            this.digSpotMarkers.forEach(m => m.setActive(spots.some(a => TileCoordinates.eq(m.spot, a))))
        })

        // Set order => Update labels
        this.spot_order.subscribe((order) => {
            this.digSpotMarkers.forEach(m => {
                let i = order.findIndex(a => TileCoordinates.eq(m.spot, a))

                m.index.set(i < 0 ? null : i + 1)
            })
        })

        /*

        if (!window.alt1) {  // Only if not Alt1, because is lags heavily inside
            if (options.show_edit_button && !app.in_alt1)
                this.addControl(new ImageButton("assets/icons/edit.png", {
                    "click": (e) => {
                        this.app.behaviour.set(new ScanEditor(this.app, {clue: this.clue, map: this.app.map.map, initial: this.getTree()}))

                        // TODO: Switch to ScanEditor Behaviour


                        //this.map.setActiveLayer(new ScanEditLayer(this.clue, this.app, indirect(this.getTree())))
                    }
                }, {
                    title: "Edit scan route (Advanced)"
                }).setPosition("topright"))
        }*/
    }

    eventContextMenu(event: GameMapContextMenuEvent) {
        event.onPre(() => {
            if (this.marker_spot.get()?.click_to_remove && TileCoordinates.eq2(event.tile(), this.marker_spot.get()?.coordinates)) {
                event.add({type: "basic", text: "Remove Marker", handler: () => this.marker_spot.set(null)})
            } else event.add({
                type: "basic", text: "Set Marker", handler: () => {
                    this.marker_spot.set({coordinates: event.tile(), click_to_remove: true, with_marker: true})
                }
            })
        })
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPost(() => {
            if (this.marker_spot.get()?.click_to_remove && TileCoordinates.eq2(event.tile(), this.marker_spot.get()?.coordinates)) {
                this.marker_spot.set(null)
            } else {
                this.marker_spot.set({coordinates: event.tile(), click_to_remove: true, with_marker: true})
            }

            event.stopAllPropagation()
        })
    }
}