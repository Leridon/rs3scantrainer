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
import {Ewent, Observable, observe} from "../../../lib/reactive";
import {floor_t, TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import * as lodash from "lodash";
import {Rectangle, Vector2} from "../../../lib/math";
import {util} from "../../../lib/util/util";
import {Path} from "../../../lib/runescape/pathing";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {ScanTheory} from "../../../lib/cluetheory/scans/Scans";
import {Scans} from "../../../lib/runescape/clues/scans";
import {SolvingMethods} from "../../model/methods";
import {ScanTree} from "../../../lib/cluetheory/scans/ScanTree";
import {scan_tree_template_resolvers} from "../solving/scans/ScanSolving";
import * as leaflet from "leaflet"
import {ScanRegionPolygon} from "./ScanLayer";
import BoundsBuilder from "../../../lib/gamemap/BoundsBuilder";
import {TileMarker} from "../../../lib/gamemap/TileMarker";
import {RenderingUtility} from "../map/RenderingUtility";
import PulseButton, {PulseIcon} from "./PulseButton";
import MethodSelector from "./MethodSelector";
import PathControl from "./PathControl";
import {PathStepEntity} from "../map/entities/PathStepEntity";
import {CursorType} from "../../../lib/runescape/CursorType";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";
import {ScanEditLayer} from "../theorycrafting/scanedit/ScanEditor";
import {ClueReader} from "./ClueReader";
import {deps} from "../../dependencies";
import span = C.span;
import todo = util.todo;
import PulseInformation = ScanTheory.PulseInformation;
import Pulse = Scans.Pulse;
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import interactionMarker = RenderingUtility.interactionMarker;
import Order = util.Order;
import spotNumber = ScanTree.spotNumber;
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import inlineimg = C.inlineimg;
import activate = TileArea.activate;

class NeoReader {
  read: Ewent<{ step: Clues.Step, text_index: number }>
  compass_angle_read: Ewent<{ angle: number }>
  pulse_read: Ewent<Pulse>
}

class NeoSolvingLayer extends GameLayer {
  public control_bar: NeoSolvingLayer.MainControlBar
  public clue_container: Widget
  public solution_container: Widget
  public method_selection_container: Widget
  public scantree_container: Widget
  public path_container: Widget

  public scan_layer: ScanEditLayer
  public generic_solution_layer: leaflet.FeatureGroup

  private sidebar: GameMapControl

  constructor(private behaviour: NeoSolvingBehaviour) {
    super();

    this.sidebar = new GameMapControl({
      position: "top-left",
      type: "floating",
      no_default_styling: true
    }, c().addClass("ctr-neosolving-sidebar")).addTo(this)

    this.sidebar.content.append(
      new NeoSolvingLayer.MainControlBar(behaviour),
      this.clue_container = c(),
      this.solution_container = c(),
      this.method_selection_container = c(),
      this.scantree_container = c(),
      this.path_container = c(),
    )

    this.scan_layer = new ScanEditLayer([]).addTo(this)
    this.generic_solution_layer = leaflet.featureGroup().addTo(this)
  }

  fit(view: TileRectangle): this {
    let copy = lodash.cloneDeep(view)

    // Modify the rectangle to center the view on the space right of the sidebar.
    {
      const sidebar_w = this.sidebar.content.raw().clientWidth + 20
      const total_w = this.getMap().container.get()[0].clientWidth

      const f = sidebar_w / Math.max(sidebar_w, total_w - sidebar_w)

      copy.topleft.x -= f * Rectangle.width(view)
    }

    this.map.fitView(copy, {
      maxZoom: 4,
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
            .toggleClass("nisinput", false)
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
            .onClick(async () => {
              const res = await this.parent.reader.readScreen()

              if (res?.step) {
                this.parent.setClueWithAutomaticMethod(res.step)
              }
            })
            .tooltip("Read a clue from screen")
            .setEnabled(deps().app.in_alt1),
          new MainControlButton({icon: "assets/icons/lock.png", text: "Auto-Solve", centered: true})
            .setToggleable(true)
            .tooltip("Continuously read clues from screen")
            .setEnabled(deps().app.in_alt1),
          new MainControlButton({icon: "assets/icons/fullscreen.png", centered: true})
            .tooltip("Hide the menu bar")
            .setToggleable(true),
          new MainControlButton({icon: "assets/icons/settings.png", centered: true})
            .tooltip("Open settings")
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

class ScanTreeSolvingControl extends Behaviour {
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

    this.parent.layer.getMap().fitView(bounds.get(), {
      maxZoom: 4,
      animate: true,
    })
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

    let content = c().addClass("ctr-neosolving-solution-row").appendTo(this.tree_widget)

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

    content.append(c().addClass('ctr-neosolving-nextscanstep')
      .setInnerHtml(
        "Next: " +
        this.parent.app.template_resolver.with(scan_tree_template_resolvers(node))
          .resolve(ScanTree.getInstruction(node)))
    )

    {

      let triples = node.children.filter(e => e.key.pulse == 3)

      node.children
        .filter((e) => triples.length <= 1 || e.key.pulse != 3)
        .sort(Order.comap(Scans.Pulse.compare, (a) => a.key))
        .forEach((child) => {
          const resolvers = this.parent.app.template_resolver.with(scan_tree_template_resolvers(child.value))

          c().addClass("ctr-neosolving-scantreeline")
            .append(
              PulseButton.forPulse(child.key, node.children.map(c => c.key))
                .onClick(() => {
                  this.setNode(child.value)
                }),
              c().setInnerHtml(resolvers.resolve(
                ScanTree.getInstruction(child.value)
              ))
            ).appendTo(content)
        })

      if (triples.length > 1) {
        c().addClass("ctr-neosolving-scantreeline")
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


export default class NeoSolvingBehaviour extends Behaviour {
  layer: NeoSolvingLayer

  active_clue: { step: Clues.Step, text_index: number } = null
  active_method: AugmentedMethod = null

  reader: ClueReader

  auto_solving: Observable<boolean> = observe(false)

  private scantree_behaviour = this.withSub(new SingleBehaviour<ScanTreeSolvingControl>())
  public path_control = this.withSub(new PathControl(this))
  private default_method_selector: MethodSelector = null

  constructor(public app: Application) {
    super();

    this.reader = new ClueReader()
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

    const settings = NeoSolving.Settings.DEFAULT

    const clue = step.step

    const bounds = new BoundsBuilder()

    // Render controls and solution on map
    {
      let w = c()

      if (step.step.type == "map") {
        w.append(c(`<img src='${step.step.image_url}' style="width: 100%">`).addClass("ctr-neosolving-solution-row").text(step.step.text[step.text_index]))
      } else {
        w.append(c().addClass("ctr-neosolving-solution-row").text(step.step.text[step.text_index]))
      }

      const sol = Clues.Step.solution(step.step)

      if (sol) {
        switch (sol?.type) {
          case "talkto":
            if (!settings.talks.at_all) break

            let npc_spot_id = 0 // TODO
            let spot = sol.spots[npc_spot_id]

            w.append(c().addClass("ctr-neosolving-solution-row")
              .append(
                inlineimg("assets/icons/cursor_talk.png"),
                span("Talk to "),
                C.npc(sol.npc, true)
                  .tooltip("Click to center")
                  .on("click", () => {
                    this.layer.fit(TileArea.toRect(spot.range))
                  }),
                settings.talks.description && spot.description
                  ? span(" " + spot.description)
                  : undefined
              ))


            interactionMarker(activate(spot.range).center(), "talk", false, false)
              .addTo(this.layer.generic_solution_layer)

            bounds.addArea(spot.range)

            break;
          case "search":
            if (!settings.searches.at_all) break

            if (sol.key && settings.searches.key_solution) {
              w.append(c().addClass("ctr-neosolving-solution-row").append(
                inlineimg("assets/icons/key.png"),
                " ",
                span(sol.key.answer).addClass("ctr-clickable").on("click", () => {
                  this.layer.fit(TileArea.toRect(sol.key.area))
                }),
              ))
            }

            w.append(c().addClass("ctr-neosolving-solution-row").append(
              inlineimg("assets/icons/cursor_talk.png"),
              " ",
              span("Search "),
              C.staticentity(sol.entity, true)
                .tooltip("Click to center")
                .on("click", () => {
                  this.layer.fit(sol.spot)
                })
            ))

            bounds.addRectangle(sol.spot)

            interactionMarker(TileRectangle.center(sol.spot, false), "search", false, false)
              .addTo(this.layer.generic_solution_layer)

            break;
          case "dig":
            if (!settings.digs.at_all) break

            w.append(c().addClass("ctr-neosolving-solution-row").append(
              inlineimg("assets/icons/cursor_shovel.png"),
              " ",
              span("Dig"),
              sol.description
                ? span(" " + sol.description)
                : span(` at ${TileCoordinates.toString(sol.spot)}`)
            ))

            interactionMarker(sol.spot, "shovel", false, false)
              .addTo(this.layer.generic_solution_layer)

            bounds.addTile(sol.spot)

            break;
        }
      }

      if (clue.type == "emote") {
        if (settings.emotes.hidey_hole && clue.hidey_hole) {
          w.append(c().addClass("ctr-neosolving-solution-row").append(
            inlineimg("assets/icons/cursor_search.png"),
            " ",
            span("Get items from "),
            C.staticentity(clue.hidey_hole.name)
              .tooltip("Click to center")
              .addClass("ctr-clickable")
              .on("click", () => {
                this.layer.fit(TileRectangle.from(clue.hidey_hole.location))
              })
          ))
        }

        if (settings.emotes.items) {
          let row = c().addClass("ctr-neosolving-solution-row").append(
            inlineimg("assets/icons/cursor_equip.png"),
            " ",
            span("Equip "),
          ).appendTo(w)

          for (let i = 0; i < clue.items.length; i++) {
            const item = clue.items[i]

            if (i > 0) {
              if (i == clue.items.length - 1) row.append(", and ")
              else row.append(", ")
            }

            const is_none = item.startsWith("Nothing") || item.startsWith("No ")

            row.append(span(item)
              .toggleClass("nisl-item", !is_none)
              .toggleClass("nisl-noitem", is_none)
            )
          }
        }

        if (settings.emotes.emotes) {
          let row = c().addClass("ctr-neosolving-solution-row").append(
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

        if (settings.emotes.double_agent && clue.double_agent) {
          w.append(c().addClass("ctr-neosolving-solution-row").append(
            inlineimg("assets/icons/cursor_attack.png"),
            " ",
            span("Kill "),
            C.npc("Double Agent")
          ))
        }

        bounds.addArea(clue.area)

        new TileMarker(activate(clue.area).center()).withMarker().addTo(this.layer.generic_solution_layer)
      } else if (clue.type == "skilling") {
        w.append(c().addClass("ctr-neosolving-solution-row").append(
          c(`<img src="${CursorType.meta(clue.cursor).icon_url}">`),
          span(clue.answer)
        ))

        bounds.addRectangle(clue.areas[0])

        interactionMarker(TileRectangle.center(clue.areas[0]), clue.cursor, false, false)
          .addTo(this.layer.generic_solution_layer)
      } else if (clue.type == "scan") {
        this.layer.scan_layer.marker.setClickable(true)
        this.layer.scan_layer.setSpots(clue.spots)
        this.layer.scan_layer.marker.setRadius(clue.range + 5)

        bounds.addTile(...clue.spots)
      } else if (clue.type == "compass") {
        bounds.addTile(...clue.spots)
      }

      if (!w.container.is(":empty"))
        this.layer.solution_container.append(w)
    }

    if (fit_target) {
      this.layer.fit(bounds.get())
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
        this.layer.scan_layer.marker.setRadius(method.method.tree.assumed_range)

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

    this.setClue(step)

    let m = await this.app.favourites.getMethod({clue: step.step.id})

    if (!m) {
      let ms = await MethodPackManager.instance().getForClue({clue: step.step.id})
      if (ms.length > 0) m = ms[0]
    }

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
    clue: "full" | "short" | "none",
    talks: {
      at_all: boolean,
      description: boolean,
    }
    digs: {
      at_all: boolean
    },
    searches: {
      at_all: boolean,
      key_solution: boolean
    },
    emotes: {
      hidey_hole: boolean,
      items: boolean,
      emotes: boolean,
      double_agent: boolean
    }
    scan_solving: "always" | "scantree_fallback" | "never",
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      clue: "full",
      talks: {
        at_all: true,
        description: true
      },
      digs: {
        at_all: true,
      },
      searches: {
        at_all: true,
        key_solution: true,
      },
      emotes: {
        hidey_hole: true,
        items: true,
        emotes: true,
        double_agent: true
      },
      scan_solving: "always"
    }
  }
}