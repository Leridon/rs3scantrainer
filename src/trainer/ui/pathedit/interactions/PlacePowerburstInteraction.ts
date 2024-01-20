import {Path} from "lib/runescape/pathing";
import InteractionTopControl from "../../map/InteractionTopControl";
import SelectTileInteraction from "../../../../lib/gamemap/interaction/SelectTileInteraction";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import {StepGraphics} from "../../pathing/PathGraphics";

export default class PlacePowerburstInteraction extends ValueInteraction<Path.step_powerburst> {

    constructor() {
        super({
            preview_render: (s) => new StepGraphics(s)
        });

        new SelectTileInteraction()
            .onCommit((t) => this.commit(({
                type: "powerburst",
                description: "",
                where: t
            })))
            .onPreview((t) =>
                this.preview(({
                        type: "powerburst",
                        description: "",
                        where: t
                    })
                )
            )
            .addTo(this)

        let control = new InteractionTopControl({
            name: "Placing Powerburst",
            cancel_handler: () => this.cancel()
        }).addTo(this)

        control.content.append(c().text("Click any tile to place the powerburst activation."))
    }
}