import * as leaflet from "leaflet";
import {ScanSpot, Video} from "../../../model/methods";
import {Box, boxPolygon, eq, MapCoordinate} from "../../../model/coordinates";
import {ScanStep, SetSolution} from "../../../model/clues";
import {ImageButton} from "../CustomControl";
import {GameMapControl, TileMarker} from "../map";
import {area_pulse, ChildType, get_pulse, PulseType, ScanEquivalenceClasses} from "../../../model/scans/scans";
import {ActiveLayer, LayerInteraction, TileMarkerWithActive} from "../activeLayer";
import {Application} from "../../../application";
import {ToggleGroup} from "./ToggleGroup";
import * as lodash from 'lodash';
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {Layer, LeafletMouseEvent} from "leaflet";

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
        if (this.polygon) this.polygon.remove()

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
                        l.setAreas(lodash.cloneDeep(this.areas.map((s) => s.spot())))

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

type AreaWidgetEvents = {
    "deleted": any,
    "changed": ScanSpot
}

class AreaWidget extends TypedEmitter<AreaWidgetEvents> {
    main_row: {
        row: JQuery,
        area_div?: JQuery
        delete_button?: JQuery,
        edit_button?: JQuery,
        info_buttons?: ToggleGroup<ChildType>
    }

    container: JQuery

    edit_panel: {
        container: JQuery,
        name: JQuery,
        area: {
            topleft: { x: JQuery, y: JQuery },
            botright: { x: JQuery, y: JQuery },
            redraw_button: JQuery
        }
    }

    private createInputfield(read: () => number, write: (number) => void): JQuery {
        return $("<input type='number' class='nisinput' style='width: 100%'>")
            .val(read())
            .on("input", (e) => {
                write($(e.target).val())

                console.log(this.area)

                this.polygon.update()
                this.parent.updateCandidates()
            })
    }

    toggleEdit(): this {
        this.edit_panel.container.animate({"height": 'toggle'})

        return this
    }

    startRedraw(): DrawAreaInteraction {
        let interaction = new DrawAreaInteraction(this.parent)

        this.edit_panel.area.redraw_button.text("Drawing...")

        interaction.events.on("changed", (a) => {
            this.area.area = a

            this.edit_panel.area.topleft.x.val(a.topleft.x)
            this.edit_panel.area.topleft.y.val(a.topleft.y)
            this.edit_panel.area.botright.x.val(a.botright.x)
            this.edit_panel.area.botright.y.val(a.botright.y)

            this.polygon.update()
        })

        interaction.events.on("done", (a) => {
            this.parent.updateCandidates()
            this.edit_panel.area.redraw_button.text("Draw on map")
        })

        interaction.activate()

        return interaction
    }

