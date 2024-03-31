import Button from "../../../lib/ui/controls/Button";
import {C} from "../../../lib/ui/constructors";
import cls = C.cls;

export class BigNisButton extends Button {

  constructor(text: string, style: BigNisButton.Kind) {
    super();

    c().text(text).addClass("content").appendTo(this)
    cls("background").appendTo(this)

    this.addClass("nisl-big-button")

    this.addClass(`nisl-big-button-${style}`)
  }
}

export namespace BigNisButton {
  export type Kind = "confirm" | "cancel" | "neutral"
}