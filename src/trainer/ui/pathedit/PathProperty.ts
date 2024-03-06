import {Path} from "lib/runescape/pathing";
import AbstractEditWidget from "../widgets/AbstractEditWidget";
import collect_issues = Path.collect_issues;
import MovementStateView from "./MovementStateView";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import Properties from "../widgets/Properties";
import {SmallImageButton} from "../widgets/SmallImageButton";
import {PathGraphics} from "../path_graphics";
import Button from "lib/ui/controls/Button";
import movement_state = Path.movement_state;
import {IssueWidget} from "./EditedPathOverview";
import {PathEditor} from "./PathEditor";

export default class PathProperty extends AbstractEditWidget<Path.raw> {
    private loaded: boolean = false

    public augmented: Promise<Path.augmented>

    private reset_button: Button = null
    private edit_button: Button = null

    constructor(public options: {
        target?: TileRectangle,
        start_state?: Path.movement_state,
        editor_handle?: (_: PathEditor.options_t) => PathEditor
    }) {
        super($("<div style='display: flex'></div>"))

        if (this.options.editor_handle) {
            this.container.on("mouseover", () => {
                if (this.reset_button) this.reset_button.setVisible(true)
                if (this.edit_button) this.edit_button.setVisible(true)
            })

            this.container.on("mouseleave", () => {
                if (this.reset_button) this.reset_button.setVisible(false)
                if (this.edit_button) this.edit_button.setVisible(false)
            })
        }

        this.setValue([])
    }

    private async edit() {
        if (!this.options.editor_handle) return

        this.loaded = true
        await this.render()

        this.options.editor_handle({
            initial: this.get(),
            commit_handler: async v => {
                this.commit(v, true)
            },
            discard_handler: async () => {
                await this.render()
            },
            start_state: this.options.start_state,
            target: this.options.target
        })
    }

    async setStartState(state: movement_state): Promise<this> {
        this.options.start_state = state

        this.augmented = Path.augment(this.get(), this.options.start_state, this.options.target)

        await this.render()

        return this
    }

    setValue(v: Path.raw): this {
        this.augmented = Path.augment(v, this.options.start_state, this.options.target)

        return super.setValue(v)
    }

    protected async render() {
        let augmented = await this.augmented

        this.empty()

        {
            let issues = collect_issues(augmented)
            let errors = issues.filter(i => i.level == 0)
            let warnings = issues.filter(i => i.level == 1)

            let tooltip = c()
            tooltip.append(new Properties().header("Start State"))
            tooltip.append(new MovementStateView(augmented.pre_state))
            tooltip.append(new Properties().header("End State"))
            tooltip.append(new MovementStateView(augmented.post_state))

            issues.forEach(i => new IssueWidget(i).appendTo(tooltip))

            let preview = c("<div class='ctr-path-property-preview'></div>")
                .addTippy(tooltip)
                .appendTo(this)
                .tapRaw(r => r.on("click", async () => await this.edit()))

            if (this.options.editor_handle) preview.css("cursor", "pointer")

            {

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
                let steps = augmented.steps.slice(0, Math.min(augmented.steps.length, 4))

                let html = augmented.steps.length > 0
                    ? steps.map((step) => PathGraphics.asSpan(step.raw)).join("|")
                    : "Empty path"

                if (steps.length != augmented.steps.length) html += " ..."

                let preview_span = c("<span>").appendTo(preview).container.html(html)
            }
        }

        this.edit_button = SmallImageButton.new("assets/icons/edit.png")
            .css("margin-left", "2px")
            .setEnabled(!this.loaded)
            .setVisible(false)
            .onClick(async () => await this.edit())
            .appendTo(this)

        this.reset_button = SmallImageButton.new("assets/icons/reset.png")
            .css("margin-left", "2px")
            .setEnabled(!this.loaded && this.get().length > 0)
            .setVisible(false)
            .onClick(async () => {
                this.commit([], true)
            })
            .appendTo(this)
    }
}