import {Path} from "../../../../lib/runescape/pathing";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import {PathStepEntity} from "../../map/entities/PathStepEntity";
import {SelectTileInteraction} from "../../../../lib/gamemap/interaction/SelectTileInteraction";
import InteractionTopControl from "../../map/InteractionTopControl";


export class DrawCosmeticInteraction extends ValueInteraction<Path.step_cosmetic> {
  constructor(private icon: string) {
    super({
      preview_render: step => new PathStepEntity(step).setInteractive(false)
    });

    this.attachTopControl(new InteractionTopControl({name: "Place Path Annotation"}).setContent(
      c("<div style='font-family: monospace; white-space:pre'></div>")
        .append(c().text(`Hold [Shift] to disable snapping`))
    ))

    new SelectTileInteraction({}, "optional").addTo(this)
      .onChange(v => {
        const t: Path.step_cosmetic = {
          type: "cosmetic",
          position: v.value,
          icon: this.icon
        }

        if (v.committed) this.commit(t)
        else this.preview(t)
      })
  }
}