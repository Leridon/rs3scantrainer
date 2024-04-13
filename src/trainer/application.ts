import {storage} from "lib/util/storage";
import {Modal} from "trainer/ui/widgets/modal";
import {TemplateResolver} from "lib/util/TemplateResolver";
import {ClueTier, ClueType} from "lib/runescape/clues";
import {GameMap, GameMapWidget} from "lib/gamemap/GameMap";
import {QueryLinks} from "trainer/query_functions";
import {Path} from "lib/runescape/pathing";
import {ExportImport} from "lib/util/exportString";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import Behaviour, {SingleBehaviour} from "lib/ui/Behaviour";
import {SolvingMethods} from "./model/methods";
import {GameLayer} from "../lib/gamemap/GameLayer";
import MainTabControl from "./ui/MainTabControl";
import Widget from "../lib/ui/Widget";
import {makeshift_main} from "./main";
import {MethodPackManager} from "./model/MethodPackManager";
import {C} from "../lib/ui/constructors";
import {Observable, observe} from "../lib/reactive";
import {FavoriteIndex} from "./favorites";
import Dependencies from "./dependencies";
import {Transportation} from "../lib/runescape/transportation";
import * as process from "process";
import * as jquery from "jquery";
import * as lodash from "lodash";
import {Settings} from "./ui/settings/Settings";
import * as assert from "assert";
import {TextRendering} from "./ui/TextRendering";
import {TransportData} from "../data/transports";
import {PathGraphics} from "./ui/path_graphics";
import {CrowdSourcing} from "./CrowdSourcing";
import {Notification, NotificationBar} from "./ui/NotificationBar";
import vbox = C.vbox;
import span = C.span;
import hbox = C.hbox;
import ActiveTeleportCustomization = Transportation.TeleportGroup.ActiveTeleportCustomization;
import TeleportSettings = Settings.TeleportSettings;
import inlineimg = C.inlineimg;
import render_digspot = TextRendering.render_digspot;
import render_scanregion = TextRendering.render_scanregion;
import resolveTeleport = TransportData.resolveTeleport;
import npc = C.npc;
import staticentity = C.staticentity;
import entity = C.entity;
import cls = C.cls;
import notification = Notification.notification;

declare let DEV_MODE: boolean

export class SimpleLayerBehaviour extends Behaviour {
  constructor(private map: GameMap, private layer: GameLayer) {
    super();
  }

  protected begin() {
    this.map.addGameLayer(this.layer)
  }

  protected end() {
    this.layer.remove()
  }
}

export namespace ScanTrainerCommands {
  import Command = QueryLinks.Command;
  import ScanTreeMethod = SolvingMethods.ScanTreeMethod;

  export const load_path: Command<{
    steps: Path.raw,
    target?: TileRectangle,
    start_state?: Path.movement_state
  }> = {
    name: "load_path",
    parser: {
      steps: ExportImport.imp<Path.Step[]>({expected_type: "path", expected_version: 0}), // import is idempotent if it's not a serialized payload string
    },
    default: {},
    serializer: {},
    instantiate: (arg: {
      steps: Path.raw,
      target?: TileRectangle,
      start_state?: Path.movement_state
    }) => (app: Application): void => {
      // TODO: Fix the PathEditor behaviour stuff

      /*
      new PathEditor(app.map.map).start().load(arg.steps, {
          commit_handler: null,
          discard_handler: () => {
          },
          target: arg.target,
          start_state: arg.start_state
      })*/
    },
  }

  export const load_overview: Command<{
    tiers: ClueTier[],
    types: ClueType[]
  }> = {
    name: "load_overview",
    parser: {
      tiers: (s: string) => s.split(",").map(t => t == "null" ? null : t) as ClueTier[],
      types: (s: string) => s.split(",") as ClueType[]
    },
    default: {
      tiers: ["easy", "medium", "hard", "elite", "master", null],
      types: ["anagram", "compass", "coordinates", "cryptic", "emote", "map", "scan", "simple", "skilling"]
    },
    serializer: {
      tiers: (tiers: ClueTier[]) => tiers.join(","),
      types: (tiers: ClueType[]) => tiers.join(",")
    },
    instantiate: ({tiers, types}) => (app: Application): void => {
      //TODO app.main_behaviour.set(new SimpleLayerBehaviour(app.map, new OverviewLayer(clues.filter(c => tiers.indexOf(c.tier) >= 0 && types.indexOf(c.type) >= 0), app)))
    },
  }

  export const load_method: Command<{
    method: ScanTreeMethod
  }> = {
    name: "load_method",
    parser: {
      // method: (a) => imp<ScanTree.ScanTreeMethod>({expected_type: "scantree", expected_version: 0})(a)
    },
    default: {},
    serializer: {
      // method: (a) => exp({type: "scantree", version: 0}, true, true)(a)
    },
    instantiate: ({method}) => (app: Application): void => {
      //let resolved = resolve(method)
      //let resolved = withClue(method, app.data.clues.byId(method.clue_id) as ScanStep)

      //app.showMethod(resolved)
    },
  }


