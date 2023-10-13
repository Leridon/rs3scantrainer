import Widget from "./Widget";
import TemplateResolver from "../../util/TemplateResolver";
import AbstractEditWidget from "./AbstractEditWidget";
import SmallImageButton from "./SmallImageButton";
import Button from "./inputs/Button";

export default class TemplateStringEdit extends AbstractEditWidget<string> {

    edit_mode: boolean = false

    main_row: Widget = null
    preview_container: Widget

    instruction_input: Widget = null
    generate_button: Button = null
    edit_button: Button = null

    constructor(private options: {
        resolver: TemplateResolver,
        generator?: () => string
    }) {
        super()

        this.container.on("mouseover", () => {
            if (this.edit_mode) return

            if (this.generate_button) this.generate_button.setVisible(true)
            if (this.edit_button) this.edit_button.setVisible(true)
        })

        this.container.on("mouseleave", () => {
            if (this.edit_mode) return

            if (this.generate_button) this.generate_button.setVisible(false)
            if (this.edit_button) this.edit_button.setVisible(false)
        })

        this.addClass("ctr-template-string-edit")

        this.render()
    }

    protected render() {
        this.empty()
        this.instruction_input = null
        this.preview_container = null

        this.main_row = c("<div class='ctr-template-string-edit-input-row'></div>")

        this.generate_button = SmallImageButton.new("assets/icons/regenerate.png")
            .css("margin-left", "2px")
            .tooltip("Auto generate")
            .setEnabled(!!this.options.generator)
            .on("click", () => {
                this.setValue(this.options.generator())
                this.changed(this.value)
            }).setVisible(this.edit_mode)

        if (this.edit_mode) {
            this.instruction_input = c("<input type='text' class='nisinput'>")
                .tapRaw(r => r
                    .val(this.value)
                    .on("input", () => {
                        this.value = this.instruction_input.container.val() as string
                        // Only update preview without immediately triggering the change
                        this.renderPreview()
                    })
                    .on("change", () => {
                        this.changed(this.instruction_input.container.val() as string)
                    })
                    .on("keyup", (e) => {
                        if (e.key === 'Enter') this.instruction_input.raw().blur()
                    })
                    .on("focusout", () => {
                        this.edit_mode = false

                        this.render()
                    })
                )

            this.main_row
                .append(this.instruction_input)
                .append(this.generate_button)
                .appendTo(this)

            this.preview_container = c().appendTo(this)

        } else {
            this.edit_button = SmallImageButton.new("assets/icons/edit.png")
                .css("margin-left", "2px")
                .tooltip("Edit")
                .on("click", () => {
                    this.startEdit()
                }).setVisible(false)

            this.preview_container = c("<span style='cursor: pointer; flex-grow: 1'>")
                .tooltip("Edit")
                .tapRaw(r => r.on("click", () => {
                    this.startEdit()
                }))

            this.main_row
                .append(this.preview_container)
                .append(this.edit_button)
                .append(this.generate_button)
                .appendTo(this)
        }

        this.renderPreview()
    }

    protected update() {
        if (this.instruction_input) {
            this.instruction_input.container.val(this.value)
        }
        this.renderPreview()
    }

    setResolver(resolver: TemplateResolver): this {
        this.options.resolver = resolver
        this.renderPreview()

        return this
    }

    private renderPreview() {
        this.preview_container.container.html(`${this.options.resolver.resolve(this.value || "")}`)
    }

    public startEdit() {
        this.edit_mode = true
        this.render()
        this.instruction_input.container.focus()
    }
}