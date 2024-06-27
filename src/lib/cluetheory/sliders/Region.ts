import * as lodash from "lodash";
import {OptimizedSliderState} from "./OptimizedSliderState";
import {Sliders} from "../Sliders";
import {util} from "../../util/util";
import factorial = util.factorial;

const n_choose_k_table: number[][] = (() => {
  function choose(n: number, k: number): number {
    if (k > n) return 0

    return factorial(n, n - k) / factorial(k)
  }

  const res: number[][] = new Array(26).fill(null).map(_ => {
    return new Array(26).fill(null)
  })

  for (let n = 0; n <= 25; n++) {
    for (let k = 0; k <= 25; k++) {
      res[n][k] = choose(n, k)
    }
  }

  return res
})()

export type Region = Region.Tile[]

export namespace Region {
  import Move = Sliders.Move;
  import count = util.count;
  import factorial = util.factorial;
  import SliderState = Sliders.SliderState;

  export class Active {
    public number_of_permutations: number
    public current: number
    public freedom: number
    public size: number
    private solution_relevant_indices: number[]

    private combination_prioritized_indices: number[]
    private combination_relevant_tiles: boolean[]
    private permutation_table: number[]

    // Prepared move table that contains all possible moves for every blank position and both move directions
    // move_table[0][i] = possible horizontal moves when the blank tile is at position i
    // move_table[1][i] = possible vertical moves when the blank tile is at position i
    move_table: Move[][][]

    public readonly solves_puzzle: boolean

    constructor(private region: Region) {
      this.solves_puzzle = region.every(t => t != Tile.FREE)
      this.current = count(region, t => t == Tile.CURRENT) + (this.solves_puzzle ? 0 : 1) // +1 because the blank tile is always part of this
      this.freedom = count(region, t => t != Tile.FIXED)

      this.number_of_permutations = this.solves_puzzle ? factorial(this.current) / 2 : factorial(this.current)
      this.size = factorial(this.freedom, Math.max(2, this.freedom - this.current))

      this.move_table = (() => {

        // TODO: This needs to depend on whether we're doing single tile or multi tile moves

        const res: Move[][][] = []

        const lut: Move[][] = [
          [1, 2, 3, 4],
          [-1, 1, 2, 3],
          [-2, -1, 1, 2],
          [-3, -2, -1, 1],
          [-4, -3, -2, -1],
        ]

        // Horizontal moves
        {
          res[0] = new Array<Move[]>(25)

          for (let blank_i = 0; blank_i < 25; blank_i++) {

            res[0][blank_i] = lut[blank_i % 5]
          }
        }

        // Vertical moves
        {
          res[1] = new Array<Move[]>(25)

          for (let blank_i = 0; blank_i < 25; blank_i++) {

            res[1][blank_i] = lut[~~(blank_i / 5)].map(m => 5 * m)
          }
        }

        return res.map(tbl => tbl.map((moves, blank_i) => moves.filter(m => this.region[m + blank_i] != Tile.FIXED)))
      })()

      {
        this.combination_prioritized_indices = lodash.sortBy(region.map((tile, i) => [tile, i]).filter(e => e[0] != Tile.FIXED), e => -e[0]).map(e => e[1])

        this.combination_relevant_tiles = region.map((tile, index) => tile == Tile.CURRENT || index == SliderState.BLANK_TILE)
      }

      {
        this.permutation_table = new Array(region.length).fill(null)

        let tile_index = 0

        for (let i = 0; i < region.length; i++) {
          if (region[i] == Tile.CURRENT || i == SliderState.BLANK_TILE) {
            this.permutation_table[i] = tile_index
            tile_index++
          }
        }
      }

      this.solution_relevant_indices = region.flatMap((tile, position) => tile == Tile.CURRENT ? [position] : [])

    }

    stateIndex(state: OptimizedSliderState): number {
      function permutationIndex(pm: number[]): number {
        const n = pm.length

        let t = 0;
        for (let i = 0; i < pm.length - 1; i++) {
          t *= (n - i)
          for (let j = i + 1; j < n; j++) {
            if (pm[i] > pm[j]) t += 1
          }
        }
        return t
      }

      if (this.solves_puzzle) {
        // For regions that solve the full puzzle, only the permutation is relevant since the combination is always the same

        // TODO: Optimize this so it doesn't create the permutation array
        const permutation: number[] = []


        for (let i = 0; i < 25; i++) {
          const tile = state[i]

          if (this.permutation_table[tile] != null) {
            permutation.push(this.permutation_table[tile])
          }
        }

        // TODO: for regions that solve the whole puzzle, the permutation index includes unsolvable states
        return permutationIndex(permutation)
      } else {
        let combination_index = 0

        {
          // https://en.wikipedia.org/wiki/Combinatorial_number_system
          // https://www.jaapsch.net/puzzles/compindx.htm

          let counter = 1

          for (let i = 0; i < this.combination_prioritized_indices.length && counter <= this.current; i++) {
            const index = this.combination_prioritized_indices[i]

            if (this.combination_relevant_tiles[state[index]]) {
              // There's a relevant tile in this position

              combination_index += n_choose_k_table[i][counter]
              counter += 1
            }
          }
        }

        // TODO: Optimize this so it doesn't create the permutation array
        const permutation: number[] = []
        for (let i = 0; i < 25; i++) {
          const tile = state[i]

          if (this.permutation_table[tile] != null) {
            permutation.push(this.permutation_table[tile])
          }
        }

        return combination_index * this.number_of_permutations + permutationIndex(permutation)
      }
    }
  }

  export type Tile = typeof Tile.FIXED | typeof Tile.CURRENT | typeof Tile.FREE

  export namespace Tile {
    export const FREE = 0
    export const CURRENT = 1
    export const FIXED = 2
  }

  export function isFirst(region: Region): boolean {
    return region.every(tile => tile != Tile.FIXED)
  }

  export function isChild(parent: Region, child: Region): boolean {
    return child.every((child_tile, index) => {
      const parent_tile = parent[index]

      switch (child_tile) {
        case Tile.FREE:
        case Tile.CURRENT:
          return parent_tile == Tile.FREE
        case Tile.FIXED:
          return child[index] == Tile.CURRENT
      }
    })
  }

  export function solvesPuzzle(region: Region): boolean {
    return region.every(tile => tile != Tile.FREE)
  }

  export function lookupTableSize(region: Region): number {
    const current_tiles = count(region, tile => tile == Tile.CURRENT)
    const free_tiles = count(region, tile => tile == Tile.FREE)

    const usable_spots = current_tiles + free_tiles

    let result = 1

    for (let i = 0; i <= current_tiles; i++) result *= (usable_spots - i)

    return result
  }
}