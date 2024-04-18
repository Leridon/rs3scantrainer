import {Sliders} from "./Sliders";
import {ewent} from "../../../../lib/reactive";
import {delay} from "../../../../skillbertssolver/oldlib";
import SliderState = Sliders.SliderState;
import Move = Sliders.Move;

abstract class Process<Result> {
  private finished_event = ewent<this>()

  private is_running: boolean = false
  protected should_stop: boolean = false
  private finished: boolean = false

  protected start_time: number
  private last_interrupt_time: number
  protected end_time: number
  private progress: number

  private timeout: number = Number.MAX_SAFE_INTEGER

  withTimeout(timeout: number): this {
    this.timeout = timeout
    return this
  }

  private interrupt_ewent = ewent<null>()

  abstract implementation(): Promise<Result> | Result

  async run(): Promise<Result> {
    if (this.is_running || this.finished) return null

    this.is_running = true
    this.should_stop = false

    this.start_time = Date.now();
    this.end_time = this.start_time + this.timeout;
    this.last_interrupt_time = this.start_time

    const result = await this.implementation()

    this.is_running = false
    this.should_stop = false
    this.finished = true

    return result
  }

  onInterrupt(f: () => void): this {
    this.interrupt_ewent.on(f)
    return this
  }

  protected async interrupt() {
    this.interrupt_ewent.trigger(null)
    await delay(1)
  }

  stop() {
    if (!this.is_running) return

    this.should_stop = true
  }

  await() {
    return new Promise(resolve => {
      this.finished_event.on(resolve)
    })
  }

  protected async checkTime() {
    const t = Date.now()

    const INTERRUPT_FREQUENCY = 50

    if (t >= this.end_time) this.stop()
    else if (t >= this.last_interrupt_time + INTERRUPT_FREQUENCY) {
      this.last_interrupt_time = t
      await this.interrupt()
    }
  }
}

export class IterativeDeepeningAStar<UnderlyingState, Move> extends Process<IterativeDeepeningAStar.State<UnderlyingState, Move>> {

  constructor(
    private start_state: UnderlyingState,
    private heuristic: (_: UnderlyingState) => number,
    private successors: (_: IterativeDeepeningAStar.State<UnderlyingState, Move>) => IterativeDeepeningAStar.Edge<UnderlyingState, Move>[],
    private isGoal: (_: UnderlyingState) => boolean
  ) {
    super()
  }

  private getSuccessors(state: IterativeDeepeningAStar.State<UnderlyingState, Move>): IterativeDeepeningAStar.State<UnderlyingState, Move>[] {
    return this.successors(state).map((edge) => {
      return {
        parent: {state: state, move: edge.move},
        state: edge.target,
        length: state.length + edge.cost
      }
    })
  }

  private async step(state: IterativeDeepeningAStar.State<UnderlyingState, Move>,
                     bound: number
  ): Promise<[[IterativeDeepeningAStar.State<UnderlyingState, Move>, number], boolean]> {
    if (state.length % 10 == 0) await this.checkTime()

    const h = this.heuristic(state.state)
    const f = state.length + h

    if (f > bound || this.should_stop) {
      return [[null, f], false]
    }

    if (this.isGoal(state.state)) {
      return [[state, f], true]
    }

    let min = Number.MAX_SAFE_INTEGER

    for (const child of this.getSuccessors(state)) {
      const [[c, v], solved] = await this.step(child, bound,)

      if (solved) return [[c, v], solved]

      if (v < min) min = v
    }

    return [[null, min], false]
  }

  async implementation(): Promise<IterativeDeepeningAStar.State<UnderlyingState, Move>> {
    const start_state: IterativeDeepeningAStar.State<UnderlyingState, Move> = {
      parent: null,
      length: 0,
      state: this.start_state
    }

    let bound = this.heuristic(start_state.state)

    while (!this.should_stop) {
      const [[state, v], solved] = await this.step(start_state, bound)

      if (solved) return state

      bound = v
    }

    return null
  }
}

export namespace IterativeDeepeningAStar {
  export type State<Underlying, MoveT> = {
    parent: {
      state: State<Underlying, MoveT>,
      move: MoveT
    } | null,
    state: Underlying,
    length: number,
  }

  export type Edge<Underlying, MoveT> = {
    target: Underlying,
    move: MoveT
    cost: number
  }

  export namespace State {
    export function moveSequence<A, B>(state: State<A, B>): B[] {
      if (!state.parent) return []

      const par = moveSequence(state.parent.state)
      par.push(state.parent.move)
      return par
    }
  }
}

type SlideStateWithBlank = { tiles: SliderState, blank: number }

class IterativeDeepeningSlideSolver extends IterativeDeepeningAStar<SlideStateWithBlank, Move> {
  constructor(start_state: SliderState, heurmod: number) {
    super(
      {tiles: start_state, blank: SliderState.blank(start_state)},
      (n) => SliderState.sumManhattenDistance(n.tiles) * heurmod,
      (node): IterativeDeepeningAStar.Edge<SlideStateWithBlank, Move>[] => {
        const was_vertical = node.parent && node.parent.move % 5 == 0
        const was_horizontal = node.parent && !was_vertical

        const blank_x = node.state.blank % 5
        const blank_y = Math.floor(node.state.blank / 5)

        const successors: IterativeDeepeningAStar.Edge<SlideStateWithBlank, Move>[] = []

        function child(move: Move) {
          const state = SliderState.withMove(node.state.tiles, move)
          successors.push({
            move: move,
            cost: 1,
            target: {
              tiles: state,
              blank: node.state.blank + move
            }
          })
        }

        if (!was_horizontal) {
          for (let xi = 0; xi < 5; xi++) {
            if (xi != blank_x) {
              child(blank_y * 5 + xi - node.state.blank)
            }
          }
        }

        if (!was_vertical) {
          for (let yi = 0; yi < 5; yi++) {
            if (yi != blank_y) {
              child(yi * 5 + blank_x - node.state.blank)
            }
          }
        }

        return successors // TODO: Exclude nodes already contained in the path?
      },
      (n) => SliderState.equals(SliderState.SOLVED, n.tiles)
    );
  }
}

export class AStarSlideSolver extends Sliders.SlideSolver {

  private subprocess: IterativeDeepeningSlideSolver

  protected async solve_implementation() {
    let factor = 2.8

    while (!this.should_stop) {
      this.subprocess = new IterativeDeepeningSlideSolver(this.start_state, factor)
        .withTimeout(this.end_time - Date.now())
        .onInterrupt(() => this.updateProgress())

      const result = await this.subprocess.run()

      if (result) {
        this.registerSolution(IterativeDeepeningAStar.State.moveSequence(result))
      }

      factor = 1 + (factor - 1) * 0.9

      await this.checkTime()
    }
  }

  stop() {
    super.stop()
    this.subprocess?.stop()
  }
}