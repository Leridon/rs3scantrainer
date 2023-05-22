import * as leaflet from "leaflet";
import {ScanSpot} from "../../../model/methods";
import {Box, boxPolygon, eq, MapCoordinate, tilePolygon} from "../../../model/coordinates";
import {ScanStep, SetSolution} from "../../../model/clues";
import {ImageButton} from "../CustomControl";
import {GameMapControl, TileMarker} from "../map";
import {get_pulse, PulseType, ScanEquivalenceClasses} from "../../../model/scans/scans";
import {ActiveLayer, TileMarkerWithActive} from "../activeLayer";
import {Application} from "../../../application";
import {createRoot} from "react-dom/client";
import {AreaWidget} from "../../widgets/AreaWidget";

class SpotPolygon extends leaflet.FeatureGroup {
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
        this.polygon = this._spot.area ? boxPolygon(this._spot.area) : tilePolygon(this._spot.tile)

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
                color: "#00FF21",
                fillColor: "#00FF21",
                interactive: false,
            })
            .bindTooltip(this.label)
            .addTo(this)

        this.updateOpacity()
    }

    updateOpacity() {
        let opacity = this.active ? 1 : 0.2

        this.polygon.setStyle(
            Object.assign(this.polygon.options, {
                opacity: opacity,
                fillOpacity: opacity * 0.2,
            }))

        this.label.setOpacity(opacity)
    }

    setActive(active: boolean) {
        this.active = active

        this.updateOpacity()
    }
}

export class ScanLayer extends ActiveLayer {
    protected markers: TileMarkerWithActive[]
    protected areas: SpotPolygon[] = []
    protected range: number

    radius_polygon: leaflet.Polygon[]

    private ms: MapCoordinate[] = []

    constructor(protected clue: ScanStep, protected app: Application,
                options: {
                    show_edit_button?: boolean,
                    show_equivalence_classes_button?: boolean
                } = {}
    ) {
        super()

        this.range = clue.range + 5 // Always assume meerkats

        this.markers = (clue.solution as SetSolution).candidates.map((e) => {
            return new TileMarkerWithActive(e).withMarker().withX("#B21319")
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
                this.addControl(new ImageButton("assets/icons/lock.png", {
                    "click": (e) => {
                        let l = new ScanEditLayer(this.clue, this.app)

                        l.setAreas(this.areas.map((s) => s.spot()))

                        this.map.setActiveLayer(l)
                    }
                }, {
                    title: "Edit scan route (Advanced)"
                }).setPosition("topright"))
        }
    }

    dragstart: MapCoordinate = null
    drag_polygon: leaflet.Polygon = null

    activate(map: GameMapControl) {
        super.activate(map);

        /*this.map.map.dragging.disable()

        let self = this

 */
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

    private invalidateEquivalenceClasses() {
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
        {
            let startTime = performance.now()

            this.equivalence_classes = new ScanEquivalenceClasses(this.remaining_candidates, this.clue.range + 5)

            console.log(this.equivalence_classes.getClasses().map((c) => c.information_gain))

            let endTime = performance.now()
            console.log(`Created ${this.equivalence_classes.equivalence_classes.length} classes in ${endTime - startTime} milliseconds`)
        }

        {
            let startTime = performance.now()

            this.equivalence_classes.getClasses().forEach((c) => {
                c.getPolygon().addTo(this)
            })

            let endTime = performance.now()

            console.log(`Created ${this.equivalence_classes.equivalence_classes.length} polygons in ${endTime - startTime} milliseconds`)
        }
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


class AreaWidget {
    container: JQuery
    status_row: JQuery
    edit_area: JQuery

    constructor(
        private parent: ScanEditLayer,
        private area: ScanSpot) {

        this.container = $("<div>")

        this.status_row = $("<div class='flex-row'>").text("Im an area").appendTo(this.container)

        $("<div>Edit</div>").on("click", () => {
            this.edit_area.animate({"height": 'toggle'})
        }).appendTo(this.status_row)

        this.edit_area = $("<div>Here be edits </div>")
            .hide()
            .appendTo(this.container)
    }
}

export class ScanEditLayer extends ScanLayer {
    private panel_content = $(".cluemethodcontent[data-methodsection=scanedit]")

    drawing: leaflet.LeafletEventHandlerFnMap = {
        "mousedown": (e) => {
            this.map.map.dragging.disable()

            this.dragstart = this.map.tileFromMouseEvent(e)

            this.drag_polygon = tilePolygon(this.dragstart)
                .setStyle({
                    color: "#00FF21",
                    fillColor: "#00FF21",
                    interactive: false,
                })
                .addTo(this)
        },
        "mousemove": (e) => {
            if (self.dragstart) {
                let now = map.tileFromMouseEvent(e)

                let area: Box =
                    {
                        topleft: {
                            x: Math.min(self.dragstart.x, now.x),
                            y: Math.max(self.dragstart.y, now.y),
                        },
                        botright: {
                            x: Math.max(self.dragstart.x, now.x),
                            y: Math.min(self.dragstart.y, now.y),
                        }
                    }


                self.drag_polygon.remove()
                self.drag_polygon = boxPolygon(area)
                    .setStyle({
                        color: "#00FF21",
                        fillColor: "#00FF21",
                        interactive: false,
                    }).addTo(self)
                self.drag_polygon.addTo(self)
            }
        },

        "mouseup": () => {
            self.dragstart = null
            self.drag_polygon = null

            map.map.dragging.enable()
        }
    }

    constructor(clue: ScanStep, app: Application) {
        super(clue, app, {
            show_edit_button: false,
            show_equivalence_classes_button: true
        })
    }

    private updateMethodPanel() {
        this.panel_content.empty()

        for (let a of this.areas) {
            /*let row_div = $("<div style='display: flex' class='flex-row'>")

            $("<div class=\"nissmallimagebutton menubarbutton\">\n" +
                "                        <img src=\"assets/icons/settings.png\" class=\"inline-img\">\n" +
                "                    </div>").appendTo(row_div)
            $("<div class='area-div'>").text(a.spot().name).appendTo(row_div)
            $("<div class='icon-button' style='border: 1px solid red; width: 20px'>1</div>").appendTo(row_div)
            $("<div class='icon-button' style='border: 1px solid red; width: 20px'>2</div>").appendTo(row_div)
            $("<div class='icon-button' style='border: 1px solid red; width: 20px'>3</div>").appendTo(row_div)
            $("<div class='icon-button' style='border: 1px solid red; width: 20px'>DL</div>").appendTo(row_div)
            $("<div class='icon-button' style='border: 1px solid red; width: 20px'>TF</div>").appendTo(row_div)*/

            new AreaWidget(this, a.spot()).container.appendTo(this.panel_content)

            // row_div.appendTo(this.panel_content)

        }
    }

    setAreas(spots: ScanSpot[]) {
        super.setAreas(spots)

        this.updateMethodPanel()
    }

    activate(map: GameMapControl) {
        super.activate(map)

        this.app.sidepanels.methods_panel.showSection("scanedit")
    }

    deactivate() {
        super.deactivate()
    }
}