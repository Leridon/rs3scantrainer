import * as leaflet from "leaflet";
import {TileCoordinates} from "../../../lib/runescape/coordinates/TileCoordinates";
import {blue_icon} from "../../../lib/gamemap/GameMap";
import {ScanTree} from "../../../lib/cluetheory/scans/ScanTree";
import {Constants} from "../../constants";
import ScanRegion = ScanTree.ScanRegion;
import {TileMarker} from "../../../lib/gamemap/TileMarker";
import {ActiveOpacityGroup, OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import {areaPolygon, boxPolygon} from "../polygon_helpers";
import {Scans} from "../../../lib/runescape/clues/scans";
import {GameLayer} from "../../../lib/gamemap/GameLayer";
import complementSpot = Scans.complementSpot;
import {GameMapContextMenuEvent, GameMapMouseEvent} from "../../../lib/gamemap/MapEvents";
import {Observable, observe} from "../../../lib/reactive";
import observe_combined = Observable.observe_combined;
import {util} from "../../../lib/util/util";
import todo = util.todo;

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

        if (this._spot?.area) {

            this.polygon = areaPolygon(this._spot.area)

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
        }

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
            }).setStyle({color: "#e51c02", fillOpacity: 0, dashArray: [9, 6, 9, 6, 9, 18]}).addTo(this)
            boxPolygon({
                topleft: {x: this.spot.x - 2 * this.range, y: this.spot.y + 2 * this.range},
                botright: {x: this.spot.x + 2 * this.range, y: this.spot.y - 2 * this.range}
            }).setStyle({
                interactive: false
            }).setStyle({color: "#fff40b", fillOpacity: 0, dashArray: [9, 9, 9, 18]}).addTo(this)
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

export class AdaptiveScanRadiusMarker extends GameLayer {
    private custom_marker: ScanRadiusMarker

    marker_spot: Observable<{
        coordinates: TileCoordinates,
        with_marker: boolean,
    } | null> = observe(null)

    scan_range = observe(10)

    surface_is_complement = observe(false)


    private fixedMarker: Observable<TileCoordinates> = observe(null)
    private manualMarker: Observable<TileCoordinates> = observe(null)
    private cursorMarker: Observable<TileCoordinates> = observe(null)

    public canBeManuallySet: Observable<boolean> = observe(false)
    public followCursor: Observable<boolean> = observe(false)


    constructor() {
        super();

        this.canBeManuallySet.subscribe(() => {
            this.manualMarker.set(null)
        })

        observe_combined({
            fixed: this.fixedMarker,
            manual: this.manualMarker,
            cursor: this.cursorMarker,
            manualEnabled: this.canBeManuallySet,
            followEnabled: this.followCursor
        }).subscribe(({fixed, manual, cursor, manualEnabled, followEnabled}) => {
            if (followEnabled && cursor) {
                this.marker_spot.set({coordinates: cursor, with_marker: false})
            } else if (manualEnabled && manual) {
                this.marker_spot.set({coordinates: manual, with_marker: true})
            } else if (fixed) {
                this.marker_spot.set({coordinates: fixed, with_marker: false})
            } else {
                this.marker_spot.set(null)
            }
        })

        observe_combined({range: this.scan_range, spot: this.marker_spot}).subscribe(({range, spot}) => {
            if (this.custom_marker) {
                this.custom_marker.remove()
                this.custom_marker = null
            }

            if (spot) {
                let is_complement = (spot.coordinates.y < 6400) == this.surface_is_complement.value()

                this.custom_marker = new ScanRadiusMarker(spot.coordinates, range, spot.with_marker, is_complement).addTo(this)

                if (spot.with_marker) {
                    this.custom_marker.on("click", (e) => {
                        leaflet.DomEvent.stopPropagation(e)
                        this.manualMarker.set(null)
                    })
                }
            }
        })
    }

    setComplementByExampleSpot(spot: TileCoordinates): this {
        this.surface_is_complement.set(spot.y >= 6400)

        return this
    }

    setFixedSpot(spot: TileCoordinates): this {
        this.fixedMarker.set(spot)
        return this
    }

    setFollowCursor(v: boolean): this {
        this.followCursor.set(v)
        return this
    }

    setClickable(v: boolean): this {
        this.canBeManuallySet.set(v)
        return this
    }

    setRadius(radius: number): this {
        this.scan_range.set(radius)
        return this
    }


    eventClick(event: GameMapMouseEvent) {
        event.onPost(() => {

            if (this.canBeManuallySet.value()) {
                event.stopAllPropagation()

                if (TileCoordinates.eq2(event.tile(), this.manualMarker.value())) {
                    this.manualMarker.set(null)
                } else {
                    this.manualMarker.set(event.tile())
                }
            }
        })
    }

    eventHover(event: GameMapMouseEvent) {
        event.onPost(() => {
            if (this.followCursor.value()) {
                this.cursorMarker.set(event.tile())
            }
        })
    }
}