import Widget from "./Widget";

export default class Checkbox extends Widget<{
    "changed": boolean
}> {
    input: JQuery
    value: boolean = false

    constructor() {
        super()

        this.input = $("<input type='checkbox'>")
            .on("input", () => {
                let value = this.input.is(":checked")
                let changed = value != this.value
                this.value = value
                if(changed) this.emit("changed", this.value)
            })
            .appendTo(this.container)
    }
}