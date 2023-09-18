import LightButton from "../widgets/LightButton";
import {Path} from "../../model/pathing";
import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {GameMapControl} from "../map/map";
import Widget from "../widgets/Widget";
import {PathingGraphics} from "../map/path_graphics";
import collect_issues = Path.collect_issues;
import {IssueWidget} from "../scanedit/PathEditLayer";
import MovementStateView from "./MovementStateView";
import {scantrainer} from "../../application";
import {MapRectangle} from "../../model/coordinates";

export default class PathProperty extends AbstractEditWidget<Path.raw, {
    "loaded_to_editor": null,
    "editor_closed": null
}> {
    summary: Widget
    issue_container: Widget
    load_button: LightButton

    private loaded: boolean = false

    private augmented: Path.augmented

    constructor(map: GameMapControl, public options: {
        target?: MapRectangle,
        start_state?: Path.movement_state
    }) {
        super()

        this.summary = c("<div>").appendTo(this)
        this.issue_container = c("<div>").appendTo(this)

        this.load_button = new LightButton("Edit")
            .css("width", "100%")
            .setEnabled(false).appendTo(this)
            .on("click", async () => {
                this.loaded = true
                await this.update()

                map.path_editor.load(this.value, {
                    save_handler: async v => {
                        this.value = v
                        await this.update()
                    },
                    close_handler: async () => {
                        this.loaded = false
                        this.changed(this.value)

                        await this.update()

                        this.emit("editor_closed", null)
                    },
                    start_state: this.options.start_state,
                    target: this.options.target
                })

                this.emit("loaded_to_editor", null)
            })
    }

    protected async update() {
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
        if (warnings.length > 0) new IssueWidget({level: 1, message: `${warnings.length} warnings`}).appendTo(this.issue_container)
    }
}