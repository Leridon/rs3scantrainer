import Widget from "./Widget";
import TemplateResolver from "../../util/TemplateResolver";
import AbstractEditWidget from "./AbstractEditWidget";

export default class TemplateStringEdit extends AbstractEditWidget<string> {

    instruction_input: JQuery
    render_view: JQuery

    constructor(private resolver: TemplateResolver) {
        super()

        this.instruction_input = $("<input type='text' class='nisinput' style='width: 100%'>")
            .on("input", () => {
                this.value = this.instruction_input.val() as string
                // Only update preview without immediately triggering the change
                this.render()
            })
            .on("change", () => {
                this.changed(this.instruction_input.val() as string)
            })
            .appendTo(this.container)

        this.render_view = $("<div style='padding-left: 5px'>").appendTo(this.container)

        this.render()
    }

    protected update() {
        this.instruction_input.val(this.value)
        this.render()
    }

    setResolver(resolver: TemplateResolver): this {
        this.resolver = resolver
        this.render()

        return this
    }

    private render() {
        this.render_view.html(`Preview: ${this.resolver.resolve(this.value || "")}`)
    }
}