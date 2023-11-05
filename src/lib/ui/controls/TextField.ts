import AbstractEditWidget from "trainer/ui/widgets/AbstractEditWidget";

export default class TextField extends AbstractEditWidget<string, {
    hint: string
}> {
    constructor() {
        super($("<input type='text' class='nisinput'>"));

        this.container
            .val(this.value)
            .on("input", () => {
                this.emit("hint", this.container.val() as string)
            })
            .on("change", () => {
                this.changed(this.container.val() as string)
            })
    }

    protected render() {
        this.container.val(this.value)
    }
}