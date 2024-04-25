export namespace CelticKnots {
  export type Element = number | "unknown"

  export type TileIndex = {
    snake: number,
    index: number
  }

  export type Lock = [TileIndex, TileIndex]

  export type Snake = number[]

  export namespace Snake {
    export function rotate(snake: Snake, move: number): Snake {
      return snake.map((_, i) => snake[(i + move + snake.length) % snake.length])
    }
  }

  export type PuzzleShape = {
    sequences: number[],
    locks: Lock[]
  }

  export type PuzzleState = {
    shape: PuzzleShape,
    snakes: Element[][],
  }


  export namespace PuzzleState {
    export function get(state: PuzzleState, index: TileIndex): Element {
      return state.snakes[index[0]][index[1]]
    }

    export function isSolved(state: PuzzleState): boolean {
      return state.shape.locks.every(([x, y]) => {
        const a = get(state, x)
        const b = get(state, y)

        return a == b && a != "unknown"
      })
    }
  }

  export type Move = {
    snake: number,
    offset: number
  }

  export type Moves = {
    moves: number[]
  }

  export function solve(state: PuzzleState): Moves {

    // Solve every lock individually.
    // Use backtracking to find a combination of moves that solves all locks

    function backtracking(next_lock_index: number, commited_moves: (number | null)[]): number[] {
      if (next_lock_index >= state.shape.locks.length) return commited_moves.map(e => e ?? 0)

      const lock = state.shape.locks[next_lock_index]

      backtracking(next_lock_index + 1, commited_moves)
    }

    backtracking(state.shape.locks, state.snakes.map(() => null))

    state.shape.locks.map(lock => {

    })
  }
}