import Widget from "../widgets/Widget";
import Collapsible from "../widgets/modals/Collapsible";

export default class ScanTools extends Widget {
    collapsible: Collapsible

    constructor() {
        super();

        this.collapsible = new Collapsible(this.container, "Tools")
    }
}