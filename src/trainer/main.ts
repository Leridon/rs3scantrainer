import {Lockboxes} from "../lib/cluetheory/Lockboxes";
import MoveMap = Lockboxes.MoveMap;


export async function makeshift_main(): Promise<void> {
  const N = 100
  let faulty = 0

  const score = MoveMap.scoring([0, 1, 1.1])

  for (let i = 0; i < N; i++) {
    const state = Lockboxes.State.generate()

    const solution = Lockboxes.solve(state, true, true, score)

    const penalty = (sol: MoveMap) => MoveMap.difference(sol, solution)

    const two_clicks = solution.flatMap((row, y) => row.flatMap((m, x) => {
      if (m == 2) return [MoveMap.fromClick(y, x)]
      else return []
    }))

    two_clicks.forEach(move => {
      const new_state = Lockboxes.State.applyMoves(state, move)

      const new_solution = Lockboxes.solve(new_state, true, true, score, solution)

      const difference = Lockboxes.MoveMap.difference(solution, new_solution)

      if (difference > 1) {
        debugger
        console.log(`Fault. Orig: ${score(solution).toFixed(1)}, New: ${score(new_solution).toFixed(1)}, Penalty: ${(penalty(new_solution)).toFixed(1)}`)
        faulty++
      }
    })
  }

  console.log(`Faulty: ${faulty}`)
}