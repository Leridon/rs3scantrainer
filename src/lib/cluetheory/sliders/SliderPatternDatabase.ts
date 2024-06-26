import {Sliders} from "../Sliders";
import {util} from "../../util/util";
import * as lodash from "lodash";
import SlideStateWithBlank = Sliders.SlideStateWithBlank;
import SliderState = Sliders.SliderState;
import {stat} from "copy-webpack-plugin/types/utils";
import factorial = util.factorial;
import {delay} from "../../../skillbertssolver/oldlib";

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

export class SliderPatternDatabase {
  region: SliderPatternDatabase.Region.Active

  constructor(public meta: SliderPatternDatabase.Meta, private data_offset: number, private underlying_data: Uint8Array) {

    this.region = new SliderPatternDatabase.Region.Active(meta.region)
  }

  /**
   * Returns the number of moves required to solve this region from the current state MOD 4
   * @param state
   */
  getDistance(state: SliderState): number {
    return this.getDistanceByIndex(this.region.stateIndex(state))
  }

  getDistanceByIndex(index: number): number {
    return (this.underlying_data[this.data_offset + ~~(index / 4)] >> (index % 4)) & 0x03
  }
}

export namespace SliderPatternDatabase {
  import SliderState = Sliders.SliderState;
  export type Region = Region.Tile[]

  export namespace Region {
    import factorial = util.factorial;
    import SliderState = Sliders.SliderState;
    import count = util.count;
    import Move = Sliders.Move;

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
      // move_table[1][i] = possible vertical moves when the blank tile is at position i+
      move_table: Move[][][]

      constructor(private region: Region) {
        this.current = count(region, t => t == Tile.CURRENT) + 1 // +1 because the blank tile is always part of this
        this.freedom = count(region, t => t != Tile.FIXED)

        this.number_of_permutations = factorial(this.current)
        this.size = factorial(this.freedom, this.freedom - this.current)

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

      stateIndex(state: SliderState): number {
        function permutationIndex(pm: number[]): number {
          const n = permutation.length

          let t = 0;
          for (let i = 0; i < permutation.length - 1; i++) {
            t *= (n - i)
            for (let j = i + 1; j < n; j++) {
              if (pm[i] > pm[j]) t += 1
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

            if (this.combination_relevant_tiles[state[index]]) {
              // There's a relevant tile in this position

              combination_index += n_choose_k_table[i][counter]
              counter += 1
            }
          }
        }

        const permutation: number[] = []
        state.forEach((tile) => {
          if (this.permutation_table[tile] != null) {
            permutation.push(this.permutation_table[tile])
          }
        })

        return combination_index * this.number_of_permutations + permutationIndex(permutation)
      }

      satisfied(state: SlideStateWithBlank): boolean {
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

  export type Meta = {
    region: Region,
  }

  export class RegionGraph {
    private edges: [SliderPatternDatabase, SliderPatternDatabase][] = []

    constructor(private databases: SliderPatternDatabase[]) {
      databases.forEach(parent => databases.forEach(child => {
        if (SliderPatternDatabase.Region.isChild(parent.meta.region, child.meta.region)) this.edges.push([parent, child])
      }))

      debugger
    }

    getChildren(parent: SliderPatternDatabase): SliderPatternDatabase[] {
      return this.edges.filter(e => e[0] == parent).map(e => e[1])
    }

    getEntryPoints(): SliderPatternDatabase[] {
      return this.databases.filter(db => SliderPatternDatabase.Region.isFirst(db.meta.region))
    }
  }

  export async function generate(region: Region, multitile: boolean): Promise<SliderPatternDatabase> {
    const r = new Region.Active(region)

    const distance = new Array(r.size).fill(null)

    async function traverse(state: SliderState, next_direction: 0 | 1, depth: number, depth_limit: number): Promise<number> {


      // TODO: There's another abortion condition here to prune the tree early

      const index = r.stateIndex(state)

      if (depth == depth_limit) {
        if (index >= r.size) debugger

        if (distance[index] != null) {
          return 0
        } // branch already visited
        else {
          distance[index] = depth
          return 1
        }
      } else if (depth > distance[index]) {
        // If we arrived here at a larger depth than saved for this state, we can't find new nodes
        return 0
      }

      const moves = r.move_table[next_direction][SliderState.blank(state)]

      let n = 0
      for (const move of moves) {
        const child = SliderState.withMove(state, move)

        n += await traverse(child, 1 - next_direction as 0 | 1, depth + 1, depth_limit)
      }

      if(n % 1000 == 0) await delay(1)

      return 1 + n
    }


    let limit = 0
    let c = 0

    // Iterative deepening
    while (c < r.size) {
      // TODO: Enumerate all solved states instead of just this one

      c += await traverse(SliderState.SOLVED, 0, 0, limit)
      c += await traverse(SliderState.SOLVED, 1, 0, limit)

      console.log(`Limit ${limit}, total ${c}`)

      limit++
    }

    const compressed = new Uint8Array(Math.ceil(r.size / 4)).fill(0)

    distance.forEach((d, i) => {
      compressed[~~(i / 4)] |= (d % 4) << i % 4
    })

    return new SliderPatternDatabase({region: region}, 0, compressed)
  }
}

export class SliderDatabaseMegafile {
  graph: SliderPatternDatabase.RegionGraph

  constructor(private data: Uint8Array) {
    const region_count = data[0]

    let offset = 0

    const regions: SliderPatternDatabase[] = []

    for (let i = 0; i < region_count; i++) {
      const region: SliderPatternDatabase.Region = Array.from(data.slice(offset, offset + 25)) as SliderPatternDatabase.Region

      offset += 25

      regions.push(new SliderPatternDatabase({region: region}, offset, data))

      offset += SliderPatternDatabase.Region.lookupTableSize(region)
    }

    this.graph = new SliderPatternDatabase.RegionGraph(regions)
  }

  static fromKumiNaTanoFiles(files: { region: SliderPatternDatabase.Region, data: Uint8Array }) {

  }
}