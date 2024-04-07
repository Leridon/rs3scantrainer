import {Sliders} from "./puzzles/Sliders";
import {Rectangle, Transform, Vector2} from "../../../lib/math";
import * as a1lib from "@alt1/base";
import {mixColor} from "@alt1/base";
import {delay} from "../../../oldlib";
import {OverlayGeometry} from "../../../lib/util/OverlayGeometry";
import {SlideReader} from "./cluereader/SliderReader";
import {C} from "../../../lib/ui/constructors";
import {PuzzleModal} from "./PuzzleModal";
import ButtonRow from "../../../lib/ui/ButtonRow";
import {BigNisButton} from "../widgets/BigNisButton";
import {deps} from "../../dependencies";
import * as lodash from "lodash";
import {findLastIndex} from "lodash";
import {ewent} from "../../../lib/reactive";
import {util} from "../../../lib/util/util";
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

  private progress_overlay: OverlayGeometry = null
  private solving_overlay: OverlayGeometry = null
  private move_overlay: OverlayGeometry = null

  private current_mainline_index: number | null = null

  private last_frame_state: SliderState = null

  private interface_closed_event = ewent<this>()

  constructor(private parent: SliderModal, private settings: SlideGuider.Settings) {
    this.puzzle = parent.puzzle.puzzle
  }

  onInterfaceClosed(f: () => void): this {
    this.interface_closed_event.on(f)

    return this
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

    const rect = this.parent.puzzle.ui.rect

    const img = a1lib.captureHold(
      Rectangle.screenOrigin(rect).x,
      Rectangle.screenOrigin(rect).y,
      290,
      290
    )

    const read = await SlideReader.read(img,
      Rectangle.screenOrigin(rect),
      this.puzzle.theme
    )

    return {
      result: read,
      state: SliderPuzzle.getState(read)
    }
  }

  private updateProgressOverlay() {

    if (!this.progress_overlay) {
      this.progress_overlay = over()
    }

    this.progress_overlay.clear()

    const length = this.solution?.length ?? this.solver?.getBest()?.length ?? 120
    const progress = this.solution ? this.current_mainline_index / this.solution.length : 0

    this.progress_overlay.progressbar(Vector2.add(
      Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
      {x: 137, y: -20}
    ), 2 * length, progress, 5)

    this.progress_overlay.freeze()
    this.progress_overlay.hide()
    this.progress_overlay.show()
    this.progress_overlay.unfreeze()
  }

  private updateMoveOverlay() {
    if (this.move_overlay) {
      this.move_overlay.hide()
      this.move_overlay = null
    }

    if (!this.solution) return
    if (this.current_mainline_index == null) return;

    this.move_overlay = over()

    const LOOKAHEAD = this.settings.max_lookahead

    let moves = []

    if (this.error_recovery_solution?.sequence) {
      moves.push(...this.error_recovery_solution.sequence)
    }

    moves.push(...this.solution.slice(this.current_mainline_index, this.current_mainline_index + LOOKAHEAD))

    // TODO: Prevent overlap

    const marker_geometry = over().withTime(20000)

    let current_blank = SliderState.blank(this.last_frame_state)
    let last_size = 0

    const recovery_length = this.error_recovery_solution?.sequence?.length ?? 0

    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i]
      const is_recovery_move = i < recovery_length
      const as_key = (this.settings.mode == "keyboard" || this.settings.mode == "hybrid") && Move.isSmallStep(move.move)

      const size = is_recovery_move ? 10 : 20 * (1 - (1 / LOOKAHEAD) * (i - recovery_length))

      const clicked_tile_center = this.posToScreen(move.clicked_tile)

      const STROKE = 3
      const CONTRAST_BORDER = 2
      const CONTRAST_COLOR = mixColor(1, 1, 1)

      if (as_key) {
        const rotation = (() => {
          switch (move.move) {
            case 1:
              return 2
            case -5:
              return 1
            case -1:
              return 0
            case 5:
              return 3
          }
        })()

        const ARROW_SHAFT_SIZE = size / 3

        const points: Vector2[] = [
          {x: -size, y: -ARROW_SHAFT_SIZE},
          {x: 0, y: -ARROW_SHAFT_SIZE},

          {x: 0, y: -size},
          {x: size, y: 0},
          {x: 0, y: size},

          {x: 0, y: ARROW_SHAFT_SIZE},
          {x: -size, y: ARROW_SHAFT_SIZE},
        ].map(p => Vector2.transform_point(
            p,
            Transform.chain(
              Transform.translation(clicked_tile_center),
              Transform.rotation(rotation),
            )
          )
        )

        marker_geometry.polyline(points, true, {width: STROKE + 2 * CONTRAST_BORDER, color: CONTRAST_COLOR})
        marker_geometry.polyline(points, true, {
            width: STROKE,
            color: is_recovery_move
              ? this.settings.color_recovery_move
              : this.settings.color_mainline_move
          }
        )

      } else {
        marker_geometry.rect(
          Rectangle.centeredOn(this.posToScreen(move.clicked_tile), size + CONTRAST_BORDER),
          {width: STROKE + 2 * CONTRAST_BORDER, color: mixColor(1, 1, 1)}
        )

        marker_geometry.rect(
          Rectangle.centeredOn(this.posToScreen(move.clicked_tile), size),
          {width: STROKE, color: is_recovery_move ? this.settings.color_recovery_move : this.settings.color_mainline_move}
        )
      }

      const blank = move.clicked_tile

      const a = this.posToScreen(current_blank)
      const b = this.posToScreen(blank)

      const dir = Vector2.normalize(Vector2.sub(b, a))

      this.move_overlay.line(
        Vector2.add(a, Vector2.scale(last_size, dir)),
        Vector2.add(b, Vector2.scale(-size, dir)),
        {
          width: 2,
          color: is_recovery_move
            ? this.settings.color_recovery_line
            : this.settings.color_mainline_line
        }
      )

      current_blank = blank

      last_size = size
    }

    this.move_overlay.add(marker_geometry)

    this.move_overlay.show()

    this.updateProgressOverlay()
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
            {x: 143, y: 133}
          ),
        )

      this.solving_overlay.progressbar(Vector2.add(
        Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
        {x: 143, y: 153},
      ), 100, this.solver.getProgress(), 5)

      this.solving_overlay.show()
    }
  }

  async run() {
    while (!this.should_stop) {
      const read_result = await this.read()

      const UNCERTAINTY_CLOSE_FACTOR = 100 // Fairly conservative estimate. In testing, factors were around 1000

      const closed_factor = read_result.result.match_uncertainty / this.puzzle.match_uncertainty

      if (closed_factor > UNCERTAINTY_CLOSE_FACTOR) {
        this.interface_closed_event.trigger(this)
        this.stop()
        break
      }

      const frame_state = read_result.state

      if (!this.solution) {
        await new Promise<void>(async (resolve) => {
          this.solver = SlideSolver.skillbertRandom(frame_state)
            .setCombineStraights(this.settings.mode == "mouse" || this.settings.mode == "hybrid")
            .onUpdate(solver => {
              if (this.should_stop) resolve()

              if (solver.isFinished()) resolve()

              this.updateSolvingOverlay()
              this.updateProgressOverlay()
            })

          await this.solver.solve(2000)

          this.current_mainline_index = 0
          this.error_recovery_solution = {sequence: [], recovering_to_mainline_index: 0}

          resolve()
        })

        this.updateSolvingOverlay()

        this.solution = Sliders.MoveList.annotate(frame_state, this.solver.getBest(), this.settings.mode != "keyboard")
        this.solver = null

        this.updateSolvingOverlay()

        continue
      }

      await delay(10)

      // Early exit if state has not changed
      if (this.last_frame_state && SliderState.equals(this.last_frame_state, frame_state)) continue

      let mainline_index = findLastIndex(this.solution, a => a.pre_states.some(s => SliderState.equals(s, frame_state)))

      if (mainline_index >= 0) {

        // pre_states also includes all states that can be reached from the target state.
        // This causes a bug where a wrong mainline index is inferred
        // This case is fixed with the following hack
        /*if (mainline_index < this.solution.length - 1 && SliderState.equals(frame_state, this.solution[mainline_index + 1].post_state)) {
          mainline_index += 2
        }*/

        this.current_mainline_index = mainline_index
        this.error_recovery_solution = {sequence: [], recovering_to_mainline_index: mainline_index}
      } else {
        let recovery_index = this.error_recovery_solution.sequence.findIndex(a => a.pre_states.some(s => SliderState.equals(s, frame_state)))

        if (recovery_index >= 0) {
          // Prune the recovery sequence to just contain the remaining steps
          this.error_recovery_solution.sequence = this.error_recovery_solution.sequence.slice(recovery_index)

          this.current_mainline_index = this.error_recovery_solution.recovering_to_mainline_index
        } else {
          // The current state was not found in the recovery sequence

          let recovery_move: Move | null = null

          for (let target of (this.getLastKnownMove()?.pre_states ?? [])) {
            recovery_move = SliderState.findMove(frame_state, target)
            if (recovery_move) break
          }

          if (recovery_move != null) {
            // Add recovery move to sequence
            this.error_recovery_solution.sequence.splice(0, 0,
              ...MoveList.annotate(frame_state, [recovery_move], this.settings.mode != "keyboard"))

            this.current_mainline_index = this.error_recovery_solution.recovering_to_mainline_index
          } else {
            // Lost track. Start reset countdown or something

            this.current_mainline_index = null
          }
        }
      }

      this.last_frame_state = frame_state

      this.updateMoveOverlay()
    }

    this.solution = null

    this.move_overlay?.hide()
    this.solving_overlay?.hide()
    this.progress_overlay?.hide()
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
      this.process = new SliderGuideProcess(this, deps().app.settings.settings.solving.puzzles.sliders)
        .onInterfaceClosed(() => {
          this.abort()
        })

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
    const autostart = deps().app.settings.settings.solving.puzzles.sliders.autostart
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

export namespace SlideGuider {
  export type Settings = {
    mode: "keyboard" | "mouse" | "hybrid",
    autostart: boolean,
    max_lookahead: number,
    prevent_overlap: boolean,
    display_recovery: boolean,
    color_mainline_move: number,
    color_mainline_line: number,
    color_recovery_move: number,
    color_recovery_line: number,
  }

  export namespace Settings {
    import A1Color = util.A1Color;
    export const DEFAULT: Settings = {
      mode: "mouse",
      autostart: true,
      max_lookahead: 5,
      prevent_overlap: true,
      display_recovery: true,
      color_mainline_move: A1Color.fromHex("#5ca000"),
      color_mainline_line: A1Color.fromHex("#41740e"),
      color_recovery_move: mixColor(255, 0, 0),
      color_recovery_line: mixColor(255, 255, 0),
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return lodash.cloneDeep(DEFAULT)

      if (!["keyboard", "mouse", "hybrid"].includes(settings.mode)) settings.mode = DEFAULT.mode
      if (![true, false].includes(settings.autostart)) settings.autostart = DEFAULT.autostart
      if (typeof settings.max_lookahead != "number") settings.max_lookahead = DEFAULT.max_lookahead
      if (![true, false].includes(settings.prevent_overlap)) settings.prevent_overlap = DEFAULT.prevent_overlap
      if (![true, false].includes(settings.display_recovery)) settings.display_recovery = DEFAULT.display_recovery
      if (![true, false].includes(settings.display_recovery)) settings.display_recovery = DEFAULT.display_recovery
      if ((typeof settings.color_mainline_move) != "number") settings.color_mainline_move = DEFAULT.color_mainline_move
      if ((typeof settings.color_mainline_line) != "number") settings.color_mainline_line = DEFAULT.color_mainline_line
      if ((typeof settings.color_recovery_move) != "number") settings.color_recovery_move = DEFAULT.color_recovery_move
      if ((typeof settings.color_recovery_line) != "number") settings.color_recovery_line = DEFAULT.color_recovery_line

      return settings
    }
  }
}