    constructor(
        private parent: ScanEditLayer,
        public area: ScanSpot,
        private polygon: SpotPolygon = null
    ) {
        super()

        if (!polygon) this.polygon = new SpotPolygon(area).addTo(this.parent)

        this.container = $("<div class='panel'>")

        this.main_row = {
            row: $("<div class='area-edit-row' style='display: flex;'>").appendTo(this.container)
        }

        this.main_row.area_div = $("<div class='area-div'></div>").text(this.area.name).appendTo(this.main_row.row)

        this.main_row.delete_button = $('<div class="nissmallimagebutton" title="Edit"><img src="assets/icons/delete.png"></div>')
            .on("click", () => this.delete())
            .appendTo(this.main_row.row)

        this.main_row.edit_button = $('<div class="nissmallimagebutton" title="Edit"><img src="assets/icons/edit.png"></div>')
            .on("click", () => {
                this.toggleEdit()
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

        this.edit_panel = {
            container: $("<div class='properties'></div>")
                .hide()
                .appendTo(this.container),
            name: $("<input type='text' class='nisinput' style='width: 100%'>")
                .val(area.name)
                .on("input", (e) => {
                    this.area.name = $(e.target).val() as string
                    this.main_row.area_div.text(this.area.name)
                    this.polygon.update()
                }),
            area: {
                topleft: {
                    x: this.createInputfield(() => this.area.area.topleft.x, (v) => this.area.area.topleft.x = v),
                    y: this.createInputfield(() => this.area.area.topleft.y, (v) => this.area.area.topleft.y = v),
                },
                botright: {
                    x: this.createInputfield(() => this.area.area.botright.x, (v) => this.area.area.botright.x = v),
                    y: this.createInputfield(() => this.area.area.botright.y, (v) => this.area.area.botright.y = v),
                },
                redraw_button: $("<div class='lightbutton' style='width: 100%'>Draw on map</div>")
                    .on("click", () => {
                        this.startRedraw()
                    })
            }
        }

        // This section is proof that I need to learn React...
        $("<div class='head'>General</div>").appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'>Name</div>"))
            .append($("<div class='col-10'>").append(this.edit_panel.name))
            .appendTo(this.edit_panel.container)

        $("<div class='head'>Area</div>").appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'></div>"))
            .append($("<div class='col-5 property' style='text-align: center'>x</div>"))
            .append($("<div class='col-5 property' style='text-align: center'>y</div>"))
            .appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property' title='Top left' style='text-align: center'>TL</div>"))
            .append($("<div class='col-5'>").append(this.edit_panel.area.topleft.x))
            .append($("<div class='col-5'>").append(this.edit_panel.area.topleft.y))
            .appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property' title='Bottom right' style='text-align: center'>BR</div>"))
            .append($("<div class='col-5'>").append(this.edit_panel.area.botright.x))
            .append($("<div class='col-5'>").append(this.edit_panel.area.botright.y))
            .appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'></div>"))
            .append($("<div class='col-10'>").append(this.edit_panel.area.redraw_button))
            .appendTo(this.edit_panel.container)

        $("<div class='head'>Overrides</div>").appendTo(this.edit_panel.container)
    }

    delete() {
        this.polygon.remove()
        this.container.remove()

        this.emit("deleted", "")
    }
}

type path = any

type tree = {
    spot_ordering: MapCoordinate[],
    areas: ScanSpot[],
    methods: {
        from?: string,
        to: string | MapCoordinate,
        path?: path,
        instruction?: string,
        clip?: Video
    }[]
    root: tree_node
}

type tree_node = {
    where: string,
    decisions?: [ChildType, tree_node][]
}

let kelda: tree_node = {
    where: "A",
    decisions: [
        [ChildType.SINGLE, {where: "B"}],
        [ChildType.DOUBLE, {where: "B"}]
    ]
}

class ScanEditPanel {
    content: JQuery

    scan_spots: {
        heading?: JQuery,
        areas?: {
            container: JQuery
            areas: AreaWidget[],
        },
        add_button?: JQuery
    } = {}

    constructor(public layer: ScanEditLayer) {
        this.content = $(".cluemethodcontent[data-methodsection=scanedit]").empty()

        //$("<h3>Spots</h3>").appendTo(this.content)

        this.scan_spots.heading = $("<h4>Scan Spots</h4>").appendTo(this.content)

        this.scan_spots.areas = {
            container: $("<div>").appendTo(this.content),
            areas: []
        }

        this.scan_spots.add_button = $("<div class='lightbutton'>+ Add area</div>")
            .on("click", () => {
                let w = this.addArea({name: "New", area: {topleft: {x: 0, y: 0}, botright: {x: 0, y: 0}}})
                    .toggleEdit()
                w.startRedraw().events.on("done", () => (w.edit_panel.name[0] as HTMLInputElement).select())
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.content))
    }

    private addArea(area: ScanSpot): AreaWidget {
        let w =
            new AreaWidget(this.layer, area)
                .on("deleted", () => this.scan_spots.areas.areas.splice(this.scan_spots.areas.areas.indexOf(w), 1))

        w.container.appendTo(this.scan_spots.areas.container)
        this.scan_spots.areas.areas.push(w)

        return w
    }

    setAreas(areas: ScanSpot[]) {
        this.scan_spots.areas.areas.forEach((a) => a.delete())

        areas.forEach((a) => this.addArea(a))
    }
}

class DrawAreaInteraction extends LayerInteraction<ScanEditLayer> {
    events = new TypedEmitter<{
        "changed": Box,
        "done": Box
        "cancelled": Box
    }>()

    dragstart: MapCoordinate = null
    last_area: Box = null

    constructor(layer: ScanEditLayer) {
        super(layer);
    }

    cancel() {
        this.layer.getMap().map.off(this._maphooks)
        this.layer.getMap().map.dragging.enable()
    }

    start() {
        console.log("Starting")

        this.layer.getMap().map.on(this._maphooks)
        this.layer.getMap().map.dragging.disable()
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "mousedown": (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            this.dragstart = this.layer.getMap().tileFromMouseEvent(e)

            this.last_area = {topleft: this.dragstart, botright: this.dragstart}

            this.events.emit("changed", this.last_area)
        },

        "mousemove": (e: LeafletMouseEvent) => {
            if (this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                let now = this.layer.getMap().tileFromMouseEvent(e)

                this.last_area =
                    {
                        topleft: {
                            x: Math.min(this.dragstart.x, now.x),
                            y: Math.max(this.dragstart.y, now.y),
                        },
                        botright: {
                            x: Math.max(this.dragstart.x, now.x),
                            y: Math.min(this.dragstart.y, now.y),
                        }
                    }

                this.events.emit("changed", this.last_area)
            }
        },

        "mouseup": (e: LeafletMouseEvent) => {
            if (this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                this.events.emit("done", this.last_area)

                this.layer.cancelInteraction()
            }
        }
    }

}

export class ScanEditLayer extends ScanLayer {
    private edit_panel = new ScanEditPanel(this)

    constructor(clue: ScanStep, app: Application) {
        super(clue, app, {
            show_edit_button: false,
            show_equivalence_classes_button: true
        })
    }

    setAreas(spots: ScanSpot[]) {
        this.edit_panel.setAreas(spots)
    }

    activate(map: GameMapControl) {
        super.activate(map)

        this.app.sidepanels.methods_panel.showSection("scanedit")
    }

    deactivate() {
        super.deactivate()
    }

    updateCandidates() {
        let areafilters: MapCoordinate[][] = this.edit_panel.scan_spots.areas.areas
            .filter((e) => e.main_row.info_buttons.value() != null) // Get all areas with a set pulse type
            .map((e) => {
                let ping = e.main_row.info_buttons.value()

                let override = ScanSpot.override(e.area, ping)

                return override || this.clue.solution.candidates.filter((s) => area_pulse(s, e.area.area, this.range).map(ChildType.fromPulse).includes(ping))
            })

        let remaining_candidates = this.clue.solution.candidates.filter((c) => areafilters.every((f) => f.some((filt) => eq(filt, c))))

        this.markers.forEach((m) => m.setActive(remaining_candidates.some((c) => eq(c, m.getSpot()))))
        this.set_remaining_candidates(remaining_candidates)
    }
}