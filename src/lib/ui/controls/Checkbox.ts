import AbstractEditWidget from "trainer/ui/widgets/AbstractEditWidget";
import Widget from "../Widget";
import {Observable, observe} from "../../reactive";

export class Checkbox extends AbstractEditWidget<boolean> {
    new_box: Widget

    type: Observable<"checkbox" | "radio">

    constructor(private label: string = "", type: "checkbox" | "radio" = "checkbox") {
        super()

        this.type = observe(type)

        this.type.subscribe((value) => {
            this.new_box.toggleClass("nisl-checkbox-radio", value == "radio")
        })

        this.addClass("nisl-checkbox")

        this.new_box = c("<div class='nisl-checkbox-box'>")
            .on("click", () => {
                this.commit(!this.get(), true)
            })
            .appendTo(this.container)

        c().addClass("nisl-checkbox-checkmark").appendTo(this.new_box)

        this.new_box.toggleClass("nisl-checkbox-radio", this.type.value() == "radio")

        if (this.label) {
            c().addClass("nisl-checkbox-label").text(this.label).appendTo(this)
        }

        this.render()
    }

    protected render() {
        this.new_box.toggleClass("checked", this.get())
    }
}

export namespace Checkbox {
    export class Group<T> {

        private value: Observable<T> = observe(null)

        constructor(private buttons: {
            button: Checkbox,
            value: T
        }[], can_be_null: boolean = false) {
            buttons.forEach(o => {
                o.button.type.set("radio")
                o.button.onCommit(v => {
                    if (v) this.value.set(o.value)
                    else if (!v && this.value.value() == o.value) {
                        if (can_be_null) this.value.set(null)
                        else o.button.setValue(true)
                    }
                })
            })

            this.value.subscribe(v => {
                this.buttons.forEach(b => {
                    b.button.setValue(b.value == v)
                })
            })

            if (can_be_null) this.value.set(null)
            else buttons[0].button.setValue(true)
        }

        setValue(v: T): this {
            this.value.set(v)

            return this
        }

        onChange(f: (_: T) => any): this {
            this.value.subscribe(f)

            return this
        }
    }

}