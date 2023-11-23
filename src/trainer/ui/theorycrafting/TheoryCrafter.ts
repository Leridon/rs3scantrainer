import Behaviour from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import TheoryCraftingSidebar from "./TheoryCraftingSidebar";
import OverviewLayer from "./OverviewLayer";

export default class TheoryCrafter extends Behaviour {
    sidebar: TheoryCraftingSidebar
    layer: OverviewLayer

    constructor(public app: Application) {
        super();
    }

    protected begin() {
        this.sidebar = new TheoryCraftingSidebar(this).prependTo(this.app.main_content)

        this.layer = new OverviewLayer(this.app).addTo(this.app.map)
    }

    protected end() {
        this.sidebar.remove()

        this.layer.remove()
    }
}