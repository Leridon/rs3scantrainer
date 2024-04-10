import {Sliders} from "./Sliders";
import * as lodash from "lodash";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import Move = Sliders.Move;

export class AStarSlideSolver extends Sliders.SlideSolver {
  protected async solve_implementation() {
    type Node = Sliders.SliderState

    function heuristic(node: Node): number {
      return SliderState.sumManhattenDistance(node) * 2
    }

    function is_goal(node: State): boolean {

      if (!node) debugger
      return SliderState.equals(node.state, SliderState.SOLVED)
    }

    function conta(state: State, config: State): boolean {
      if (state == null) return false
      if (SliderState.equals(state.state, config.state)) return true
      return conta(state.parent?.state, config)
    }

    function successors(node: State): State[] {
      const was_vertical = node.parent && node.parent.move % 5 == 0
      const was_horizontal = node.parent && !was_vertical

      const blank_x = node.blank % 5
      const blank_y = Math.floor(node.blank / 5)

      const successors: State[] = []

      function child(move: Move) {
        const state = SliderState.withMove(node.state, move)
        successors.push({
          parent: {state: node, move: move},
          state: state,
          depth: node.depth + 1,
          blank: node.blank + move,
          estimate: node.depth + 1 + heuristic(state)
        })
      }

      if (!was_horizontal) {
        for (let xi = 0; xi < 5; xi++) {
          if (xi != blank_x) {
            child(blank_y * 5 + xi - node.blank)
          }
        }
      }

      if (!was_vertical) {
        for (let yi = 0; yi < 5; yi++) {
          if (yi != blank_y) {
            child(yi * 5 + blank_x - node.blank)
          }
        }
      }

      return successors//.filter(c => !conta(node, c))
    }

    type State = {
      parent: {
        state: State,
        move: number
      } | null,
      depth: number,
      state: SliderState,
      blank: number,
      estimate: number
    }

    const self = this

    let best: State = null

    function found(state: State) {
      if (!best || state.depth < best.depth) {
        best = state
        self.registerSolution(reduce(state))
      }
    }

    function reduce(state: State): MoveList {
      if (!state.parent) return []

      const par = reduce(state.parent.state)
      par.push(state.parent.move)
      return par
    }

    const backlog: State[] = [{
      state: self.start_state,
      estimate: heuristic(self.start_state),
      depth: 0,
      blank: SliderState.blank(self.start_state),
      parent: null
    }]

    while (!self.should_stop) {
      if (self.should_stop) break

      let state = lodash.minBy(backlog, s => s.estimate)

      if (!state) break

      while (!self.should_stop) {
        if (best && state.depth > best.depth) break

        if (is_goal(state)) {
          found(state)
          break;
        }

        const succe = lodash.sortBy(successors(state), c => c.estimate)

        // Push half of the successors except the most promising to a backlog
        //backlog.push(...succe.slice(1, succe.length / 2))

        state = succe[0]

        await self.checkTime()
      }
    }
  }
}