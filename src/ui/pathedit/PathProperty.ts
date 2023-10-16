import {Path} from "../../model/pathing";
import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {GameMapControl} from "../map/map";
import collect_issues = Path.collect_issues;
import {IssueWidget, PathEditor} from "./PathEditor";
import MovementStateView from "./MovementStateView";
import {MapRectangle} from "../../model/coordinates";
import Properties from "../widgets/Properties";
import SmallImageButton from "../widgets/SmallImageButton";
import {PathGraphics} from "../map/path_graphics";
import Button from "../widgets/inputs/Button";

export default class PathProperty extends AbstractEditWidget<Path.raw, {
    "loaded_to_editor": null,
    "editor_closed": null
}> {
    private loaded: boolean = false

    private augmented: Path.augmented

    private reset_button: Button = null
    private edit_button: Button = null

    constructor(public options: {
        target?: MapRectangle,
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

        this.value = []
    }

    private async edit() {
        if (!this.options.editor) return

        this.loaded = true
        await this.update()

        this.options.editor.load(this.value, {
            commit_handler: async v => {
                this.value = v
                await this.update()
            },
            discard_handler: async () => {
                this.loaded = false
                this.changed(this.value)

                await this.update()

                this.emit("editor_closed", null)
            },
            start_state: this.options.start_state,
            target: this.options.target
        })

        this.emit("loaded_to_editor", null)
    }

    protected async render() {
        this.empty()

        this.augmented = await Path.augment(this.value, this.options.start_state, this.options.target)

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

                await this.update()
            })
            .appendTo(this)
    }

    protected async update() {
        await this.render()

        return
        /*
                this.load_button.setEnabled(!!this.value && !this.loaded)

                if (this.loaded) {
                    this.load_button.setText("Loaded to editor, edit on map")
                } else {
                    this.load_button.setText("Edit")
                }

                this.augmented = await Path.augment(this.value)

                if (!!this.value) {
                    this.load_button.tooltip("Load path into the path editor")
                } else {
                    this.load_button.tooltip("Can't load null path into editor")
                }

                this.summary.empty()

                {
                    c("<span class='nisl-textlink'></span>").text(`T${this.augmented.pre_state.tick}`).appendTo(this.summary)
                        .addTippy(new MovementStateView(this.augmented.pre_state))
                    c("<span>&nbsp;-&nbsp;</span>").appendTo(this.summary)
                    c("<span class='nisl-textlink'></span>").text(`T${this.augmented.post_state.tick}`).appendTo(this.summary)
                        .addTippy(new MovementStateView(this.augmented.post_state))
                    c(`<span>:&nbsp;</span>`).appendTo(this.summary)
                    c(`<span>${scantrainer.template_resolver.resolve(this.value.map(PathingGraphics.templateString).join(" - "))}</span>`).appendTo(this.summary)
                }
                if (this.value.length == 0) this.summary.text("Empty path")

                this.issue_container.empty()

                let issues = collect_issues(this.augmented)
                let errors = issues.filter(i => i.level == 0)
                let warnings = issues.filter(i => i.level == 1)

                if (errors.length > 0) new IssueWidget({level: 0, message: `${errors.length} errors`}).appendTo(this.issue_container)
                if (warnings.length > 0) new IssueWidget({level: 1, message: `${warnings.length} warnings`}).appendTo(this.issue_container)*/
    }
}