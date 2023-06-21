import Button from "./Button";

export default class LightButton extends Button {
    constructor(text: string) {
        super()

        this.addClass("lightbutton").text(text)
    }

    setText(text: string){
        this.text(text)
    }
}