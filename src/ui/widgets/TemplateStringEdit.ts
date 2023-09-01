import Widget from "./Widget";
import TemplateResolver from "../../util/TemplateResolver";
import AbstractEditWidget from "./AbstractEditWidget";
import SmallImageButton from "./SmallImageButton";

export default class TemplateStringEdit extends AbstractEditWidget<string> {

    input_row: Widget
    instruction_input: Widget

    render_view: Widget

    constructor(private options: {
        resolver: TemplateResolver,
        generator?: () => string
    }) {
        super()

        this.addClass("ctr-template-string-edit")

        this.render()
    }

    protected render() {

        this.input_row = c("<div class='ctr-template-string-edit-input-row'></div>").appendTo(this)

        this.instruction_input = c("<input type='text' class='nisinput'>")
            .tapRaw(r => r
                .on("input", () => {
                    this.value = this.instruction_input.container.val() as string
                    // Only update preview without immediately triggering the change
                    this.renderPreview()
                })
                .on("change", () => {
                    this.changed(this.instruction_input.container.val() as string)
                }))
            .appendTo(this.input_row)

        if (this.options.generator) {
            SmallImageButton.new("assets/icons/regenerate.png")
                .css("margin-left", "2px")
                .tooltip("Auto generate")
                .on("click", () => {
                    this.setValue(this.options.generator())
                    this.changed(this.value)
                }).appendTo(this.input_row)
        }

        this.render_view = c("<div style='padding-left: 5px'>").appendTo(this)

        this.renderPreview()
    }

    protected update() {
        this.instruction_input.container.val(this.value)
        this.renderPreview()
    }

    setResolver(resolver: TemplateResolver): this {
        this.options.resolver = resolver
        this.renderPreview()

        return this
    }

    private renderPreview() {
        this.render_view.container.html(`Preview: ${this.options.resolver.resolve(this.value || "")}`)
    }
}