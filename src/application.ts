import {storage} from "./util/storage";
import SidePanelControl from "./ui/SidePanelControl";
import MenuBarControl from "./ui/MenuBarControl";
import {Modal} from "./ui/widgets/modal";

import TemplateResolver from "./util/TemplateResolver";
import {TeleportLayer} from "./ui/map/teleportlayer";
import {Teleports} from "./model/teleports";
import {ClueSteps} from "./model/clues";
import {Methods} from "./data/accessors";
import {GameMapControl} from "./ui/map/map";
import {extract_query_function} from "./query_functions";

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

export class Application {
    in_alt1: boolean = !!window.alt1

    menubar = new MenuBarControl(this)
    map = new GameMapControl($("#map"))
    sidepanels = new SidePanelControl(this)

    data = {
        teleports: new Teleports({
            fairy_ring_favourites: [],
            potas: [],
            variants: []
        }),
        clues: new ClueSteps(),
        methods: new Methods()
    }

    template_resolver = new TemplateResolver(new Map(
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

                return `<span style="position: relative" title="${tele.hover}"><img class='text-icon' src='assets/icons/teleports/${typeof tele.icon == "string" ? tele.icon : tele.icon.url}' title="${tele.hover}"><div class="tele-icon-code-overlay">${tele.code ? tele.code : ""}</div></span>`
            }],
            ["icon", (args) => {
                return `<img class='text-icon' src='assets/icons/${args[0]}.png'>`
            }]
        ]
    ))

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
        this.map.setTeleportLayer(new TeleportLayer(this.data.teleports.getAll()))

        this.data.teleports.on("refreshed", (t) => {
            this.map.setTeleportLayer(new TeleportLayer(this.data.teleports.getAll()))
        })
    }

    async start() {
        let query_function = extract_query_function(new URLSearchParams(window.location.search))
        if (query_function) query_function(this)

        if (!this.startup_settings.get().hide_beta_notice) await this.beta_notice_modal.show()
        if (this.patch_notes_modal.hasNewPatchnotes()) await this.patch_notes_modal.showNew()
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