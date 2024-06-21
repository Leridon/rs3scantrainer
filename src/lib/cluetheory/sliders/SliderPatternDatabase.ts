import {Sliders} from "../Sliders";
import {util} from "../../util/util";
import {lazy} from "../../properties/Lazy";
import SlideStateWithBlank = Sliders.SlideStateWithBlank;
import Move = Sliders.Move;
import SliderState = Sliders.SliderState;

const blank_move_table = lazy<Move[][][]>(() => {
  return new Array(25).fill(null).map((_, blank_tile) => {
    const x = blank_tile % 5
    const y = Math.floor(blank_tile / 5);

    const move_map = [
      ...[0, 1, 2, 3, 4].filter(move_y => move_y != y).map(move_y => move_y * 5 + x),
      ...[0, 1, 2, 3, 4].filter(move_x => move_x != x).map(move_x => y * 5 + move_x)
    ]

    return new Array(256).fill(null).map((_, profile) => {

      return new Array(8).fill(null).flatMap((_, bit) => {
        if (((profile >> bit) & 1) != 0) return [move_map[bit]]
        else return []
      })
    })
  })
})

export class SliderPatternDatabase {
  constructor(public meta: SliderPatternDatabase.Meta, private data_offset: number, private underlying_data: Uint8Array) {

    this.isSolved = SliderPatternDatabase.Region.toSatisfiedPredicate(meta.region)
  }

  get(state: SlideStateWithBlank): Move[] {
    const state_index = SliderPatternDatabase.Region.stateIndex(this.meta.region, state.tiles)

    const profile = this.underlying_data[this.data_offset + state_index]

    return blank_move_table.get()[state.blank][profile]
  }

  isSolved: (_: SliderState) => boolean
}

export namespace SliderPatternDatabase {
  export type Region = Region.Tile[]

  export namespace Region {
    import SliderState = Sliders.SliderState;
    import todo = util.todo;
    import count = util.count;
    export type Tile = typeof Tile.LOCKED | typeof Tile.FIXED | typeof Tile.CURRENT | typeof Tile.FREE

    export namespace Tile {
      export const FREE = 0
      export const CURRENT = 1
      export const FIXED = 2
      export const LOCKED = 3
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
          case Tile.LOCKED:
            return parent_tile == Tile.LOCKED
        }
      })
    }

    export function solvesPuzzle(region: Region): boolean {
      return region.every(tile => tile != Tile.FREE)
    }

    export function stateIndex(region: Region, state: SliderState): number {
      todo()
    }

    export function toSatisfiedPredicate(region: Region): (_: SliderState) => boolean {
      const relevant_indices = region.flatMap((tile, position) => tile == Tile.CURRENT ? [position] : [])

      return state => relevant_indices.every(i => state[i] == i)
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