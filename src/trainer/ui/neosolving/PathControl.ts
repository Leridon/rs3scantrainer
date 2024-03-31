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
import {Observable, observe} from "../../../lib/reactive";
import {TemplateResolver} from "../../../lib/util/TemplateResolver";
import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {CursorType} from "../../../lib/runescape/CursorType";
import {TransportData} from "../../../data/transports";
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

export class PathSectionControl extends Widget {
  constructor(
    private sections: SectionedPath,
    private current_section_id: number[],
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

      let currently_shown_path = (() => {
        let n = index(section_link, -2)
        assert(n.type == "inner")

        return n.children.map(c => {
          assert(c.type == "leaf")
          return c.value
        })
      })()

      if (this.step_graphics) {
        TreeArray.forLeafs(this.step_graphics, graphics => {
          // TODO(?) graphics.setHighlightable(false)
        })
      }

      currently_shown_path.forEach((step, index) => {
        let sectionindex = lodash.clone(this.current_section_id)
        sectionindex[sectionindex.length - 1] = index

        let graphics_node = TreeArray.index(this.step_graphics, sectionindex)
        assert(graphics_node.type == "leaf")

        new PathSectionControl.StepRow(
          sectionindex,
          step,
          this.template_resolver
        )
          .setAssociatedGraphics(graphics_node.value)
          .appendTo(this)
      })
    }
  }

  private setCurrentSection(ids: number[]) {
    this.current_section_id = TreeArray.fixIndex(this.sections, ids)
    this.render()
  }
}

export namespace PathSectionControl {
  import resolveTeleport = TransportData.resolveTeleport;

  export class StepRow extends Widget {
    highlighted: Observable<boolean> = observe(false)
    associated_graphics: PathStepEntity = null

    constructor(private section_index: number[],
                private step: Path.Step,
                private template_resolver: TemplateResolver
    ) {
      super();

      this.highlighted.subscribe(v => {
        this.toggleClass("ctr-neosolving-path-legend-highlighted", v)

        if (v) this.associated_graphics?.requestActivation(false)
        else this.associated_graphics?.resetActivation()
      })

      const index = util.index(this.section_index, -1)

      let order = c().text(`${index + 1}.`)

      const {icon, content} = StepRow.renderStep(step)

      hboxl(order, icon, content).addClass("ctr-neosolving-path-legend")
        .on("mouseover", () => this.setHighlight(true))
        .on("mouseleave", () => this.setHighlight(false))
        .appendTo(this)
    }

    setAssociatedGraphics(graphics: PathStepEntity): this {
      this.associated_graphics = graphics

      if (graphics) {
        //graphics.setHighlightable(true)

        this.associated_graphics.highlighted.subscribe(v => {
          this.setHighlight(v)
        })
      }

      return this
    }

    setHighlight(v: boolean) {
      this.highlighted.set(v)
    }
  }

  export namespace StepRow {
    export function renderStep(step: Path.Step): {
      icon?: Widget,
      content?: Widget
    } {
      let icon = c().addClass("ctr-neosolving-path-stepicon")
      let content = div()

      switch (step.type) {
        case "orientation":

          icon.append(img("assets/icons/compass.png"))

          content.append(
            "Face ",
            bold(direction.toString(step.direction))
          )

          break;
        case "ability":
          icon.append(img(ability_icon(step.ability)))

          content.append(
            capitalize(step.ability),
            " "
          )

          if (step.target) {
            content.append("on ", entity(step.target))

            if (step.target_text) {
              content.append(", ", step.target_text)
            }
          } else if (step.target_text) {
            content.append(step.target_text, " ")
          } else {
            content.append(
              bold(direction.toString(direction.fromVector(Vector2.sub(step.to, step.from))))
            )
          }

          break;
        case "run":
          icon.append(img("assets/icons/run.png"))

          content.append("Run ",)

          if (step.to_text) {
            content.append(step.to_text)
          } else {
            content.append(`${PathFinder.pathLength(step.waypoints)} tiles`)
          }

          break;
        case "teleport":
          let flat = resolveTeleport(step.id)

          icon.append(new TeleportIcon(flat)
            .css2({
              "display": "inline-block",
              "height": "20px"
            }))

          content.append(
            "Teleport to ",
            bold(flat.spot.name)
          )
          break;
        case "redclick":
          icon.append(img(CursorType.meta(step.how).icon_url))

          content.append(
            "Target ",
            staticentity("Entity")
          )
          break;
        case "powerburst":

          icon.append(img("assets/icons/accel.png")
            .tooltip("Powerburst of Acceleration"))

          content.append(
            "Drink ",
            span("Powerburst of Acceleration").addClass("nisl-item")
          )

          break;
        case "transport":
          let shortcut = step.internal
          let action = shortcut.actions[0]

          icon.append(img(CursorType.meta(step.internal.actions[0].cursor).icon_url))

          content.append(
            action.name, " ",
            entity(shortcut.entity)
          )

          break;
        case "cheat":
          icon.append(img("assets/icons/Rotten_potato.png"))
          content.append("")
          break
      }

      return {icon, content}
    }
  }
}

export default class PathControl extends Behaviour {
  private method: AugmentedMethod<GenericPathMethod> = null
  private sectioned_path: SectionedPath = null

  private path_layer: GameLayer = new GameLayer()
  private step_graphics: TreeArray<PathStepEntity, {}> = null

  private widget: Widget = null

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

  private set(method: AugmentedMethod<GenericPathMethod>,
              sections: SectionedPath,
              active_id: number[] = null
  ) {
    this.sectioned_path = sections
    this.method = method
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
      new PathSectionControl(
        this.sectioned_path,
        active_id,
        this.step_graphics,
        this.parent.app.template_resolver
      )
        .addClass("ctr-neosolving-solution-row")
        .appendTo(w)
    }

    if (w.container.is(":empty")) return

    this.widget = w.appendTo(this.parent.layer.path_container)
  }
}