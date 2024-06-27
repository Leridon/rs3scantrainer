import {Region} from "./Region";

export type RegionDatabaseDescription = {
  region: Region,
  multitile: boolean
}

export namespace RegionDatabaseDescription {

  export const SERIALIZED_SIZE = 26

  export function serialize(description: RegionDatabaseDescription): Uint8Array {
    return new Uint8Array([description.multitile ? 1 : 0, ...description.region])
  }

  export function deserialize(data: Uint8Array, offset: number): RegionDatabaseDescription {

    const multitile = data[offset] == 1
    const tiles = data.slice(offset + 1, offset + 26)
    return {
      region: [...tiles] as Region.Tile[],
      multitile: multitile
    }

  }

  export class MoveTable {
    constructor(description: RegionDatabaseDescription) {

    }
  }
}