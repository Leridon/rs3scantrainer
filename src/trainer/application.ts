import {storage} from "lib/util/storage";
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
import {Alt1MainHotkeyEvent} from "../lib/alt1/Alt1MainHotkeyEvent";
import {Alt1ContextMenuDetection} from "../lib/alt1/Alt1ContextMenuDetection";
import {Log} from "../lib/util/Log";
import {Changelog} from "./ChangeLog";
import {DevelopmentModal} from "../devtools/DevelopmentMenu";
import {LogViewer} from "../devtools/LogViewer";
import {NisModal} from "../lib/ui/NisModal";
import {BigNisButton} from "./ui/widgets/BigNisButton";
import Properties from "./ui/widgets/Properties";
import ActiveTeleportCustomization = Transportation.TeleportGroup.ActiveTeleportCustomization;
import TeleportSettings = Settings.TeleportSettings;
import inlineimg = C.inlineimg;
import render_digspot = TextRendering.render_digspot;
import render_scanregion = TextRendering.render_scanregion;
import resolveTeleport = TransportData.resolveTeleport;
import npc = C.npc;
import staticentity = C.staticentity;
import entity = C.entity;
import notification = Notification.notification;
import log = Log.log;
import img = C.img;
import {DataExport} from "./DataExport";

class PermissionChecker extends NisModal {
  constructor() {
    super({disable_close_button: true, fixed: true});

    this.title.set("Missing Permissions")
  }

  render() {
    super.render();

    const props = new Properties().appendTo(this.body)

    props.paragraph("Clue Trainer is missing permissions that are essential for it to function. Please grant the necessary permissions and then check again by clicking the button on the bottom of this modal.")

    props.header("How to set permissions")

    props.paragraph("Open Clue Trainer settings by clicking the small wrench on the top left, next to the buttons to minimize or close the window.")

    props.row(img("media/how_to_set_permissions_1.png"))

    props.paragraph("Make sure all permissions are checked.")

    props.row(img("media/how_to_set_permissions_2.png"))

    props.paragraph("Click 'Check' below to check if permissions have correctly been set.")
  }

  getButtons(): BigNisButton[] {
    return [
      new BigNisButton("Ignore", "cancel")
        .onClick(() => {
          notification("Please be aware that Clue Trainer will not work without granting the permissions.", "error").show()
          this.remove()
        }),
      new BigNisButton("Check", "confirm")
        .onClick(() => {
          if (!alt1) this.remove()
          else {
            if (alt1.permissionPixel && alt1.permissionOverlay && alt1.permissionGameState) {
              notification("Success! Permissions are fine now", "information").show()
              this.remove()
            } else {
              notification("Clue Trainer is still missing permissions.", "error").show()
            }
          }
        })
    ]
  }
}

namespace PermissionChecker {
  export function arePermissionsFine(): boolean {
    return alt1.permissionPixel && alt1.permissionOverlay && alt1.permissionGameState
  }

  export function check() {
    if (alt1.permissionInstalled && !arePermissionsFine()) new PermissionChecker().show()
  }
}

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

const DEBUG_SIMULATE_INALT1 = false

export class SettingsManagement {
  public readonly storage = new storage.Variable<Settings.Settings>("preferences/settings", () => null)

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
  crowdsourcing: CrowdSourcing = new CrowdSourcing(this, "https://api.cluetrainer.app")

  settings = new SettingsManagement()

  in_alt1: boolean = !!window.alt1?.permissionInstalled || DEBUG_SIMULATE_INALT1
  in_dev_mode = !!process.env.DEV_MODE

  menu_bar: MainTabControl
  main_content: Widget = null
  map_widget: GameMapWidget
  map: GameMap

  favourites: FavoriteIndex

  main_behaviour = this.withSub(new SingleBehaviour())

  main_hotkey = new Alt1MainHotkeyEvent()
  context_menu = new Alt1ContextMenuDetection()

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

  readonly version: number = Changelog.latest_patch.version

  data_dump: DataExport

  private startup_settings_storage = new storage.Variable<Application.Preferences>("preferences/startupsettings", () => ({}))
  startup_settings = observe(this.startup_settings_storage.get())

  notifications: NotificationBar

  constructor() {
    super()

    this.favourites = new FavoriteIndex(MethodPackManager.instance())

    this.data_dump = new DataExport("cluetrainer", this.version, DataExport.createSpec(
      this.settings.storage,
      MethodPackManager.instance().local_pack_store,
      this.favourites.data
    ))

    if (this.in_dev_mode) {
      log().log("In development mode")
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

    /*
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
      notification("Clue Trainer is an Alt1 plugin and has clue-solving features when installed.")
        .setDuration(null)
        .addButton(C.text_link("Click here to install", () => new Alt1Modal().show()))
        .addButton("Don't show again", (not) => {
          this.startup_settings.update(s => s.dont_recommend_alt1 = true)
          not.dismiss()
        }).show()
    }*/

    const is_first_visit = this.startup_settings.value().last_loaded_version == null

    if (!is_first_visit && this.startup_settings.value().last_loaded_version != Changelog.latest_patch.version) {
      const notifyable_update = lodash.findLast(Changelog.log, e => {
        return e.notification && e.version > this.startup_settings.value().last_loaded_version
      })

      notification(notifyable_update?.notification ?? "There has been an update.")
        .setDuration(30000)
        .addButton("View patch notes", (not) => {
          new Changelog.Modal().show()
          not.dismiss()
        }).show()
    }

    this.startup_settings.update(s => s.last_loaded_version = Changelog.latest_patch.version)

    //let query_function = QueryLinks.get_from_params(ScanTrainerCommands.index, new URLSearchParams(window.location.search))
    //if (query_function) query_function(this)

    document.body.addEventListener("keydown", e => {
      if (e.key == "F6") {
        log().log("Log exported")

        LogViewer.do(log().get())

        /*ExportStringModal.do(
          log().toString(),
          "",
          `cluetrainerlog${Date.now()}.txt`
        )*/
      }

      if (e.key == "F4") {
        new DevelopmentModal().show()
      }
    })

    log().log(`Clue Trainer v${Changelog.latest_patch.version} started`)

    if (globalThis.alt1) {
      log().log(`Alt1 version detected: ${alt1.version}`)
      log().log(`Active capture mode: ${alt1.captureMethod}`)
      log().log(`Permissions: Installed ${alt1.permissionInstalled}, GameState ${alt1.permissionGameState}, Pixel ${alt1.permissionPixel}, Overlay ${alt1.permissionOverlay}`)
      log().log("Settings on startup", "Startup", {type: "object", value: lodash.cloneDeep(this.settings.settings)})

      PermissionChecker.check()
    }
  }

  protected end() {
  }

  /*
  mode(): "development" | "live" | "preview" {
    return "preview"

    if (window.location.host.includes("localhost"))
      return "development"

    if (window.location.host == "leridon.github.io") {
      if (window.location.pathname.startsWith("/cluetrainer-live")) return "live"
      if (window.location.pathname.startsWith("/rs3scantrainer")) return "preview"
    }

    return "development"
  }*/

  addToAlt1Link(): string {
    return `alt1://addapp/${window.location.protocol}//${window.location.host}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1)}appconfig.json`
  }
}

namespace Application {
  export type Preferences = {
    last_loaded_version?: number,
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