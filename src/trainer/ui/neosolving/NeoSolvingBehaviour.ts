import Behaviour from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import GameLayer from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {C} from "../../../lib/ui/constructors";
import Widget from "../../../lib/ui/Widget";
import Button from "../../../lib/ui/controls/Button";

class NeoSolvingLayer extends GameLayer {
    constructor() {
        super();

        let sidebar = new GameMapControl({
            position: "top-left",
            type: "floating",
            no_default_styling: true
        }, c().addClass("ctr-neosolving-sidebar")).addTo(this)

        sidebar.content.append(
            new NeoSolvinglayer.MainControlBar(),
            c().text("I am another test thing")
        )
    }
}

namespace NeoSolvinglayer {
    import spacer = C.spacer;
    import span = C.span;

    class MainControlButton extends Button {
        constructor(options: { icon?: string, text?: string }) {
            super();

            if (options.icon) {
                this.append(c(`<img src="${options.icon}" class="ctr-neosolving-main-bar-icon">`))
            }

            if (options.text) {
                this.append(span(options.text))
                this.append(spacer())
                this.css("flex-grow", "1")
            }

            this.addClass("ctr-neosolving-main-bar-button")
        }
    }

    export class MainControlBar extends Widget {
        constructor() {
            super();

            this.addClass("ctr-neosolving-main-bar")

            this.append(
                c("<div><img src='assets/icons/glass.png' class='ctr-neosolving-main-bar-icon'></div>"),
                new MainControlButton({text: "Solve"}),
                new MainControlButton({icon: "assets/icons/lock.png", text: "Auto"})
                    .setToggleable(true),
                new MainControlButton({icon: "assets/icons/fullscreen.png"})
                    .setToggleable(true),
                new MainControlButton({icon: "assets/icons/settings.png"}),
            )

        }
    }
}

export default class NeoSolvingBehaviour extends Behaviour {
    layer: NeoSolvingLayer

    constructor(private app: Application) {
        super();
    }

    protected begin() {
        this.app.map.addGameLayer(this.layer = new NeoSolvingLayer())
    }

    protected end() {
        this.layer.remove()
    }
}