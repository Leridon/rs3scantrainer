import {ExpansionBehaviour} from "../ExpansionBehaviour";
import Button from "./Button";

export default class NisCollapseButton extends Button {

  constructor(public behaviour: ExpansionBehaviour) {
    super($("<img class='nisl-collapse-button'>"));

    behaviour.bindToClickable(this)

    behaviour.state().subscribe((isCollapsed) => {
      this.container.attr("src", isCollapsed
        ? "assets/nis/plus.png"
        : "assets/nis/minus.png"
      )
    }, true)
  }
}