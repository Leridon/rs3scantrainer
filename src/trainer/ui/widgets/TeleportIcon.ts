import Widget from "../../../lib/ui/Widget";
import {C} from "../../../lib/ui/constructors";
import div = C.div;
import img = C.img;
import {Transportation} from "../../../lib/runescape/transportation";

export default class TeleportIcon extends Widget {

    constructor(spot: Transportation.TeleportGroup.Spot) {
        super();

        this.tooltip(spot.hover())
        this.addClass("ctr-teleport-icon")

        this.append(
            img(`assets/icons/teleports/${spot.image().url}`, spot.hover()),
            div().text(spot.code())
        )
    }
}