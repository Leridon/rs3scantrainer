import Widget from "../../../lib/ui/Widget";
import {Teleports} from "../../../lib/runescape/teleports";
import {C} from "../../../lib/ui/constructors";
import div = C.div;
import img = C.img;


export default class TeleportIcon extends Widget {

    constructor(tele: Teleports.flat_teleport) {
        super();

        this.tooltip(tele.hover)
        this.addClass("ctr-teleport-icon")

        this.append(
            img(`assets/icons/teleports/${typeof tele.icon == "string" ? tele.icon : tele.icon.url}`, tele.hover),
            div().text(tele.code ? tele.code : "")
        )
    }
}