import Widget from "./Widget";
import TemplateResolver from "../../util/TemplateResolver";

export default class TemplateStringEdit extends Widget<{
    "changed": string
}> {

    instruction_input: JQuery
    render_view: JQuery

    constructor(private resolver: TemplateResolver, private value: string = "") {
        super()
        this.instruction_input = $("<input type='text' class='nisinput' style='width: 100%'>")
            .val(value)
            .on("input", () => {
                this.value = this.instruction_input.val() as string
                // Only update preview without immediately triggering the change
                this.render()
            })
            .on("change", () => {
                this.value = this.instruction_input.val() as string
                this.emit("changed", this.value)
            })
            .appendTo(this.container)

        this.render_view = $("<div style='padding-left: 5px'>").appendTo(this.container)

        this.render()
    }

    setResolver(resolver: TemplateResolver) {
        this.resolver = resolver
        this.render()
    }

    private render() {
        this.render_view.html(`Preview: ${this.resolver.resolve(this.value)}`)
    }
}