import Behaviour from "../../../lib/ui/Behaviour";
import {Path} from "../../../lib/runescape/pathing";
import Widget from "../../../lib/ui/Widget";
import {PathGraphics} from "../path_graphics";
import * as lodash from "lodash";
import {capitalize} from "lodash";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {C} from "../../../lib/ui/constructors";
import {SolvingMethods} from "../../model/methods";
import {AugmentedMethod} from "../../model/MethodPackManager";
import MethodSelector from "./MethodSelector";
import {NislIcon} from "../nisl";
import TeleportIcon from "../widgets/TeleportIcon";
import {direction, PathFinder} from "../../../lib/runescape/movement";
import {Vector2} from "../../../lib/math";
import {PathStepEntity} from "../map/entities/PathStepEntity";
import {util} from "../../../lib/util/util";
import {TreeArray} from "../../../lib/util/TreeArray";
import * as assert from "assert";
import {ewent, Observable, observe} from "../../../lib/reactive";
import {TemplateResolver} from "../../../lib/util/TemplateResolver";
import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {CursorType} from "../../../lib/runescape/CursorType";
import {TransportData} from "../../../data/transports";
import {deps} from "../../dependencies";
import {CTRIcon} from "../../CTRIcon";
import KeyValueStore from "../../../lib/util/KeyValueStore";
import hbox = C.hbox;
import span = C.span;
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import div = C.div;
import hboxl = C.hboxl;
import img = C.img;
import staticentity = C.staticentity;
import ability_icon = PathGraphics.ability_icon;
import bold = C.bold;
import entity = C.entity;
import SectionedPath = Path.SectionedPath;
import index = util.index;

class SectionMemory {

  private data = KeyValueStore.instance().variable<Record<string, number[]>>("preferences/pathsectionmemory")

  constructor() {
    if (!this.data.get()) {
      this.data.set({})
    }
  }

  private hash(method: AugmentedMethod): string {
    return method.pack.local_id + method.method.id
  }

  async get(method: AugmentedMethod): Promise<number[]> {
    return (await this.data.get()) ?. [this.hash(method)]
  }

  async store(method: AugmentedMethod, section: number[]) {
    const value = (await this.data.get()) ?? {}

    value[this.hash(method)] = section

    await this.data.set(value)
  }
}

export class PathSectionControl extends Widget {
  section_selected = ewent<Path.raw>()

  public selected_section: Path.raw = undefined

  constructor(
    private sections: SectionedPath,
    public current_section_id: number[],
    private step_graphics: TreeArray<PathStepEntity, {}>,
    private template_resolver: TemplateResolver,
  ) {
    super()

    this.render()
  }

  render() {
    this.empty()

    if (this.sections && this.current_section_id) {
      let section_link = TreeArray.getPath(this.sections, this.current_section_id)

      {
        section_link.forEach((node, i) => {
          if (i == 0 || node?.type != "inner") return // Ignore root node and steps

          let parent = section_link[i - 1]

          assert(parent.type == "inner")

          if (parent.children.length <= 1) return // Don't draw section controls if there is just one

          let section_id = parent.children.indexOf(node)

          if (node.type == "inner") {
            hbox(
              section_id > 0 ? NislIcon.arrow("left").withClick(() => {
                let cp = lodash.clone(this.current_section_id)
                cp[i - 1] -= 1
                this.setCurrentSection(cp)
              }) : undefined,
              span(node.value.name).css("flex-grow", "1").css("text-align", "center"),
              section_id < parent.children.length - 1 ? NislIcon.arrow("right").withClick(() => {
                let cp = lodash.clone(this.current_section_id)
                cp[i - 1] += 1
                this.setCurrentSection(cp)
              }) : undefined,
            )
              .appendTo(this)
          }
        })
      }

      this.selected_section = (() => {
        let n = index(section_link, -2)
        assert(n.type == "inner")

        return n.children.map(c => {
          assert(c.type == "leaf")
          return c.value
        })
      })()
    }
  }

