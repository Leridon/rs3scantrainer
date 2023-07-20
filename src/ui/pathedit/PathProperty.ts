import Widget from "../widgets/Widget";
import LightButton from "../widgets/LightButton";

export default class PathProperty extends Widget {
    constructor() {
        super()

        new LightButton("Load to editor").appendTo(this)
    }
}