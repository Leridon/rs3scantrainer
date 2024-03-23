import MethodSubEditor from "./MethodSubEditor";
import MethodEditor from "./MethodEditor";
import {AugmentedMethod} from "../../model/MethodPackManager";
import {SolvingMethods} from "../../model/methods";
import PathProperty from "../pathedit/PathProperty";
import {PathEditor} from "../pathedit/PathEditor";
import {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {GameLayer} from "../../../lib/gamemap/GameLayer";
import Widget from "../../../lib/ui/Widget";
import Properties from "../widgets/Properties";
import * as lodash from "lodash";
import {Path} from "../../../lib/runescape/pathing";
import {Clues} from "../../../lib/runescape/clues";
import {deps} from "../../dependencies";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import movement_state = Path.movement_state;
import activate = TileArea.activate;

function getSection(method: GenericPathMethod, section: "pre" | "post" | "main") {
  switch (section) {
    case "pre":
      return method.pre_path
    case "post":
      return method.post_path
    case "main":
      return method.main_path
  }
}

export default class GenericPathMethodEditor extends MethodSubEditor {
  path_editor: SingleBehaviour<PathEditor> = this.withSub(new SingleBehaviour<PathEditor>())

  sidepanel_widget: Widget

  sequence: GenericPathMethodEditor.Sequence = []

  constructor(parent: MethodEditor,
              public value: AugmentedMethod<GenericPathMethod>,
  ) {
    super(parent);

    this.layer = new GameLayer()

    this.assumptions.subscribe((v) => {
      this.updateSequence()
    })
  }

  private setPathEditor(options: PathEditor.options_t): PathEditor {
    let editor = new PathEditor(
      this.layer,
      deps().app.template_resolver,
      options,
      false)
      .onStop(() => {
        this.propagateState()
        //if (this.tree_edit.active_node.value() == node) this.tree_edit.setActiveNode(null)
      })

    this.path_editor.set(editor)

    return editor
  }

  protected begin() {
    super.begin()

    this.sidepanel_widget = c().appendTo(this.parent.sidebar.body)

    this.layer.addTo(deps().app.map)

    this.updateSequence()

    this.sequence.find(s => s.path.prop).path.prop.edit()
  }

  /**
   * Updates the required sequence based on the clue step and the method assumptions.
   * The sequence is the "blueprint" of things that need to be done to complete the step.
   */
  private updateSequence() {
    let sequence: GenericPathMethodEditor.Sequence = []

    const value = this.value
    const clue = this.value.clue
    const assumptions = this.assumptions.value()

    if (clue.type == "emote") {
      const hidey_hole_in_target = clue.hidey_hole && activate(clue.area).query(clue.hidey_hole.location)

      if (!assumptions.full_globetrotter) {
        if (hidey_hole_in_target) {
          sequence.push({
            name: `Path to Hidey Hole (${clue.hidey_hole.name}) in Target Area`,
            path: {section: "main", target: activate(TileArea.init(clue.hidey_hole.location))}
          })
        } else if (clue.hidey_hole) {
          sequence.push({
            name: `Path to Hidey Hole (${clue.hidey_hole.name})`,
            path: {section: "pre", target: activate(TileArea.init(clue.hidey_hole.location))}
          })
        }

        if (clue.hidey_hole) sequence.push({name: "Take and Equip Items", ticks: 1})
        else sequence.push({name: "Unequip Items", ticks: 1 + Math.floor(clue.items.length / 3)})
      }

      if (assumptions.full_globetrotter || !hidey_hole_in_target) sequence.push({
        name: "Path to Emote Area",
        path: {section: "main", target: activate(clue.area)}
      })

      sequence.push({name: "Summon Uri", ticks: 1})

      if (clue.double_agent) sequence.push({name: "Kill double agent", ticks: clue.tier == "master" ? 5 : 3})

      if (clue.hidey_hole && !hidey_hole_in_target && !assumptions.full_globetrotter) {
        sequence.push({
          name: "Return to Hidey Hole",
          path: {section: "post", target: activate(TileArea.init(clue.hidey_hole.location))}
        })

        sequence.push({name: "Return Items", ticks: 1})
      }
    } else {
      if (Clues.requiresKey(clue) && !assumptions.way_of_the_footshaped_key) {
        sequence.push({name: "Path to Key", path: {section: "pre", target: activate(clue.solution.key.area)}})

        sequence.push({name: `Get Key (${clue.solution.key.instructions})`, ticks: 2})
      }

      sequence.push({
        name: "To target", path: {
          section: "main",
          target: activate(Clues.ClueSpot.targetArea({clue: clue, spot: value.method.for.spot}))
        }
      })
    }

    this.sequence = sequence

    this.render()
  }

  private render() {
    this.sidepanel_widget.empty()

    const props = new Properties().appendTo(this.sidepanel_widget)
    const value = this.value
    const assumptions = this.assumptions.value()

    this.sequence.forEach(section => {
      if (section.ticks != null) {
        props.header(`${section.name} (+${section.ticks} ticks)`)
      } else {
        props.header(section.name)
      }

      if (section.path) {
        props.row(section.path.prop = new PathProperty({
          editor_handle: (options) => this.setPathEditor(options),
          target: section.path.target,
        })
          .setValue(getSection(value.method, section.path.section))
          .onCommit((v) => {
            switch (section.path.section) {
              case "pre":
                this.value.method.pre_path = v
                break
              case "post":
                this.value.method.post_path = v
                break;
              case "main":
                this.value.method.main_path = v
                break;
            }

            this.parent.registerChange()

            this.propagateState()
          }))
      }
    })

    this.propagateState()

    // Create widgets for every part of the path
    // - Pre-Path for keys (if not way of the foot shaped key) and hidey holes (if not full globetrotter && hideyhole not in area)
    // - Main Path
    // - Post-Path for hidey holes (if not full globetrotter && hideyhole not in area)

    // Integrate Path Editor
    // - Auto active if only main path exists
  }

  protected end() {
    this.layer.remove()
  }

  private async propagateState() {
    const end_state = await this.sequence.reduce<Promise<movement_state>>(async (old_state, section) => {
      let state: movement_state = lodash.cloneDeep(await old_state)

      if (section.path) {
        await section.path.prop.setStartState(await old_state)
        state = lodash.cloneDeep((await section.path.prop.augmented).post_state)
      }

      if (section.ticks) state.tick += section.ticks

      return state
    }, Promise.resolve(movement_state.start(this.assumptions.value())))

    this.value.method.expected_time = end_state.tick
  }
}

export namespace GenericPathMethodEditor {

  export type Sequence = {
    path?: { section: "pre" | "post" | "main", target: TileArea.ActiveTileArea, prop?: PathProperty } | null,
    name: string,
    ticks?: number
  } []
}