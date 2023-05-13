import {storage} from "./util/storage";
import CluePanelControl from "./uicontrol/CluePanelControl";
import HowToTabControls from "./uicontrol/HowToTabControl";
import MenuBarControl from "./uicontrol/MenuBarControl";
import {Modal} from "./uicontrol/widgets/modal";

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

    constructor(id: string, private app: Application) {
        super(id);

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

}

export class Application {
    in_alt1: boolean = !!window.alt1

    menubar = new MenuBarControl(this)
    howtotabs = new HowToTabControls(this)
    cluepanel = new CluePanelControl(this)

    startup_settings = new storage.Variable<{
        hide_beta_notice: boolean,
        seen_changelogs: string[]
    }>("preferences/startupsettings", {
        hide_beta_notice: false,
        seen_changelogs: []
    })

    beta_notice_modal = new BetaNoticeModal("modal-public-beta", this)
    patch_notes_modal = new PatchNotesModal("modal-patchnotes", this)

    constructor() {
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
}