import {Queue} from "queue-typescript";
import {OptimizedSliderState} from "./OptimizedSliderState";
import {Region} from "./Region";
import {Process} from "../../Process";
import {Observable, observe} from "../../reactive";

export class RegionDistanceTable {
  public description: RegionDistanceTable.Description

  public readonly byte_size: number

  region: Region.Active

  constructor(private underlying_data: Uint8Array, private data_offset: number = 0) {
    this.description = RegionDistanceTable.Description.deserialize(underlying_data, data_offset)

    this.region = new Region.Active(this.description.region)

    this.byte_size = RegionDistanceTable.Description.SERIALIZED_SIZE + this.region.size / 4
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

export namespace RegionDistanceTable {
  export type Description = {
    region: Region,
    multitile: boolean
  }

  export namespace Description {
    export const SERIALIZED_SIZE = 26

    export function serialize(description: Description): Uint8Array {
      return new Uint8Array([description.multitile ? 1 : 0, ...description.region])
    }

    export function deserialize(data: Uint8Array, offset: number): Description {
      const multitile = data[offset] == 1
      const tiles = data.slice(offset + 1, offset + 26)
      return {
        multitile: multitile,
        region: [...tiles] as Region.Tile[],
      }
    }

    export class MoveTable {
      constructor(description: Description) {

      }
    }
  }

  export class RegionGraph {
    private edges: [RegionDistanceTable, RegionDistanceTable][] = []

    constructor(private databases: RegionDistanceTable[]) {
      databases.forEach(parent => databases.forEach(child => {
        if (Region.isChild(parent.description.region, child.description.region)) this.edges.push([parent, child])
      }))
    }

    getChildren(parent: RegionDistanceTable): RegionDistanceTable[] {
      return this.edges.filter(e => e[0] == parent).map(e => e[1])
    }

    getEntryPoints(): RegionDistanceTable[] {
      return this.databases.filter(db => Region.isFirst(db.description.region))
    }
  }

  export class Generator extends Process<RegionDistanceTable> {
    private progress: Observable<Generator.Progress>

    public region: Region.Active
    private visited_nodes: number = 0
    private current_depth: number = 0

    constructor(private description: Description) {
      super();

      this.region = new Region.Active(this.description.region)

      this.progress = observe<Generator.Progress>({region: this.region, nodes: 0, depth: 0})

      this.withInterrupt(100, 1)

      this.onInterrupt(() => {
        this.progress.set({region: this.region, nodes: this.visited_nodes, depth: this.current_depth})
      })
    }

    async implementation(): Promise<RegionDistanceTable> {

      const r = this.region

      const visited = new Uint8Array(Math.ceil(r.size / 8)).fill(0)
      const compressed = new Uint8Array(Description.SERIALIZED_SIZE + r.size / 4).fill(0)

      const queue = new Queue<{
        state: OptimizedSliderState,
        next_direction: 0 | 1,
        depth: number
      }>()

      const push = (state: OptimizedSliderState, next_direction: 0 | 1, depth: number) => {
        const index = r.stateIndex(state)

        const h = ~~(index / 8)
        const l = index % 8

        if (((visited[h] >> l) & 1) != 0) return

        visited[h] |= 1 << l
        compressed[Description.SERIALIZED_SIZE + ~~(index / 4)] |= (depth % 4) << (index % 4)

        this.visited_nodes++

        queue.enqueue({
          state: state,
          next_direction: next_direction,
          depth: depth
        })
      }

      const pushStart = (state: OptimizedSliderState) => {
        const index = r.stateIndex(state)

        const h = ~~(index / 8)
        const l = index % 8

        visited[h] |= 1 << l

        this.visited_nodes++

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
          if (this.description.region[i] == Region.Tile.FREE) {
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

      while (queue.length > 0) {
        if (this.visited_nodes % 10000 == 0) await this.checkTime()

        if (this.should_stop) return null

        const node = queue.dequeue()

        if (node.depth > last_dist) {
          this.current_depth = node.depth

          console.log(`Depth ${node.depth}, total ${this.visited_nodes}/${r.size}, queue: ${queue.length.toString()}`)
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

      compressed.set(Description.serialize(this.description))

      this.progress.set({region: this.region, nodes: this.visited_nodes, depth: this.current_depth})

      return new RegionDistanceTable(compressed)
    }

    onProgress(f: (_: Generator.Progress) => void): this {
      this.progress.subscribe(f)
      return this
    }
  }


  export namespace Generator {
    export type Progress = {
      region: Region.Active,
      nodes: number,
      depth: number
    }
  }
}

