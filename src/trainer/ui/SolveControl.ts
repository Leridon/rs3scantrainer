import {Application} from "trainer/application";
import ToggleButton from "./widgets/togglebutton";
import {storage} from "../../lib/util/storage";
import {ClueReader} from "skillbertssolver/reader";
import * as a1lib from "@alt1/base";

export default class SolveControl {
    private lockbutton = new ToggleButton($("#lockbutton"))
    private solvebutton = $("#solvebutton")

    private clue_reader = new ClueReader()

    private should_autosolve = new storage.Variable("preferences/autosolve", false)

    constructor(private app: Application) {
        if (!this.app.in_alt1) {
            this.lockbutton.button.hide()
            this.solvebutton.hide()
            return
        }

        this.lockbutton = new ToggleButton($("#lockbutton"), this.should_autosolve.get())
            .on_toggle((s) => {
                this.should_autosolve.set(s)

                this.update_autosolve()
            })

        this.solvebutton.on("click", async () => {
            await this.try_solve()
        })

        this.update_autosolve()
    }

    interval = null

    private async try_solve() {
        let clue = await this.clue_reader.find(a1lib.captureHoldFullRs())

        if (clue) this.app.sidepanels.clue_panel.selectClue(clue)
    }

    private update_autosolve() {
        if (this.should_autosolve.get() && !this.interval) {
            this.interval = window.setInterval(() => this.try_solve(), 300)
        } else if (!this.should_autosolve.get() && this.interval) {
            window.clearInterval(this.interval)
            this.interval = null
        }
    }
}