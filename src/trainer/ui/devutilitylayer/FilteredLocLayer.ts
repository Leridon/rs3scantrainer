import {GameLayer, timeSync} from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import Properties from "../widgets/Properties";
import {storage} from "../../../lib/util/storage";
import {ewent, Observable, observe} from "../../../lib/reactive";
import {CacheTypes} from "./cachetools/CacheTypes";
import {LocUtil} from "./cachetools/util/LocUtil";
import TextField from "../../../lib/ui/controls/TextField";
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import {FloorLevels, ZoomLevels} from "../../../lib/gamemap/ZoomLevels";
import {boxPolygon} from "../polygon_helpers";
import {Rectangle, Vector2} from "lib/math";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import {Menu} from "../widgets/ContextMenu";
import Widget from "../../../lib/ui/Widget";
import * as leaflet from "leaflet"

import {LocParsingTable} from "./cachetools/ParsingTable";
import {C} from "../../../lib/ui/constructors";
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import LightButton from "../widgets/LightButton";
import * as lodash from "lodash";
import {LocInstanceProperties} from "./cachetools/LocInstanceProperties";
import LocDataFile = CacheTypes.LocDataFile;
import LocInstance = CacheTypes.LocInstance;
import getInstances = LocUtil.getInstances;
import LocWithUsages = CacheTypes.LocWithUsages;
import hbox = C.hbox;

export type LocFilter = {
  names?: string[],
  actions?: string[],
  object_ids?: number[],
  parser?: boolean | undefined
}

export namespace LocFilter {
  import getActions = LocUtil.getActions;
  import LocWithUsages = CacheTypes.LocWithUsages;

  export function normalize(filter: LocFilter): LocFilter {
    if (!filter.names) filter.names = []
    if (!filter.actions) filter.actions = []

    return filter
  }

  export function apply(filter: LocFilter, loc: LocWithUsages, parsing_table: LocParsingTable): boolean {
    if (filter.object_ids != null && filter.object_ids.length > 0 && !filter.object_ids.includes(loc.id)) return false

    if (filter.names && filter.names.length > 0 && !filter.names.some(n => loc.location.name!.toLowerCase().includes(n.toLowerCase()))) return false

    if (filter.actions && filter.actions.length > 0) {
      const actions = getActions(loc.location)

      if (!actions.some(a => filter.actions?.some(filter_action =>
        a.name.toLowerCase().includes(filter_action.toLowerCase()),
      ))) return false
    }

    if (filter.parser != null) {
      if (filter.parser != !!parsing_table.getGroupForLoc(loc.id)) return false
    }

    return true
  }
}

class LocFilterControl extends GameMapControl {
  storage = new storage.Variable<LocFilter>("devutility/locfilter", () => ({}))

  count_widget: Widget

  filter: Observable<LocFilter>

  go_to_first = ewent<null>()

  constructor() {
    super({
      type: "floating",
      position: "top-right",
    }, c());

    this.filter = observe(this.storage.get() ?? {})

    const props = new Properties()

    props.named("Name",
      new TextField()
        .setValue(this.filter.value().names ? this.filter.value().names.join(";") : "")
        .onCommit(v => {
          const names = v.split(";").map(l => l.trim().toLowerCase()).filter(l => l.length > 0)

          this.filter.update(f => f.names = names)
        })
    )

    props.named("Action",
      new TextField()
        .setValue(this.filter.value().actions ? this.filter.value().actions.join(";") : "")
        .onCommit(v => {
          const names = v.split(";").map(l => l.trim().toLowerCase()).filter(l => l.length > 0)

          this.filter.update(f => f.actions = names)
        })
    )

    props.named("Loc ID", new TextField()
      .setValue(this.filter.value().object_ids ? this.filter.value().object_ids.join(";") : "")
      .onCommit((v) => {
        const ids = v.split(";").map(l => Number(l.trim().toLowerCase())).filter(l => l != 0 && !Number.isNaN(l))

        this.filter.update(f => f.object_ids = ids)
      })
    )

    props.header("Parser")

    const group = new Checkbox.Group([
      {value: false, button: new Checkbox("No")},
      {value: true, button: new Checkbox("Yes")},
    ], true)
      .setValue(this.filter.value().parser)
      .onChange(v => {
        this.filter.update(f => f.parser = v)
      })

    props.row(hbox(...group.checkboxes()))

    this.filter.subscribe((f) => {
      this.storage.set(f)
    })

    props.named("Results", this.count_widget = c())

    props.row(new LightButton("Go to entity")
      .onClick(() => this.go_to_first.trigger(null)))

    this.content.append(props)
  }

