import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {AugmentedMethod} from "../../model/MethodPackManager";
import MapSideBar from "../MapSideBar";
import {Application} from "../../application";
import Properties from "../widgets/Properties";
import TextField from "../../../lib/ui/controls/TextField";
import TextArea from "../../../lib/ui/controls/TextArea";
import {C} from "../../../lib/ui/constructors";
import ScanEditor from "./scanedit/ScanEditor";
import {SolvingMethods} from "../../model/methods";
import {Clues} from "../../../lib/runescape/clues";
import MethodSubEditor from "./MethodSubEditor";
import LightButton from "../widgets/LightButton";
import SaveInPack from "./SaveInPack";
import Widget from "../../../lib/ui/Widget";
import vbox = C.vbox;
import hbox = C.hbox;
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import ClueAssumptions = SolvingMethods.ClueAssumptions;
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import {ewent} from "../../../lib/reactive";
import GenericPathMethodEditor from "./GenericPathMethodEditor";
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import AssumptionProperty from "./AssumptionProperty";

class MethodEditSideBar extends MapSideBar {
    save_row: Widget
    assumptions: AssumptionProperty

    private pack_name: Widget

    constructor(private parent: MethodEditor) {
        super("Method Editor");

        this.save_row = hbox().appendTo(this.body).addClass("ctr-button-container")

        this.header.close_handler.set(() => parent.stop())

        let props = new Properties()

        props.named("Name", new TextField().setValue(parent.method.method.name).setPlaceholder("Enter Name")
            .onCommit(v => parent.method.method.name = v))
        props.named("Pack", this.pack_name = c().text(parent.method.pack ? parent.method.pack.name : ""))

        props.header("Description")
        props.row(new TextArea({placeholder: "Enter description"}).css("height", "80px").setValue(parent.method.method.description)
            .onCommit(v => parent.method.method.description = v)
        )

        props.header("Assumptions")

        props.row(
            this.assumptions = new AssumptionProperty()
                .setValue(parent.method.method.assumptions)
        )

        this.renderSaveRow()

        this.body.append(props)
    }

    renderSaveRow() {
        this.save_row.empty()

        if (this.parent.method.pack) {
            this.pack_name.text(this.parent.method.pack.name)

            this.save_row.append(
                new LightButton(`Save`, "rectangle")
                    .onClick(async () => {
                        await this.parent.app.methods.updateMethod(this.parent.method)
                        this.parent.app.notifications.notify({type: "information", duration: 3000}, `Successfully saved in Pack '${this.parent.method.pack.name}'.`)
                    }),
                new LightButton("Save Copy", "rectangle").onClick(async () => {
                    await new SaveInPack(this.parent.method, this.parent.app.methods).do()
                    this.parent.app.notifications.notify({type: "information", duration: 3000}, `Successfully saved a copy in Pack '${this.parent.method.pack.name}'.`)
                })
            )
        } else {
            this.pack_name.text("")

            this.save_row.append(
                new LightButton("Select Pack and Save", "rectangle")
                    .onClick(async () => {
                        this.parent.method.pack = await new SaveInPack(this.parent.method, this.parent.app.methods).do()
                        this.parent.app.notifications.notify({type: "information", duration: 3000}, `Successfully saved in Pack '${this.parent.method.pack.name}'.`)

                        this.renderSaveRow()
                    })
            )
        }
    }
}

export default class MethodEditor extends Behaviour {

    sidebar: MethodEditSideBar

    sub_editor: MethodSubEditor

    constructor(public app: Application, public method: AugmentedMethod) {
        super();
    }

    protected begin() {
        this.sidebar = new MethodEditSideBar(this).prependTo(this.app.main_content)
            .css("width", "300px")

        if (this.method.method.type == "scantree") {
            this.sub_editor = this.withSub(new ScanEditor(this, this.app, this.method as AugmentedMethod<ScanTreeMethod, Clues.Scan>, this.sidebar.body))
        } else {
            this.sub_editor = this.withSub(new GenericPathMethodEditor(this, this.method as AugmentedMethod<GenericPathMethod, Clues.Step>))
        }

        this.sidebar.assumptions.setRelevantAssumptions(this.sub_editor.relevantAssumptions())

        this.sub_editor.setAssumptions(this.method.method.assumptions)

        this.sidebar.assumptions.onCommit(value => {
            this.sub_editor.setAssumptions(value)
        })
    }

    protected end() {
        this.sidebar.remove()
    }
}