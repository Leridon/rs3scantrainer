import {storage} from "lib/util/storage";
import MenuBarControl from "trainer/ui/MenuBarControl";
import {Modal} from "trainer/ui/widgets/modal";
import TemplateResolver from "lib/util/TemplateResolver";
import {TeleportLayer} from "lib/gamemap/defaultlayers/TeleportLayer";
import {Teleports} from "lib/runescape/teleports";
import {ClueTier, ClueType} from "lib/runescape/clues";
import {GameMap, GameMapWidget} from "lib/gamemap/GameMap";
import {QueryLinks} from "trainer/query_functions";
import {Path} from "lib/runescape/pathing";
import {ExportImport} from "lib/util/exportString";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import {PathGraphics} from "./ui/path_graphics";
import Behaviour, {SingleBehaviour} from "lib/ui/Behaviour";
import {SolvingMethods} from "./model/methods";
import GameLayer from "../lib/gamemap/GameLayer";
import MenuBar from "./ui/MenuBar";
import Widget from "../lib/ui/Widget";
import TheoryCrafter from "./ui/theorycrafting/TheoryCrafter";
import {makeshift_main} from "./main";
import {MethodPackManager} from "./model/MethodPackManager";
import NotificationBar from "./ui/NotificationBar";
import {C} from "../lib/ui/constructors";
import div = C.div;
import link = QueryLinks.link;
import vbox = C.vbox;
import span = C.span;
import hbox = C.hbox;
import spacer = C.spacer;
import {observe} from "../lib/reactive";
import NeoSolvingBehaviour from "./ui/neosolving/NeoSolvingBehaviour";
import {FavoriteIndex} from "./favorites";

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
            steps: ExportImport.imp<Path.step[]>({expected_type: "path", expected_version: 0}), // import is idempotent if it's not a serialized payload string
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

        this.all_title = $("#patch-note-title-all")
        this.new_title = $("#patch-note-title-new")

        this.sections = $(".patchnotesection").get().map($).map((e: JQuery) => {
            return {
                el: e,
                patchnotes: e.data("patchnotes") as string
            }
        })
    }

    showAll() {
        $("#modal-patchnotes-report-issues").hide()

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
        $("#viewpatchnotes").on("click", async () => {
            this.hide()
            await this.app.patch_notes_modal.showAll()
            this.show()
        })

        $("#current-version").text(app.patch_notes_modal.sections[0].patchnotes)
    }
}

export class Application extends Behaviour {
    version = "b0.3.1"

    in_alt1: boolean = !!window.alt1

    main_content: Widget = null
    menubar = new MenuBarControl(this)
    map_widget: GameMapWidget
    map: GameMap

    methods: MethodPackManager
    favourites: FavoriteIndex

    main_behaviour = this.withSub(new SingleBehaviour())

    data = {
        teleports: new Teleports.ManagedTeleports({
            fairy_ring_favourites: [],
            potas: [],
        }),
    }

    template_resolver = new TemplateResolver(new Map<string, (args: string[]) => string>(
        [
            ["surge", () => "<img class='text-icon' src='assets/icons/surge.png' title='Surge'>"],
            ["dive", () => "<img class='text-icon' src='assets/icons/dive.png' title='Dive'>"],
            ["surgedive", () => "<img class='text-icon' src='assets/icons/surgedive.png' title='Surge'>"],
            ["bladeddive", () => "<img class='text-icon' src='assets/icons/bladeddive.png' title='Bladed Dive'>"],
            ["escape", () => "<img class='text-icon' src='assets/icons/escape.png' title='Escape'>"],
            ["barge", () => "<img class='text-icon' src='assets/icons/barge.png' title='Barge'>"],
            ["digspot", (args) => `<span class="ctr-digspot-inline">${args[0]}</span>`],
            ["scanarea", (args) => `<span class="ctr-scanspot-inline">${args[0]}</span>`],
            ["teleport", (args) => {
                let tele = this.data.teleports.get(args[0], args[1])

                if (!tele) return "NULL"

                return PathGraphics.Teleport.asSpan(tele)
            }],
            ["icon", (args) => {
                return `<img class='text-icon' src='assets/icons/${args[0]}.png'>`
            }]
        ]
    ))

    private startup_settings_storage = new storage.Variable<Application.Preferences>("preferences/startupsettings", () => ({}))
    startup_settings = observe(this.startup_settings_storage.get())

    patch_notes_modal = new PatchNotesModal("modal-patchnotes", this)
    about_modal = new AboutModal("modal-about", this)

    notifications: NotificationBar

    constructor() {
        super()

        this.methods = new MethodPackManager()
        this.favourites = new FavoriteIndex(this.methods)
    }

    protected async begin() {
        let container = Widget.wrap($("#main-content"))

        this.startup_settings.subscribe(s => this.startup_settings_storage.set(s))

        let map_widget: Widget

        this.notifications = new NotificationBar().appendTo($("body"))

        container.append(
            new MenuBar(this),
            this.main_content = c("<div style='display: flex; height: 100%; flex-grow: 1'></div>")
                .append(map_widget = c("<div style='flex-grow: 1; height: 100%'></div>"))
        )

        this.map_widget = new GameMapWidget(map_widget.container)
        this.map = this.map_widget.map

        this.map.setTeleportLayer(new TeleportLayer(this.data.teleports.getAll()))

        this.data.teleports.on("refreshed", (t) => {
            this.map.setTeleportLayer(new TeleportLayer(this.data.teleports.getAll()))
        })

        this.main_behaviour.set(new NeoSolvingBehaviour(this))

        if (this.mode() == "preview") {
            this.notifications.notify({type: "information"}, div(
                "This is a preview release of Scan Trainer and not recommended for general usage. Features may change or disappear without any notice. ",
                c("<a href='https://leridon.github.io/cluetrainer-live/' style='color: unset; text-decoration: underline'>Click here to get to the official release.</a>")
            ))
        }

        if (!this.in_alt1 && !this.startup_settings.value().dont_recommend_alt1) {
            this.notifications.notify({type: "information"}, not => vbox(
                span("Scan Trainer is an Alt1 plugin and has clue-solving features when installed."),
                hbox(
                    c(`<a href='${this.addToAlt1Link()}' class="ctr-notification-link">Click here to install.</a>`),
                    spacer().css("max-width", "60px"),
                    c(`<span class="ctr-notification-link">Don't show again.</span>`).on("click", () => {
                        this.startup_settings.update(s => s.dont_recommend_alt1 = true)
                        not.dismiss()
                    })
                )
            ))
        }

        if (this.startup_settings.value().last_loaded_version != null && this.startup_settings.value().last_loaded_version != this.version) {
            this.notifications.notify({type: "information"}, not => vbox(
                span("There has been an update! "),
                c(`<span class="ctr-notification-link">View patchnotes.</span>`).on("click", () => {
                    this.patch_notes_modal.showAll()
                    not.dismiss()
                })
            ))
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
        dont_recommend_alt1?: boolean
    }
}

export function initialize() {
    new Application().start()

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