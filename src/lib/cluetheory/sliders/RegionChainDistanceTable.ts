import {RegionDistanceTable} from "./RegionDistanceTable";
import {Process} from "../../Process";
import {Region} from "./Region";
import {Observable, observe} from "../../reactive";

export class RegionChainDistanceTable {
  graph: RegionDistanceTable.RegionGraph

  constructor(private data: Uint8Array) {
    let offset = 0

    const regions: RegionDistanceTable[] = []

    while (offset < data.length) {
      const region = new RegionDistanceTable(data, offset)

      regions.push(region)

      offset += region.byte_size
    }

    this.graph = new RegionDistanceTable.RegionGraph(regions)
  }
}

export namespace RegionChainDistanceTable {
  export type Description = {
    multitile: boolean,
    regions: Region[]
  }

  export class Generator extends Process<RegionChainDistanceTable> {
    private progress: Observable<Generator.Progress>
    private active_generator: RegionDistanceTable.Generator = null

    constructor(private description: Description) {
      super();

      this.progress = observe<Generator.Progress>({
        generator: this,
        visited_nodes: 0,
        active_region: 0,
        sub_progress: this.description.regions.map(r => ({
          region: new Region.Active(r),
          depth: 0,
          nodes: 0
        }))
      })

      this.withInterrupt(100, 1)
    }

    public stop() {
      super.stop();

      this.active_generator?.stop()
    }

    async implementation(): Promise<RegionChainDistanceTable> {

      let solved_nodes = 0

      const generated_regions: RegionDistanceTable[] = []

      for (let i = 0; i < this.description.regions.length; i++) {
        if (this.should_stop) return null

        const region = this.description.regions[i]

        const generator = this.active_generator = new RegionDistanceTable.Generator({
          multitile: this.description.multitile,
          region: region
        })
          .onProgress(progress => {
            this.progress.update2(c => {
              c.visited_nodes = solved_nodes + c.visited_nodes
              c.active_region = i
              c.sub_progress[i] = progress
            })
          })

        generated_regions.push(await generator.run())

        console.log(`Generator ${i} ended`)

        solved_nodes += generator.region.size
      }

      // TODO: concat regions
    }

    onProgress(f: (_: Generator.Progress) => void): this {
      this.progress.subscribe(f)
      return this
    }
  }

  export namespace Generator {
    export type Progress = {
      generator: Generator
      visited_nodes: number,
      active_region: number,
      final_result?: RegionChainDistanceTable,
      sub_progress: RegionDistanceTable.Generator.Progress[]
    }
  }
}