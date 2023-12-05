import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import TheoryCraftingSidebar from "./TheoryCraftingSidebar";
import OverviewLayer from "./OverviewLayer";
import {AugmentedMethod} from "../../model/MethodPackManager";
import MethodEditor from "./MethodEditor";
import * as lodash from "lodash";

export default class TheoryCrafter extends Behaviour {
    sidebar: TheoryCraftingSidebar
    layer: OverviewLayer

    method_editor = this.withSub(new SingleBehaviour<MethodEditor>())

    constructor(public app: Application) {
        super();

        this.method_editor.behaviour.subscribe((b, old_b) => {
            if (b && !old_b) {
                this.sidebar.setVisible(false)
                this.layer.remove()
            } else if (!b && old_b) {
                this.sidebar.setVisible(true)
                this.layer.addTo(this.app.map)
            }
        })

        this.method_editor.content_stopped.on(() => this.method_editor.set(null))
    }

    protected begin() {
        this.sidebar = new TheoryCraftingSidebar(this).prependTo(this.app.main_content)

        this.layer = new OverviewLayer(this.app, m => this.editMethod(m)).addTo(this.app.map)
    }

    protected end() {
        this.sidebar.remove()

        this.layer.remove()
    }

    editMethod(method: AugmentedMethod) {
        let copy: AugmentedMethod = {
            clue: method.clue,
            pack: method.pack,
            method: lodash.cloneDeep(method.method)
        }

        this.method_editor.set(new MethodEditor(this.app, copy))
    }
}