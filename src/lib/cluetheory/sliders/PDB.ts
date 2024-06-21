import {Sliders} from "../Sliders";
import {util} from "../../util/util";

export namespace SliderPDB {
  import SliderState = Sliders.SliderState;
  type Region = Region.Tile[]

  export namespace Region {
    import SliderState = Sliders.SliderState;
    import todo = util.todo;
    export type Tile = typeof Tile.LOCKED | typeof Tile.FIXED | typeof Tile.CURRENT | typeof Tile.FREE

    export namespace Tile {
      export const FREE = 0
      export const CURRENT = 1
      export const FIXED = 2
      export const LOCKED = 3
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
  }

  export class PatternDB {
    constructor(private meta: PatternDB.Meta, private data: Uint8Array) {

    }

    get(state: SliderState): Sliders.Move {
      const state_index = Region.stateIndex(this.meta.region, state)

      // TODO: Incorporate compression techniques for data

      return this.data[state_index] - SliderState.blank(state)
    }
  }

  export namespace PatternDB {
    export type Meta = {
      region: Region,
      type: "multitile" | "singletile"
    }
  }
}
