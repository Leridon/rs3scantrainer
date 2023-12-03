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

export default class PackWidget extends Widget {

    private name_span: Widget

    constructor(pack: Pack,
                manager: MethodPackManager,
                mode: "edit" | "view" = "edit"
    ) {
        super();

        this.addClass("ctr-pack-widget")

        if (pack.type == "default" || pack.type == "imported") mode = "view"

        this.append(
            hbox(
                span("Pack: "),
                this.name_span = span(pack.name),
                spacer(),
                span("+")
            ).addClass("ctr-pack-widget-header")
                .tooltip(pack.id)
                .tapRaw(r => r.on("click", () => {
                    body.container.animate({
                        "height": "toggle"
                    }, 100)
                }))
        )

        let body = new Properties().appendTo(this)
            .addClass("ctr-pack-widget-body")
            .css("display", "none")

        switch (mode) {
            case "edit":
                body.named("Name", new TextField().setValue(pack.name)
                    .onChange((v) => this.name_span.text(v.value))
                    .onCommit(v => {
                        manager.updatePack(pack, p => p.name = v)
                    })
                )
                body.named("Author", new TextField().setValue(pack.author)
                    .onCommit(v => manager.updatePack(pack, p => p.author = v))
                )

                body.header("Description")
                body.row(new TextArea().css("height", "80px").setValue(pack.description)
                    .onCommit(v => manager.updatePack(pack, p => p.description = v))
                )

                break
            case "view":
                body.named("Author", c().text(pack.author))

                body.header("Description")
                body.row(c().text(pack.description))

                break
        }

        body.row(span(`Contains ${pack.methods.length} methods`))

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