import {Path} from "lib/runescape/pathing";
import InteractionTopControl from "../../map/InteractionTopControl";
import SelectTileInteraction from "../../../../lib/gamemap/interaction/SelectTileInteraction";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import ContextMenu, {MenuEntry} from "../../widgets/ContextMenu";
import {PathStepEntity} from "../../pathing/PathStepEntity";
import { CursorType } from "lib/runescape/CursorType";

export default class PlaceRedClickInteraction extends ValueInteraction<Path.step_redclick> {

    constructor(private interaction_type: CursorType = null) {
        super({
            preview_render: (s) => new PathStepEntity({step: s, interactive:false})
        });

        new SelectTileInteraction()
            .onCommit((t) => {
                    if (this.interaction_type != null) {
                        this.commit(({
                            type: "redclick",
                            target:  CursorType.defaultEntity(this.interaction_type),
                            where: t,
                            how: this.interaction_type
                        }))
                    } else {

                        let menu = CursorType.all().map((i): MenuEntry => {
                            return {
                                type: "basic",
                                text: i.description,
                                icon: i.icon_url,
                                handler: () => {
                                    this.commit(({
                                        type: "redclick",
                                        target:  CursorType.defaultEntity(i.type),
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
                this.preview(({
                        type: "redclick",
                        target: {kind: "static", name: "Entity"},
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