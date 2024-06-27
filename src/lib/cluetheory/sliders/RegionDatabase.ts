import {delay} from "../../../skillbertssolver/oldlib";
import {Queue} from "queue-typescript";
import {OptimizedSliderState} from "./OptimizedSliderState";
import {Region} from "./Region";
import {RegionDatabaseDescription} from "./RegionDatabaseDescription";


export class RegionDistanceDatabase {
  public description: RegionDatabaseDescription

  public readonly byte_size: number

  region: Region.Active

  constructor(private underlying_data: Uint8Array, private data_offset: number = 0) {
    this.description = RegionDatabaseDescription.deserialize(underlying_data, data_offset)

    this.region = new Region.Active(this.description.region)

    this.byte_size = RegionDatabaseDescription.SERIALIZED_SIZE + this.region.size / 4
  }

  /**
   * Returns the number of moves required to solve this region from the current state MOD 4
   * @param state
   */
  getDistance(state: OptimizedSliderState): number {
    return this.getDistanceByIndex(this.region.stateIndex(state))
  }

  getDistanceByIndex(index: number): number {
    return (this.underlying_data[this.data_offset + ~~(index / 4)] >> (index % 4)) & 0x03
  }
}

export namespace RegionDistanceDatabase {


  export class RegionGraph {
    private edges: [RegionDistanceDatabase, RegionDistanceDatabase][] = []

    constructor(private databases: RegionDistanceDatabase[]) {
      databases.forEach(parent => databases.forEach(child => {
        if (Region.isChild(parent.description.region, child.description.region)) this.edges.push([parent, child])
      }))
    }

    getChildren(parent: RegionDistanceDatabase): RegionDistanceDatabase[] {
      return this.edges.filter(e => e[0] == parent).map(e => e[1])
    }

    getEntryPoints(): RegionDistanceDatabase[] {
      return this.databases.filter(db => Region.isFirst(db.description.region))
    }
  }

  export async function generate(description: RegionDatabaseDescription): Promise<RegionDistanceDatabase> {
    const r = new Region.Active(description.region)

    /*
      const states: SliderState[] = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 24, 20, 21, 22, 23, 19],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 24, 18, 20, 21, 22, 23, 19],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 18, 20, 21, 22, 24, 19],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 18, 20, 21, 22, 19, 24],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 24, 20, 21, 22, 19, 18],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 24, 23, 20, 21, 22, 19, 18],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 23, 20, 21, 22, 24, 18],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 23, 20, 21, 22, 18, 24],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 24, 20, 21, 22, 18, 23],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 24, 19, 20, 21, 22, 18, 23],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 23],
      ]

      for (const state of states) {
        console.log(`${SliderState.toString(state)}\nindex: ${r.stateIndex(state)}`)
      }*/

    const EMPTY = 0xFF

    const distance = new Uint8Array(r.size).fill(EMPTY)

    let c = 0

    const queue = new Queue<{
      state: OptimizedSliderState,
      next_direction: 0 | 1,
      depth: number
    }>()

    function push(state: OptimizedSliderState, next_direction: 0 | 1, depth: number) {
      const index = r.stateIndex(state)

      if (distance[index] != EMPTY) return

      distance[index] = depth
      c++

      queue.enqueue({
        state: state,
        next_direction: next_direction,
        depth: depth
      })
    }

    function pushStart(state: OptimizedSliderState) {
      const index = r.stateIndex(state)

      distance[index] = 0
      c++

      queue.enqueue({
        state: state,
        next_direction: 0,
        depth: 0
      })

      queue.enqueue({
        state: state,
        next_direction: 1,
        depth: 0
      })
    }

    // Determine all solved states
    if (r.solves_puzzle) {
      pushStart(OptimizedSliderState.SOLVED)
    } else {
      for (let i = 0; i < 25; i++) {
        if (description.region[i] == Region.Tile.FREE) {
          const state = OptimizedSliderState.copy(OptimizedSliderState.SOLVED)

          state[24] = i
          state[i] = 24
          state[OptimizedSliderState.BLANK_INDEX] = i

          pushStart(state)
        }
      }
    }

    console.log(`Starting with ${queue.length} nodes`)

    let last_dist = -1

    let i = 0
    while (queue.length > 0) {
      i++
      if (c % 10000 == 0) await delay(1)

      const node = queue.dequeue()

      if (node.depth > last_dist) {
        console.log(`Depth ${node.depth}, total ${c}/${r.size}, queue: ${queue.length.toString()}`)
        last_dist = node.depth
      }

      const moves = r.move_table[node.next_direction][node.state[OptimizedSliderState.BLANK_INDEX]]

      for (const move of moves) {
        const child = OptimizedSliderState.copy(node.state)
        OptimizedSliderState.doMove(child, move)

        push(child, 1 - node.next_direction as 0 | 1, node.depth + 1)
      }
    }

    console.log(`Depth ${last_dist}, total ${c}/${r.size}`)

    const compressed = new Uint8Array(RegionDatabaseDescription.SERIALIZED_SIZE + r.size / 4).fill(0)

    compressed.set(RegionDatabaseDescription.serialize(description))

    distance.forEach((d, i) => {
      compressed[RegionDatabaseDescription.SERIALIZED_SIZE + ~~(i / 4)] |= (d % 4) << i % 4
    })

    return new RegionDistanceDatabase(compressed)
  }
}

export class SliderDatabaseMegafile {
  graph: RegionDistanceDatabase.RegionGraph

  constructor(private data: Uint8Array) {
    let offset = 0

    const regions: RegionDistanceDatabase[] = []

    while (offset < data.length) {
      const region = new RegionDistanceDatabase(data, offset)

      regions.push(region)

      offset += region.byte_size
    }

    this.graph = new RegionDistanceDatabase.RegionGraph(regions)
  }
}