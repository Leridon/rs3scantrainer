import Widget from "lib/ui/Widget";
import Button from "lib/ui/controls/Button";
import InteractionLayer from "lib/gamemap/interaction/InteractionLayer";
import {Observable, observe} from "lib/reactive";
import {C} from "../../../lib/ui/constructors";


export class ActionBar extends Widget {
    constructor(buttons: ActionBar.ActionBarButton[]) {
        super();

        this.addClass("ctr-actionbar")

        this.append(...buttons)
    }
}

export namespace ActionBar {
    export class ActionBarButton extends Button {
        private _activeInteraction: Observable<InteractionLayer> = observe(null)
        public cooldown = observe(0)

        constructor(private icon: string,
                    private activation: (_: JQuery.ClickEvent) => Promise<InteractionLayer> | InteractionLayer | any) {
            super();

            this._activeInteraction.subscribe((i) => {
                this.render()

                if (i) i.onEnd(() => this._activeInteraction.set(null))
            })

            this.on("click", async (e) => {
                if (this._activeInteraction.value()) this._activeInteraction.value().cancel()
                else {
                    let activated = await this.activation(e)

                    if (activated instanceof InteractionLayer) this._activeInteraction.set(activated)
                }
            })

            this.render()
        }

        private render() {
            this.empty()

            this.addClass("medium-image-button")
                .append($(`<img src='${this.icon}'>`))

            if (this.cooldown.value() != 0 || this._activeInteraction.value()) {
                this.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>")
                    .text(this.cooldown.value() > 0 ? this.cooldown.value() + "t" : ""))
            }

            if (this._activeInteraction.value()) {
                this.css("position", "relative").append(c("<div class='ctr-actionbar-cancel-overlay'></div>")
                    .text("X"))
            }
        }
    }

}