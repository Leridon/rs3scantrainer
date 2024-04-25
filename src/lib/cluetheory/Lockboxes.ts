export namespace Lockboxes {


  export type Tile = 0 | 1 | 2

  export namespace Tile {
    export function advance(tile: Tile): Tile {
      return (tile + 1) % 3 as Tile
    }
  }

  export type State = {
    tiles: Tile[][]
  }

  export namespace State {
    export function applyMove(state: State, move: [number, number]): void {
      
    }
  }
}