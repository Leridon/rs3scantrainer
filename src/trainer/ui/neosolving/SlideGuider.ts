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
import {AnchorImages} from "./cluereader/AnchorImages";
import over = OverlayGeometry.over;
import SliderState = Sliders.SliderState;
import SliderPuzzle = Sliders.SliderPuzzle;
import SlideSolver = Sliders.SlideSolver;
import AnnotatedMoveList = Sliders.AnnotatedMoveList;
import MoveList = Sliders.MoveList;
import Move = Sliders.Move;
import getAnchorImages = AnchorImages.getAnchorImages;
import {TileRectangle} from "../../../lib/runescape/coordinates";
import {Process} from "../../../lib/Process";

class SliderGuideProcess extends Process {
  private guiding_start_time = -1
  private solved_time = -1

  private puzzle: SliderPuzzle

  private solver: {
    solver: SlideSolver,
    solving_from: number
  } = null

  private error_recovery_solution: {
    sequence: AnnotatedMoveList,
    recovering_to_mainline_index: number
  } = null

  private solution: AnnotatedMoveList = null

  private progress_overlay: OverlayGeometry = null
  private solving_overlay: OverlayGeometry = null
  private move_overlay: OverlayGeometry = null

  private last_overlay_render: number = -1

  private current_mainline_index: number | null = null

  private last_frame_state: SliderState = null

  private interface_closed_event = ewent<this>()

  private arrow_keys_inverted: boolean = false

  constructor(private parent: SliderModal, private settings: SlideGuider.Settings) {
    super()

    this.asInterval(1000 / 50) // Goal of 50 fps

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
    state: SliderState,
    inverted_checkmark: boolean
  }> {

    const CHECKBOX_OFFSET: Vector2 = {x: -173, y: 214}

    const slider_rect = this.parent.puzzle.ui.rect

    const capture_rect = Rectangle.extendTo(slider_rect, Vector2.add(Rectangle.screenOrigin(slider_rect), CHECKBOX_OFFSET))

    const img = a1lib.captureHold(
      Rectangle.screenOrigin(capture_rect).x,
      Rectangle.screenOrigin(capture_rect).y,
      Rectangle.width(capture_rect) + 10,
      Rectangle.height(capture_rect) + 10,
    )

    const read = await SlideReader.read(img,
      Rectangle.screenOrigin(slider_rect),
      this.puzzle.theme
    )

    const checkmark_found = img.findSubimage((await getAnchorImages()).slider_inverted_checkmark).length > 0

    return {
      result: read,
      state: SliderPuzzle.getState(read),
      inverted_checkmark: checkmark_found
    }
  }

  private updateProgressOverlay() {
    if (!this.progress_overlay) {
      this.progress_overlay = over()
    }

    this.progress_overlay.clear()

    const solution_length = this.solution?.length ?? this.solver?.solver?.getBest()?.length

    const center = Vector2.add(
      Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
      {x: 137, y: -9}
    )

    if (this.solution && this.current_mainline_index >= solution_length) {
      const total_time = (this.solved_time - this.start_time) / 1000
      const solving_time = (this.solved_time - this.guiding_start_time) / 1000
      const moves_per_second = this.solution.length / solving_time

      const estimate_slider = this.settings.estimate_slider_speed

      this.progress_overlay.text(
        `Done! ${total_time.toFixed(1)}s, ${moves_per_second.toFixed(1)} moves/s`,
        center,
        {
          color: mixColor(255, 255, 255),
          centered: true,
          shadow: true,
          width: 12
        })

      if (estimate_slider) {
        const raw_solution = this.solution.map(s => s.move)

        const solution_with_multimoves = MoveList.compress(raw_solution)
        const small_step_solution = raw_solution.flatMap(Move.split)
        const partial_steps = small_step_solution.length - solution_with_multimoves.length
        const full_steps = small_step_solution.length - partial_steps
        const counted = partial_steps * 0.5 + full_steps

        const estimated_slider_speed = (solving_time - 0.5) / counted

        this.progress_overlay.text(
          `Slider Speed ${estimated_slider_speed.toFixed(3)}`,
          Vector2.add(center, {x: 0, y: 20}),
          {
            color: mixColor(255, 255, 255),
            centered: true,
            shadow: true,
            width: 12
          })
      }

    } else {
      const length = Math.min(2 * (solution_length ?? 120), 250)
      const progress = this.solution ? this.current_mainline_index / this.solution.length : 0

      this.progress_overlay.progressbar(center, length, progress, 5)

      if (solution_length) {
        this.progress_overlay.text(solution_length.toString(), Vector2.add(center, {x: length / 2 + 20, y: 0}), {
          color: mixColor(255, 255, 255),
          width: 12,
          shadow: true,
          centered: true
        })

        const now = Date.now()

        const total_time = (now - this.start_time) / 1000

        this.progress_overlay.text(`${total_time.toFixed(1)}s`, Vector2.add(center, {x: -(length / 2 + 25), y: 0}), {
          color: mixColor(255, 255, 255),
          width: 12,
          shadow: true,
          centered: true
        })

        if (this.solution && this.current_mainline_index >= 0) {
          const solving_time = (now - this.guiding_start_time) / 1000
          const moves_per_second = this.current_mainline_index / solving_time

          this.progress_overlay.text(`${moves_per_second.toFixed(1)}/s`, center, {
            color: mixColor(255, 255, 255),
            width: 12,
            shadow: true,
            centered: true
          })
        }
      }
    }

    this.progress_overlay.render()
  }

