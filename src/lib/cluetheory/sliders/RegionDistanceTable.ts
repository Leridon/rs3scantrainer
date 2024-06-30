import {OptimizedSliderState} from "./OptimizedSliderState";
import {Region} from "./Region";
import {Process} from "../../Process";
import {Observable, observe} from "../../reactive";
import {MoveTable} from "./MoveTable";

export class RegionDistanceTable {
  public description: RegionDistanceTable.Description

  public readonly byte_size: number

  region: Region.Indexing
  move_table: MoveTable

  private real_data_offset: number

  constructor(public underlying_data: Uint8Array, private data_offset: number) {
    this.description = RegionDistanceTable.Description.deserialize(underlying_data, data_offset)

    this.region = new Region.Indexing(this.description.region)
    this.move_table = new MoveTable(this.description.region, this.description.multitile)

    this.byte_size = RegionDistanceTable.Description.SERIALIZED_SIZE + this.region.size / 4
    this.real_data_offset = data_offset + RegionDistanceTable.Description.SERIALIZED_SIZE
  }

  /**
   * Returns the number of moves required to solve this region from the current state MOD 4
   * @param state
   */
  getDistance(state: OptimizedSliderState): number {
    return this.getDistanceByIndex(this.region.stateIndex(state))
  }

  getDistanceByIndex(index: number): number {
    if (index > this.region.size) debugger

    return (this.underlying_data[this.real_data_offset + ~~(index / 4)] >> 2 * (index % 4)) & 0x03
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
        if (parent != child && Region.isChild(parent.description.region, child.description.region)) this.edges.push([parent, child])
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

    public region: Region.Indexing
    private visited_nodes: number = 0
    private current_depth: number = 0

    constructor(private description: Description) {
      super();

      this.region = new Region.Indexing(this.description.region)

      this.progress = observe<Generator.Progress>({region: this.region, nodes: 0, depth: 0})

      this.withInterrupt(100, 1)

      this.onInterrupt(() => {
        this.progress.set({region: this.region, nodes: this.visited_nodes, depth: this.current_depth})
      })
    }

    async implementation(): Promise<RegionDistanceTable> {

      const r = this.region
      const move_table = new MoveTable(this.description.region, this.description.multitile)

      const visited = new Uint8Array(Math.ceil(r.size / 8)).fill(0)
      const compressed = new Uint8Array(Description.SERIALIZED_SIZE + r.size / 4).fill(0)

      let depth = 0
      let current_depth: OptimizedSliderState[] = []
      let next_depth: OptimizedSliderState[] = []

      const push = (state: OptimizedSliderState, depth: number) => {
        const index = r.stateIndex(state)

        const h = ~~(index / 8)
        const l = index % 8

        if (((visited[h] >> l) & 1) != 0) return

        visited[h] |= 1 << l
        compressed[Description.SERIALIZED_SIZE + ~~(index / 4)] |= (depth % 4) << 2 * (index % 4)

        this.visited_nodes++

        next_depth.push(state)
      }

      // Determine all solved states
      if (r.solves_puzzle) {
        push(OptimizedSliderState.SOLVED, 0)
      } else {
        for (let i = 0; i < 25; i++) {
          if (this.description.region[i] == Region.Tile.FREE) {
            const state = OptimizedSliderState.copy(OptimizedSliderState.SOLVED)

            state[24] = i
            state[i] = 24
            state[OptimizedSliderState.BLANK_INDEX] = i

            push(state, 0)
          }
        }
      }

      while (next_depth.length > 0) {
        current_depth = next_depth
        next_depth = []

        console.log(`Depth ${depth}, total ${this.visited_nodes}/${r.size}, queue: ${current_depth.length.toString()}`)

        this.current_depth = depth++

        for (const node of current_depth) {
          if (this.visited_nodes % 100000 == 0) await this.checkTime()

          if (this.should_stop) return null

          for (const move of move_table.get(node)) {
            const child = OptimizedSliderState.copy(node)
            OptimizedSliderState.doMove(child, move)

            push(child, depth)
          }
        }
      }

      console.log(`Depth ${depth}, total ${this.visited_nodes}/${r.size}`)

      compressed.set(Description.serialize(this.description), 0)

      this.progress.set({region: this.region, nodes: this.visited_nodes, depth: this.current_depth})

      return new RegionDistanceTable(compressed, 0)
    }

    onProgress(f: (_: Generator.Progress) => void): this {
      this.progress.subscribe(f)
      return this
    }
  }


  export namespace Generator {
    export type Progress = {
      region: Region.Indexing,
      nodes: number,
      depth: number
    }
  }
}