  private setCurrentSection(ids: number[]) {
    this.current_section_id = TreeArray.fixIndex(this.sections, ids)

    this.render()

    this.section_selected.trigger(this.selected_section)
  }

  onSelection(f: (_: Path.raw) => any): this {
    this.section_selected.on(f)
    return this
  }
}

export default class PathControl extends Behaviour {
  private section_memory = new SectionMemory()

  private method: AugmentedMethod<GenericPathMethod> = null
  private sectioned_path: SectionedPath = null

  private path_layer: GameLayer = new GameLayer()
  private step_graphics: TreeArray<PathStepEntity, {}> = null

  private widget: Widget = null

  section_selected = ewent<Path.raw>()

  constructor(private parent: NeoSolvingBehaviour) {
    super();
  }

  protected begin() {
    this.path_layer.addTo(this.parent.layer)
  }

  protected end() {
    this.path_layer.remove()
  }

  /**
   * Sets the path displayed in the legend and on the map.
   * Automatically splits it into appropriate sections, use {@link setSections} for more fine-grained control.
   * @param path
   */
  setPath(path: Path.raw) {
    this.set(null, Path.Section.split_into_sections(path))
  }

  setSections(sections: SectionedPath, active_id: number[] = null) {
    this.set(null, sections, active_id)
  }

  setMethod(method: AugmentedMethod<GenericPathMethod>) {
    let sectioned: Path.SectionedPath = TreeArray.init({name: "root"})

    if (method.method.pre_path && method.method.pre_path.length > 0) {
      TreeArray.add(sectioned,
        Path.Section.split_into_sections(method.method.pre_path, "Pre Path")
      )
    }

    TreeArray.add(sectioned,
      Path.Section.split_into_sections(method.method.main_path, "Main Path")
    )

    if (method.method.post_path && method.method.post_path.length > 0) {
      TreeArray.add(sectioned,
        Path.Section.split_into_sections(method.method.post_path, "Post Path")
      )
    }

    if (sectioned.children.length == 1) sectioned = sectioned.children[0]

    this.set(method, sectioned)
  }

  private async set(method: AugmentedMethod<GenericPathMethod>,
                    sections: SectionedPath,
                    active_id: number[] = null
  ) {
    this.sectioned_path = sections
    this.method = method

    if (method && !active_id) {
      active_id = await this.section_memory.get(method)
    }

    const section_id = TreeArray.fixIndex(this.sectioned_path, active_id || [])

    this.path_layer.clearLayers()
    this.step_graphics = TreeArray.map(this.sectioned_path, (step) => {
      return new PathStepEntity(step)
        .setInteractive()
        .addTo(this.path_layer)
    })

    this.renderWidget(section_id)
  }

  reset(): this {
    this.sectioned_path = null
    this.method = null

    this.widget?.remove()
    this.widget = null
    this.path_layer.clearLayers()

    return this
  }

  private renderWidget(active_id: number[]) {
    this.widget?.remove()
    this.widget = null

    let w = c()

    if (this.method) {
      new MethodSelector(this.parent, this.method.method.for)
        .addClass("ctr-neosolving-solution-row")
        .appendTo(w)
    }

    if (this.sectioned_path) {
      const section_control = new PathSectionControl(
        this.sectioned_path,
        active_id,
        this.step_graphics,
        this.parent.app.template_resolver
      )
        .onSelection(p => {
          if (this.method) {
            this.section_memory.store(this.method, section_control.current_section_id)
          }

          this.section_selected.trigger(p)
        })
        .addClass("ctr-neosolving-solution-row")

      // Only actually add the widget if there is something to show to avoid borders showing up
      if (!section_control.container.is(":empty")) section_control.appendTo(w)

      this.section_selected.trigger(section_control.selected_section)
    }

    if (w.container.is(":empty")) return

    this.widget = w.appendTo(this.parent.layer.path_container)
  }
}