  private updateMoveOverlay() {
    if (!this.move_overlay) {
      this.move_overlay = over()
        .withTime(20000)
    }

    this.move_overlay.clear()

    if (!this.solution || !this.last_frame_state) return
    if (this.current_mainline_index == null) return;

    const LOOKAHEAD = this.settings.max_lookahead

    let moves = []

    if (this.error_recovery_solution?.sequence) {
      moves.push(...this.error_recovery_solution.sequence)
    }

    moves.push(...this.solution.slice(this.current_mainline_index, this.current_mainline_index + LOOKAHEAD))

    const marker_geometry = over()

    let current_blank = SliderState.blank(this.last_frame_state)
    let last_size = 0

    const recovery_length = this.error_recovery_solution?.sequence?.length ?? 0

    const overlap_prevention_map = new Array(25).fill(false)
    overlap_prevention_map[current_blank] = true

    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i]
      const real_move = move.clicked_tile - current_blank

      if (this.settings.prevent_overlap) {
        if (overlap_prevention_map[move.clicked_tile]) break

        let blank = current_blank

        for (let m of Move.split(real_move)) {
          blank += m
          overlap_prevention_map[blank] = true
        }
      }

      const is_recovery_move = i < recovery_length
      const as_key = (this.settings.mode == "keyboard" || this.settings.mode == "hybrid") && Move.isSmallStep(real_move)

      const size = is_recovery_move ? 10 : 20 * (1 - (1 / LOOKAHEAD) * (i - recovery_length))

      const clicked_tile_center = this.posToScreen(move.clicked_tile)

      const STROKE = 3
      const CONTRAST_BORDER = 2
      const CONTRAST_COLOR = mixColor(1, 1, 1)

