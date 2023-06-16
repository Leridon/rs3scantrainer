import Widget from "./Widget";
import TemplateResolver from "../../util/TemplateResolver";

export default class TemplateStringEdit extends Widget<{
    "changed": string
}> {

    instruction_input: JQuery
    view_render_button: JQuery
    render_view: JQuery


    constructor(private resolver: TemplateResolver, private value: string = "") {
        super()
        this.instruction_input = $("<input type='text' class='nisinput' style='width: 100%'>")
            .val(value)
            .on("input", () => {
                this.value = this.instruction_input.val() as string

                this.render()

                this.emit("changed", this.value)
            }).appendTo(this.container)

        this.render_view = $("<div>").appendTo(this.container)

        this.render()
    }

    setResolver(resolver: TemplateResolver) {
        this.resolver = resolver
        this.render()
    }

    private render() {
        this.render_view.html(this.resolver.resolve(this.value))
    }
}