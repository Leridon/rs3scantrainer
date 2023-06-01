import * as leaflet from "leaflet";
import {Box, boxPolygon, eq, MapCoordinate} from "../../../model/coordinates";
import {ScanStep, SetSolution} from "../../../model/clues";
import {ImageButton} from "../CustomControl";
import {GameMapControl, TileMarker} from "../map";
import {get_pulse, PulseType, ScanEquivalenceClasses} from "../../../model/scans/scans";
import {ActiveLayer, TileMarkerWithActive} from "../activeLayer";
import {Application} from "../../../application";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import ScanEditPanel from "../../scanedit/ScanEditPanel";
import {ScanTree2} from "../../../model/scans/ScanTree2";
import {cloneDeep} from "lodash";
import {Constants} from "../../../constants";
import ScanSpot = ScanTree2.ScanSpot;
import tree = ScanTree2.tree;
import {indirect, resolve} from "../../../model/methods";
import ScanDecision = ScanTree2.ScanDecision;
import resolved_scan_tree = ScanTree2.resolved_scan_tree;
import narrow_down = ScanTree2.narrow_down;

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
export class ScanLayer extends ActiveLayer {
    protected markers: TileMarkerWithActive[]
    protected areas: SpotPolygon[] = []

    public events = new TypedEmitter<{
        "dig_spot_clicked": TileMarkerWithActive
    }>

    radius_polygon: leaflet.Polygon[]

    private ms: MapCoordinate[] = []

    constructor(protected clue: ScanStep, protected app: Application,
                options: {
                    show_edit_button?: boolean,
                    show_equivalence_classes_button?: boolean
                } = {}
    ) {
        super()

        this.markers = (clue.solution as SetSolution).candidates.map((e) => {
            let m = new TileMarkerWithActive(e).withMarker().withX("#B21319")

            m.on("click", (e) => {
                this.events.emit("dig_spot_clicked", m)
            })

            return m
        })

        /*
        // DO NOT REMOVE. Development code to easily assign numbers to scans
        this.markers.forEach((m) => {
            m.on("click", (e) => {
                this.ms.push(e.target.getSpot())
                e.target.withLabel(this.ms.length.toString(), "spot-number", [0, 0])

                console.log(JSON.stringify(this.ms))
            })
        })*/

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
                    "click": (e) => this.map.setActiveLayer(new ScanEditLayer(this.clue, this.app, this.getTree()))
                }, {
                    title: "Edit scan route (Advanced)"
                }).setPosition("topright"))
        }
    }

    getRange(): number {
        return this.clue.range + 5
    }

    getTree(): resolved_scan_tree {
        return null
    }

    setSpotOrder(ordering: MapCoordinate[]) {
        this.markers.forEach((m) => {
            let i = ordering.findIndex((s) => eq(m.getSpot(), s))

            if (i >= 0) m.withLabel((i + 1).toString(), "spot-number", [0, 10])
            else m.removeLabel()
        })
    }

    activate(map: GameMapControl) {
        super.activate(map);
    }

    remaining_candidates: MapCoordinate[] = this.clue.solution.candidates

    rule_out(spots: MapCoordinate[]) {
        this.set_remaining_candidates(this.remaining_candidates.filter((c) => !spots.some((b) => eq(c, b))))
    }

    rule_out_but(spots: MapCoordinate[]) {
        this.set_remaining_candidates(this.remaining_candidates.filter((c) => spots.some((b) => eq(c, b))))
    }

    set_remaining_candidates(spots: MapCoordinate[]) {
        this.remaining_candidates = spots
        this.invalidateEquivalenceClasses()
    }

    pulse(spot: MapCoordinate, pulse: PulseType) {
        this.set_remaining_candidates(
            this.remaining_candidates.filter((s) => get_pulse(spot, s, this.clue.range + 5) == pulse)
        )
    }

    pulse_area(area: Box, pulse: 1 | 2 | 3) {

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

    setAreas(spots: ScanSpot[]) {
        this.areas.forEach((a) => a.remove())

        this.areas = spots.map((s) => new SpotPolygon(s))

        this.areas.forEach((a) => a.addTo(this))
    }

    getArea(name: string): SpotPolygon {
        return this.areas.find((a) => a.spot().name == name)
    }

    getMarker(i: number): TileMarkerWithActive {
        return this.markers[i - 1]
    }

    on_marker_set(marker: TileMarker | null) {
        if (this.radius_polygon) {
            this.radius_polygon.forEach((l) => l.remove())

            this.radius_polygon = []
        }

        if (!marker) return

        let center = marker.getSpot()

        let radius = this.clue.range + 5 // Always assume meerkats

        let inner: Box = {
            topleft: {x: center.x - radius, y: center.y + radius},
            botright: {x: center.x + radius, y: center.y - radius}
        }

        let outer: Box = {
            topleft: {x: center.x - 2 * radius, y: center.y + 2 * radius},
            botright: {x: center.x + 2 * radius, y: center.y - 2 * radius}
        }

        this.radius_polygon = [
            boxPolygon(inner).setStyle({color: "green", fillOpacity: 0}),
            boxPolygon(outer).setStyle({color: "yellow", fillOpacity: 0, dashArray: [5, 5]})
        ]

        this.radius_polygon.forEach((p) => p.addTo(this))
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

    constructor(clue: ScanStep, app: Application, tree: resolved_scan_tree) {
        super(clue, app, {
            show_edit_button: false,
            show_equivalence_classes_button: true
        })

        this.edit_panel = new ScanEditPanel(this, this.clue, resolve<ScanStep, tree>(cloneDeep(indirect(tree))))
    }

    getClue(): ScanStep {
        return this.clue
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

    updateCandidates(decisions: ScanDecision[]) {
        let remaining_candidates: MapCoordinate[] = decisions.reduce((candidates, decision) => {
            console.log(candidates)
            return narrow_down(candidates, decision, this.getRange())
        }, this.clue.solution.candidates)

        this.highlightCandidates(remaining_candidates)

        this.set_remaining_candidates(remaining_candidates)
    }
}