import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import {ScanSpot} from "../../model/methods";
import {ToggleGroup} from "../map/layers/ToggleGroup";
import {ChildType} from "../../model/scans/scans";
import {ScanEditLayer, SpotPolygon} from "../map/layers/ScanLayer";
import DrawAreaInteraction from "./DrawAreaInteraction";
import {ScanDecision} from "./TreeEdit";
import SelectDigSpotsInteraction from "./SelectDigSpotsInteraction";
import SmallImageButton from "../widgets/SmallImageButton";
import AreaEdit from "./AreaEdit";
import {eq} from "../../model/coordinates";

export default class AreaWidget extends TypedEmitter<{
    "deleted": ScanSpot,
    "changed": ScanSpot,
    "decision_changed": ScanDecision
}> {
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
            container: JQuery,
            topleft: { x: JQuery, y: JQuery },
            botright: { x: JQuery, y: JQuery },
            redraw_button: JQuery
        },
        overrides: Map<ChildType, JQuery>
    }

    select_interaction: SelectDigSpotsInteraction = null

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
        super()

        if (!polygon) this.polygon = new SpotPolygon(value).addTo(this.layer)

        this.container = $("<div class='panel'>")

        this.main_row = {
            row: $("<div class='area-edit-row' style='display: flex;'>").appendTo(this.container)
        }

        this.main_row.area_div = $("<div class='area-div'></div>").text(this.value.name).appendTo(this.main_row.row)

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

        this.main_row.info_buttons.on("value_changed", (value) => {
            this.emit("decision_changed", this.getActiveDecision())
        })

        this.edit_panel = {
            container: $("<div class='properties'></div>")
                .hide()
                .appendTo(this.container),
            name: $("<input type='text' class='nisinput' style='width: 100%'>")
                .val(value.name)
                .on("input", (e) => {
                    this.value.name = $(e.target).val() as string
                    this.emit("changed", this.value)

                    this.main_row.area_div.text(this.value.name)
                    this.polygon.update()
                }),
            area: {
                container: $("<div>"),
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
            overrides: new Map<ChildType, JQuery>()
        }

        // This section is proof that I need to learn React...
        $("<div class='head'>General</div>").appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'>Name</div>"))
            .append($("<div class='col-10'>").append(this.edit_panel.name))
            .appendTo(this.edit_panel.container)

        $("<div class='head'>Area</div>").appendTo(this.edit_panel.container)

        let virtual_checkbox = $("<input type='checkbox'>")
            .on("input", (e) => {
                this.value.is_virtual = virtual_checkbox.is(":checked")

                this.polygon.update()

                this.emit("changed", this.value)

                this.edit_panel.area.container.animate({"height": 'toggle'})
            })

        if (value.is_virtual) virtual_checkbox.prop("checked", true)

        $("<div class='row'>")
            .append($("<div class='col-2 property' title='Check if this area is no specific place on the map, for example when \"Try scanning a different level\" is used.'>Virtual?</div>"))
            .append($("<div class='col-10 property' style='text-align: left'></div>")
                .append(virtual_checkbox)
            )
            .appendTo(this.edit_panel.container)

        this.edit_panel.area.container.appendTo(this.edit_panel.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'></div>"))
            .append($("<div class='col-5 property' style='text-align: center'>x</div>"))
            .append($("<div class='col-5 property' style='text-align: center'>y</div>"))
            .appendTo(this.edit_panel.area.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property' title='Top left' style='text-align: center'>TL</div>"))
            .append($("<div class='col-5'>").append(this.edit_panel.area.topleft.x))
            .append($("<div class='col-5'>").append(this.edit_panel.area.topleft.y))
            .appendTo(this.edit_panel.area.container)


        $("<div class='row'>")
            .append($("<div class='col-2 property' title='Bottom right' style='text-align: center'>BR</div>"))
            .append($("<div class='col-5'>").append(this.edit_panel.area.botright.x))
            .append($("<div class='col-5'>").append(this.edit_panel.area.botright.y))
            .appendTo(this.edit_panel.area.container)

        $("<div class='row'>")
            .append($("<div class='col-2 property'></div>"))
            .append($("<div class='col-10'>").append(this.edit_panel.area.redraw_button))
            .appendTo(this.edit_panel.area.container)


        $("<div class='head'>Overrides</div>").appendTo(this.edit_panel.container)


        for (let c of ChildType.all) {
            let override_exists = ScanSpot.override(value, c) != null

            let input = $("<input class='nisinput disabled' style='flex-grow: 1; min-width: 30%' disabled type='text'>")
                .on("input", (e) => {
                    let chosen = (input.val() as string).split(",")
                        .map((s) => this.parent.parent.value.spot_ordering[Number(s.trim()) - 1])
                        .filter((s) => s)

                    ScanSpot.setOverride(this.value, c, chosen)

                    this.emit("changed", this.value)
                })
                .on("focusout", () => {
                    this.updateSpotOrder()
                })
                .prop("disabled", !override_exists)

            this.edit_panel.overrides.set(c, input)

            let checkbox = $("<input type='checkbox' style='margin-right: 5px'>")
                .prop("checked", override_exists)
                .on("input", () => {
                    let checked = checkbox.is(":checked")

                    if (!checked) {
                        ScanSpot.setOverride(this.value, c, null)
                        this.updateSpotOrder()
                    }

                    input.prop("disabled", !checked)
                    select_button.setEnabled(checked)
                })

            let select_button = SmallImageButton.new("assets/icons/select.png")
                .tooltip("Select on map")
                .css("margin-left", "5px")
                .on("click", () => {
                    if (this.select_interaction == null) {
                        select_button.setIcon("assets/icons/checkmark.png")

                        let old = this.layer.highlightedCandidates()

                        this.select_interaction = new SelectDigSpotsInteraction(this.layer)

                        this.select_interaction.events
                            .on("changed", (selection) => {
                                ScanSpot.setOverride(this.value, c, selection)
                                this.updateSpotOrder()
                                this.layer.highlightCandidates(selection)
                            })
                            .on("done", (selection) => {
                                ScanSpot.setOverride(this.value, c, selection)

                                this.emit("changed", this.value)

                                this.updateSpotOrder()
                                this.layer.highlightCandidates(old)
                            })

                        this.layer.highlightCandidates([])

                        this.select_interaction.activate()
                    } else {
                        this.select_interaction.cancel()

                        select_button.setIcon("assets/icons/select.png")

                        this.select_interaction = null
                    }
                })

            if (!override_exists) select_button.setEnabled(false)

            let r = $("<div class='row'>")
                .append($("<div class='col-2'>").attr("title", ChildType.meta(c).pretty).text(ChildType.meta(c).pretty))
                .append($("<div class='col-10'>")
                    .append($("<div style='display: flex'>")
                        .append(checkbox).append(input).append(select_button.container)
                    ))
                .appendTo(this.edit_panel.container)
        }
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
        this.container.remove()

        this.emit("deleted", this.value)
    }

    updateSpotOrder() {
        for (let c of ChildType.all) {
            let override = ScanSpot.override(this.value, c)

            if (override) {

                let input = override.map((s) => this.parent.parent.value.spot_ordering.findIndex((e) => eq(e, s)) + 1)
                input = input.sort()

                this.edit_panel.overrides.get(c).val(input.join(", "))
            } else {
                this.edit_panel.overrides.get(c).val("")
            }

        }
    }

    setDecision(decision: ChildType) {
        this.main_row.info_buttons.setValue(decision)
    }
}