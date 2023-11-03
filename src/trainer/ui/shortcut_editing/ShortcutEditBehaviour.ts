import Behaviour from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import GameLayer from "../../../lib/gamemap/GameLayer";
import {Shortcuts} from "../../../lib/runescape/shortcuts";
import {LeafletEventHandlerFn} from "leaflet";
import * as leaflet from "leaflet"
import {boxPolygon, boxPolygon2} from "../polygon_helpers";
import {Constants} from "../../constants";
import {RenderingUtility} from "../map/RenderingUtility";
import {Rectangle} from "../../../lib/math/Vector";
import DrawDoor from "./DrawDoor";
import {ActionBar} from "../map/ActionBar";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";

class ShortcutEditGameLayer extends GameLayer {
    interActionGuard: InteractionGuard = new InteractionGuard()

    constructor(data: Shortcuts.new_shortcut[]) {
        super();

        data.map(Shortcuts.new_shortcut.normalize).map(s => this.render(s)).forEach(s => this.addLayer(s))

        let action_bar_control = new GameMapControl({
            type: "gapless",
            position: "bottom-center"
        }).addTo(this)

        action_bar_control.content.append(new ShortcutEditActionBar(this))

        this.add(new DrawDoor({
            done_handler: (shortcut) => {
                console.log(shortcut)
            }
        }))
    }

    private render(shortcut: Shortcuts.new_shortcut_entity): leaflet.Layer {
        let layer = leaflet.featureGroup()

        for (let action of shortcut.actions) {
            boxPolygon(action.interactive_area).setStyle({
                color: Constants.colors.shortcuts.interactive_area,
                fillColor: Constants.colors.shortcuts.interactive_area,
                interactive: false,
            }).addTo(layer)
        }

        leaflet.polygon(boxPolygon2(shortcut.clickable_area), {
            color: Constants.colors.shortcuts.clickable_area,
            fillColor: Constants.colors.shortcuts.clickable_area,
            interactive: false,
        }).addTo(layer)

        RenderingUtility.interactionMarker(Rectangle.center(shortcut.clickable_area, false), shortcut.actions[0].cursor)
            .addTo(layer)

        return layer
    }


    override getEvents(): { [p: string]: LeafletEventHandlerFn } {
        return {
            "zoomend": () => {},
            "moveend": () => {}
        }
    }
}

class ShortcutEditActionBar extends ActionBar {
    constructor(private layer: ShortcutEditGameLayer) {
        super([
            new ActionBar.ActionBarButton("assets/icons/cursor_open.png", 0, () => {
                return this.layer.interActionGuard.set(new DrawDoor({done_handler: (step) => {
                        // TODO: Add to list somehow, save locally
                    }}), this.layer)
            }),
        ]);
    }
}

export default class ShortcutEditBehaviour extends Behaviour {
    layer: ShortcutEditGameLayer

    constructor(public app: Application) {
        super();
    }

    protected begin() {
        this.layer = new ShortcutEditGameLayer([
            {type: "door", name: "Door", area: {topleft: {x: 3242, y: 3450}, botright: {x: 3243, y: 3450}, level: 0}, direction: "eastwest"}

        ])

        this.app.map.map.addGameLayer(this.layer)
    }

    protected end() {
        this.layer.remove()
    }
}