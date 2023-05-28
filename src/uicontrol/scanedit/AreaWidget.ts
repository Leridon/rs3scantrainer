import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import {ScanSpot} from "../../model/methods";
import {ToggleGroup} from "../map/layers/ToggleGroup";
import {ChildType} from "../../model/scans/scans";
import {ScanEditLayer, SpotPolygon} from "../map/layers/ScanLayer";
import DrawAreaInteraction from "./DrawAreaInteraction";

export default class AreaWidget extends TypedEmitter<{
    "deleted": any,
    "changed": ScanSpot
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
            .append($("<div class='col-2 property' title='Check if this area is no specific place on the map, for example when \"Try scanning a different level\" is used.'>Virtual?</div>"))
            .append($("<div class='col-10 property' style='text-align: left'></div>")
                .append($("<input type='checkbox'>"))
            )
            .appendTo(this.edit_panel.container)

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


        for (let c of ChildType.all) {
            let input = $("<input class='nisinput disabled' style='flex-grow: 1; min-width: 30%' disabled type='text'>")
            let checkbox = $("<input type='checkbox' style='margin-right: 5px'>")
                .on("input", () => {
                    let checked = checkbox.is(":checked")

                    input.prop("disabled", !checked)
                    if (checked) select_button.removeClass("disabled")
                    else select_button.addClass("disabled")
                })

            let select_button = $("<div class='nissmallimagebutton disabled' style='margin-left: 5px'><img src='assets/icons/select.png'></div>")

            let r = $("<div class='row'>")
                .append($("<div class='col-2'>").attr("title", ChildType.meta(c).pretty).text(ChildType.meta(c).pretty))
                .append($("<div class='col-10'>")
                    .append($("<div style='display: flex'>")
                        .append(checkbox).append(input).append(select_button)
                    ))
                /*.append($("<div class='col-1'>").append(checkbox))
                .append($("<div class='col-7'>").append(input))
                .append($("<div class='col-2'>").append(select_button))*/
                .appendTo(this.edit_panel.container)
        }
    }

    delete() {
        this.polygon.remove()
        this.container.remove()

        this.emit("deleted", "")
    }
}