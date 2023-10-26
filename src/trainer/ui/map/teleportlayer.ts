import * as leaflet from "leaflet"
import {flat_teleport} from "lib/runescape/teleports";
import {Vector2} from "lib/math/Vector";

class TeleportIcon extends leaflet.Icon {
    constructor(public options: leaflet.IconOptions & { teleport: flat_teleport }) {
        super(options);
    }

    createIcon() {
        let el = document.createElement("div");
        el.style.backgroundImage = `url("${this.options.iconUrl}")`;
        el.classList.add("marktele");
        if (this.options.teleport.code) {
            el.innerText = this.options.teleport.code;
        }
        if (this.options.teleport.hover) {
            el.title = this.options.teleport.hover;
        }
        if (typeof this.options.teleport.icon != "string") {
            el.style.backgroundSize = `${this.options.teleport.icon.width ? this.options.teleport.icon.width + "px" : "auto"} ${this.options.teleport.icon.height ? this.options.teleport.icon.height + "px" : "auto"}`
        }
        return el;
    }

    static fromTeleport(tele: flat_teleport): TeleportIcon {
        return new TeleportIcon({
            iconUrl: `./assets/icons/teleports/${typeof tele.icon == "string" ? tele.icon : tele.icon.url}`,
            teleport: tele
        })
    }
}

export class TeleportLayer extends leaflet.FeatureGroup {

    constructor(teleports: flat_teleport[]) {
        super()

        for (let tele of teleports) {
            leaflet.marker(Vector2.toLatLong(tele.spot), {
                icon: TeleportIcon.fromTeleport(tele)
            }).addTo(this)
        }
    }
}