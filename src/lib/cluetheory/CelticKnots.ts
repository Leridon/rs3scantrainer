import * as lodash from "lodash"
import {timeSync} from "../gamemap/GameLayer";
import {stat} from "copy-webpack-plugin/types/utils";
import {debug} from "@alt1/ocr";

export namespace CelticKnots {
  export const elements =
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const

  export type Element = (typeof elements)[number] | "unknown"

  export namespace Element {
    export function maybeEqual(a: Element, b: Element): boolean {
      return a == b || a == "unknown" || b == "unknown"
    }
  }

  export type TileIndex = {
    snake: number,
    tile: number
  }

  export type Lock = {
    first: TileIndex,
    second: TileIndex
  }

  export type Snake = Element[]

  export namespace Snake {
    export function rotate(snake: Snake, move: number): Snake {
      const res = snake.map((_, i) => snake[(i - move + snake.length) % snake.length])


      return res
    }

    export function index(snake: Snake, index: number): Element {
      return snake[(index + snake.length) % snake.length]
    }

    export function optimizeMove(snake: Snake, move: number): number {
      const positive = (move + snake.length) % snake.length

      const half = Math.floor(snake.length / 2)

      if (positive > half) return positive - snake.length
      else return positive
    }
  }

  export type PuzzleShape = {
    snake_lengths: number[],
    locks: Lock[]
  }

  export type PuzzleState = {
    shape: PuzzleShape,
    snakes: Element[][],
  }


  export namespace PuzzleState {
    export function generate(shape: PuzzleShape): PuzzleState {
      const state: PuzzleState = {
        shape: shape,
        snakes: shape.snake_lengths.map(s => new Array(s).fill(0).map(() => elements[lodash.random(elements.length - 1)]))
      }

      shape.locks.forEach(({first, second}) => {
        state.snakes[second.snake][second.tile] = state.snakes[first.snake][first.tile]
      })

      return state
    }

    export function shuffle(state: PuzzleState): PuzzleState {
      return {
        shape: state.shape,
        snakes: state.snakes.map(snake => {
          const o = lodash.random(snake.length)
          return Snake.rotate(snake, o)
        })
      }
    }

    export function get(state: PuzzleState, index: TileIndex): Element {
      return state.snakes[index.snake][index.tile]
    }

    export function isSolved(state: PuzzleState): boolean {
      return state.shape.locks.every((lock) => lockMaybeSolved(state, lock))
    }

    export function doMove(state: PuzzleState, ...moves: Move[]): PuzzleState {
      return {
        snakes: state.snakes.map((snake, index) => {
          const move = moves.find(m => m.snake_index == index)

          if (move) return Snake.rotate(snake, move.offset)
          else return snake
        }),
        shape: state.shape
      }
    }

    export function lockMaybeSolved(state: PuzzleState, lock: Lock): boolean {
      const a = get(state, lock.first)
      const b = get(state, lock.second)

      return Element.maybeEqual(a, b)
    }
  }

  export type Move = {
    snake_index: number,
    offset: number
  }

  export type Moves = {
    moves: number[]
  }

  export type Solution = {
    end_state: PuzzleState,
    moves: Move[]
  }

  export function solve(state: PuzzleState): Solution {

    // Solve every lock individually.
    // Use backtracking to find a combination of moves that solves all locks

    function backtracking(next_lock_index: number, state: PuzzleState, commited_moves: (Move | null)[]): Solution[] {
      if (next_lock_index >= state.shape.locks.length) {
        if (!PuzzleState.isSolved(state)) debugger

        // All locks are solved, return solution
        return [{
          end_state: state,
          moves: commited_moves.map((e, i) => e ?? {snake_index: i, offset: 0})
        }]
      }

      function recurseWith(move: Move, solved: boolean): Solution[] {
        commited_moves[move.snake_index] = move
        const res = backtracking(next_lock_index + (solved ? 1 : 0), PuzzleState.doMove(state, move), commited_moves)
        commited_moves[move.snake_index] = null

        return res
      }

      const lock = state.shape.locks[next_lock_index]

      if (commited_moves[lock.first.snake] == null && commited_moves[lock.second.snake] == null) {
        // Both snakes have no attached move yet. Just check all moves for one of them
        const moving_snake = state.snakes[lock.first.snake]

        return moving_snake.map<Move>((e, index) => {
          return {snake_index: lock.first.snake, offset: Snake.optimizeMove(moving_snake, index)}
        }).flatMap(m => recurseWith(m, false))
      } else if (commited_moves[lock.first.snake] == null || commited_moves[lock.second.snake] == null) {
        const [lock_on_locked_snake, lock_on_free_snake] = commited_moves[lock.first.snake]
          ? [lock.first, lock.second]
          : [lock.second, lock.first]

        const expected = state.snakes[lock_on_locked_snake.snake][lock_on_locked_snake.tile]

        const moving_snake = state.snakes[lock_on_free_snake.snake]

        return moving_snake.flatMap((e, index) => {
          if (Element.maybeEqual(e, expected))
            return recurseWith({snake_index: lock_on_free_snake.snake, offset: Snake.optimizeMove(moving_snake, lock_on_free_snake.tile - index)}, true)
          else
            return []
        })
      } else if (PuzzleState.lockMaybeSolved(state, lock)) {
        // If the lock is already solved, we can just continue with the next one without applying any move
        return backtracking(next_lock_index + 1, state, commited_moves)
      } else  {
        // Both snakes are locked in but the lock is not solved. No possible solutions
        return []
      }
    }

    const solutions = backtracking(0, state, state.snakes.map(() => null))

    if (solutions.length == 1) return solutions[0]
    else {
      const real_solutions = solutions.filter(s => s.end_state.shape.locks.every(lock => s.end_state.snakes[lock.first.snake][lock.first.tile] != "unknown"))

      return lodash.minBy(real_solutions, s => s.moves.map(m => Math.abs(m.offset)))
    }
  }
}