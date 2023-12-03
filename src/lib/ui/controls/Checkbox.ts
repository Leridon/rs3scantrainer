import AbstractEditWidget from "trainer/ui/widgets/AbstractEditWidget";

export default class Checkbox extends AbstractEditWidget<boolean> {
    constructor() {
        super($("<input type='checkbox'>"))

        this.container
            .on("input", () => {
                let value = this.container.is(":checked")
                if (value != this.get()) this.commit(value)
            })
            .appendTo(this.container)
    }

    protected render() {
        this.container.prop("checked", this.get());
    }
}