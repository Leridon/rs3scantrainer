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

  export function empty(): Region {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
  }

  export function reflect(region: Region): Region {
    return OptimizedSliderState.tile_reflection_table.map(i => region[i])
  }

  export function equals(a: Region, b: Region): boolean {
    return lodash.isEqual(a, b)
  }

  import count = util.count;
  import factorial = util.factorial;
  import SliderState = Sliders.SliderState;

  export class Indexing {
    public number_of_permutations: number
    public current: number
    public freedom: number
    public size: number
    private solution_relevant_indices: number[]

    private combination_prioritized_indices: number[]
    private relevant_tile_numbers: boolean[]
    private relevant_tile_numbers_translation: number[] // TODO: I don't think the translation is needed at all

    public readonly solves_puzzle: boolean

    constructor(private region: Region) {
      this.solves_puzzle = region.every((t, i) => t != Tile.FREE || [23, 19].includes(i))
      this.current = count(region, t => t == Tile.CURRENT) + (this.solves_puzzle ? 0 : 1) // +1 because the blank tile is always part of this
      this.freedom = count(region, t => t != Tile.FIXED)

      this.number_of_permutations = factorial(this.current)
      this.size = factorial(this.freedom, Math.max(2, this.freedom - this.current))

      {
        this.combination_prioritized_indices = lodash.sortBy(region.map((tile, i) => [tile, i]).filter(e => e[0] != Tile.FIXED), e => -e[0]).map(e => e[1])

        this.relevant_tile_numbers = region.map((tile, index) => tile == Tile.CURRENT || index == SliderState.BLANK_TILE)
      }

      {
        this.relevant_tile_numbers_translation = new Array(region.length).fill(null)

        let tile_index = 0

        for (let i = 0; i < region.length; i++) {
          if (region[i] == Tile.CURRENT || i == SliderState.BLANK_TILE) {
            this.relevant_tile_numbers_translation[i] = tile_index
            tile_index++
          }
        }
      }

      this.solution_relevant_indices = region.flatMap((tile, position) => tile == Tile.CURRENT || tile == Tile.FIXED ? [position] : [])

    }

    stateIndex(state: OptimizedSliderState): number {

      // TODO: This is O(n²), but there is an O(n log n) algorithm. Also, inline this so ideally no array needs to be created.
      //       For the regions we use, in the worst case these are 6+5+4+3+2+1 = 21 comparisons.
      function permutationIndex(pm: number[]): number {
        const n = pm.length

        let t = 0;
        for (let i = 0; i < pm.length - 1; i++) {
          t *= (n - i) // TODO: This computes the factorial on the fly, which could be replaced with a lookup table probably

          // Now we count how many of the following elements are less than the current element
          // Question: Can this be reformulated so we need
          for (let j = i + 1; j < n; j++) {
            if (pm[j] < pm[i]) t += 1
          }
        }
        return t
      }

      let combination_index = 0

      {
        // https://en.wikipedia.org/wiki/Combinatorial_number_system
        // https://www.jaapsch.net/puzzles/compindx.htm

        let counter = 1

        for (let i = 0; i < this.combination_prioritized_indices.length && counter <= this.current; i++) {
          const index = this.combination_prioritized_indices[i]

          if (this.relevant_tile_numbers[state[index]]) {
            // There's a relevant tile in this position
            combination_index += n_choose_k_table[i][counter]
            counter += 1
          }
        }
      }

      // TODO: Optimize this so it doesn't create the permutation array for each node
      const permutation: number[] = []
      for (let i = 0; i < 25; i++) {
        const tile = state[i]

        if (this.relevant_tile_numbers_translation[tile] != null) {
          permutation.push(this.relevant_tile_numbers_translation[tile])
        }
      }

      return combination_index * this.number_of_permutations + permutationIndex(permutation)
    }

    satisfied(state: OptimizedSliderState): boolean {
      return this.solution_relevant_indices.every(i => state[i] == i)
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
          return parent_tile == Tile.FIXED || parent_tile == Tile.CURRENT
      }
    })
  }

  export function child(parent: Region): Region {
    return parent.map(tile => {
      if (tile == Tile.FREE) return Tile.FREE
      else return Tile.FIXED
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

  export function check(region: Region): string[] {
    // TODO:
    //   - Connected
    //   - Blank is free or everything is solved
    //   - Every free

    return []
  }
}