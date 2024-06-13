import {CursorType} from "../../../../lib/runescape/CursorType";
import {Vector2} from "../../../../lib/math";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import * as lodash from "lodash";
import {CacheTypes} from "./CacheTypes";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";

export namespace ProcessedCacheTypes {

  import npcs = CacheTypes.npcs;
  import objects = CacheTypes.objects;
  export type cache = { type: "npc", id: PrototypeID.NPC, data: npcs } | { type: "loc", id: PrototypeID.Loc, data: objects }

  type Action = [string, CursorType, number]

  export type Prototype = Prototype.Loc | Prototype.Npc

  export namespace Prototype {
    type base = {
      id: PrototypeID;
      size: Vector2,
      actions: Action[],
      name: string,
    }

    export type Loc = base & {
      raw: objects,
      id: PrototypeID.Loc,
    }

    export type Npc = base & {
      raw: npcs,
      id: PrototypeID.NPC
    }

    export function isLoc(prototype: Prototype): prototype is Loc {
      return prototype.id[0] == "loc"
    }

    export function fromCache(cache: cache & { type: "loc" }): Prototype.Loc
    export function fromCache(cache: cache & { type: "npc" }): Prototype.Npc
    export function fromCache(cache: cache): Prototype {
      switch (cache.type) {
        case "npc":
          return {
            id: cache.id,
            name: cache.data.name,
            actions: [],
            raw: cache.data,
            size: {x: 1, y: 1}
          } satisfies Prototype.Npc

        case "loc":
          return {
            id: cache.id,
            name: cache.data.name,
            actions: [],
            raw: cache.data,
            size: {x: cache.data.width ?? 1, y: cache.data.length ?? 1}
          } satisfies Prototype.Loc
      }
    }
  }

  export type PrototypeID = PrototypeID.NPC | PrototypeID.Loc

  export namespace PrototypeID {
    export type base = [string, number]
    export type NPC = base & ["npc", number]
    export type Loc = base & ["loc", number]

    export function hash(id: PrototypeID): string {
      return id[0] + ":" + id[1]
    }
  }

  export type Instance = Instance.Loc | Instance.NPC

  export namespace Instance {
    type base = {
      id: PrototypeID,
      rotation: number,
      position: TileCoordinates
    }

    export type Loc = base & { id: PrototypeID.Loc } & {}
    export type NPC = base & { id: PrototypeID.NPC } & {}
  }

  export type GroupedInstanceData = GroupedInstanceData.Loc | GroupedInstanceData.NPC

  export namespace GroupedInstanceData {
    export type base = { id: PrototypeID, instances: Instance[] }
    export type Loc = base & { id: PrototypeID.Loc, instances: Instance.Loc[] }
    export type NPC = base & { id: PrototypeID.NPC, instances: Instance.NPC[] }

    export function combine(...data: GroupedInstanceData[][]): GroupedInstanceData[] {
      const combined: Record<string, GroupedInstanceData> = {}

      data.forEach(group => group.forEach(data => {
        const hash = PrototypeID.hash(data.id)
        if (!combined[hash]) combined[hash] = lodash.cloneDeep(data)
        else combined[hash].instances.push(...lodash.cloneDeep(data.instances))
      }))

      return Object.values(combined)
    }
  }

  type FileA = Prototype[]
  type FileB = GroupedInstanceData[]

  export class PrototypeInstance<T extends Prototype = Prototype> {
    public readonly box: TileArea

    constructor(
      private prototype: T,
      private instance: T extends Prototype.Npc ? Instance.NPC : Instance.Loc,
    ) {
      this.box = TileArea.init(
        this.instance.position,
        (this.instance.rotation % 2 == 0)
          ? this.prototype.size
          : {x: this.prototype.size.y, y: this.prototype.size.y}
      )
    }

    isLoc(): this is PrototypeInstance<Prototype.Loc> {
      return this.prototype.id[0] == "loc"
    }
  }

  export class PrototypeIndex {
    private lookup_table: {
      loc: Prototype.Loc[],
      npc: Prototype.Npc[]
    } = {
      loc: [],
      npc: []
    }

    constructor(public data: Prototype[]) {
      data.forEach(proto => {
        const is_loc = Prototype.isLoc(proto)

        if (is_loc) {
          this.lookup_table.loc[proto.id[1]] = proto
        } else {
          this.lookup_table.npc[proto.id[1]] = proto
        }
      })
    }

    static fromPrototypes(prototypes: Prototype[]): PrototypeIndex {
      return new PrototypeIndex(prototypes) as PrototypeIndex
    }

    lookup(id: PrototypeID.Loc): Prototype.Loc
    lookup(id: PrototypeID.NPC): Prototype.Npc
    lookup(id: PrototypeID): Prototype
    lookup(id: PrototypeID): Prototype {
      return this.lookup_table[id[0]][id[1]]
    }

    resolve(instance: Instance.Loc): PrototypeInstance<Prototype.Loc>
    resolve(instance: Instance.NPC): PrototypeInstance<Prototype.Npc>
    resolve(instance: Instance): PrototypeInstance<Prototype>
    resolve(instance: Instance): PrototypeInstance<Prototype> {
      const resolve = this.lookup(instance.id)

      return new PrototypeInstance(resolve, instance)
    }
  }
}