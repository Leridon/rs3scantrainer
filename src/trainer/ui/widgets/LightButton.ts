import Button from "lib/ui/controls/Button";
import {C} from "../../../lib/ui/constructors";
import Appendable = C.Appendable;

export default class LightButton extends Button {
  constructor(text: Appendable = "Button", type: "round" | "rectangle" = "round") {
    super()

    if (type == "round") this.addClass("ctr-lightbutton-round")

    this.addClass("ctr-lightbutton").append(text)
  }

  setText(text: string): this {
    this.text(text)
    return this
  }

  setHTML(html: string): this {
    this.container.html(html)
    return this
  }
}