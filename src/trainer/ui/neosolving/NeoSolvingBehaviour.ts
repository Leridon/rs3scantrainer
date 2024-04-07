import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {C} from "../../../lib/ui/constructors";
import Widget from "../../../lib/ui/Widget";
import Button from "../../../lib/ui/controls/Button";
import TextField from "../../../lib/ui/controls/TextField";
import {ExpansionBehaviour} from "../../../lib/ui/ExpansionBehaviour";
import {AbstractDropdownSelection} from "../widgets/AbstractDropdownSelection";
import {Clues} from "../../../lib/runescape/clues";
import {clue_data} from "../../../data/clues";
import PreparedSearchIndex from "../../../lib/util/PreparedSearchIndex";
import {Observable, observe} from "../../../lib/reactive";
import {floor_t, TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import * as lodash from "lodash";
import {Vector2} from "../../../lib/math";
import {util} from "../../../lib/util/util";
import {Path} from "../../../lib/runescape/pathing";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {ScanTheory} from "../../../lib/cluetheory/scans/Scans";
import {Scans} from "../../../lib/runescape/clues/scans";
import {SolvingMethods} from "../../model/methods";
import {ScanTree} from "../../../lib/cluetheory/scans/ScanTree";
import * as leaflet from "leaflet"
import {ScanRegionPolygon} from "./ScanLayer";
import BoundsBuilder from "../../../lib/gamemap/BoundsBuilder";
import {RenderingUtility} from "../map/RenderingUtility";
import PulseButton, {PulseIcon} from "./PulseButton";
import MethodSelector from "./MethodSelector";
import PathControl from "./PathControl";
import {PathStepEntity} from "../map/entities/PathStepEntity";
import {CursorType} from "../../../lib/runescape/CursorType";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";
import {ScanEditLayer} from "../theorycrafting/scanedit/ScanEditor";
import {ClueReader} from "./cluereader/ClueReader";
import {deps} from "../../dependencies";
import {storage} from "../../../lib/util/storage";
import {SettingsModal} from "../settings/SettingsEdit";
import {TemplateResolver} from "../../../lib/util/TemplateResolver";
import {TextRendering} from "../TextRendering";
import {ClueEntities} from "./ClueEntities";
import {NislIcon} from "../nisl";
import {ClueProperties} from "../theorycrafting/ClueProperties";
import {SlideGuider, SliderModal} from "./SlideGuider";
import {PuzzleModal} from "./PuzzleModal";
import span = C.span;
import todo = util.todo;
import PulseInformation = ScanTheory.PulseInformation;
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import interactionMarker = RenderingUtility.interactionMarker;
import Order = util.Order;
import spotNumber = ScanTree.spotNumber;
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import inlineimg = C.inlineimg;
import activate = TileArea.activate;
import item = C.item;
import cls = C.cls;
import vbox = C.vbox;
import bold = C.bold;
import spacer = C.spacer;
import space = C.space;
import hboxl = C.hboxl;

class NeoSolvingLayer extends GameLayer {
  public control_bar: NeoSolvingLayer.MainControlBar
  public clue_container: Widget
  public solution_container: Widget
  public method_selection_container: Widget
  public scantree_container: Widget
  public path_container: Widget

  public scan_layer: ScanEditLayer
  public generic_solution_layer: GameLayer

  private sidebar: GameMapControl

  constructor(private behaviour: NeoSolvingBehaviour) {
    super();

    this.sidebar = new GameMapControl({
      position: "top-left",
      type: "floating",
      no_default_styling: true
    }, cls("ctr-neosolving-sidebar")).addTo(this)

    this.sidebar.content.append(
      new NeoSolvingLayer.MainControlBar(behaviour),
      this.clue_container = c(),
      this.solution_container = c(),
      this.method_selection_container = c(),
      this.scantree_container = c(),
      this.path_container = c(),
    )

    this.scan_layer = new ScanEditLayer([]).addTo(this)
    this.generic_solution_layer = new GameLayer().addTo(this)
  }

  fit(view: TileRectangle): this {
    let copy = lodash.cloneDeep(view)

    let padding: [number, number] = null

    const mapSize = this.getMap().getSize()

    function score(w: number, h: number) {
      return (w * w) * (h * h)
    }

    const wideScore = score(mapSize.x - this.sidebar.content.raw().clientWidth, mapSize.y)
    const highScore = score(mapSize.x, mapSize.y - this.sidebar.content.raw().clientHeight)

    if (wideScore > highScore) {
      console.log("wide")
      padding = [this.sidebar.content.raw().offsetWidth, 0]
    } else {
      console.log("slim")
      padding = [0, this.sidebar.content.raw().offsetHeight]
    }

    /*
    // Modify the rectangle to center the view on the space right of the sidebar.
    {
      const sidebar_w = this.sidebar.content.raw().clientWidth + 20
      const total_w = this.getMap().container.get()[0].clientWidth

      const f = sidebar_w / Math.max(sidebar_w, total_w - sidebar_w)

      copy.topleft.x -= f * Rectangle.width(view)
    }*/

    this.map.fitView(copy, {
      //maxZoom: lodash.clamp(this.getMap().getZoom(), 3, 7),
      paddingTopLeft: padding
    })

    return this
  }

  reset(): void {
    this.clue_container.empty()
    this.solution_container.empty()

    this.scan_layer.marker.setClickable(false)
    this.scan_layer.marker.setFixedSpot(null)
    this.scan_layer.setSpots([])

    this.generic_solution_layer.clearLayers()
  }
}

namespace NeoSolvingLayer {
  import hbox = C.hbox;
  import Step = Clues.Step;

  class MainControlButton extends Button {
    constructor(options: { icon?: string, text?: string, centered?: boolean }) {
      super();

      if (options.icon) {
        this.append(c(`<img src="${options.icon}" class="ctr-neosolving-main-bar-icon">`))
      }

      if (options.centered) this.css("justify-content", "center")

      if (options.text) {
        this.append(c().text(options.text))

        this.css("flex-grow", "1")
      }

      this.addClass("ctr-neosolving-main-bar-button")
        .addClass("ctr-neosolving-main-bar-section")
    }
  }

  export class MainControlBar extends Widget {
    fullscreen_preference = new storage.Variable<boolean>("preferences/solve/fullscreen", () => deps().app.in_alt1)
    autosolve_preference = new storage.Variable<boolean>("preferences/solve/autosolve", () => deps().app.in_alt1)

    search_bar: TextField
    rest: Widget

    search_bar_collapsible: ExpansionBehaviour
    rest_collapsible: ExpansionBehaviour

    dropdown: AbstractDropdownSelection.DropDown<{ step: Clues.Step, text_index: number }> = null

    prepared_search_index: PreparedSearchIndex<{ step: Clues.Step, text_index: number }>

    constructor(private parent: NeoSolvingBehaviour) {
      super();

      this.addClass("ctr-neosolving-main-bar")

      this.prepared_search_index = new PreparedSearchIndex<{ step: Clues.Step, text_index: number }>(
        clue_data.all.flatMap(step => step.text.map((_, i) => ({step: step, text_index: i}))),
        (step) => step.step.text[step.text_index]
        , {
          all: true,
          threshold: -10000
        }
      )

      this.append(
        new MainControlButton({icon: "assets/icons/glass.png"})
          .append(this.search_bar = new TextField()
            .css("flex-grow", "1")
            .css("font-weight", "normal")
            .setPlaceholder("Enter Search Term...")
            .toggleClass("nisl-textinput", false)
            .addClass("ctr-neosolving-main-bar-search")
            .setVisible(false)
            .onChange(({value}) => {
              let results = this.prepared_search_index.search(value)

              this.dropdown.setItems(results)
            })
          )
          .tooltip("Search Clues")
          .onClick((e) => {
            e.stopPropagation()

            if (this.search_bar_collapsible.isExpanded()) {
              e.preventDefault()
            } else {
              this.search_bar_collapsible.expand()
              this.search_bar.container.focus()
              this.search_bar.setValue("")
            }
          }),
        this.rest = hbox(
          new MainControlButton({icon: "assets/icons/activeclue.png", text: "Solve", centered: true})
            .onClick(() => this.parent.screen_reading.solveManuallyTriggered())
            .tooltip("Read a clue from screen")
            .setEnabled(deps().app.in_alt1),
          new MainControlButton({icon: "assets/icons/lock.png", text: "Auto-Solve", centered: true})
            .setToggleable(true)
            .tooltip("Continuously read clues from screen")
            .setEnabled(deps().app.in_alt1)
            .onToggle(v => {
              this.parent.screen_reading.setAutoSolve(v)
              this.autosolve_preference.set(v)
            })
            .setToggled(this.autosolve_preference.get())
          ,
          new MainControlButton({icon: "assets/icons/fullscreen.png", centered: true})
            .tooltip("Hide the menu bar")
            .setToggleable(true)
            .onToggle(t => {
              deps().app.menu_bar.setCollapsed(t)
              this.fullscreen_preference.set(t)
            })
            .setToggled(this.fullscreen_preference.get()),
          new MainControlButton({icon: "assets/icons/settings.png", centered: true})
            .tooltip("Open settings")
            .onClick(() => new SettingsModal().show())
        ).css("flex-grow", "1"),
      )

      this.dropdown = new AbstractDropdownSelection.DropDown<{ step: Clues.Step, text_index: number }>({
        dropdownClass: "ctr-neosolving-favourite-dropdown",
        renderItem: e => {
          return c().text(Step.shortString(e.step, e.text_index))
        }
      })
        .onSelected(async clue => {
          this.parent.setClueWithAutomaticMethod(clue)
        })
        .onClosed(() => {
          this.search_bar_collapsible.collapse()
        })
        .setItems([])

      this.search_bar_collapsible = ExpansionBehaviour.horizontal({target: this.search_bar, starts_collapsed: true, duration: 100})
        .onChange(v => {
          if (v) this.dropdown?.close()
          else {
            this.dropdown.setItems(this.prepared_search_index.items())
            this.dropdown?.open(this, this.search_bar)
          }

          this.rest_collapsible.setCollapsed(!v)
        })

      this.rest_collapsible = ExpansionBehaviour.horizontal({target: this.rest, starts_collapsed: false})
    }
  }
}

export class ScanTreeSolvingControl extends Behaviour {
  node: ScanTree.Augmentation.AugmentedScanTreeNode = null
  augmented: ScanTree.Augmentation.AugmentedScanTree = null
  layer: leaflet.FeatureGroup = null

  tree_widget: Widget

  constructor(public parent: NeoSolvingBehaviour, public method: AugmentedMethod<ScanTreeMethod, Clues.Scan>) {
    super()

    this.augmented = ScanTree.Augmentation.basic_augmentation(method.method.tree, method.clue)
  }

  private fit() {
    // TODO: This is a copy of the old implementation
    let node = this.node

    let bounds = new BoundsBuilder()

    //1. If no children: All Candidates
    if (node.children.length == 0)
      node.remaining_candidates.forEach((c) => bounds.addTile(c))

    //2. All children that are leafs in the augmented tree (i.e. spots directly reached from here)
    /* //TODO: Rethink this, disabled to get the build working again
    this.node.get().children.filter(c => c.value.is_leaf)
        .map(c => c.value.remaining_candidates.map(Vector2.toPoint).forEach(spot => bounds.extend(spot)))

     */

    //4. "Where"
    if (node.region?.area) {
      bounds.addArea(node.region.area)
      bounds.addArea(node.region.area)
    }

    // 6. The path
    // TODO: Include path bounds, without augmenting it!

    bounds.addRectangle(Path.bounds(node.raw.path))

    this.parent.layer.fit(bounds.get())
  }

  private renderLayer(): void {
    let node = this.node

    this.layer.clearLayers()

    let pos = node.region
      ? activate(node.region.area).center()
      : Path.ends_up(node.raw.path)

    if (pos) {
      this.parent.layer.getMap().floor.set(pos.level)
    } else {
      this.parent.layer.getMap().floor.set(Math.min(...node.remaining_candidates.map((c) => c.level)) as floor_t)
    }

    if (pos && node.remaining_candidates.length > 1) {
      this.parent.layer.scan_layer.marker.setFixedSpot(pos)
    } else {
      this.parent.layer.scan_layer.marker.setFixedSpot(null)
    }

    this.parent.layer.scan_layer.setActiveCandidates(node.remaining_candidates)

    new ScanRegionPolygon(ScanTree.getTargetRegion(node)).setOpacity(1).addTo(this.layer)

    AugmentedScanTree.collect_parents(node, false).forEach(n => {
      new ScanRegionPolygon(ScanTree.getTargetRegion(n)).setOpacity(0.2).addTo(this.layer)
      PathStepEntity.renderPath(n.raw.path).eachEntity(e => e.setOpacity(0.2)).addTo(this.layer)
    })

    // Children paths to dig spots are rendered with 0.5
    node.children.forEach(c => {
      PathStepEntity.renderPath(c.value.raw.path).eachEntity(l => l.setOpacity(0.5)).addTo(this.layer)
      new ScanRegionPolygon(ScanTree.getTargetRegion(c.value)).setOpacity(0.5).addTo(this.layer)
    })
  }

  setNode(node: ScanTree.Augmentation.AugmentedScanTreeNode) {
    this.node = node

    this.tree_widget.empty()

    this.parent.path_control.reset().setPath(node.raw.path)

    this.fit()
    this.renderLayer()

    {
      new MethodSelector(this.parent, this.method.method.for)
        .addClass("ctr-neosolving-solution-row")
        .appendTo(this.tree_widget)
    }

    let content = cls("ctr-neosolving-solution-row").appendTo(this.tree_widget)

    {
      let ui_nav = c()

      let list = c("<ol class='breadcrumb' style='margin-bottom: unset'></ol>").appendTo(ui_nav)

      AugmentedScanTree.collect_parents(node)
        .map(n =>
          c("<span class='nisl-textlink'>")
            .on("click", () => this.setNode(n))
            .text(AugmentedScanTree.decision_string(n))
        ).forEach(w => w.appendTo(c("<li>").addClass("breadcrumb-item").appendTo(list)))

      let last = list.container.children().last()

      last.text(last.children().first().text()).addClass("active")

      content.append(ui_nav)
    }

    content.append(cls('ctr-neosolving-nextscanstep')
      .append(
        "Next: ",
        ...this.parent.app.template_resolver.with(...ScanTreeSolvingControl.scan_tree_template_resolvers(node))
          .resolve(ScanTree.getInstruction(node)))
    )

    {

      let triples = node.children.filter(e => e.key.pulse == 3)

      node.children
        .filter((e) => triples.length <= 1 || e.key.pulse != 3)
        .sort(Order.comap(Scans.Pulse.compare, (a) => a.key))
        .forEach((child) => {
          const resolvers = this.parent.app.template_resolver.with(...ScanTreeSolvingControl.scan_tree_template_resolvers(child.value))

          cls("ctr-neosolving-scantreeline")
            .append(
              PulseButton.forPulse(child.key, node.children.map(c => c.key))
                .onClick(() => {
                  this.setNode(child.value)
                }),
              c().append(...resolvers.resolve(
                ScanTree.getInstruction(child.value)
              ))
            ).appendTo(content)
        })

      if (triples.length > 1) {
        cls("ctr-neosolving-scantreeline")
          .append(
            c().append( // Wrap in another div to allow another margin
              new PulseIcon({different_level: false, pulse: 3}, null)
                .css("margin", "1px")
            ),
            span("at"),
            ...triples
              .sort(Order.comap(Order.natural_order, (c) => spotNumber(node.root.raw, c.value.remaining_candidates[0])))
              .map((child) =>
                PulseButton.forSpot(spotNumber(node.root.raw, child.value.remaining_candidates[0]))
                  .onClick(() => this.setNode(child.value))
              )
          ).appendTo(content)
      }
    }
  }

  protected begin() {
    this.tree_widget = c().appendTo(this.parent.layer.scantree_container)
    this.layer = leaflet.featureGroup().addTo(this.parent.layer.scan_layer)

    this.setNode(this.augmented.root_node)
  }

  protected end() {
    this.tree_widget.remove()
    this.tree_widget = null

    if (this.layer) {
      this.layer.remove()
      this.layer = null
    }
  }
}

export namespace ScanTreeSolvingControl {
  import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
  import render_digspot = TextRendering.render_digspot;
  import render_scanregion = TextRendering.render_scanregion;
  import shorten_integer_list = util.shorten_integer_list;

  export function scan_tree_template_resolvers(node: AugmentedScanTreeNode): TemplateResolver.Function[] {
    return [
      {
        name: "target", apply: () => {
          if (node.remaining_candidates.length == 1) {
            return [{
              type: "domelement",
              value: render_digspot(spotNumber(node.root.raw, node.remaining_candidates[0]))
            }]
          } else {
            return [{
              type: "domelement",
              value: render_scanregion(node.raw.region?.name || "_")
            }]
          }
        }
      },
      {
        name: "candidates", apply: () => {
          return [{
            type: "domelement",
            value: c(util.natural_join(shorten_integer_list(node.remaining_candidates.map(c => spotNumber(node.root.raw, c)), c => render_digspot(c).raw().outerHTML)))
          }]
        }
      }
    ]
  }
}

class ClueSolvingReadingBehaviour extends Behaviour {
  reader: ClueReader

  private activeInterval: number = null

  constructor(private parent: NeoSolvingBehaviour) {
    super();

    this.reader = new ClueReader()
  }

  protected begin() {
  }

  protected end() {
    this.setAutoSolve(false)
  }

  private async solve(): Promise<ClueReader.Result> {
    const res = await this.reader.readScreen()

    if (res?.step) {
      this.parent.setClueWithAutomaticMethod(res.step)
    } else if (res.puzzle) {
      this.parent.setPuzzle(res.puzzle)
    }

    return res
  }

  setAutoSolve(v: boolean) {
    if (this.activeInterval != null) {
      clearInterval(this.activeInterval)
      this.activeInterval = null
    }

    if (this.parent.app.in_alt1 && v) {
      // TODO: Adaptive timing to avoid running all the time?

      this.activeInterval = window.setInterval(() => {
        this.solve()
      }, 300)
    }
  }

  async solveManuallyTriggered() {
    const found = await this.solve()

    if (!found?.step && !found?.puzzle) {
      this.parent.app.notifications.notify({type: "error"}, "No clue found on screen.")
    }
  }
}

export default class NeoSolvingBehaviour extends Behaviour {
  layer: NeoSolvingLayer

  active_puzzle_modal: PuzzleModal = null

  active_clue: { step: Clues.Step, text_index: number } = null
  active_method: AugmentedMethod = null

  screen_reading: ClueSolvingReadingBehaviour = this.withSub(new ClueSolvingReadingBehaviour(this))

  auto_solving: Observable<boolean> = observe(false)

  private scantree_behaviour = this.withSub(new SingleBehaviour<ScanTreeSolvingControl>())
  public path_control = this.withSub(new PathControl(this))
  private default_method_selector: MethodSelector = null

  constructor(public app: Application) {
    super();

    this.path_control.section_selected.on(p => {
      if (this.active_method.method.type != "scantree") setTimeout(() => this.layer.fit(Path.bounds(p)), 20)
    })
  }

  setPuzzle(puzzle: PuzzleModal.Puzzle | null): void {
    if (this.active_puzzle_modal?.puzzle?.type == puzzle?.type) return // Don't do anything if a puzzle of that type is already active

    this.reset()

    if (this.active_puzzle_modal) {

      this.active_puzzle_modal.abort()
      this.active_puzzle_modal = null
    }

    if (puzzle) {

      this.active_puzzle_modal = (() => {
        switch (puzzle.type) {
          case "slider":
            return new SliderModal(puzzle)
        }
      })()

      this.active_puzzle_modal.hidden.on(modal => {
        if (modal == this.active_puzzle_modal) {
          this.active_puzzle_modal = null
        }
      })

      this.active_puzzle_modal.start()
    }
  }

  /**
   * Sets the active clue. Builds the ui elements and moves the map view to the appropriate spot.
   *
   * @param step The clue step combined with the index of the selected text variant.
   * @param fit_target
   */
  setClue(step: { step: Clues.Step, text_index: number }, fit_target: boolean = true): void {
    this.reset()

    if (this.active_clue && this.active_clue.step.id == step.step.id && this.active_clue.text_index == step.text_index) {
      return
    }

    this.active_clue = step

    const settings = this.app.settings.settings.solving

    const clue = step.step

    const bounds = new BoundsBuilder()

    // Render controls and solution on map
    {
      let w = c()

      if (step.step.type == "map") {
        if (settings.info_panel.map_image == "show") {
          w.append(c(`<img src='${step.step.image_url}' style="width: 100%">`).addClass("ctr-neosolving-solution-row"))
        }
      } else {
        switch (settings.info_panel.clue_text) {
          case "full":
            cls("ctr-neosolving-solution-row").text(step.step.text[step.text_index]).appendTo(w)
            break
          case "abridged":
            const short = Clues.Step.shortString(clue, step.text_index)

            const row = cls("ctr-neosolving-solution-row").text(short).appendTo(w)

            if (clue.text[step.text_index]) row.addClass("ctr-neosolving-solution-row-shortened")

            break
          case "hide":
          // Do nothing
        }

      }

      const sol = Clues.Step.solution(step.step)

      if (sol) {
        switch (sol?.type) {
          case "talkto":
            let npc_spot_id = 0
            let spot = sol.spots[npc_spot_id]

            if (settings.info_panel.talk_target == "show") {
              w.append(cls("ctr-neosolving-solution-row")
                .append(
                  inlineimg("assets/icons/cursor_talk.png"),
                  span("Talk to "),
                  C.npc(sol.npc, true)
                    .tooltip("Click to center")
                    .on("click", () => {
                      this.layer.fit(TileArea.toRect(spot.range))
                    }),
                  spot.description
                    ? span(" " + spot.description)
                    : undefined
                ))
            }

            for (let i = 0; i < sol.spots.length; i++) {
              const spot = sol.spots[i]

              new ClueEntities.TalkSolutionNpcEntity(sol.npc, spot)
                .addTo(this.layer.generic_solution_layer)
            }

            bounds.addArea(spot.range)

            break;
          case "search":
            if (sol.key && settings.info_panel.search_key == "show") {
              w.append(cls("ctr-neosolving-solution-row").append(
                inlineimg("assets/icons/key.png"),
                " ",
                span(sol.key.answer).addClass("ctr-clickable").on("click", () => {
                  this.layer.fit(TileArea.toRect(sol.key.area))
                }),
              ))
            }

            if (settings.info_panel.search_target == "show") {
              w.append(cls("ctr-neosolving-solution-row").append(
                inlineimg("assets/icons/cursor_talk.png"),
                " ",
                span("Search "),
                C.staticentity(sol.entity, true)
                  .tooltip("Click to center")
                  .on("click", () => {
                    this.layer.fit(sol.spot)
                  })
              ))
            }

            bounds.addRectangle(sol.spot)

            new ClueEntities.SearchSolutionEntity(sol)
              .addTo(this.layer.generic_solution_layer)

            break;
          case "dig":
            if (settings.info_panel.dig_target == "show") {
              w.append(cls("ctr-neosolving-solution-row").append(
                inlineimg("assets/icons/cursor_shovel.png"),
                " ",
                span("Dig"),
                sol.description
                  ? span(" " + sol.description)
                  : span(` at ${TileCoordinates.toString(sol.spot)}`)
              ))
            }
            new ClueEntities.DigSolutionEntity(sol)
              .addTo(this.layer.generic_solution_layer)

            bounds.addTile(sol.spot)

            break;
        }
      }

      if (clue.type == "emote") {
        if (clue.hidey_hole && settings.info_panel.hidey_hole == "show") {
          w.append(cls("ctr-neosolving-solution-row").append(
            inlineimg("assets/icons/cursor_search.png"),
            " ",
            span("Get items from "),
            C.staticentity(clue.hidey_hole.name)
              .tooltip("Click to center")
              .addClass("ctr-clickable")
              .on("click", () => {
                this.layer.fit(clue.hidey_hole.location)
              })
          ))
        }

        if (settings.info_panel.emote_items == "show") {
          let row = cls("ctr-neosolving-solution-row").append(
            inlineimg("assets/icons/cursor_equip.png"),
            " ",
            span("Equip "),
          ).appendTo(w)

          for (let i = 0; i < clue.items.length; i++) {
            const itm = clue.items[i]

            if (i > 0) {
              if (i == clue.items.length - 1) row.append(", and ")
              else row.append(", ")
            }

            row.append(item(itm))
          }
        }
        if (settings.info_panel.emotes == "show") {
          let row = cls("ctr-neosolving-solution-row").append(
            inlineimg("assets/icons/emotes.png"),
            " ",
          ).appendTo(w)

          for (let i = 0; i < clue.emotes.length; i++) {
            const item = clue.emotes[i]

            if (i > 0) {
              if (i == clue.emotes.length - 1) row.append(", then ")
              else row.append(", ")
            }

            row.append(item).addClass("nisl-emote")
          }
        }

        if (clue.double_agent && settings.info_panel.double_agent == "show") {
          w.append(cls("ctr-neosolving-solution-row").append(
            inlineimg("assets/icons/cursor_attack.png"),
            " ",
            span("Kill "),
            C.npc("Double Agent")
          ))
        }

        new ClueEntities.EmoteAreaEntity(clue).addTo(this.layer.generic_solution_layer)

        if (clue.hidey_hole) {
          new ClueEntities.HideyHoleEntity(clue).addTo(this.layer.generic_solution_layer)
        }

        bounds.addArea(clue.area)
      } else if (clue.type == "skilling") {
        w.append(cls("ctr-neosolving-solution-row").append(
          c(`<img src="${CursorType.meta(clue.cursor).icon_url}">`),
          span(clue.answer)
        ))

        bounds.addRectangle(clue.areas[0])

        interactionMarker(TileRectangle.center(clue.areas[0]), clue.cursor)
          .addTo(this.layer.generic_solution_layer)
      } else if (clue.type == "scan") {
        this.layer.scan_layer.marker.setClickable(true)
        this.layer.scan_layer.setSpots(clue.spots)
        this.layer.scan_layer.marker.setRadius(clue.range + 5, true)

        bounds.addTile(...clue.spots)
      } else if (clue.type == "compass") {
        bounds.addTile(...clue.spots)
      }

      if (clue.challenge && clue.challenge.length > 0) {
        const challenge = clue.challenge.find(c => c.type == "challengescroll") as Clues.Challenge & { type: "challengescroll" }

        if (challenge) {
          const answer_id = this.app.favourites.getChallengeAnswerId(clue)
          const answer = challenge.answers[answer_id]

          if (settings.info_panel.challenge != "hide") {
            let row: Widget = null
            let answer_span: Widget = null

            w.append(row = cls("ctr-neosolving-solution-row")
              .append(
                hboxl(
                  inlineimg("assets/icons/activeclue.png"),
                  vbox(
                    settings.info_panel.challenge == "full"
                      ? c().css("font-style", "italic").text(challenge.question) : undefined,
                    hboxl(
                      bold(`Answer:`),
                      space(),
                      answer_span = span(answer.answer.toString()),
                      spacer(),
                      challenge.answers.length > 1 ? NislIcon.dropdown() : undefined
                    )
                  ).css("flex-grow", "1")
                )
              ))

            if (challenge.answers.length > 1) {
              row.on("click", () => {
                new AbstractDropdownSelection.DropDown<Clues.Challenge.ChallengeScroll["answers"][number]>({
                  dropdownClass: "ctr-neosolving-favourite-dropdown",
                  renderItem: a => c().text(`${a.answer} (${a.note})`)
                })
                  .setItems(challenge.answers)
                  .setHighlighted(answer)
                  .open(row, undefined)
                  .onSelected(a => {
                    this.app.favourites.setChallengeAnswerId(clue, challenge.answers.indexOf(a))
                    answer_span.text(a.answer.toString())
                  })
              })
            }
          }
        } else {
          if (settings.info_panel.puzzle == "show") {
            const row = cls("ctr-neosolving-solution-row").appendTo(w)

            for (let i = 0; i < clue.challenge.length; i++) {
              if (i > 0) {
                if (i == clue.challenge.length - 1) row.append(", or ")
                else row.append(", ")
              }

              row.append(ClueProperties.render_challenge(clue.challenge[i]).css("display", "inline-block"))
            }
          }
        }
      }

      if (!w.container.is(":empty"))
        this.layer.solution_container.append(w)
    }

    if (fit_target) {
      this.layer.fit(bounds.get())
    }

    if (this.app.settings.settings.teleport_customization.preset_bindings_active) {
      const active_preset = this.app.settings.settings.teleport_customization.active_preset
      const bound_preset = this.app.settings.settings.teleport_customization.preset_bindings[clue.tier]

      if (active_preset != bound_preset && bound_preset != null)
        this.app.settings.update(set => set.teleport_customization.active_preset = bound_preset)
    }

    this.setMethod(null)
  }

  /**
   * Sets the active solving method.
   * Use {@link setClue} to activate the related clue first!
   * Builds the necessary ui elements and potentially zooms to the start point.
   *
   * @param method
   */
  setMethod(method: AugmentedMethod): void {
    if (method && method.clue.id != this.active_clue?.step?.id) return;
    if (method && method == this.active_method) return;

    this.scantree_behaviour.set(null)
    this.path_control.reset()
    this.default_method_selector?.remove()

    this.active_method = null

    if (method) {
      if (method.clue.id != this.active_clue?.step?.id) return

      this.active_method = method

      if (method.method.type == "scantree") {
        this.scantree_behaviour.set(
          new ScanTreeSolvingControl(this, method as AugmentedMethod<ScanTreeMethod, Clues.Scan>)
        )

        this.layer.scan_layer.setSpotOrder(method.method.tree.ordered_spots)
        this.layer.scan_layer.marker.setRadius(method.method.tree.assumed_range, method.method.assumptions.meerkats_active)
      } else if (method.method.type == "general_path") {
        this.path_control.reset().setMethod(method as AugmentedMethod<GenericPathMethod>)
      }
    } else {
      this.default_method_selector = new MethodSelector(this, {clue: this.active_clue.step.id})
        .addClass("ctr-neosolving-solution-row")
        .appendTo(this.layer.method_selection_container)
    }
  }

  async setClueWithAutomaticMethod(step: { step: Clues.Step, text_index: number }) {
    if (this.active_clue && this.active_clue.step.id == step.step.id && this.active_clue.text_index == step.text_index) {
      return
    }

    let m = await this.app.favourites.getMethod({clue: step.step.id})

    if (!m) {
      let ms = await MethodPackManager.instance().getForClue({clue: step.step.id})
      if (ms.length > 0) m = ms[0]
    }

    this.setClue(step, !m)

    if (m) this.setMethod(m)
  }

  /**
   * Resets both the active clue and method, resets all displayed pathing.
   */
  reset() {
    this.layer.reset()

    this.path_control.reset()
    this.scantree_behaviour.set(null)
    this.default_method_selector?.remove()
    this.active_clue = null
    this.active_method = null

    if (this.active_puzzle_modal) {
      this.active_puzzle_modal.abort()
      this.active_puzzle_modal = null
    }
  }

  /**
   * Adds angle information for a compass clue into the current solving process.
   *
   * @param info
   * @private
   */
  private addCompassInfo(info: { angle: number, position: Vector2 }) {
    todo()
  }

  /**
   * Adds pulse information for a scan clue into the current solving process.
   *
   * @param info
   * @private
   */
  private addScanInfo(info: { position: TileCoordinates, pulse: PulseInformation, range: number }) {
    todo()
  }


  protected begin() {
    this.app.map.addGameLayer(this.layer = new NeoSolvingLayer(this))
  }

  protected end() {
    this.layer.remove()
  }
}

export namespace NeoSolving {
  export type Settings = {
    info_panel: Settings.InfoPanel,
    puzzles: Settings.Puzzles
  }

  export namespace Settings {
    export type Puzzles = {
      sliders: SlideGuider.Settings
    }

    export namespace Puzzles {
      export const DEFAULT: Puzzles = {
        sliders: SlideGuider.Settings.DEFAULT
      }

      export function normalize(settings: Puzzles): Puzzles {
        if (!settings) return lodash.cloneDeep(DEFAULT)

        settings.sliders = SlideGuider.Settings.normalize(settings.sliders)

        return settings
      }
    }

    export type InfoPanel = {
      clue_text: "full" | "abridged" | "hide"
      map_image: "show" | "hide",
      dig_target: "show" | "hide",
      talk_target: "show" | "hide",
      search_target: "show" | "hide",
      search_key: "show" | "hide",
      hidey_hole: "show" | "hide",
      emote_items: "show" | "hide",
      emotes: "show" | "hide",
      double_agent: "show" | "hide",
      path_components: "show" | "hide",
      puzzle: "show" | "hide",
      challenge: "full" | "answer_only" | "hide"
    }

    export namespace InfoPanel {
      export const EVERYTHING: Settings["info_panel"] = {
        clue_text: "full",
        map_image: "show",
        dig_target: "show",
        talk_target: "show",
        search_target: "show",
        search_key: "show",
        hidey_hole: "show",
        emote_items: "show",
        emotes: "show",
        double_agent: "show",
        path_components: "show",
        challenge: "full",
        puzzle: "show"
      }

      export const NOTHING: Settings["info_panel"] = {
        clue_text: "hide",
        map_image: "hide",
        dig_target: "hide",
        talk_target: "hide",
        search_target: "hide",
        search_key: "hide",
        hidey_hole: "hide",
        emote_items: "hide",
        emotes: "hide",
        double_agent: "hide",
        path_components: "hide",
        challenge: "hide",
        puzzle: "hide"
      }

      export const REDUCED: Settings["info_panel"] = {
        clue_text: "abridged",
        map_image: "show",
        dig_target: "show",
        talk_target: "show",
        search_target: "show",
        search_key: "hide",
        hidey_hole: "hide",
        emote_items: "hide",
        emotes: "hide",
        double_agent: "hide",
        path_components: "show",
        challenge: "answer_only",
        puzzle: "hide"
      }

      export function normalize(settings: InfoPanel): InfoPanel {
        if (!settings) return lodash.cloneDeep(InfoPanel.EVERYTHING)

        if (!["full", "hide", "abridged"].includes(settings.clue_text)) settings.clue_text = "full"
        if (!["show", "hide"].includes(settings.map_image)) settings.map_image = "show"
        if (!["show", "hide"].includes(settings.dig_target)) settings.dig_target = "show"
        if (!["show", "hide"].includes(settings.talk_target)) settings.talk_target = "show"
        if (!["show", "hide"].includes(settings.search_target)) settings.search_target = "show"
        if (!["show", "hide"].includes(settings.search_key)) settings.search_key = "show"

        if (!["show", "hide"].includes(settings.hidey_hole)) settings.hidey_hole = "show"
        if (!["show", "hide"].includes(settings.emote_items)) settings.emote_items = "show"
        if (!["show", "hide"].includes(settings.emotes)) settings.emotes = "show"
        if (!["show", "hide"].includes(settings.double_agent)) settings.double_agent = "show"
        if (!["show", "hide"].includes(settings.path_components)) settings.path_components = "show"

        if (!["show", "hide"].includes(settings.puzzle)) settings.puzzle = "show"
        if (!["full", "answer_only", "hide"].includes(settings.challenge)) settings.challenge = "full"

        return settings
      }
    }

    export const DEFAULT: Settings = {
      info_panel: InfoPanel.EVERYTHING,
      puzzles: Puzzles.DEFAULT,
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) settings = lodash.cloneDeep(DEFAULT)

      settings.info_panel = InfoPanel.normalize(settings.info_panel)
      settings.puzzles = Puzzles.normalize(settings.puzzles)


      return settings
    }
  }
}