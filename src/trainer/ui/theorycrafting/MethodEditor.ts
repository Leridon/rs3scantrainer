import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {AugmentedMethod} from "../../model/MethodPackManager";
import MapSideBar from "../MapSideBar";
import {Application} from "../../application";
import Properties from "../widgets/Properties";
import TextField from "../../../lib/ui/controls/TextField";
import TextArea from "../../../lib/ui/controls/TextArea";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import hbox = C.hbox;
import Checkbox from "../../../lib/ui/controls/Checkbox";
import span = C.span;
import ScanEditor from "../scanedit/ScanEditor";
import {SolvingMethods} from "../../model/methods";
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import {Clues} from "../../../lib/runescape/clues";
import ClueAssumptions = SolvingMethods.ClueAssumptions;
import MethodSubEditor from "./MethodSubEditor";
import LightButton from "../widgets/LightButton";

class MethodEditSideBar extends MapSideBar {
    constructor(parent: MethodEditor) {
        super("Method Editor");

        if (parent.method.pack) {
            hbox(
                new LightButton(`Save in ${parent.method.pack}`, "rectangle"),
                new LightButton("Save Copy", "rectangle")
            ).appendTo(this.body).addClass("ctr-button-container")
        } else {
            hbox(
                new LightButton("Select Pack and Save", "rectangle")
            ).appendTo(this.body).addClass("ctr-button-container")
        }


        this.header.close_handler.set(() => parent.stop())

        let props = new Properties()

        props.header("Name & Description")
        props.row(new TextField().setValue(parent.method.method.name).setPlaceholder("Enter Name")
            .on("changed", v => parent.method.method.name = v)
        )
        props.row(new TextArea().css("height", "80px").setValue(parent.method.method.description)
            .on("changed", v => parent.method.method.description = v)
        )

        props.header("Assumptions")

        function updateAssumptions(f: (a: ClueAssumptions) => void) {
            f(parent.method.method.assumptions)
            parent.sub_editor.get().setAssumptions(parent.method.method.assumptions)
        }

        props.row(vbox(
            hbox(new Checkbox().setValue(parent.method.method.assumptions.meerkats_active)
                    .on("changed", v => updateAssumptions(a => a.meerkats_active = v))
                , span("Meerkats")),
            hbox(new Checkbox().setValue(parent.method.method.assumptions.full_globetrotter)
                    .on("changed", v => updateAssumptions(a => a.full_globetrotter = v))
                , span("Full Globetrotter")),
            hbox(new Checkbox().setValue(parent.method.method.assumptions.way_of_the_footshaped_key)
                    .on("changed", v => updateAssumptions(a => a.way_of_the_footshaped_key = v))
                , span("Way of the foot-shaped key")),
            hbox(new Checkbox().setValue(parent.method.method.assumptions.double_surge)
                    .on("changed", v => updateAssumptions(a => a.double_surge = v))
                , span("Double Surge")),
            hbox(new Checkbox().setValue(parent.method.method.assumptions.double_escape)
                    .on("changed", v => updateAssumptions(a => a.double_escape = v))
                , span("Double Escape")),
            hbox(new Checkbox().setValue(parent.method.method.assumptions.mobile_perk)
                    .on("changed", v => updateAssumptions(a => a.mobile_perk = v))
                , span("Mobile Perk")),
        ))

        this.body.append(props)
    }
}

export default class MethodEditor extends Behaviour {

    sidebar: MethodEditSideBar

    sub_editor = this.withSub(new SingleBehaviour<MethodSubEditor>())

    constructor(private app: Application, public method: AugmentedMethod) {
        super();
    }

    protected begin() {
        this.sidebar = new MethodEditSideBar(this).prependTo(this.app.main_content)
            .css("width", "300px")

        if (this.method.method.type == "scantree") {
            this.sub_editor.set(new ScanEditor(this.app, this.method as AugmentedMethod<ScanTreeMethod, Clues.Scan>, this.sidebar.body))
        }
    }

    protected end() {
        this.sidebar.remove()
    }
}