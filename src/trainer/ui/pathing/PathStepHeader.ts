import {Path} from "../../../lib/runescape/pathing";
import Widget from "../../../lib/ui/Widget";
import {direction, PathFinder} from "../../../lib/runescape/movement";
import {capitalize} from "lodash";
import {Vector2} from "../../../lib/math";
import TeleportIcon from "../widgets/TeleportIcon";
import {CursorType} from "../../../lib/runescape/CursorType";
import {CTRIcon} from "../../CTRIcon";
import {C} from "../../../lib/ui/constructors";
import {PathGraphics} from "../path_graphics";
import {TransportData} from "../../../data/transports";
import hboxl = C.hboxl;


export class PathStepHeader extends Widget {
  constructor(step: Path.Step) {
    super();

    const {icon, content} = PathStepHeader.renderTextAndIconSeparately(step)

    hboxl(icon, content)
      .addClass("ctr-neosolving-path-legend")
      .appendTo(this)
  }
}

export namespace PathStepHeader {
  import cls = C.cls;
  import div = C.div;
  import img = C.img;
  import bold = C.bold;
  import ability_icon = PathGraphics.ability_icon;
  import entity = C.entity;
  import resolveTeleport = TransportData.resolveTeleport;
  import staticentity = C.staticentity;
  import span = C.span;

  export function renderTextAndIconSeparately(step: Path.Step): {
    icon?: Widget,
    content?: Widget
  } {
    let icon = cls("ctr-neosolving-path-stepicon")
    let content = div()

    switch (step.type) {
      case "orientation":
        icon.append(img("assets/icons/compass.png"))

        content.append(
          "Face ",
          bold(direction.toString(step.direction))
        )

        break;
      case "ability":
        icon.append(img(ability_icon(step.ability)))

        content.append(
          capitalize(step.ability),
          " "
        )

        if (step.target) {
          content.append("on ", entity(step.target))

          if (step.target_text) {
            content.append(", ", step.target_text)
          }
        } else if (step.target_text) {
          content.append(step.target_text, " ")
        } else {
          content.append(
            bold(direction.toString(direction.fromVector(Vector2.sub(step.to, step.from))))
          )
        }

        break;
      case "run":
        icon.append(img("assets/icons/run.png"))

        content.append("Run ",)

        if (step.to_text) {
          content.append(step.to_text)
        } else {
          content.append(`${PathFinder.pathLength(step.waypoints)} tiles`)
        }

        break;
      case "teleport":
        let flat = resolveTeleport(step.id)

        icon.append(new TeleportIcon(flat)
          .css2({
            "display": "inline-block",
            "height": "20px"
          }))

        content.append(
          "Teleport to ",
          bold(flat.spot.name)
        )
        break;
      case "redclick":
        icon.append(img(CursorType.meta(step.how).icon_url))

        content.append(
          "Target ",
          entity(step.target)
        )
        break;
      case "powerburst":

        icon.append(img("assets/icons/accel.png")
          .tooltip("Powerburst of Acceleration"))

        content.append(
          "Drink ",
          entity({kind: "item", name: "Powerburst of Acceleration"}),
        )

        break;
      case "transport":
        let shortcut = step.internal
        let action = shortcut.actions[0]

        icon.append(img(CursorType.meta(step.internal.actions[0].cursor).icon_url))

        content.append(
          action.name, " ",
          entity(shortcut.entity)
        )

        break;
      case "cheat":
        icon.append(img("assets/icons/Rotten_potato.png"))
        content.append("")
        break

      case "cosmetic":
        icon.append(img(CTRIcon.url(CTRIcon.get(step.icon))))
        content.append("Note")
        break
    }

    return {icon, content}
  }
}