import AbstractEditWidget from "trainer/ui/widgets/AbstractEditWidget";

export default class TextArea extends AbstractEditWidget<string> {
    constructor() {
        super($("<textarea class='nisinput'>"));

        this.container
            .val(this.get())
            .on("input", () => {
                this.preview(this.container.val() as string)
            })
            .on("change", () => {
                this.commit(this.container.val() as string)
            })
    }

    setEnabled(v: boolean) : this {
        this.container.prop("disabled", !v)
        return this
    }

    protected render() {
        this.container.val(this.get())
    }
}