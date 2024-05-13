import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {Process} from "../../../../lib/Process";
import {ClueReader} from "../cluereader/ClueReader";
import {PuzzleModal} from "../PuzzleModal";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import Widget from "../../../../lib/ui/Widget";
import {BigNisButton} from "../../widgets/BigNisButton";
import {ewent} from "../../../../lib/reactive";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {CapturedModal} from "../cluereader/capture/CapturedModal";
import {TowersReader} from "../cluereader/TowersReader";
import {Towers} from "../../../../lib/cluetheory/Towers";
import {mixColor} from "@alt1/base";
import {Vector2} from "../../../../lib/math";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {util} from "../../../../lib/util/util";
import A1Color = util.A1Color;


class TowersSolvingProcess extends Process {
  puzzle_closed = ewent<this>()

  solution_overlay = new OverlayGeometry()
  last_successful_read: number

  puzzle: Towers.PuzzleState
  isSolved: boolean = false

  constructor(private parent: TowersSolving) {
    super();

    this.last_successful_read = Date.now()

    this.asInterval(1000 / 20)
  }

  private debugOverlay(reader: TowersReader.TowersReader) {

    this.solution_overlay.clear()

    const hints = reader.getHints()

    hints.top.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: i, y: -1}, true),
      )
    })
    hints.bottom.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: i, y: 5}, true),
      )
    })
    hints.left.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: -1, y: i}, true),
      )
    })

    hints.right.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: 5, y: i}, true),
      )
    })

    this.solution_overlay.render()
  }

  async showSolutionOverlay(reader: TowersReader.TowersReader, currentState: Towers.PuzzleState, solution: Towers.PuzzleState, hidden_by_context_menu: ScreenRectangle = null) {
    this.solution_overlay.clear()

    const blocked_area = hidden_by_context_menu
      ? ScreenRectangle.extend(hidden_by_context_menu, {x: 7, y: 11})
      : null

    const blocked = (pos: Vector2): boolean => blocked_area && ScreenRectangle.contains(blocked_area, pos)

    const TR_OVERLAY_OFFSET = {x: 33, y: 10}
    const TL_OVERLAY_OFFSET = {x: 12, y: 10}

    let isSolved = true

    for (let y = 0; y < solution.blocks.rows.length; y++) {
      const row = solution.blocks.rows[y]
      for (let x = 0; x < row.length; x++) {

        const should = solution.blocks.rows[y][x]
        const is = currentState.blocks.rows[y][x] ?? 0

        const TR = Vector2.add(reader.tileOrigin({x, y}, true), TR_OVERLAY_OFFSET)
        const TL = Vector2.add(reader.tileOrigin({x, y}, true), TL_OVERLAY_OFFSET)

        const difference = (6 + should - is) % 6

        const correct = should == is

        isSolved &&= correct

        if (correct) {

          if (this.parent.settings.show_checkmark) {
            if (!blocked(TR)) {
              this.solution_overlay.text(
                "✓",
                TR, {
                  color: A1Color.fromHex("#41740e"),
                  width: 8
                }
              )
            }
          }
        } else {

          if (!blocked(TR)) {
            if (this.parent.settings.solution_mode == "target" || this.parent.settings.solution_mode == "both") {
              this.solution_overlay.text(
                should.toString(),
                TR, {
                  color: mixColor(200, 200, 200),
                  width: 10
                }
              )
            }
          }

          if (this.parent.settings.solution_mode == "delta" || this.parent.settings.solution_mode == "both") {
            const tr_taken = this.parent.settings.solution_mode == "both"

            const pos = tr_taken ? TL : TR

            if (!blocked(pos)) {
              this.solution_overlay.text(
                "+" + difference.toString(),
                pos, {
                  color: mixColor(200, 200, 200),
                  width: 10
                }
              )
            }
          }
        }
      }
    }

    if (isSolved) {
      this.solution_overlay.text(
        "Solved",
        Vector2.add(reader.tileOrigin({x: 2, y: 2}, true), {x: 21, y: 21}), {
          color: mixColor(0, 255, 0),
          width: 20
        }
      )

      const CHECK_RECTANGLE: ScreenRectangle = {origin: {x: 317, y: 243}, size: {x: 150, y: 25}}

      this.solution_overlay.rect2(
        ScreenRectangle.subRect(reader.modal.body.screenRectangle(), CHECK_RECTANGLE),
        {
          color: mixColor(0, 255, 0),
          width: 2,
        }
      )
    }

    this.solution_overlay.render()
  }

  async tick() {
    try {
      const capt = CapturedImage.capture(this.parent.lockbox.reader.modal.body.screenRectangle())

      if (!capt) return

      const capture = CapturedModal.assumeBody(capt)
      const reader = new TowersReader.TowersReader(capture)

      let puzzle = await reader.getPuzzle()

      const context_menu_area = await reader.findContextMenu()

      if (puzzle) {
        if (this.puzzle && context_menu_area) puzzle.blocks = Towers.Blocks.combine(puzzle.blocks, this.puzzle.blocks)

        this.puzzle = puzzle
      }

      if (this.puzzle) {
        const solution = Towers.solve(this.puzzle.hints)

        await this.showSolutionOverlay(reader, this.puzzle, solution, context_menu_area)
      }

      if (await reader.getState() == "likelyclosed") this.puzzleClosed()

    } catch (e) {
      console.error(e.toString())
    }
  }

  private puzzleClosed() {
    this.stop()
    this.puzzle_closed.trigger(this)
  }

  async implementation(): Promise<void> {
    this.puzzle = await this.parent.lockbox.reader.getPuzzle() // This should already be cached

    while (!this.should_stop) {
      await this.tick()

      await (this.checkTime())
    }

    this.solution_overlay?.clear()?.render()
  }
}

