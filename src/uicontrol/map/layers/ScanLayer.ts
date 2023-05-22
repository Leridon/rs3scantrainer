import * as leaflet from "leaflet";
import {ScanSpot} from "../../../model/methods";
import {Box, boxPolygon, eq, MapCoordinate, tilePolygon} from "../../../model/coordinates";
import {ScanStep, SetSolution} from "../../../model/clues";
import {ImageButton} from "../CustomControl";
import {GameMapControl, TileMarker} from "../map";
import {ChildType, get_pulse, PulseType, ScanEquivalenceClasses} from "../../../model/scans/scans";
import {ActiveLayer, TileMarkerWithActive} from "../activeLayer";
import {Application} from "../../../application";
import {ToggleGroup} from "./ToggleGroup";
import ToggleButton from "../../widgets/togglebutton";

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
                this.addControl(new ImageButton("assets/icons/edit.png", {
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
    main_row: {
        row: JQuery,
        area_div?: JQuery
        delete_button?: JQuery,
        edit_button?: JQuery,
        info_buttons?: ToggleGroup<ChildType>
    }

    container: JQuery

    edit_area: {
        container: JQuery
    }

    constructor(
        private parent: ScanEditLayer,
        public area: ScanSpot) {

        this.container = $("<div class='panel'>")

        this.main_row = {
            row: $("<div class='area-edit-row' style='display: flex;'>").appendTo(this.container)
        }

        this.main_row.area_div = $("<div class='area-div'></div>").text(this.area.name).appendTo(this.main_row.row)

        this.main_row.delete_button = $('<div class="nissmallimagebutton" title="Edit"><img src="assets/icons/delete.png"></div>')
            .on("click", () => {
                // TODO:
            })
            .appendTo(this.main_row.row)

        this.main_row.edit_button = $('<div class="nissmallimagebutton" title="Edit"><img src="assets/icons/edit.png"></div>')
            .on("click", () => {
                this.edit_area.container.animate({"height": 'toggle'})
            })
            .appendTo(this.main_row.row)

        this.main_row.info_buttons = new ToggleGroup(ChildType.all.map((c) => {
            return $("<div class='lightbutton'>")
                .text(ChildType.meta(c).short)
                .attr("title", ChildType.meta(c).pretty)
                .data("value", c)
                .appendTo(this.main_row.row)
        }))

        this.main_row.info_buttons.on("value_changed", (value) => this.parent.updateCandidates())

        this.edit_area = {
            container: $("<div class='properties'></div>")
                .hide()
                .appendTo(this.container)
        }

        // This section is proof that I need to learn React...
        $("<div class='head'>General</div>").appendTo(this.edit_area.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'>Name</div>"))
            .append($("<div class='col-10'>").append($("<input type='text' class='nisinput' style='width: 100%'>")))
            .appendTo(this.edit_area.container)

        $("<div class='head'>Area</div>").appendTo(this.edit_area.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'></div>"))
            .append($("<div class='col-5 property' style='text-align: center'>x</div>"))
            .append($("<div class='col-5 property' style='text-align: center'>y</div>"))
            .appendTo(this.edit_area.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property' title='Top left' style='text-align: center'>TL</div>"))
            .append($("<div class='col-5'>").append($("<input type='number' class='nisinput' style='width: 100%'>")))
            .append($("<div class='col-5'>").append($("<input type='number' class='nisinput' style='width: 100%'>")))
            .appendTo(this.edit_area.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property' title='Bottom right' style='text-align: center'>BR</div>"))
            .append($("<div class='col-5'>").append($("<input type='number' class='nisinput' style='width: 100%'>")))
            .append($("<div class='col-5'>").append($("<input type='number' class='nisinput' style='width: 100%'>")))
            .appendTo(this.edit_area.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'></div>"))
            .append($("<div class='col-10'>").append($("<div class='lightbutton' style='width: 100%'>Redraw on map</div>")))
            .appendTo(this.edit_area.container)

        $("<div class='head'>Overrides</div>").appendTo(this.edit_area.container)
    }
}

class ScanEditPanel {
    content: JQuery

    scan_spots: {
        heading?: JQuery,
        areas?: {
            container: JQuery
            areas?: AreaWidget[],
        },
        add_button?: JQuery
    } = {}

    constructor(public layer: ScanEditLayer) {
        this.content = $(".cluemethodcontent[data-methodsection=scanedit]").empty()

        //$("<h3>Spots</h3>").appendTo(this.content)

        this.scan_spots.heading = $("<h4>Scan Spots</h4>").appendTo(this.content)

        this.scan_spots.areas = {
            container: $("<div>").appendTo(this.content)
        }

        this.scan_spots.add_button = $("<div class='lightbutton'>+ Add area</div>").appendTo($("<div style='text-align: center'></div>").appendTo(this.content))
    }

    setAreas(areas: ScanSpot[]) {
        this.scan_spots.areas.container.empty()

        this.scan_spots.areas.areas = areas.map((e) => new AreaWidget(this.layer, e))

        for (let e of this.scan_spots.areas.areas) e.container.appendTo(this.scan_spots.areas.container)
    }
}


export class ScanEditLayer extends ScanLayer {
    private edit_panel = new ScanEditPanel(this)

    /*drawing: leaflet.LeafletEventHandlerFnMap = {
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
     }**/

    constructor(clue: ScanStep, app: Application) {
        super(clue, app, {
            show_edit_button: false,
            show_equivalence_classes_button: true
        })
    }

    setAreas(spots: ScanSpot[]) {
        super.setAreas(spots)

        this.edit_panel.setAreas(this.areas.map((e) => e.spot()))
    }

    activate(map: GameMapControl) {
        super.activate(map)

        this.app.sidepanels.methods_panel.showSection("scanedit")
    }

    deactivate() {
        super.deactivate()
    }

    updateCandidates() {
        // TODO
        let candidates: number[] = []

        let areafilters: Set<number>[] = this.edit_panel.scan_spots.areas.areas
            .filter((e) => e.main_row.info_buttons.value() != null) // Get all areas with a set pulse type
            .map((e) => {   // TODO: Determine actual candidates
                switch (e.main_row.info_buttons.value()) {
                    case ChildType.SINGLE:
                        break;
                    case ChildType.DOUBLE:
                        break;
                    case ChildType.TRIPLE:
                        break;
                    case ChildType.DIFFERENTLEVEL:
                        break;
                    case ChildType.TOOFAR:
                        break;
                }

                e.area

                e.main_row.info_buttons.value()
                return new Set()
            })

        let remaining_candidates = candidates.filter((c) => areafilters.every((f) => f.has(c)))

        this.markers.forEach((m) => m.setActive(false))
        for (let c of remaining_candidates) this.markers[0].setActive(true)
    }
}