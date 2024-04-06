import {Sliders} from "./puzzles/Sliders";
import {Rectangle, Vector2} from "../../../lib/math";
import * as a1lib from "@alt1/base";
import {mixColor} from "@alt1/base";
import {delay} from "../../../oldlib";
import {OverlayGeometry} from "../../../lib/util/OverlayGeometry";
import {SlideReader} from "./cluereader/SliderReader";
import {C} from "../../../lib/ui/constructors";
import {PuzzleModal} from "./PuzzleModal";
import ButtonRow from "../../../lib/ui/ButtonRow";
import {BigNisButton} from "../widgets/BigNisButton";
import over = OverlayGeometry.over;
import SliderState = Sliders.SliderState;
import SliderPuzzle = Sliders.SliderPuzzle;
import SlideSolver = Sliders.SlideSolver;
import AnnotatedMoveList = Sliders.AnnotatedMoveList;

class SliderGuideProcess {
  private puzzle: SliderPuzzle
  private should_stop: boolean = false

  private solver: SlideSolver = null
  private solution: AnnotatedMoveList = null

  private solving_overlay: OverlayGeometry = null
  private move_overlay: OverlayGeometry = null

  private current_move_index: number = null

  constructor(private parent: SliderModal) {
    this.puzzle = parent.puzzle.puzzle
  }

  private posToScreen(pos: number): Vector2 {
    return Vector2.add(
      Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
      {x: 25, y: 25},
      {x: (pos % 5) * 56, y: Math.floor(pos / 5) * 56}
    )
  }

  private async read(): Promise<SliderState> {
    return SliderPuzzle.getState(
      await SlideReader.read(a1lib.captureHoldFullRs(), Rectangle.screenOrigin(this.parent.puzzle.ui.rect), this.puzzle.theme)
    )
  }

  private updateMoveOverlay() {
    if (this.move_overlay) {
      this.move_overlay.hide()
      this.move_overlay = null
    }

    if (!this.solution) return
    if (this.current_move_index < 0) return;

    this.move_overlay = over()

    for (let i = 0; i < 4 && i + this.current_move_index < this.solution.length; ++i) {
      const move = this.solution[this.current_move_index + i]

      this.move_overlay.rect(
        Rectangle.centeredOn(this.posToScreen(move.clicked_tile),
          20 - 3 * i
        ),
        {width: 3, color: mixColor(255, 0, 0)}
      )
    }

    this.move_overlay.show(20000)
  }

  private updateSolvingOverlay() {
    if (this.solving_overlay) {
      this.solving_overlay.hide()
      this.solving_overlay = null
    }

    if (this.solver) {
      this.solving_overlay = over()
        .text("Solving",
          Vector2.add(
            Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
            {x: 143, y: 143}
          ),
        )

      const start = Vector2.add(
        Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
        {x: 93, y: 163},
      )

      const end = Vector2.add(start, {x: 100, y: 0})
      const mid = Vector2.snap(Vector2.add(start, {x: this.solver.getProgress() * 100, y: 0}))

      this.solving_overlay.line(start, mid, {color: mixColor(0, 255, 0), width: 5})
      this.solving_overlay.line(mid, end, {color: mixColor(255, 0, 0), width: 5})

      this.solving_overlay.show(3000)
    }
  }

  async run() {
    let last_move_index = null

    while (!this.should_stop) {
      const frame_state = await this.read()

      if (!this.solution) {
        await new Promise<void>(async (resolve) => {
          this.solver = SlideSolver.skillbertRandom(frame_state)
            .onUpdate(solver => {
              if (this.should_stop) resolve()

              if (solver.isFinished()) resolve()

              this.updateSolvingOverlay()
            })

          await this.solver.solve(1000)

          resolve()
        })

        this.updateSolvingOverlay()

        this.solution = Sliders.MoveList.annotate(Sliders.SliderPuzzle.getState(this.puzzle), this.solver.getBest(true))
        this.solver = null

        this.updateSolvingOverlay()

        continue
      }

      await delay(20)

      this.current_move_index = this.solution.findIndex(a => a.pre_states.some(s => SliderState.equals(s, frame_state)))

      // TODO: Error recovery if index < 0

      if (this.current_move_index != last_move_index) this.updateMoveOverlay()

      last_move_index = this.current_move_index
    }

    this.solution = null

    this.updateMoveOverlay()
  }

  stop() {
    this.should_stop = true
  }
}

export class SliderModal extends PuzzleModal {
  private process: SliderGuideProcess = null

  constructor(public readonly puzzle: PuzzleModal.Slider) {
    super(puzzle);

    this.title.set("Slider")
  }

  private resetProcess(start: boolean) {
    if (this.process) {
      this.process.stop()
      this.process = null
    }

    if (start) {
      this.process = new SliderGuideProcess(this)
      this.process.run()
    }
  }

  protected begin(): void {
    const autostart = false

    if (autostart) this.resetProcess(true)
  }

  protected end(): void {

  }

  start_button: BigNisButton
  reset_button: BigNisButton
  stop_button: BigNisButton

  render() {
    super.render();

    C.img(SlideReader.getThemeImageUrl(this.puzzle.puzzle.theme))
      .appendTo(C.div().css("text-align", "center").appendTo(this.body))

    this.body.append(new ButtonRow()
      .buttons(
        this.start_button = new BigNisButton("Start", "confirm")
          .onClick(() => this.resetProcess(true)),
        this.reset_button = new BigNisButton("Reset", "neutral")
          .onClick(() => this.resetProcess(true)),
        this.stop_button = new BigNisButton("Stop", "cancel")
          .onClick(() => this.resetProcess(false)),
      )
    )
  }
}