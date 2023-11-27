import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import TheoryCraftingSidebar from "./TheoryCraftingSidebar";
import OverviewLayer from "./OverviewLayer";
import {AugmentedMethod} from "../../model/MethodPackManager";

class MethodEditor extends Behaviour {
    constructor(private value: AugmentedMethod) {
        super();


    }

    protected begin() {
    }

    protected end() {
    }
}

export default class TheoryCrafter extends Behaviour {
    sidebar: TheoryCraftingSidebar
    layer: OverviewLayer

    method_editor = this.withSub(new SingleBehaviour<MethodEditor>())

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