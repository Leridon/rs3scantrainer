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
import {TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import * as lodash from "lodash";
import {capitalize} from "lodash";
import {Path} from "../../../lib/runescape/pathing";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {SolvingMethods} from "../../model/methods";
import BoundsBuilder from "../../../lib/gamemap/BoundsBuilder";
import {RenderingUtility} from "../map/RenderingUtility";
import MethodSelector from "./MethodSelector";
import PathControl from "./PathControl";
import {CursorType} from "../../../lib/runescape/CursorType";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";
import {ScanEditLayer} from "../theorycrafting/scanedit/ScanEditor";
import {ClueReader} from "./cluereader/ClueReader";
import {deps} from "../../dependencies";
import {storage} from "../../../lib/util/storage";
import {SettingsModal} from "../settings/SettingsEdit";
import {ClueEntities} from "./ClueEntities";
import {NislIcon} from "../nisl";
import {ClueProperties} from "../theorycrafting/ClueProperties";
import {SlideGuider, SliderSolving} from "./subbehaviours/SliderSolving";
import {Notification} from "../NotificationBar";
import TransportLayer from "../map/TransportLayer";
import {NeoSolvingSubBehaviour} from "./NeoSolvingSubBehaviour";
import {CompassSolving} from "./subbehaviours/CompassSolving";
import {ScanTreeSolving} from "./subbehaviours/ScanTreeSolving";
import {KnotSolving} from "./subbehaviours/KnotSolving";
import {Alt1Modal} from "../../Alt1Modal";
import {LockboxSolving} from "./subbehaviours/LockboxSolving";
import {TowersSolving} from "./subbehaviours/TowersSolving";
import {Log} from "../../../lib/util/Log";
import * as assert from "assert";
import {CapturedScan} from "./cluereader/capture/CapturedScan";
import {AbstractCaptureService, CapturedImage, CaptureInterval} from "../../../lib/alt1/capture";
import span = C.span;
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import interactionMarker = RenderingUtility.interactionMarker;
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import inlineimg = C.inlineimg;
import item = C.item;
import cls = C.cls;
import vbox = C.vbox;
import bold = C.bold;
import spacer = C.spacer;
import space = C.space;
import hboxl = C.hboxl;
import notification = Notification.notification;
import activate = TileArea.activate;
import ClueSpot = Clues.ClueSpot;
import log = Log.log;

class NeoSolvingLayer extends GameLayer {
  public control_bar: NeoSolvingLayer.MainControlBar
  public clue_container: Widget
  public solution_container: Widget
  public method_selection_container: Widget
  public compass_container: Widget
  public scantree_container: Widget
  public path_container: Widget

  public scan_layer: ScanEditLayer
  public generic_solution_layer: GameLayer

  private sidebar: GameMapControl

  constructor(private behaviour: NeoSolvingBehaviour) {
    super();

    new TransportLayer(true, {transport_policy: "none", teleport_policy: "target_only"}).addTo(this)

    this.sidebar = new GameMapControl({
      position: "top-left",
      type: "floating",
      no_default_styling: true
    }, cls("ctr-neosolving-sidebar")).addTo(this)

    this.sidebar.content.append(
      new NeoSolvingLayer.MainControlBar(behaviour),
      this.clue_container = c(),
      this.solution_container = c(),
      this.compass_container = c(),
      this.method_selection_container = c(),
      this.scantree_container = c(),
      this.path_container = c(),
    )

    this.scan_layer = new ScanEditLayer([]).addTo(this)
    this.generic_solution_layer = new GameLayer().addTo(this)
  }

  fit(view: TileRectangle): this {
    if (!view) return this

    let copy = lodash.cloneDeep(view)

    let padding: [number, number] = null

    const mapSize = this.getMap().getSize()

    function score(w: number, h: number) {
      return (w * w) * (h * h)
    }

    const wideScore = score(mapSize.x - this.sidebar.content.raw().clientWidth, mapSize.y)
    const highScore = score(mapSize.x, mapSize.y - this.sidebar.content.raw().clientHeight)

    if (wideScore > highScore) {
      padding = [this.sidebar.content.raw().offsetWidth, 0]
    } else {
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
      maxZoom: lodash.clamp(this.getMap().getZoom(), 2, 4),
      paddingTopLeft: padding
    })

    return this
  }

  reset(): void {
    this.clue_container.empty()
    this.solution_container.empty()
    this.compass_container.empty()

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
    fullscreen_preference = new storage.Variable<boolean>("preferences/solve/fullscreen", () => false)
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
        this.parent.tetracompass_only
          ? new MainControlButton({icon: "assets/icons/tetracompass.png"})
            .css("cursor", "default")
          : new MainControlButton({icon: "assets/icons/glass.png"})
            .append(
              this.search_bar = new TextField()
                .css("flex-grow", "1")
                .css("font-weight", "normal")
                .setPlaceholder("Enter Search Term...")
                .toggleClass("nisl-textinput", false)
                .addClass("ctr-neosolving-main-bar-search")
                .setVisible(false)
                .onPreview((value) => {
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
          deps().app.in_alt1
            ? undefined
            : new MainControlButton({icon: "assets/icons/Alt1.png", text: "Solving available in Alt1", centered: true})
              .tooltip("More available in Alt1")
              .onClick(() => new Alt1Modal().show()),
          !deps().app.in_alt1 ? undefined :
            new MainControlButton({icon: "assets/icons/activeclue.png", text: "Solve", centered: true})
              .onClick(() => this.parent.screen_reading.solveManuallyTriggered())
              .tooltip("Read a clue from screen")
              .setEnabled(deps().app.in_alt1),
          !deps().app.in_alt1 ? undefined :
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
            .onClick(() => new SettingsModal("solving_general").do())
        ).css("flex-grow", "1"),
      )

      this.dropdown = new AbstractDropdownSelection.DropDown<{ step: Clues.Step, text_index: number }>({
        dropdownClass: "ctr-neosolving-favourite-dropdown",
        renderItem: e => {
          return c().text(Step.shortString(e.step, e.text_index))
        }
      })
        .onSelected(async clue => {
          this.parent.setClueWithAutomaticMethod(clue, null)
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

class ClueSolvingReadingBehaviour extends Behaviour {
  reader: ClueReader

  private autoSolve: boolean = false

  constructor(private parent: NeoSolvingBehaviour) {
    super();

    this.reader = new ClueReader(this.parent.tetracompass_only)
  }

  protected begin() {
    const interval = CaptureInterval.fromApproximateInterval(300)

    this.lifetime_manager.bind(this.parent.app.capture_service.subscribe({
      options: (time: AbstractCaptureService.CaptureTime) => ({interval: interval, area: null}),
      paused: () => (!this.autoSolve || this.parent.active_behaviour.get()?.pausesClueReader()),
      handle: (img) => this.solve(img.value, true)
    }))
  }

  protected end() {
    this.setAutoSolve(false)
  }

  private solve(img: CapturedImage, is_autosolve: boolean): ClueReader.Result {
    const res = this.reader.read(img)

    if (res) {
      switch (res.type) {
        case "textclue":
          this.parent.setClueWithAutomaticMethod(res.step, res)
          break;
        case "scan":
        case "compass":
          this.parent.setClueWithAutomaticMethod({step: res.step, text_index: 0}, res)
          break;
        case "puzzle":
          const is_new_one = this.parent.setPuzzle(res.puzzle)

          if (is_autosolve && res.puzzle.type == "slider" && is_new_one) {
            deps().app.crowdsourcing.pushSlider(res.puzzle.puzzle)
          }

          break;
      }
    }

    return res
  }

  setAutoSolve(v: boolean) {
    this.autoSolve = v
  }

  async solveManuallyTriggered() {
    const img = await this.parent.app.capture_service.captureOnce({options: {area: null, interval: null}})

    const found = await this.solve(img.value, false)

    if (!found) {
      notification("No clue found on screen.", "error").show()
    }
  }
}

export default class NeoSolvingBehaviour extends Behaviour {
  layer: NeoSolvingLayer

  state: NeoSolving.ActiveState = null
  history: NeoSolving.ActiveState[] = []

  active_method: AugmentedMethod = null
  active_behaviour: SingleBehaviour<NeoSolvingSubBehaviour> = this.withSub(new SingleBehaviour<NeoSolvingSubBehaviour>())

  private activateSubBehaviour(behaviour: NeoSolvingSubBehaviour) {
    if (behaviour) {
      behaviour.setRelatedState(this.state)
      log().log(`Activating subbehaviour: ${behaviour.constructor.name}`, "Solving")
    }


    this.active_behaviour.set(behaviour)
  }

  screen_reading: ClueSolvingReadingBehaviour = this.withSub(new ClueSolvingReadingBehaviour(this))

  public path_control = this.withSub(new PathControl(this))
  private default_method_selector: MethodSelector = null

  /**
   * Get an estimate for the player's current position based on the solution of the previous clue.
   * Currently, only scans and compasses report their respective solution to be used by this.
   * Solutions expire after 10 seconds, puzzles extend this expiry.
   */
  getAssumedPlayerPositionByLastClueSolution(): TileArea | null {

    const now = Date.now()

    const LOOKBACK = 10000 // 10 seconds

    let OLDEST_CONSIDERED_STEP = now - LOOKBACK

    for (let i = this.history.length - 2; i >= 0; i--) {
      const state = this.history[i]

      if (state.end_time < OLDEST_CONSIDERED_STEP) return null

      if (state.step.type == "puzzle") OLDEST_CONSIDERED_STEP = state.start_time - LOOKBACK
      else return state.solution_area
    }

    return null
  }

  constructor(public app: Application, public tetracompass_only: boolean) {
    super();

    this.path_control.section_selected.on(p => {
      if (this.active_method?.method?.type != "scantree") setTimeout(() => this.layer.fit(Path.bounds(p)), 20)
    })
  }

  private pushState(state: NeoSolving.ActiveState["step"]): NeoSolving.ActiveState {
    const now = Date.now()

    if (this.state && !this.state.end_time) {
      this.state.end_time = now
    }

    this.state = {
      step: state,
      start_time: now,
      end_time: undefined,
      solution_area: undefined
    }

    log().log(`Changed state to ${NeoSolving.ActiveState.title(this.state)}`, "Solving")

    this.history.push(this.state)

    return this.state
  }

  setPuzzle(puzzle: ClueReader.Result.Puzzle.Puzzle | null): boolean {
    if (this.state?.step?.type == "puzzle" && this.state.step.puzzle.type == puzzle?.type) return false // Don't do anything if a puzzle of that type is already active

    this.reset(this.state)

    this.pushState({type: "puzzle", puzzle: puzzle})

    if (puzzle) {
      this.activateSubBehaviour((() => {
        switch (puzzle.type) {
          case "slider":
            return new SliderSolving(this, puzzle)
          case "knot":
            return new KnotSolving(this, puzzle)
          case "lockbox":
            return new LockboxSolving(this, puzzle)
          case "tower":
            return new TowersSolving(this, puzzle)
        }
      })())
    }

    return true
  }

  /**
   * Sets the active clue. Builds the ui elements and moves the map view to the appropriate spot.
   *
   * @param step The clue step combined with the index of the selected text variant.
   * @param fit_target
   * @param read_result
   */
  setClue(step: { step: Clues.Step, text_index: number }, fit_target: boolean = true, read_result: ClueReader.Result): void {
    if (this.state?.step?.type == "clue" && this.state.step.clue.step.id == step.step.id && this.state.step.clue.text_index == step.text_index) {
      return
    }

    if (this.state?.step?.type == "clue" && this.state.step.clue.step.type == "compass" && step.step.type == "compass") {
      // This is a workaround fix for a rare issue where a master compass is reset and reloaded as an elite compass because of interface interference.
      // Changing from an active compass to another compass is disallowed.
      return
    }


    this.reset(this.state)

    const state = this.pushState({type: "clue", clue: step})

    const settings = this.app.settings.settings.solving

    const clue = step.step

    const bounds = new BoundsBuilder()

    // Render controls and solution on map
    {
      let w = c()

      if (step.step.type == "map") {
        if (settings.info_panel.map_image == "show") {
          w.append(c(`<img src='${step.step.image_url}' style="width: 100%">`).addClass("ctr-neosolving-solution-row"))
        } else if (settings.info_panel.map_image == "transcript") {
          cls("ctr-neosolving-solution-row").text(step.step.text[0]).appendTo(w)
        }
      } else {
        switch (settings.info_panel.clue_text) {
          case "full":
            cls("ctr-neosolving-solution-row").text(step.step.text[step.text_index]).appendTo(w)
            break
          case "abridged":
            if (clue.type == "compass") break

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
                inlineimg("assets/icons/cursor_search.png"),
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
            space(),
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
          inlineimg(CursorType.meta(clue.cursor).icon_url),
          space(),
          span(clue.answer)
        ))

        bounds.addRectangle(TileArea.toRect(clue.areas[0]))

        interactionMarker(activate(clue.areas[0]).center(), clue.cursor)
          .addTo(this.layer.generic_solution_layer)
      } else if (clue.type == "scan") {
        this.layer.scan_layer.marker.setClickable(true)
        this.layer.scan_layer.setSpots(clue.spots)
        this.layer.scan_layer.marker.setRadius(clue.range + 5, true)

        bounds.addTile(...clue.spots)
      } else if (clue.type == "compass") {
        // bounds.addTile(...clue.spots)
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
              .toggleClass("ctr-clickable", challenge.answers.length > 1)
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
          if (settings.info_panel.puzzle == "show" || (settings.info_panel.puzzle == "hideforscansandcompasses" && step.step.type != "compass" && step.step.type != "scan")) {
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

    if (read_result?.type == "compass" && clue.type == "compass") {
      const behaviour = new CompassSolving(this, clue, read_result.reader)

      behaviour.selected_spot.subscribe(async spot => {
        if (spot) {
          const method = await this.getAutomaticMethod({clue: clue.id, spot: spot.spot})

          this.setMethod(method)
        } else {
          this.setMethod(null)
        }
      })

      this.activateSubBehaviour(behaviour)
    }

    this.setMethod(null)
  }

  /**
   * Sets the active solving method.
   * Use {@link setClue} to activate the related clue first!
   * Builds the necessary ui elements and potentially zooms to the start point.
   *
   * @param method
   * @param read_result
   */
  setMethod(method: AugmentedMethod, read_result: ClueReader.Result = null): void {
    log().log(`Setting method ${method ? method.method.name : "null"}`)

    if (method) {
      log().log(`Setting method to ${method.method.name} (${method.method.id.substring(0, 8)})`, "Solving")
    } else {
      log().log(`Setting method to null`, "Solving")
    }

    if (this.state?.step?.type != "clue") {
      log().log(`Aborting set method because active state is not a clue step: '${this.state?.step?.type}'.`, "Solving")

      return;
    }

    if (method && (method.clue.id != this.state?.step?.clue?.step?.id)) {
      log().log(`Aborting set method because method does not match clue.`, "Solving")

      return;
    }
    if (method && method == this.active_method) {
      log().log(`Aborting set method because same method is already active.`, "Solving")

      return;
    }

    this.path_control.reset()
    this.default_method_selector?.remove()

    this.active_method = null

    const active_behaviour = this.active_behaviour.get()

    if (active_behaviour?.type == "method") {
      active_behaviour.stop()
    }

    if (!method && active_behaviour instanceof ScanTreeSolving) {
      assert(this.state.step.clue.step.type == "scan")
      this.layer.fit(TileRectangle.from(...this.state.step.clue.step.spots))
    }

    if (method) {
      this.active_method = method

      if (method.method.type == "scantree") {
        const scan_interface: CapturedScan = (() => {
          if (read_result) {
            assert(read_result.type == "scan")

            return read_result.scan_interface
          } else return null
        })()

        this.activateSubBehaviour(
          new ScanTreeSolving(this, method as AugmentedMethod<ScanTreeMethod, Clues.Scan>, scan_interface)
        )
      } else if (method.method.type == "general_path") {
        this.path_control.setMethod(method as AugmentedMethod<GenericPathMethod>)
      }
    }

    if ((this.state.step?.clue?.step?.type != "compass") || (active_behaviour instanceof CompassSolving && active_behaviour.selected_spot.value())) {

      const clue: ClueSpot.Id = active_behaviour instanceof CompassSolving
        ? {clue: this.state.step.clue.step.id, spot: active_behaviour.selected_spot.value().spot}
        : {clue: this.state.step.clue.step.id}

      this.default_method_selector = new MethodSelector(this, clue)
        .addClass("ctr-neosolving-solution-row")
        .appendTo(this.layer.method_selection_container)
    }
  }

  async getAutomaticMethod(step: ClueSpot.Id): Promise<AugmentedMethod> {
    let m = await this.app.favourites.getMethod(step)

    if (m === undefined) {
      let ms = await MethodPackManager.instance().getForClue(step)
      if (ms.length > 0) m = ms[0]
    }

    return m
  }

  async setClueWithAutomaticMethod(step: Clues.StepWithTextIndex, read_result: ClueReader.Result) {
    if (this.state?.step?.type == "clue" && this.state.step.clue.step.id == step.step.id && this.state.step.clue.text_index == step.text_index) {
      return
    }

    let m = await this.getAutomaticMethod({clue: step.step.id})

    this.setClue(step, !m, read_result)
    this.setMethod(m, read_result)
  }

  /**
   * Resets both the active clue and method, resets all displayed pathing.
   */
  reset(state: NeoSolving.ActiveState): boolean {
    if (state != this.state) return false // The caller needs to provide the active state as a token to prevent potential timing issues

    this.layer.reset()

    this.path_control.reset()
    this.activateSubBehaviour(null)
    this.default_method_selector?.remove()
    this.state = null
    this.active_method = null

    log().log("Reset state", "Solving")

    return true
  }

  protected begin() {
    this.app.map.addGameLayer(this.layer = new NeoSolvingLayer(this))
  }

  protected end() {
    this.layer.remove()
  }
}

export namespace NeoSolving {
  export type ActiveState = {
    step: {
      type: "puzzle",
      puzzle: ClueReader.Result.Puzzle.Puzzle
    } | {
      type: "clue",
      clue: Clues.StepWithTextIndex
    },
    start_time: number,
    end_time: number,
    solution_area: TileArea,
  }

  export namespace ActiveState {
    export function title(state: ActiveState): string {
      switch (state.step.type) {
        case "puzzle":
          switch (state.step.puzzle.type) {
            case "slider":
              return `Slider (${state.step.puzzle.puzzle.theme})`
            case "knot":
              return "Knot"
            case "tower":
              return "Tower"
            case "lockbox":
              return "Lockbox"
            default:
              return "Unknown Puzzle"
          }
        case "clue":
          return `${capitalize(state.step.clue.step.type)} (${state.step.clue.step.id})`

      }
    }
  }

  export type Settings = {
    info_panel: Settings.InfoPanel,
    puzzles: Settings.Puzzles,
    compass: CompassSolving.Settings
  }

  export namespace Settings {
    export type Puzzles = {
      sliders: SlideGuider.Settings,
      knots: KnotSolving.Settings,
      lockboxes: LockboxSolving.Settings,
      towers: TowersSolving.Settings,
    }

    export namespace Puzzles {
      export const DEFAULT: Puzzles = {
        sliders: SlideGuider.Settings.DEFAULT,
        knots: KnotSolving.Settings.DEFAULT,
        lockboxes: LockboxSolving.Settings.DEFAULT,
        towers: TowersSolving.Settings.DEFAULT,
      }

      export function normalize(settings: Puzzles): Puzzles {
        if (!settings) return lodash.cloneDeep(DEFAULT)

        settings.sliders = SlideGuider.Settings.normalize(settings.sliders)
        settings.knots = KnotSolving.Settings.normalize(settings.knots)
        settings.lockboxes = LockboxSolving.Settings.normalize(settings.lockboxes)
        settings.towers = TowersSolving.Settings.normalize(settings.towers)

        return settings
      }
    }

    export type InfoPanel = {
      clue_text: "full" | "abridged" | "hide"
      map_image: "show" | "transcript" | "hide",
      dig_target: "show" | "hide",
      talk_target: "show" | "hide",
      search_target: "show" | "hide",
      search_key: "show" | "hide",
      hidey_hole: "show" | "hide",
      emote_items: "show" | "hide",
      emotes: "show" | "hide",
      double_agent: "show" | "hide",
      puzzle: "show" | "hide" | "hideforscansandcompasses",
      challenge: "full" | "answer_only" | "hide",
      path_step_list: "show" | "hide"
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
        challenge: "full",
        puzzle: "show",
        path_step_list: "show",
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
        challenge: "hide",
        puzzle: "hide",
        path_step_list: "hide",
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
        challenge: "answer_only",
        puzzle: "hideforscansandcompasses",
        path_step_list: "hide",
      }

      export const DEFAULT = REDUCED

      export function normalize(settings: InfoPanel): InfoPanel {
        if (!settings) return lodash.cloneDeep(DEFAULT)

        if (!["full", "hide", "abridged"].includes(settings.clue_text)) settings.clue_text = DEFAULT.clue_text
        if (!["show", "hide"].includes(settings.map_image)) settings.map_image = DEFAULT.map_image
        if (!["show", "hide"].includes(settings.dig_target)) settings.dig_target = DEFAULT.dig_target
        if (!["show", "hide"].includes(settings.talk_target)) settings.talk_target = DEFAULT.talk_target
        if (!["show", "hide"].includes(settings.search_target)) settings.search_target = DEFAULT.search_target
        if (!["show", "hide"].includes(settings.search_key)) settings.search_key = DEFAULT.search_key

        if (!["show", "hide"].includes(settings.hidey_hole)) settings.hidey_hole = DEFAULT.hidey_hole
        if (!["show", "hide"].includes(settings.emote_items)) settings.emote_items = DEFAULT.emote_items
        if (!["show", "hide"].includes(settings.emotes)) settings.emotes = DEFAULT.emotes
        if (!["show", "hide"].includes(settings.double_agent)) settings.double_agent = DEFAULT.double_agent
        if (!["show", "hide"].includes(settings.path_step_list)) settings.path_step_list = DEFAULT.path_step_list

        if (!["show", "hide"].includes(settings.puzzle)) settings.puzzle = DEFAULT.puzzle
        if (!["full", "answer_only", "hide"].includes(settings.challenge)) settings.challenge = DEFAULT.challenge

        return settings
      }
    }

    export const DEFAULT: Settings = {
      info_panel: InfoPanel.REDUCED,
      puzzles: Puzzles.DEFAULT,
      compass: CompassSolving.Settings.DEFAULT
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) settings = lodash.cloneDeep(DEFAULT)

      settings.info_panel = InfoPanel.normalize(settings.info_panel)
      settings.puzzles = Puzzles.normalize(settings.puzzles)
      settings.compass = CompassSolving.Settings.normalize(settings.compass)

      return settings
    }
  }
}