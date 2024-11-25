import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {Clues} from "../../../../lib/runescape/clues";
import {CapturedScan} from "../cluereader/capture/CapturedScan";
import {Scans} from "../../../../lib/runescape/clues/scans";
import {deps} from "../../../dependencies";
import {ScanSolving} from "./ScanSolving";
import ScanMinimapOverlay = ScanSolving.ScanMinimapOverlay;
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {TileRectangle} from "../../../../lib/runescape/coordinates";

export class SimpleScanSolving extends NeoSolvingSubBehaviour {
  settings: ScanSolving.Settings
  private minimap_overlay: ScanMinimapOverlay

  constructor(parent: NeoSolvingBehaviour,
              private clue: Clues.Scan,
              private original_interface_capture: CapturedScan
  ) {
    super(parent, "clue");

    this.settings = deps().app.settings.settings.solving.scans

    if (this.settings.show_minimap_overlay_simple && this.original_interface_capture) {
      this.minimap_overlay = this.withSub(new ScanMinimapOverlay(this.parent.app.minimapreader).setRange(Scans.range(clue, this.original_interface_capture.hasMeerkats())))
    }
  }

  protected begin() {
    this.registerSolution(
      TileArea.fromRect(
        TileRectangle.extend(TileRectangle.from(...this.clue.spots), 1)
      )
    )
  }

  protected end() {
  }
}