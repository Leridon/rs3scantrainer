import Behaviour from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import TheoryCraftingSidebar from "./TheoryCraftingSidebar";
import OverviewLayer from "./OverviewLayer";
import {clues} from "../../../data/clues";

export default class TheoryCrafter extends Behaviour {
    sidebar: TheoryCraftingSidebar
    layer: OverviewLayer

    constructor(public app: Application) {
        super();
    }

    protected begin() {
        this.sidebar = new TheoryCraftingSidebar(this).prependTo(this.app.main_content)

        this.layer = new OverviewLayer(clues, this.app).addTo(this.app.map)
    }

    protected end() {
        this.sidebar.remove()
    }
}