import {storage} from "./util/storage";
import SidePanelControl from "./uicontrol/SidePanelControl";
import HowToTabControls from "./uicontrol/HowToTabControl";
import MenuBarControl from "./uicontrol/MenuBarControl";
import {Modal} from "./uicontrol/widgets/modal";
import {clues} from "./data/clues";

import TemplateResolver from "./util/TemplateResolver";
import {TeleportLayer} from "./uicontrol/map/teleportlayer";
import {Teleports} from "./model/teleports";

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

        return this.show()
    }

    showAll() {
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
    howtotabs = new HowToTabControls(this)
    sidepanels = new SidePanelControl(this)

    teleports = new Teleports({
        fairy_ring_favourites: [],
        potas: [{
            color: "red",
            active: true,
            slots: ["gamesnecklace", "ringofduelling", "amuletofglory", "skillsnecklace", "digsitependant", "ringofslaying"]
        }],
        variants: []
    })

    template_resolver = new TemplateResolver(new Map(
        [
            ["surge", () => "<img src='assets/icons/surge.png' title='Surge'>"],
            ["dive", () => "<img src='assets/icons/dive.png' title='Dive'>"],
            ["bladeddive", () => "<img src='assets/icons/bladeddive.png' title='Bladed Dive'>"],
            ["teleport", (args) => {
                let tele = this.teleports.get(args[0], args[1])

                if (!tele) return "NULL"

                // TODO: Overlay code

                /*
                *
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
                * */

                return `<div><img src='assets/icons/teleports/${tele.icon}' title="${tele.hover}"> <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)">${tele.code}</div></div>`
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
        this.howtotabs.map.setTeleportLayer(new TeleportLayer(this.teleports.getAll()))

        this.teleports.on("refreshed", (t) => {
            this.howtotabs.map.setTeleportLayer(new TeleportLayer(this.teleports.getAll()))
        })
    }

    async start() {
        if (!this.startup_settings.get().hide_beta_notice) await this.beta_notice_modal.show()
        if (this.patch_notes_modal.hasNewPatchnotes()) await this.patch_notes_modal.showNew()
    }
}

export let scantrainer: Application = null

export function initialize() {

    scantrainer = new Application()

    scantrainer.start()

    //scantrainer.select(clues.find((c) => c.id == 361)) // zanaris
    //scantrainer.select(clues.find((c) => c.id == 399)) // compass
    scantrainer.sidepanels.clue_panel.selectClue(clues.find((c) => c.id == 364)) // falador

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