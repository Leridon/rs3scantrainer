import {SimpleScanSolving} from "./SimpleScanSolving";
import {ScanTreeSolving} from "./ScanTreeSolving";
import * as lodash from "lodash";
import Behaviour from "../../../../lib/ui/Behaviour";
import {AbstractCaptureService, CaptureInterval} from "../../../../lib/alt1/capture";
import {MinimapReader} from "../../../../lib/alt1/readers/MinimapReader";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {Transform, Vector2} from "../../../../lib/math";
import {util} from "../../../../lib/util/util";

export namespace ScanSolving {

  import over = OverlayGeometry.over;
  import A1Color = util.A1Color;

  export class ScanMinimapOverlay extends Behaviour {
    private minimap_interest: AbstractCaptureService.InterestToken<AbstractCaptureService.Options, MinimapReader.CapturedMinimap>
    private minimap_overlay: OverlayGeometry = over()
    private range: number = 10

    private last_known_ppt = null

    constructor(private minimapreader: MinimapReader) {
      super()
    }

    protected begin() {
      this.lifetime_manager.bind(
        this.minimap_interest = this.minimapreader.subscribe({
          options: (time: AbstractCaptureService.CaptureTime) => ({
            interval: CaptureInterval.fromApproximateInterval(100),
            refind_interval: CaptureInterval.fromApproximateInterval(10_000)
          }),
          handle: (value: AbstractCaptureService.TimedValue<MinimapReader.CapturedMinimap>) => {
            const minimap = value.value

            this.minimap_overlay.clear()


            if (value.value) {
              this.last_known_ppt = value.value.pixelPerTile() ?? this.last_known_ppt

              // If there's no known pixels per tile value, abort
              if(this.last_known_ppt == null) return

              const scale = (this.range * 2 + 1) * this.last_known_ppt / 2

              const transform =
                Transform.chain(
                  Transform.translation(minimap.center()),
                  Transform.rotationRadians(-minimap.compassAngle.get()),
                  Transform.scale({x: scale, y: scale}),
                )

              const unit_square: Vector2[] = [
                {x: 1, y: 1},
                {x: 1, y: -1},
                {x: -1, y: -1},
                {x: -1, y: 1},
              ]

              this.minimap_overlay.polyline(
                unit_square.map(v => Vector2.transform_point(v, transform)),
                true, {
                  color: A1Color.fromHex("#FFFFFF")
                }
              )
            }

            this.minimap_overlay.render()
          }
        }),
      )
    }

    protected end() {
      this.minimap_overlay?.clear()?.render()
    }

    setRange(range: number): this {
      this.range = range
      return this
    }
  }

  export type Simple = SimpleScanSolving
  export type ScanTree = ScanTreeSolving

  export type Settings = {
    show_minimap_overlay_scantree: boolean,
    show_minimap_overlay_simple: boolean,
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      show_minimap_overlay_scantree: true,
      show_minimap_overlay_simple: true
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return lodash.cloneDeep(DEFAULT)

      if (![true, false].includes(settings.show_minimap_overlay_scantree)) settings.show_minimap_overlay_scantree = DEFAULT.show_minimap_overlay_scantree
      if (![true, false].includes(settings.show_minimap_overlay_simple)) settings.show_minimap_overlay_simple = DEFAULT.show_minimap_overlay_simple

      return settings
    }
  }
}