  export const index = [
    load_path, load_overview, load_method
  ]
}

class PatchNotesModal extends Modal {
  sections: { el: JQuery, patchnotes: string }[]
  all_title: JQuery
  new_title: JQuery

  constructor(id: string, private app: Application) {
    super(id);

    this.all_title = jquery("#patch-note-title-all")
    this.new_title = jquery("#patch-note-title-new")

    this.sections = jquery(".patchnotesection").get().map(jquery).map((e: JQuery) => {
      return {
        el: e,
        patchnotes: e.data("patchnotes") as string
      }
    })
  }

  showAll() {
    jquery("#modal-patchnotes-report-issues").hide()

    this.all_title.show()
    this.new_title.hide()

    this.sections.forEach((el) => {
      el.el.show()
    })

    return this.show()
  }

}

class AboutModal extends Modal {

  constructor(id: string, private app: Application) {
    super(id);
    jquery("#viewpatchnotes").on("click", async () => {

    })

    jquery("#current-version").text(app.version)
  }
}

const DEBUG_SIMULATE_INALT1 = false

export class SettingsManagement {
  private storage = new storage.Variable<Settings.Settings>("preferences/settings", () => null)

  active_teleport_customization: Observable<ActiveTeleportCustomization> = observe(null).equality(lodash.isEqual)

  constructor() {
    // Normalize on first load to prevent migration issues
    this.set(Settings.normalize(this.storage.get()))
  }

  set(settings: Settings.Settings) {
    this.settings = settings

    this.storage.set(settings)

    this.active_teleport_customization.set(TeleportSettings.inferActiveCustomization(settings.teleport_customization))
  }

  update(f: (_: Settings.Settings) => void) {
    const clone = lodash.cloneDeep(this.settings)
    f(clone)
    this.set(clone)
  }

  settings: Settings.Settings
}

export class Application extends Behaviour {
  version = "b0.3.1"

  crowdsourcing: CrowdSourcing = new CrowdSourcing(this, "https://cluetrainer.app")

  settings = new SettingsManagement()

  in_alt1: boolean = !!window.alt1 || DEBUG_SIMULATE_INALT1
  in_dev_mode = !!process.env.DEV_MODE

  menu_bar: MainTabControl
  main_content: Widget = null
  map_widget: GameMapWidget
  map: GameMap

  favourites: FavoriteIndex

  main_behaviour = this.withSub(new SingleBehaviour())

  template_resolver = new TemplateResolver(
    {name: "surge", apply: () => [{type: "domelement", value: inlineimg('assets/icons/surge.png')}]},
    {name: "dive", apply: () => [{type: "domelement", value: inlineimg('assets/icons/dive.png')}]},
    {name: "surgedive", apply: () => [{type: "domelement", value: inlineimg('assets/icons/surgedive.png')}]},
    {name: "bladeddive", apply: () => [{type: "domelement", value: inlineimg('assets/icons/bladeddive.png')}]},
    {name: "escape", apply: () => [{type: "domelement", value: inlineimg('assets/icons/escape.png')}]},
    {name: "barge", apply: () => [{type: "domelement", value: inlineimg('assets/icons/barge.png')}]},
    {
      name: "digspot", apply: ([arg0]) => {
        assert(arg0.type == "safestring")

        return [{type: "domelement", value: render_digspot(arg0.value)}]
      }
    }, {
      name: "scanarea", apply: ([arg0]) => {
        assert(arg0.type == "safestring")

        return [{type: "domelement", value: render_scanregion(arg0.value)}]
      }
    }, {
      name: "teleport", apply: ([groupid, spotid]) => {
        assert(groupid.type == "safestring")
        assert(spotid.type == "safestring")

        let tele = resolveTeleport({group: groupid.value, spot: spotid.value})

        if (!tele) return [{type: "safestring", value: "NULL"}]

        return [{type: "domelement", value: PathGraphics.Teleport.asSpan(tele)}]
      }
    }, {
      name: "icon", apply: ([icon_url]) => {
        assert(icon_url.type == "safestring")

        return [{type: "domelement", value: inlineimg(`assets/icons/${icon_url.value}.png`)}]
      }
    }, {
      name: "npc", apply: ([npc_name]) => {
        assert(npc_name.type == "safestring")

        return [{type: "domelement", value: npc(npc_name.value)}]
      }
    }, {
      name: "object", apply: ([npc_name]) => {
        assert(npc_name.type == "safestring")

        return [{type: "domelement", value: staticentity(npc_name.value)}]
      }
    }, {
      name: "item", apply: ([npc_name]) => {
        assert(npc_name.type == "safestring")

        return [{type: "domelement", value: entity({kind: "item", name: npc_name.value})}]
      }
    }
  )

