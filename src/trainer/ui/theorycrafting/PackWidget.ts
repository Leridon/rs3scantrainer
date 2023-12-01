import Widget from "../../../lib/ui/Widget";
import {MethodPackManager, Pack} from "../../model/MethodPackManager";
import Properties from "../widgets/Properties";
import LightButton from "../widgets/LightButton";
import TextArea from "../../../lib/ui/controls/TextArea";
import TextField from "../../../lib/ui/controls/TextField";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;

export default class PackWidget extends Widget {
    constructor(pack: Pack,
                manager: MethodPackManager,
                mode: "edit" | "view"
    ) {
        super();

        if(pack.type == "default") mode = "view"

        // TODO: Selectable
        //  "Edit-Mode" vs "View mode"

        this.addClass("ctr-pack-widget")

        this.append(
            c(`<div class="ctr-pack-widget-header">Pack: <span>${pack.name}</span></span></div>`)
                .tooltip(pack.id)
        )

        let body = new Properties().appendTo(this)
            .addClass("ctr-pack-widget-body")

        body.named("Name", new TextField().setEnabled(pack.type == "local").setValue(pack.name))
        body.named("Author", new TextField().setEnabled(pack.type == "local").setValue(pack.author))

        body.header("Description")
        body.row(new TextArea().setEnabled(pack.type == "local").css("height", "80px").setValue(pack.description))

        body.row(hbox(
            new LightButton("Clone", "rectangle")
                .on("click", () => manager.create(pack)),
            new LightButton("Delete", "rectangle").setEnabled(pack.type == "local" || pack.type == "imported")
                .on("click", () => manager.deletePack(pack)),
            new LightButton("Export", "rectangle").setEnabled(pack.type == "local" || pack.type == "imported"),
        ).addClass("ctr-button-container"))
    }
}