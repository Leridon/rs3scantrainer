import {TypedEmitter} from "skillbertssolver/eventemitter";

export type ToggleGroupEvents<T> = {
    value_changed: T | null
}

export class ToggleGroup<T> extends TypedEmitter<ToggleGroupEvents<T>> {
    active_button: JQuery = null

    constructor(private buttons: JQuery[]) {
        super()

        this.buttons.forEach((b) => {
            b.on("click", (e) => {
                if (this.active_button != null) this.active_button.removeClass("active")

                if (b == this.active_button) { // Disable selection
                    this.active_button = null
                    this.emit("value_changed", null)
                } else {
                    this.active_button = b
                    this.emit("value_changed", this.active_button.data("value"))
                }

                this.buttons.forEach((e) => e.removeClass("active").removeClass("inactive"))

                if (this.active_button) {
                    this.buttons.forEach((e) => e.addClass("inactive"))
                    this.active_button.removeClass("inactive").addClass("active")
                }
            })
        })
    }

    value(): T {
        if (!this.active_button) return null
        else return this.active_button.data("value")
    }

    setValue(value: T): void {
        this.buttons.forEach((e) => e.removeClass("active").removeClass("inactive"))

        if (value != null) {
            this.buttons.forEach((e) => e.addClass("inactive"))

            this.active_button = this.buttons.find((b) => b.data("value") == value)
            this.active_button.removeClass("inactive").addClass("active")
        }
    }
}