  private startup_settings_storage = new storage.Variable<Application.Preferences>("preferences/startupsettings", () => ({}))
  startup_settings = observe(this.startup_settings_storage.get())

  notifications: NotificationBar

  constructor() {
    super()

    this.favourites = new FavoriteIndex(MethodPackManager.instance())

    if (this.in_dev_mode) {
      console.log("In development mode")
    }
  }

  protected async begin() {
    let container = Widget.wrap(jquery("#main-content"))

    this.startup_settings.subscribe(s => this.startup_settings_storage.set(s))

    let map_widget: Widget

    this.notifications = NotificationBar.instance().appendTo(jquery("body"))

    container.append(
      this.menu_bar = new MainTabControl(this),
      this.main_content = c("<div style='display: flex; height: 100%; flex-grow: 1'></div>")
        .append(map_widget = c("<div style='flex-grow: 1; height: 100%'></div>"))
    )

    this.map_widget = new GameMapWidget(map_widget.container)
    this.map = this.map_widget.map

    this.menu_bar.switchToTab(this.in_alt1 ? "solve" : "solve")

    if (this.mode() == "preview") {
      if (!this.startup_settings.value().hide_preview_notice) {
        notification("Preview Notice: Clue Trainer is actively in development and currently incomplete.")
          .setDuration(null)
          .addButton("Don't show again", (not) => {
            this.startup_settings.update(s => s.hide_preview_notice = true)
            not.dismiss()
          }).show()
      }
    }

    if (!this.in_alt1 && !this.startup_settings.value().dont_recommend_alt1) {
      notification("Scan Trainer is an Alt1 plugin and has clue-solving features when installed.")
        .setDuration(null)
        .addButton(c(`<a href='${this.addToAlt1Link()}' class="ctr-notification-link">Click here to install.</a>`))
        .addButton("Don't show again", (not) => {
          this.startup_settings.update(s => s.dont_recommend_alt1 = true)
          not.dismiss()
        }).show()
    }

    if (this.startup_settings.value().last_loaded_version != null && this.startup_settings.value().last_loaded_version != this.version) {
      notification("There has been an update!")
        .addButton("View patchnotes", (not) => {
          // TODO: Actually view patchnotes
          not.dismiss()
        })
    }

    this.startup_settings.update(s => s.last_loaded_version = this.version)

    let query_function = QueryLinks.get_from_params(ScanTrainerCommands.index, new URLSearchParams(window.location.search))
    if (query_function) query_function(this)

    //ExportStringModal.do(await makeshift_main())
    await makeshift_main()
  }

  protected end() {
  }

  mode(): "development" | "live" | "preview" {
    return "preview"

    if (window.location.host.includes("localhost"))
      return "development"

    if (window.location.host == "leridon.github.io") {
      if (window.location.pathname.startsWith("/cluetrainer-live")) return "live"
      if (window.location.pathname.startsWith("/rs3scantrainer")) return "preview"
    }

    return "development"
  }

  addToAlt1Link(): string {
    return `alt1://addapp/${window.location.protocol}//${window.location.host}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1)}appconfig.json`
  }
}

namespace Application {
  export type Preferences = {
    last_loaded_version?: string,
    dont_recommend_alt1?: boolean,
    hide_preview_notice?: boolean
  }
}

export function initialize() {
  let app = new Application()
  Dependencies.instance().app = app
  app.start()


  //scantrainer.select(clues.find((c) => c.id == 361)) // zanaris
  //scantrainer.select(clues.find((c) => c.id == 399)) // compass
  // scantrainer.sidepanels.clue_panel.selectClue(clues.find((c) => c.id == 364)) // falador

  /*
      let player = YouTubePlayer('my-player', {
          events: undefined,
          height: undefined,
          host: "",
          playerVars: {
              autoplay: 1,
              controls: 1,
              enablejsapi: 1,
              end: 7,
              fs: 0,
              iv_load_policy: 3,
              loop: 1,
              modestbranding: 1,
              list: "U9pFPB6gjug",
              rel: 0,
              start: 3

          },
          videoId: "U9pFPB6gjug",
          width: undefined
      })

      player.mute()
          .then(() =>
              player.loadVideoById({
                  videoId: "U9pFPB6gjug",
                  startSeconds: 3,
                  endSeconds: 7
              }))
          .then(() => player.playVideo())

      // TODO: Check the current time on a loop and reset when close to end


      /*
          player.loadVideoByUrl({
              mediaContentUrl: "U9pFPB6gjug",
              startSeconds: 2,
              endSeconds: 3,
          })*/

  //player.playVideo()
}