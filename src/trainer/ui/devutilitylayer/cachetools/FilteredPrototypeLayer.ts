import {GameLayer} from "../../../../lib/gamemap/GameLayer";
import {ProcessedCacheTypes} from "./ProcessedCacheTypes";
import {ewent} from "../../../../lib/reactive";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {areaPolygon} from "../../polygon_helpers";
import {Rectangle} from "../../../../lib/math";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {PrototypeProperties} from "./PrototypeExplorer";
import PrototypeInstance = ProcessedCacheTypes.PrototypeInstance;
import Prototype = ProcessedCacheTypes.Prototype;

interface Filter {

  applyPrototype(prototype: Prototype): boolean

  applyInstance(instance: PrototypeInstance): boolean
}

namespace Filter {
  import PrototypeID = ProcessedCacheTypes.PrototypeID;

  export function none(): Filter {
    return new class implements Filter {
      applyPrototype(prototype: ProcessedCacheTypes.Prototype): boolean {
        return true
      }

      applyInstance(instance: ProcessedCacheTypes.PrototypeInstance): boolean {
        return true
      }
    }
  }

  export type Config = {
    names: string[],
    action_names: string[],
    type: PrototypeID["0"] | undefined,
  }

  export function forConfig(config: Config): Filter {
    return new class implements Filter {
      applyInstance(instance: ProcessedCacheTypes.PrototypeInstance): boolean {
        return true;
      }

      applyPrototype(prototype: ProcessedCacheTypes.Prototype): boolean {
        if (config.names.length > 0 && !config.names.some(n => prototype.name.toLowerCase().includes(n))) return false
        if (config.action_names.length > 0 && !config.action_names.some(n => prototype.actions.some(a => a[0].toLowerCase().includes(n)))) return false

        if(config.type && config.type != prototype.id[0]) return false

        return true;
      }

    }
  }
}

export class PrototypeInstanceDataSource {
  created = ewent<PrototypeInstance>()
  removed = ewent<PrototypeInstance>()

  protected constructor(private data: PrototypeInstance[]) {

  }

  get(): PrototypeInstance[] {
    return this.data
  }

  static fromList(instance: PrototypeInstance[]) {
    return new PrototypeInstanceDataSource(instance)
  }
}


class PrototypeInstanceEntity extends MapEntity {

  constructor(private instance: PrototypeInstance) {
    super();

    this.setTooltip(() => new PrototypeProperties(this.instance.prototype))
  }

  protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {

    const color = this.instance.isLoc() ? "cyan" : "yellow"

    const box = areaPolygon(this.instance.box).setStyle({
      color: color,
      stroke: true
    }).addTo(this)


    return box.getElement()
  }

  bounds(): Rectangle {
    return TileArea.toRect(this.instance.box);
  }
}

export class FilteredPrototypeLayer extends GameLayer {
  private filter: Filter

  private lookup_table: {
    loc: {
      prototype: Prototype.Loc,
      entities: PrototypeInstanceEntity[]
    }[],
    npc: {
      prototype: Prototype.Loc,
      entities: PrototypeInstanceEntity[]
    }[]
  } = {
    loc: [],
    npc: []
  }

  constructor(private pre_filter: Filter = Filter.none()) {
    super()
  }

  addDataSource(...sources: PrototypeInstanceDataSource[]): this {
    sources.forEach(source => {
      source.get().forEach(instance => this.create(instance))

      source.created.on(i => this.create(i)).bindTo(this.handler_pool)
    })

    return this
  }

  private create(instance: PrototypeInstance) {

    let entry = this.lookup_table[instance.prototype.id[0]][instance.prototype.id[1]]

    if (!entry) {
      entry = this.lookup_table[instance.prototype.id[0]][instance.prototype.id[1]] = {
        prototype: instance.prototype as any,
        entities: []
      }
    }

    entry.entities.push(new PrototypeInstanceEntity(instance).addTo(this))
  }

  setFilter(filter: Filter) {

  }
}