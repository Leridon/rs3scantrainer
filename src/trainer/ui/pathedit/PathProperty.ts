import {Path} from "lib/runescape/pathing";
import AbstractEditWidget from "../widgets/AbstractEditWidget";
import collect_issues = Path.collect_issues;
import {IssueWidget, PathEditor} from "./PathEditor";
import MovementStateView from "./MovementStateView";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import Properties from "../widgets/Properties";
import SmallImageButton from "../widgets/SmallImageButton";
import {PathGraphics} from "../path_graphics";
import Button from "../../../lib/ui/controls/Button";
import {observe} from "../../../lib/properties/Observable";

export default class PathProperty extends AbstractEditWidget<Path.raw, {
    "loaded_to_editor": null,
    "editor_closed": null
}> {
    private loaded: boolean = false

    private augmented: Path.augmented

    private reset_button: Button = null
    private edit_button: Button = null

    constructor(public options: {
        target?: TileRectangle,
        start_state?: Path.movement_state,
        editor?: PathEditor
    }) {
        super($("<div style='display: flex'></div>"))

        if (this.options.editor) {
            this.container.on("mouseover", () => {
                if (this.reset_button) this.reset_button.setVisible(true)
                if (this.edit_button) this.edit_button.setVisible(true)
            })

            this.container.on("mouseleave", () => {
                if (this.reset_button) this.reset_button.setVisible(false)
                if (this.edit_button) this.edit_button.setVisible(false)
            })
        }

    }

    private async edit() {
        if (!this.options.editor) return

        this.loaded = true
        await this.render()

        this.options.editor.load(this.value, {
            commit_handler: async v => {
                this.changed(v)
                await this.render()
            },
            discard_handler: async () => {
                this.loaded = false
                this.changed(this.value)

                await this.render()

                this.emit("editor_closed", null)
            },
            start_state: this.options.start_state,
            target: this.options.target
        })

        this.emit("loaded_to_editor", null)
    }

    protected async render() {
        this.augmented = await Path.augment(this.value, this.options.start_state, this.options.target)

        this.empty()

        {
            let tooltip = c()
            tooltip.append(new Properties().header("Start State"))
            tooltip.append(new MovementStateView(this.augmented.pre_state))
            tooltip.append(new Properties().header("End State"))
            tooltip.append(new MovementStateView(this.augmented.post_state))

            let preview = c("<div class='ctr-path-property-preview'></div>")
                .addTippy(tooltip)
                .appendTo(this)
                .tapRaw(r => r.on("click", async () => await this.edit()))

            if (this.options.editor) preview.css("cursor", "pointer")

            {
                let issues = collect_issues(this.augmented)
                let errors = issues.filter(i => i.level == 0)
                let warnings = issues.filter(i => i.level == 1)

                if (errors.length > 0) new IssueWidget({level: 0, message: errors.length.toString()})
                    .css("margin-top", "0")
                    .css("margin-bottom", "0")
                    .appendTo(preview)
                if (warnings.length > 0) new IssueWidget({level: 1, message: warnings.length.toString()})
                    .css("margin-top", "0")
                    .css("margin-bottom", "0")
                    .appendTo(preview)
            }

            {
                let steps = this.augmented.steps.slice(0, Math.min(this.augmented.steps.length, 4))

                let html = this.augmented.steps.length > 0
                    ? steps.map((step) => PathGraphics.asSpan(step.raw)).join("|")
                    : "Empty path"

                if (steps.length != this.augmented.steps.length) html += " ..."

                let preview_span = c("<span>").appendTo(preview).container.html(html)
            }
        }

        this.edit_button = SmallImageButton.new("assets/icons/edit.png")
            .css("margin-left", "2px")
            .setEnabled(!this.loaded)
            .setVisible(false)
            .on("click", async () => await this.edit())
            .appendTo(this)

        this.reset_button = SmallImageButton.new("assets/icons/reset.png")
            .css("margin-left", "2px")
            .setEnabled(!this.loaded && this.value.length > 0)
            .setVisible(false)
            .on("click", async () => {
                this.changed([])

                await this.render()
            })
            .appendTo(this)
    }
}