class TowersModal extends PuzzleModal {
  constructor(public parent: TowersSolving) {
    super(parent);

    this.title.set("Lockbox")
  }

  update() {
    this.body.empty().append(
      c()
        .css2({
          "max-width": "100%",
          "text-align": "center"
        })
        .append(
          Widget.wrap(
            this.parent.lockbox.reader.puzzle_area.getData().toImage()
          ).css("max-width", "100%")
        ),
      this.parent.process
        ? new BigNisButton("Reset", "neutral")
          .onClick(() => {
            this.parent.resetProcess(true)
          })
        : new BigNisButton("Show Solution", "confirm")
          .onClick(() => {
            this.parent.resetProcess(true)
          })
    )
  }

  render() {
    super.render()

    this.update()
  }
}

export class TowersSolving extends NeoSolvingSubBehaviour {
  public process: TowersSolvingProcess
  public modal: TowersModal

  constructor(parent: NeoSolvingBehaviour,
              public settings: TowersSolving.Settings,
              public lockbox: ClueReader.Result.Puzzle.Towers) {
    super(parent);
  }

  async resetProcess(start: boolean) {
    if (this.process) {
      this.process.stop()
      this.process = null
    }

    if (start) {
      this.process = new TowersSolvingProcess(this)
      this.process.puzzle_closed.on(() => this.stop())
      this.process.run()
    }

    this.modal.update()
  }

  protected begin() {
    this.modal = new TowersModal(this)

    this.modal.hidden.on(() => this.stop())

    this.modal.show()

    if (this.settings.autostart) this.resetProcess(true)
  }

  protected end() {
    this.resetProcess(false)
    this.modal.remove()
  }

  pausesClueReader(): boolean {
    return !this.process?.isSolved
  }
}

export namespace TowersSolving {
  export type Settings = {
    autostart: boolean,
    solution_mode: "target" | "delta" | "both",
    show_checkmark: boolean,
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      autostart: true,
      solution_mode: "delta",
      show_checkmark: true,
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return DEFAULT

      if (![true, false].includes(settings.autostart)) settings.autostart = DEFAULT.autostart
      if (!["target", "delta", "both"].includes(settings.solution_mode)) settings.solution_mode = DEFAULT.solution_mode
      if (![true, false].includes(settings.show_checkmark)) settings.show_checkmark = DEFAULT.show_checkmark

      return settings
    }
  }
}