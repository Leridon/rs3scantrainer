import Widget from "../../../lib/ui/Widget";
import Button from "../../../lib/ui/controls/Button";
import InteractionLayer from "../../../lib/gamemap/interaction/InteractionLayer";


export class ActionBar extends Widget {
    constructor(buttons: ActionBar.ActionBarButton[]) {
        super($("<div style='display: flex'></div>"));

        buttons.forEach(b => b.appendTo(this))
    }
}

export namespace ActionBar {
    export class ActionBarButton extends Button {
        private _activeInteraction: InteractionLayer = null

        constructor(private icon: string,
                    private cooldown: number = 0,
                    private activation: () => InteractionLayer | void) {
            super();

            this.on("click", () => {
                if (this._activeInteraction) this._activeInteraction.cancel()
                else {
                    let activated = this.activation()

                    if (activated instanceof InteractionLayer) {
                        this._activeInteraction = activated

                        activated.onEnd(() => {
                            this._activeInteraction = null
                            this.render()
                        })

                        this.render()
                    }
                }
            })

            this.render()
        }

        private render() {
            this.empty()

            this.addClass("medium-image-button")
                .append($(`<img src='${this.icon}'>`))

            if (this.cooldown != 0) {
                this.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>")
                    .text(this.cooldown > 0 ? this.cooldown + "t" : ""))
            }

            if (this._activeInteraction) {
                // TODO: Render X
            }
        }
    }

}