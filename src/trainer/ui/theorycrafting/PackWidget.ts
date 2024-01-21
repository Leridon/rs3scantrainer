import Widget from "../../../lib/ui/Widget";
import {MethodPackManager, Pack} from "../../model/MethodPackManager";
import Properties from "../widgets/Properties";
import LightButton from "../widgets/LightButton";
import TextArea from "../../../lib/ui/controls/TextArea";
import TextField from "../../../lib/ui/controls/TextField";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import * as lodash from "lodash";
import span = C.span;
import spacer = C.spacer;
import {ExportImport} from "../../../lib/util/exportString";
import exp = ExportImport.exp;
import ExportStringModal from "../widgets/modals/ExportStringModal";
import {NislIcon} from "../nisl";
import NisCollapseButton from "../../../lib/ui/controls/NisCollapseButton";
import {ExpansionBehaviour} from "../../../lib/ui/ExpansionBehaviour";

export default class PackWidget extends Widget {

    private name_span: Widget

    constructor(public pack: Pack,
                manager: MethodPackManager,
                customization: {
                    mode: "edit" | "view",
                    buttons?: boolean,
                    collapsible?: boolean
                }
    ) {
        super();

        this.addClass("ctr-pack-widget")

        if (pack.type == "default" || pack.type == "imported") customization.mode = "view"

        let body = new Properties()
            .addClass("ctr-pack-widget-body")

        let header = hbox(
            "Pack: ",
            this.name_span = span(pack.name),
            spacer(),
            customization.collapsible
                ? new NisCollapseButton(ExpansionBehaviour.vertical({
                    target: body,
                    starts_collapsed: true
                }))
                : undefined
        ).addClass("ctr-pack-widget-header")
            .tooltip(pack.local_id)

        this.append(header, body)

        switch (customization.mode) {
            case "edit":
                body.named("Name", new TextField().setValue(pack.name)
                    .onChange((v) => this.name_span.text(v.value))
                    .onCommit(v => {
                        manager.updatePack(pack, p => p.name = v)
                    })
                )
                body.named("Author(s)", new TextField().setValue(pack.author)
                    .onCommit(v => manager.updatePack(pack, p => p.author = v))
                )

                body.header("Description")
                body.row(new TextArea().css("height", "80px").setValue(pack.description)
                    .onCommit(v => manager.updatePack(pack, p => p.description = v))
                )

                break
            case "view":
                body.named("Author(s)", c().text(pack.author))

                body.header("Description")
                body.row(c().text(pack.description))

                break
        }

        body.row(span(`Contains ${pack.methods.length} methods`))

        if (customization.buttons) {
            body.row(hbox(
                new LightButton("Clone", "rectangle")
                    .onClick(() => {
                        let copy = lodash.cloneDeep(pack)

                        copy.name = `Cloned ${pack.name}`

                        manager.create(copy)
                    }),
                new LightButton("Delete", "rectangle").setEnabled(pack.type == "local" || pack.type == "imported")
                    .onClick(() => manager.deletePack(pack)),
                new LightButton("Export", "rectangle").setEnabled(pack.type == "local" || pack.type == "imported")
                    .onClick(() => {
                        ExportStringModal.do(exp({type: "method-pack", version: 1},
                            true,
                            true
                        )(pack))
                    }),
            ).addClass("ctr-button-container"))
        }
    }
}