      if (as_key) {
        const rotation = (() => {
          const arrow_move = this.arrow_keys_inverted ? -real_move : real_move

          switch (arrow_move) {
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
          width: 4,
          color: CONTRAST_COLOR
        }
      )

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

    this.move_overlay.render()
    this.last_overlay_render = Date.now()

    this.updateProgressOverlay()
  }

  private updateSolvingOverlay() {
    if (!this.solving_overlay) {
      this.solving_overlay = over()
    }

    this.solving_overlay.clear()

    if (!this.solution && this.solver) {
      this.solving_overlay
        .text("Solving",
          Vector2.add(
            Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
            {x: 143, y: 133}
          ),
          {color: mixColor(255, 255, 255), width: 20, centered: true, shadow: true}
        )

      this.solving_overlay.progressbar(Vector2.add(
        Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
        {x: 143, y: 153},
      ), 100, this.solver.solver.getProgress(), 5)
    } else if (!this.solution) {
      this.solving_overlay
        .text("No solution found",
          Vector2.add(
            Rectangle.screenOrigin(this.parent.puzzle.ui.rect),
            {x: 143, y: 133}
          ),
          {color: mixColor(255, 0, 0), width: 20, centered: true, shadow: true}
        )
    }

    this.solving_overlay.render()
  }

  override async implementation(): Promise<void> {
    while (!this.should_stop) {
      const read_result = await this.read()

      if (read_result.result.match_score < SlideReader.DETECTION_THRESHOLD_SCORE) {
        this.interface_closed_event.trigger(this)
        this.stop()
        break
      }

      const frame_state = read_result.state

      const LASOLVING = 20

      if (!this.solver && !this.solution) {
        this.solver = {
          solver: SlideSolver.skillbertRandom(frame_state)
            //new AStarSlideSolver(frame_state)
            .setCombineStraights(this.settings.mode == "mouse" || this.settings.mode == "hybrid")
            .onUpdate(solver => {
              this.updateSolvingOverlay()
              this.updateProgressOverlay()
            })
            .withTimeout(this.settings.solve_time_ms),
          solving_from: 0
        }

        const initial_solution = await this.solver.solver.run()

        this.solver = null
        this.current_mainline_index = 0
        this.error_recovery_solution = {sequence: [], recovering_to_mainline_index: 0}

        this.guiding_start_time = Date.now()

        this.updateSolvingOverlay()

        if (initial_solution) {
          this.solution = Sliders.MoveList.annotate(frame_state, initial_solution, this.settings.mode != "keyboard")
        } else {
          this.stop()
        }

        this.updateSolvingOverlay()

        continue
      }

      await delay(10)

      if (!this.solution) continue

      if (this.settings.continue_solving_after_initial_solve) {
        if (this.solver && this.current_mainline_index + this.settings.max_lookahead + 2 >= this.solver.solving_from) {
          // Getting close to the current start of the solving, stop the solving process
          this.solver.solver.stop()
          this.solver = null
        }

        if (!this.solver && (this.current_mainline_index + LASOLVING < this.solution.length)) {
          const solving_start_index = this.current_mainline_index + LASOLVING

          const solving_start_state = this.solution[solving_start_index].post_state

          this.solver = {
            solver: SlideSolver.skillbertRandom(solving_start_state)
              //new AStarSlideSolver(frame_state)
              .setCombineStraights(this.settings.mode == "mouse" || this.settings.mode == "hybrid")
              .withInterrupt(20, 10) // Cooperative interrupt behaviour
              .onFound(better => {
                if (solving_start_index == this.solver?.solving_from) {
                  const annotated = MoveList.annotate(solving_start_state, better, this.settings.mode != "keyboard")

                  this.solution.splice(
                    solving_start_index,
                    this.solution.length,
                    ...annotated
                  )
                }
              }),
            solving_from: solving_start_index
          }

          this.solver.solver.run()
        }
      }

      const inversion_changed = read_result.inverted_checkmark != this.arrow_keys_inverted
      this.arrow_keys_inverted = read_result.inverted_checkmark

      // Rerender move overlay every 10 seconds, so it does not expire
      if (inversion_changed || Date.now() - this.last_overlay_render > 10000) this.updateMoveOverlay()

      // Early exit if state has not changed
      if (this.last_frame_state && SliderState.equals(this.last_frame_state, frame_state)) {
        this.updateProgressOverlay()
        continue
      }

      let mainline_index = findLastIndex(this.solution, a => a.pre_states.some(s => SliderState.equals(s, frame_state)))

      if (mainline_index == this.solution.length - 2 && SliderState.equals(frame_state, SliderState.SOLVED)) {
        mainline_index = this.solution.length

        this.solved_time = Date.now()
      }

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

    this.move_overlay?.hide()
    this.solving_overlay?.hide()
    this.progress_overlay?.hide()
    this.solver?.solver?.stop()
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
    this.resetProcess(false)
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
    solve_time_ms: number,
    estimate_slider_speed: boolean,
    improve_slider_matches_backtracking: boolean,
    continue_solving_after_initial_solve: boolean,
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
      color_recovery_move: A1Color.fromHex("#FF0000"),
      color_recovery_line: A1Color.fromHex("#ff6600"),
      solve_time_ms: 2000,
      estimate_slider_speed: false,
      improve_slider_matches_backtracking: true,
      continue_solving_after_initial_solve: true
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
      if ((typeof settings.solve_time_ms) != "number") settings.solve_time_ms = DEFAULT.solve_time_ms
      if (![true, false].includes(settings.estimate_slider_speed)) settings.estimate_slider_speed = DEFAULT.estimate_slider_speed
      if (![true, false].includes(settings.improve_slider_matches_backtracking)) settings.improve_slider_matches_backtracking = DEFAULT.improve_slider_matches_backtracking
      if (![true, false].includes(settings.continue_solving_after_initial_solve)) settings.continue_solving_after_initial_solve = DEFAULT.continue_solving_after_initial_solve

      settings.solve_time_ms = lodash.clamp(settings.solve_time_ms, 500, 5000)

      return settings
    }
  }
}