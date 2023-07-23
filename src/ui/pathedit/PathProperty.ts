import LightButton from "../widgets/LightButton";
import {Path} from "../../model/pathing";
import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {GameMapControl} from "../map/map";

export default class PathProperty extends AbstractEditWidget<Path.raw> {
    load_button: LightButton

    constructor(map: GameMapControl) {
        super()

        this.load_button = new LightButton("Load to editor").setEnabled(false).appendTo(this)
            .on("click", () => {
                map.path_editor.load(this.value, {save_handler: v => this.changed(v)})
            })
    }

    protected update() {
        this.load_button.setEnabled(!!this.value)

        if (!!this.value) {
            this.load_button.tooltip("Load path into the path editor")
        } else {
            this.load_button.tooltip("Can't load null path into editor")
        }
    }
}