  setCount(count: number): void {
    this.count_widget.text(`${count} instances match filter`)
  }
}

export class LocInstanceEntity extends MapEntity {
  private rendered_with_parser: boolean = undefined

  constructor(public instance: LocInstance, private parsing_table: LocParsingTable) {
    super()

    this.setInteractive()

    this.zoom_sensitivity_layers = ZoomLevels.none

    this.floor_sensitivity_layers = FloorLevels.single(instance.origin.level)

    this.setTooltip(() => new LocInstanceProperties(this.instance, this.parsing_table))
  }

  protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {
    const parsing_group = this.parsing_table && this.parsing_table.getPairing(this.instance)

    const has_parser = !!parsing_group.group
    const has_instance_parser = has_parser && (!parsing_group.group.parser.per_instance_parameter || parsing_group.instance_group)


    const box = boxPolygon(this.instance.box).setStyle({
      color: has_parser ? (has_instance_parser ? "green" : "yellow") : "red",
      stroke: true
    }).addTo(this)

    let true_west: [Vector2, Vector2]

    const rect = Rectangle.extend(this.instance.box, 0.5)

    switch (this.instance.rotation ?? 0) {
      case 0:
        true_west = [Rectangle.bottomLeft(rect), Rectangle.topLeft(rect)]
        break
      case 1:
        true_west = [Rectangle.topLeft(rect), Rectangle.topRight(rect)]
        break
      case 2:
        true_west = [Rectangle.topRight(rect), Rectangle.bottomRight(rect)]
        break
      case 3:
        true_west = [Rectangle.bottomRight(rect), Rectangle.bottomLeft(rect)]
        break
    }

    leaflet.polyline(true_west.map(Vector2.toLatLong), {
      color: "blue"
    }).addTo(this)

    this.rendered_with_parser = has_parser

    return box.getElement()
  }

  bounds(): Rectangle {
    return this.instance.box
  }

  async contextMenu(event: GameMapContextMenuEvent): Promise<Menu | null> {
    return {
      type: "submenu",
      text: this.instance.prototype.name ?? "Entity",
      children: []
    }
  }

  checkParserRedraw() {
    if (this.rendered_props.render_at_all && (this.parsing_table && !!this.parsing_table.getPairing(this.instance).group) != this.rendered_with_parser) {
      this.render(true)
    }
  }
}

const pre_filter: LocFilter = {
  actions: ["open", "use", "enter", "climb", "crawl", "scale", "pass", "jump", "leave", "teleport", "descend", "step", "walk", "cross", "exit", "squeeze",
    "stand", "ascend", "top", "bottomt", "descend", "across", "swing", "slash", "pray", "operate"]
}

export class FilteredLocLayer extends GameLayer {

  filter_control: LocFilterControl

  loc_entities: {
    loc: LocWithUsages,
    instances: LocInstanceEntity[]
  }[]

  constructor(private data: LocDataFile, private parsing_table: LocParsingTable) {
    super();

    this.add(this.filter_control = new LocFilterControl())

    this.init()

    this.parsing_table.version.subscribe(() => {
      this.entity_quadtree.forEachVisible(e => {
        if (e instanceof LocInstanceEntity) {
          e.checkParserRedraw()
        }
      })

      this.applyFilter()
    })

    this.filter_control.filter.subscribe(() => this.applyFilter())

    this.filter_control.go_to_first.on(() => {

      const a = lodash.maxBy(this.loc_entities, loc => {
        const v = LocFilter.apply(pre_filter, loc.loc, this.parsing_table)
          && LocFilter.apply(this.filter_control.filter.value(), loc.loc, this.parsing_table)

        return v ? loc.instances.length : -1
      })

      if (a) this.getMap().fitView(a.instances[0].instance.box)
    })
  }

  private applyFilter() {


    let count = 0

    this.loc_entities.forEach(loc => {
      const visible = LocFilter.apply(pre_filter, loc.loc, this.parsing_table)
        && LocFilter.apply(this.filter_control.filter.value(), loc.loc, this.parsing_table)

      if (visible) count += loc.instances.length

      loc.instances.forEach(instance => instance.setVisible(visible))
    })

    this.filter_control.setCount(count)
  }

  init() {
    timeSync("Initializing loc_entities", () => {
      this.loc_entities = this.data.getAll().map((loc) => {
        return {
          loc: loc,
          instances: getInstances(loc).map(i => new LocInstanceEntity(i, this.parsing_table))
        }
      })
    })

    this.applyFilter()

    this.loc_entities.forEach(l => l.instances.forEach(i => i.addTo(this)))
  }
}