import {ToggleGroup} from "../map/layers/ToggleGroup";
import {ScanEditLayer, SpotPolygon} from "../map/layers/ScanLayer";
import DrawAreaInteraction from "./DrawAreaInteraction";
import SelectDigSpotsInteraction from "./SelectDigSpotsInteraction";
import AreaEdit from "./AreaEdit";
import {ScanTree2} from "../../model/scans/ScanTree2";
import ScanSpot = ScanTree2.ScanSpot;
import ScanDecision = ScanTree2.ScanDecision;
import Widget from "../widgets/Widget";
import {Pulse} from "../../model/scans/scans";

let area_name_pattern = /[a-zA-Z_][_a-zA-Z0-9]*/

export default class AreaWidget extends Widget<{
    "deleted": ScanSpot,
    "changed": ScanSpot,
    "decision_changed": ScanDecision,
    "renamed": { old: string, new: string }
}> {
    main_row: {
        row: JQuery,
        area_div?: JQuery
        delete_button?: JQuery,
        edit_button?: JQuery,
        info_buttons?: ToggleGroup<Pulse>
    }

    edit_panel: {
        container: JQuery,
        name: JQuery,
        area: {
            topleft: { x: JQuery, y: JQuery },
            botright: { x: JQuery, y: JQuery },
            redraw_button: JQuery
        },
    }

    private createInputfield(read: () => number, write: (number) => void): JQuery {
        return $("<input type='number' class='nisinput' style='width: 100%'>")
            .val(read())
            .on("input", (e) => {
                write(Number($(e.target).val()))

                this.polygon.update()
                this.emit("changed", this.value)

                if (this.main_row.info_buttons.value() != null) this.emit("decision_changed", this.getActiveDecision())
            })
    }

    toggleEdit(): this {
        this.edit_panel.container.animate({"height": 'toggle'})

        return this
    }

    startRedraw(): DrawAreaInteraction {
        let interaction = new DrawAreaInteraction(this.layer)

        this.edit_panel.area.redraw_button.text("Drawing...")

        interaction.events.on("changed", (a) => {
            this.value.area = a

            this.edit_panel.area.topleft.x.val(a.topleft.x)
            this.edit_panel.area.topleft.y.val(a.topleft.y)
            this.edit_panel.area.botright.x.val(a.botright.x)
            this.edit_panel.area.botright.y.val(a.botright.y)

            this.emit("changed", this.value)

            this.polygon.update()
        })

        interaction.events.on("done", (a) => {
            if (this.main_row.info_buttons.value() != null) this.emit("decision_changed", this.getActiveDecision())

            this.edit_panel.area.redraw_button.text("Draw on map")
        })

        interaction.activate()

        return interaction
    }

    constructor(
        private parent: AreaEdit,
        private layer: ScanEditLayer,
        public value: ScanSpot,
        private polygon: SpotPolygon = null
    ) {
        super($("<div class='panel'>"))

        if (!polygon) this.polygon = new SpotPolygon(value).addTo(this.layer)

        this.main_row = {
            row: $("<div class='area-edit-row' style='display: flex;'>").appendTo(this.container)
        }

        this.main_row.area_div = $("<div class='area-div'></div>").text(this.value.name).appendTo(this.main_row.row)

        this.main_row.delete_button = $('<div class="nissmallimagebutton" title="Delete"><img src="assets/icons/delete.png"></div>')
            .on("click", () => this.delete())
            .appendTo(this.main_row.row)

        this.main_row.edit_button = $('<div class="nissmallimagebutton" title="Edit"><img src="assets/icons/edit.png"></div>')
            .on("click", () => {
                this.toggleEdit()
            })
            .appendTo(this.main_row.row)

        this.main_row.info_buttons = new ToggleGroup(Pulse.all.map((c) => {
            return $("<div class='lightbutton' style='padding-left: 0.5em; padding-right : 0.5em'>")
                .text(Pulse.meta(c).short)
                .attr("title", Pulse.meta(c).pretty)
                .data("value", c)
                .appendTo(this.main_row.row)
        }))

        this.main_row.info_buttons.on("value_changed", (value) => {
            this.emit("decision_changed", this.getActiveDecision())
        })

        this.edit_panel = {
            container: $("<div class='properties' style='margin-top: 5px; border-top: 1px solid #41555F'></div>")
                .hide()
                .appendTo(this.container),
            name: $("<input type='text' class='nisinput' style='width: 100%'>")
                //.attr("pattern", area_name_pattern.toString())
                .val(value.name)
                .on("change", () => {
                    let oldName = this.value.name
                    let newName = this.edit_panel.name.val() as string

                    if (area_name_pattern.test(newName) && oldName != newName) {
                        this.value.name = newName

                        this.main_row.area_div.text(this.value.name)
                        this.polygon.update()

                        this.emit("renamed", {old: oldName, new: newName})
                    } else {
                        // Reset input field
                        if (!this.edit_panel.name.is(":focus")) this.edit_panel.name.val(this.value.name)
                    }
                })
            /*
            .on("input", (e) => {
                this.value.name = $(e.target).val() as string
                this.emit("changed", this.value)
            })*/,
            area: {
                topleft: {
                    x: this.createInputfield(() => this.value.area.topleft.x, (v) => this.value.area.topleft.x = v),
                    y: this.createInputfield(() => this.value.area.topleft.y, (v) => this.value.area.topleft.y = v),
                },
                botright: {
                    x: this.createInputfield(() => this.value.area.botright.x, (v) => this.value.area.botright.x = v),
                    y: this.createInputfield(() => this.value.area.botright.y, (v) => this.value.area.botright.y = v),
                },
                redraw_button: $("<div class='lightbutton' style='width: 100%'>Draw on map</div>")
                    .on("click", () => {
                        this.startRedraw()
                    })
            },
        }

        // This section is proof that I need to learn React...
        $("<div class='head'>General</div>").appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'>Name</div>"))
            .append($("<div class='col-10'>").append(this.edit_panel.name))
            .appendTo(this.edit_panel.container)

        $("<div class='head'>Area</div>").appendTo(this.edit_panel.container)

        /*
                let virtual_checkbox = $("<input type='checkbox'>")
                    .on("input", (e) => {
                        this.value.is_virtual = virtual_checkbox.is(":checked")

                        this.polygon.update()

                        this.emit("changed", this.value)

                        this.edit_panel.area.container.animate({"height": 'toggle'})
                    }
                if (value.is_virtual) virtual_checkbox.prop("checked", true)

               /* $("<div class='row'>")
                    .append($("<div class='col-2 property' title='Check if this area is no specific place on the map, for example when \"Try scanning a different level\" is used.'>Virtual?</div>"))
                    .append($("<div class='col-10 property' style='text-align: left'></div>")
                        .append(virtual_checkbox)
                    )
                    .appendTo(this.edit_panel.container)

                */

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
    }

    getActiveDecision(): ScanDecision {
        if (this.main_row.info_buttons.value() == null) return null

        return {
            area: this.value,
            ping: this.main_row.info_buttons.value()
        }
    }

    delete() {
        this.polygon.remove()
        this.remove()

        this.emit("deleted", this.value)
    }

    updateSpotOrder() {

    }

    setDecision(decision: Pulse) {
        this.main_row.info_buttons.setValue(decision)
    }
}