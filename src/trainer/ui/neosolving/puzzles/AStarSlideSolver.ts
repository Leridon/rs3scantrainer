import {Sliders} from "./Sliders";
import {delay} from "../../../../oldlib";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;

export class AStarSlideSolver extends Sliders.SlideSolver {
  protected async solve_implementation() {
    type Node = Sliders.SliderState

    const FOUND = -1

    function heuristic(node: Node): number {
      return SliderState.sumManhattenDistance(node) * 5
    }

    function is_goal(node: Node): boolean {
      return SliderState.equals(node, SliderState.SOLVED)
    }

    function successors(node: State): State[] {
      const was_vertical = node.parent && node.parent.move % 5 == 0
      const was_horizontal = node.parent && !was_vertical

      const blank_x = node.blank % 5
      const blank_y = Math.floor(node.blank / 5)

      const successors: State[] = []

      if (!was_horizontal) {
        for (let xi = 0; xi < 5; xi++) {
          if (xi != blank_x) {
            const move = blank_y * 5 + xi - node.blank

            successors.push({
              parent: {state: node, move: move},
              state: SliderState.withMove(node.state, move),
              depth: node.depth + 1,
              blank: node.blank + move
            })
          }
        }
      }

      if (!was_vertical) {
        for (let yi = 0; yi < 5; yi++) {
          if (yi != blank_y) {
            const move = yi * 5 + blank_x - node.blank

            successors.push({
              parent: {state: node, move: move},
              state: SliderState.withMove(node.state, move),
              depth: node.depth + 1,
              blank: node.blank + move
            })
          }
        }
      }

      return successors
    }

    type State = {
      parent: {
        state: State,
        move: number
      } | null,
      depth: number,
      state: SliderState,
      blank: number
    }

    async function ida_star(start_state: SliderState): Promise<State> {
      let bound = heuristic(start_state)

      const path: State = {
        parent: null,
        state: start_state,
        depth: 0,
        blank: SliderState.blank(start_state)
      }

      while (true) {
        let [res, length] = await search(path, bound)

        if (res && length == FOUND) return res
        if (length == Number.MAX_SAFE_INTEGER) return null

        bound = length

        await delay(1)
      }
    }

    async function search(node: State, bound: number): Promise<[State, number]> {
      const f = node.depth + heuristic(node.state)

      if (f > bound) return [null, f]

      if (is_goal(node.state)) return [node, FOUND]

      let min = Number.MAX_SAFE_INTEGER

      for (let succ of successors(node)) {
        await delay(1)

        const [child_res, child_score] = await search(succ, bound)

        if (child_score == FOUND) return [child_res, child_score]

        if (child_score < min) min = child_score
      }

      return [null, min]
    }

    const res = ida_star(this.start_state)

    function reduce(state: State): MoveList {
      if (!state.parent) return []

      const par = reduce(state.parent.state)
      par.push(state.parent.move)
      return par
    }

    this.registerSolution(reduce(await res))
  }
}