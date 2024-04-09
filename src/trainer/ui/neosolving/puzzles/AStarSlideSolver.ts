import {Sliders} from "./Sliders";
import {util} from "../../../../lib/util/util";
import todo = util.todo;
import index = util.index;
import SliderState = Sliders.SliderState;

export class AStarSlideSolver extends Sliders.SlideSolver {
  protected solve_implementation() {
    type Node = Sliders.SliderState

    let path
    let node
    let g
    let f

    function h(node: Node): number {
      todo()
    }

    function cost(node: Node, succ: Node): number {
      return 1
    }

    function is_goal(node: Node): boolean {
      todo()
    }

    function successors(node: Node): Node[] {
      todo()
    }

    function ida_star(root: Node) {
      let bound = h(root)
      path = [root]
      while (true) {
        let t = search(path, 0, bound)
        if (t == "FOUND") return (path, bound)
        if (t == Number.MAX_SAFE_INTEGER) return null
        bound = t
      }
    }

    function search(path: Node[], g, bound) {
      node = index(path, -1)
      f = g + h(node)
      if (f > bound) return f
      if (is_goal(node)) return "FOUND"

      let min = Number.MAX_SAFE_INTEGER


      for (let succ of successors(node)) {
        if (!path.includes(succ)) {
          path.push(succ)
          let t = search(path, g + cost(node, succ), bound)
          if (t == "FOUND") return "FOUND"
          if (t < min) min = t
          path.pop()
        }
      }

      return min
    }
  }
}