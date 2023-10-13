import AbstractEditWidget from "../AbstractEditWidget";

export default class Checkbox extends AbstractEditWidget<boolean> {
    input: JQuery

    constructor() {
        super()

        this.input = $("<input type='checkbox'>")
            .on("input", () => {
                let value = this.input.is(":checked")
                if (value != this.value) this.changed(value)
            })
            .appendTo(this.container)
    }

    protected update() {
        this.input.prop("checked", this.value);
    }
}