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
import {FloorLevels, ZoomLevels} from "../../../../lib/gamemap/ZoomLevels";

export interface PrototypeFilter {

  applyPrototype(prototype: Prototype): boolean

  applyInstance(instance: PrototypeInstance): boolean
}

export namespace PrototypeFilter {
  import PrototypeID = ProcessedCacheTypes.PrototypeID;

  export function none(): PrototypeFilter {
    return new class implements PrototypeFilter {
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

  export function forConfig(config: Config): PrototypeFilter {
    return new class implements PrototypeFilter {
      applyInstance(instance: ProcessedCacheTypes.PrototypeInstance): boolean {
        return true;
      }

      applyPrototype(prototype: ProcessedCacheTypes.Prototype): boolean {
        if (config.names.length > 0 && !config.names.some(n => prototype.name.toLowerCase().includes(n))) return false
        if (config.action_names.length > 0 && !config.action_names.some(n => prototype.actions.some(a => a[0].toLowerCase().includes(n)))) return false

        if (config.type && config.type != prototype.id[0]) return false

        return true;
      }

    }
  }

  export function pre_filter(): PrototypeFilter {
    return forConfig({
      action_names: ["open", "use", "enter", "climb", "crawl", "scale", "pass", "jump", "leave", "teleport", "descend", "step", "walk", "cross", "exit", "squeeze",
        "stand", "ascend", "top", "bottom", "descend", "across", "swing", "slash", "pray", "operate", "pull", "dig", "push", "grapple",
        "board", "swim", "through", "past", "attune", "traverse", "vault", "slide", "merge", "activate", "charge", "chop-down"],
      names: [],
      type: undefined
    })
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

  constructor(public instance: PrototypeInstance) {
    super();

    this.zoom_sensitivity_layers = ZoomLevels.none

    this.floor_sensitivity_layers = FloorLevels.single(instance.box.origin.level)

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
  private filter: PrototypeFilter = PrototypeFilter.none()

  private lookup_table: {
    loc: {
      prototype: Prototype.Loc,
      pre_filtered: boolean,
      entities: PrototypeInstanceEntity[]
    }[],
    npc: {
      prototype: Prototype.Loc,
      pre_filtered: boolean,
      entities: PrototypeInstanceEntity[]
    }[]
  } = {
    loc: [],
    npc: []
  }

  constructor(private pre_filter: PrototypeFilter = PrototypeFilter.none()) {
    super()
  }

  addDataSource(...sources: PrototypeInstanceDataSource[]): this {
    this.rendering.lock()

    sources.forEach(source => {
      source.get().forEach(instance => this.create(instance))

      source.created.on(i => this.create(i)).bindTo(this.handler_pool)
    })

    this.rendering.unlock()

    this.updateFilter()

    return this
  }

  private create(instance: PrototypeInstance) {

    let entry = this.lookup_table[instance.prototype.id[0]][instance.prototype.id[1]]

    if (!entry) {
      entry = this.lookup_table[instance.prototype.id[0]][instance.prototype.id[1]] = {
        prototype: instance.prototype as any,
        pre_filtered: this.pre_filter.applyPrototype(instance.prototype),
        entities: []
      }
    }

    if (entry.pre_filtered) {
      entry.entities.push(new PrototypeInstanceEntity(instance).setVisible(
        this.filter.applyPrototype(instance.prototype) && this.filter.applyInstance(instance)
      ).addTo(this))
    }
  }

  private updateFilter() {
    this.lookup_table.loc.forEach(entry => {
      if (!entry || !entry.pre_filtered) return

      const prototype_visible = this.filter.applyPrototype(entry.prototype)

      entry.entities.forEach(entity => {
        const visible = prototype_visible && this.filter.applyInstance(entity.instance)

        entity.setVisible(visible)
      })
    })

    this.lookup_table.npc.forEach(entry => {
      if (!entry || !entry.pre_filtered) return

      const prototype_visible = this.filter.applyPrototype(entry.prototype)

      entry.entities.forEach(entity => {
        const visible = prototype_visible && this.filter.applyInstance(entity.instance)

        entity.setVisible(visible)
      })
    })
  }

  setFilter(filter: PrototypeFilter): this {
    this.filter = filter

    this.updateFilter()

    return this
  }
}