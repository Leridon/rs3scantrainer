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
import MoveList = Sliders.MoveList;
import Move = Sliders.Move;

class SliderGuideProcess {
  private puzzle: SliderPuzzle
  private should_stop: boolean = false

  private solver: SlideSolver = null

  private error_recovery_solution: {
    sequence: AnnotatedMoveList,
    recovering_to_mainline_index: number
  } = null

  private solution: AnnotatedMoveList = null

  private solving_overlay: OverlayGeometry = null
  private move_overlay: OverlayGeometry = null

  private current_mainline_index: number | null = null

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

  private async read(): Promise<{
    result: SlideReader.ReadResult,
    state: SliderState
  }> {
    const read = await SlideReader.read(a1lib.captureHoldFullRs(),
      Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
      this.puzzle.theme
    )

    return {
      result: read,
      state: SliderPuzzle.getState(read.puzzle)
    }
  }

  private updateMoveOverlay() {
    if (this.move_overlay) {
      this.move_overlay.hide()
      this.move_overlay = null
    }

    if (!this.solution) return
    if (this.current_mainline_index == null) return;

    this.move_overlay = over()

    const LOOKAHEAD = 5

    let moves = this.error_recovery_solution?.sequence ?? []

    if (moves.length < LOOKAHEAD) {
      moves.push(...this.solution.slice(this.current_mainline_index, this.current_mainline_index + (LOOKAHEAD - moves.length)))
    } else if (moves.length > LOOKAHEAD) {
      moves = moves.slice(0, LOOKAHEAD)
    }

    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i]

      this.move_overlay.rect(
        Rectangle.centeredOn(this.posToScreen(move.clicked_tile),
          20 - 4 * i
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

    let last_frame_state: SliderState = null

    while (!this.should_stop) {
      const read_result = await this.read()

      // TODO: Do something if the confidence in the read theme is low. That means likely the interface was closed

      const frame_state = read_result.state

      if (!this.solution) {
        await new Promise<void>(async (resolve) => {
          this.solver = SlideSolver.skillbertRandom(frame_state)
            .onUpdate(solver => {
              if (this.should_stop) resolve()

              if (solver.isFinished()) resolve()

              this.updateSolvingOverlay()
            })

          await this.solver.solve(1000)

          this.current_mainline_index = 0
          this.error_recovery_solution = {sequence: [], recovering_to_mainline_index: 0}

          resolve()
        })

        this.updateSolvingOverlay()

        this.solution = Sliders.MoveList.annotate(frame_state, this.solver.getBest(true))
        this.solver = null

        this.updateSolvingOverlay()

        continue
      }

      await delay(20)

      // Early exit if state has not changed
      if (last_frame_state && SliderState.equals(last_frame_state, frame_state)) continue

      let mainline_index = this.solution.findIndex(a => a.pre_states.some(s => SliderState.equals(s, frame_state)))

      if (mainline_index >= 0) {

        // pre_states also includes all states that can be reached from the target state.
        // This causes a bug where a wrong mainline index is inferred
        // This case is fixed with the following hack
        if (mainline_index < this.solution.length - 1 && SliderState.equals(frame_state, this.solution[mainline_index + 1].post_state)) {
          mainline_index += 2
        }

        this.current_mainline_index = mainline_index
        this.error_recovery_solution = {sequence: [], recovering_to_mainline_index: mainline_index}
      } else {
        let recovery_index = this.error_recovery_solution.sequence.findIndex(a => a.pre_states.some(s => SliderState.equals(s, frame_state)))

        if (recovery_index >= 0) {
          // Prune the recovery sequence to just contain the remaining steps
          this.error_recovery_solution.sequence = this.error_recovery_solution.sequence.slice(recovery_index)

          this.current_mainline_index = this.error_recovery_solution.recovering_to_mainline_index
        } else {
          // The current state was not found in either the mainline nor in the recovery sequence

          let recovery_move: Move | null = null

          for (let target of this.getLastKnownMove().pre_states) {
            recovery_move = SliderState.findMove(frame_state, target)
            if (recovery_move) break
          }

          if (recovery_move != null) {
            // Add recovery move to sequence
            this.error_recovery_solution.sequence.splice(0, 0,
              ...MoveList.annotate(frame_state, [recovery_move]))

            this.current_mainline_index = this.error_recovery_solution.recovering_to_mainline_index
          } else {
            // Lost track. Start reset countdown or something

            this.current_mainline_index = null
          }
        }
      }

      this.updateMoveOverlay()

      last_frame_state = frame_state
    }

    this.solution = null

    this.updateMoveOverlay()
  }

  private getLastKnownMove() {
    return this.error_recovery_solution?.sequence?.[0] ?? this.solution[this.current_mainline_index]
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

    this.updateButtonsState()
  }

  private updateButtonsState() {
    this.reset_button.setVisible(!!this.process)
    this.start_button.setVisible(!this.process)
    this.stop_button.setEnabled(!!this.process)
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

    this.updateButtonsState()
  }
}