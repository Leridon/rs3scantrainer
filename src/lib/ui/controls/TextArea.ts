import AbstractEditWidget from "trainer/ui/widgets/AbstractEditWidget";

export default class TextArea extends AbstractEditWidget<string, HTMLTextAreaElement> {
    constructor(customization: {
        readonly?: boolean,
        placeholder?: string
    } = {}) {
        super($("<textarea class='nisinput'>"));

        this.raw().readOnly = !!customization.readonly
        this.raw().placeholder = customization.placeholder || ""

        this
            .on("input", () => {
                this.preview(this.container.val() as string)
            })
            .on("change", () => {
                this.commit(this.container.val() as string)
            })
    }

    setEnabled(v: boolean): this {
        this.container.prop("disabled", !v)
        return this
    }

    setPlaceholder(placeholder: string): this{
        this.container.attr("placeholder", placeholder)

        return this
    }

    protected render() {
        this.container.val(this.get())
    }
}