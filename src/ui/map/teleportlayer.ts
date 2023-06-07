import * as leaflet from "leaflet"
import {toLeafletLatLngExpression} from "../../model/coordinates";
import {flat_teleport} from "../../model/teleports";

class TeleportIcon extends leaflet.Icon {
    declare options: leaflet.IconOptions & { text?: string, title?: string };

    constructor(p: leaflet.IconOptions & { text?: string, title?: string }) {
        super(p);
    }

    createIcon() {
        let el = document.createElement("div");
        el.style.backgroundImage = `url("${this.options.iconUrl}")`;
        el.classList.add("marktele");
        if (this.options.text) {
            el.innerText = this.options.text;
        }
        if (this.options.title) {
            el.title = this.options.title;
        }
        return el;
    }
}

export class TeleportLayer extends leaflet.FeatureGroup {

    constructor(teleports: flat_teleport[]) {
        super()

        for (let tele of teleports) {
            leaflet.marker(toLeafletLatLngExpression(tele.spot), {
                icon: new TeleportIcon({
                    iconUrl: `./assets/icons/teleports/${tele.icon}`,
                    text: tele.code,
                    title: tele.hover
                })
            }).addTo(this)
        }
    }
}