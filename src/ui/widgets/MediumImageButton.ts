import Button from "./inputs/Button";

export default class MediumImageButton extends Button {
    constructor(icon: string) {
        super()

        this.container
            .addClass("medium-image-button")
            .append($(`<img src='${icon}'>`))
    }
}