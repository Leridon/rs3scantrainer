import LightButton from "../widgets/LightButton";
import {Path} from "../../model/pathing";
import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {GameMapControl} from "../map/map";
import Widget from "../widgets/Widget";
import {PathingGraphics} from "../map/path_graphics";

export default class PathProperty extends AbstractEditWidget<Path.raw> {
    summary: Widget
    load_button: LightButton

    private augmented: Path.augmented

    constructor(map: GameMapControl) {
        super()

        this.summary = c("<div>").appendTo(this)

        this.load_button = new LightButton("Load to editor")
            .css("width", "100%")
            .setEnabled(false).appendTo(this)
            .on("click", () => {
                map.path_editor.load(this.value, {
                    save_handler: async v => {
                        this.changed(v)
                        await this.update()
                    }
                })
            })

    }

    protected async update() {
        this.load_button.setEnabled(!!this.value)

        this.augmented = await Path.augment(this.value)

        if (!!this.value) {
            this.load_button.tooltip("Load path into the path editor")
        } else {
            this.load_button.tooltip("Can't load null path into editor")
        }

        this.summary.empty()
        for (let i = 0; i < this.value.steps.length; i++) {
            if (i != 0) c("<span> - </span>").appendTo(this.summary)

            PathingGraphics.getIcon(this.value.steps[i]).appendTo(this.summary)
        }

        if(this.value.steps.length == 0) this.summary.text("Empty path")
    }
}