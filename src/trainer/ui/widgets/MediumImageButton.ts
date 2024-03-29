import Button from "lib/ui/controls/Button";
import * as jquery from "jquery";

export default class MediumImageButton extends Button {
  constructor(icon: string) {
    super()

    this.container
      .addClass("medium-image-button")
      .append(jquery(`<img src='${icon}'>`))
  }
}