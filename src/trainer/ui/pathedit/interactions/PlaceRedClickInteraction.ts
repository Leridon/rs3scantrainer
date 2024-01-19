import {Path} from "lib/runescape/pathing";
import InteractionTopControl from "../../map/InteractionTopControl";
import SelectTileInteraction from "../../../../lib/gamemap/interaction/SelectTileInteraction";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import ContextMenu, {MenuEntry} from "../../widgets/ContextMenu";
import InteractionType = Path.InteractionType;
import {StepGraphics} from "../../pathing/PathGraphics";

export default class PlaceRedClickInteraction extends ValueInteraction<Path.step_redclick> {

    constructor(private interaction_type: InteractionType = null) {
        super({
            preview_render: (s) => new StepGraphics(s)
        });

        new SelectTileInteraction()
            .onCommit((t) => {
                    if (this.interaction_type != null) {
                        this.commit(Path.auto_describe({
                            type: "redclick",
                            description: "",
                            where: t,
                            how: this.interaction_type
                        }))
                    } else {

                        let menu = InteractionType.all().map((i): MenuEntry => {
                            return {
                                type: "basic",
                                text: i.description,
                                icon: i.icon_url,
                                handler: () => {
                                    this.commit(Path.auto_describe({
                                        type: "redclick",
                                        description: "",
                                        where: t,
                                        how: i.type
                                    }))
                                }
                            }
                        })

                        new ContextMenu(menu).show(this.getMap().container.get()[0], this.getMap().getClientPos(t))
                            .onCancel(() => this.cancel())
                    }
                }
            )
            .onPreview((t) =>
                this.preview(Path.auto_describe({
                        type: "redclick",
                        description: "",
                        where: t,
                        how: "generic"
                    })
                )
            )
            .addTo(this)

        let control = new InteractionTopControl({
            name: "Placing Redclick",
            cancel_handler: () => this.cancel()
        }).addTo(this)

        control.content.append(c().text("Click any tile to place the redclick activation."))
    }
}