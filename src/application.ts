import {storage} from "./util/storage";
import SidePanelControl from "./ui/SidePanelControl";
import MenuBarControl from "./ui/MenuBarControl";
import {Modal} from "./ui/widgets/modal";

import TemplateResolver from "./util/TemplateResolver";
import {TeleportLayer} from "./ui/map/teleportlayer";
import {Teleports} from "./model/teleports";
import {ClueSteps, ClueTier, ClueType} from "./model/clues";
import {Methods} from "./data/accessors";
import {GameMapWidget} from "./ui/map/map";
import {QueryLinks} from "./query_functions";
import {Path} from "./model/pathing";
import {ExportImport} from "./util/exportString";
import OverviewLayer from "./ui/map/layers/OverviewLayer";
import {clues} from "./data/clues";
import {ScanTree} from "./model/scans/ScanTree";
import {resolve} from "./model/methods";
import {MapRectangle} from "./model/coordinates";
import {PathGraphics} from "./ui/map/path_graphics";
import Behaviour, {SingleBehaviour} from "./lib/ui/Behaviour";

export namespace ScanTrainerCommands {
    import Command = QueryLinks.Command;
    import exp = ExportImport.exp;
    import imp = ExportImport.imp;
    export const load_path: Command<{
        steps: Path.raw,
        target?: MapRectangle,
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
            target?: MapRectangle,
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
            types: ["anagram", "compass", "coordinates", "cryptic", "emote", "image", "scan", "simple", "skilling"]
        },
        serializer: {
            tiers: (tiers: ClueTier[]) => tiers.join(","),
            types: (tiers: ClueType[]) => tiers.join(",")
        },
        instantiate: ({tiers, types}) => (app: Application): void => {
            app.map.map.setActiveLayer(new OverviewLayer(clues.filter(c => tiers.indexOf(c.tier) >= 0 && types.indexOf(c.type) >= 0)))
        },
    }

    export const load_method: Command<{
        method: ScanTree.indirect_scan_tree
    }> = {
        name: "load_method",
        parser: {
            // method: (a) => imp<ScanTree.indirect_scan_tree>({expected_type: "scantree", expected_version: 0})(a)
        },
        default: {},
        serializer: {
            // method: (a) => exp({type: "scantree", version: 0}, true, true)(a)
        },
        instantiate: ({method}) => (app: Application): void => {
            let resolved = resolve(method)

            app.sidepanels.clue_panel.clue(resolved.clue).showMethod(resolved)
        },
    }


    export const index = [
        load_path, load_overview, load_method
    ]
}

class BetaNoticeModal extends Modal {
    understand_button: JQuery

    constructor(id: string, app: Application) {
        super(id);

        this.understand_button = $("#beta-notice-dismiss").on("click", () => {
            app.startup_settings.map((s) => {
                s.hide_beta_notice = true
            })
        })
    }
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

    hasNewPatchnotes(): boolean {
        let seen = this.app.startup_settings.get().seen_changelogs

        return this.sections.some((e) => !seen.includes(e.patchnotes))
    }


    showNew() {
        this.all_title.hide()
        this.new_title.show()

        let seen = this.app.startup_settings.get().seen_changelogs

        this.sections.forEach((el) => {
            if (seen.includes(el.patchnotes)) el.el.hide()
            else el.el.show()
        })

        this.app.startup_settings.map((s) => {
            s.seen_changelogs = this.sections.map((e) => e.patchnotes)
        })

        $("#modal-patchnotes-report-issues").show()

        return this.show()
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
    in_alt1: boolean = !!window.alt1

    menubar = new MenuBarControl(this)
    map = new GameMapWidget($("#map"))
    sidepanels = new SidePanelControl(this)

    behaviour = new SingleBehaviour()

    data = {
        teleports: new Teleports({
            fairy_ring_favourites: [],
            potas: [],
            variants: []
        }),
        clues: new ClueSteps(),
        methods: new Methods()
    }

    template_resolver = new TemplateResolver(new Map<string, (args: string[]) => string>(
        [
            ["surge", () => "<img class='text-icon' src='assets/icons/surge.png' title='Surge'>"],
            ["dive", () => "<img class='text-icon' src='assets/icons/dive.png' title='Dive'>"],
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

    query_commands: {}

    startup_settings = new storage.Variable<{
        hide_beta_notice: boolean,
        seen_changelogs: string[]
    }>("preferences/startupsettings", {
        hide_beta_notice: false,
        seen_changelogs: []
    })

    beta_notice_modal = new BetaNoticeModal("modal-public-beta", this)
    patch_notes_modal = new PatchNotesModal("modal-patchnotes", this)
    about_modal = new AboutModal("modal-about", this)

    constructor() {
        super()

        this.map.map.setTeleportLayer(new TeleportLayer(this.data.teleports.getAll()))

        this.data.teleports.on("refreshed", (t) => {
            this.map.map.setTeleportLayer(new TeleportLayer(this.data.teleports.getAll()))
        })
    }

    protected async begin() {
        let query_function = QueryLinks.get_from_params(ScanTrainerCommands.index, new URLSearchParams(window.location.search))
        if (query_function) query_function(this)

        if (!this.startup_settings.get().hide_beta_notice) await this.beta_notice_modal.show()
        if (this.patch_notes_modal.hasNewPatchnotes()) await this.patch_notes_modal.showNew()

        //ExportStringModal.do(await makeshift_main())

        return this
    }

    protected end() {
    }
}

export let scantrainer: Application

export function initialize() {

    scantrainer = new Application()

    scantrainer.start()

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