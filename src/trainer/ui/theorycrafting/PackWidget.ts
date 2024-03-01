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
import NisCollapseButton from "../../../lib/ui/controls/NisCollapseButton";
import {ExpansionBehaviour} from "../../../lib/ui/ExpansionBehaviour";
import {ConfirmationModal} from "../widgets/modals/ConfirmationModal";
import Dependencies from "../../dependencies";
import ContextMenu, {MenuEntry} from "../widgets/ContextMenu";

export default class PackWidget extends Widget {
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

        let header = C.div()
            .text(`${pack.name} (${pack.methods.length})`)
            .addClass("ctr-pack-widget-header")
            .tooltip(pack.local_id)

        this.append(header, body)

        body.named("Author(s)", c().text(pack.author))

        body.row(c().css("font-style", "italic").text(pack.description))

        if (customization.buttons) {
            this.on("click", (event) => {
                let menu: MenuEntry[] = []

                menu.push({
                    type: "basic",
                    text: "Clone",
                    icon: "assets/icons/copy.png",
                    handler: () => {
                        let copy = lodash.cloneDeep(pack)

                        copy.name = `Cloned ${pack.name}`

                        // TODO: Modal

                        manager.create(copy)
                    }
                })

                if(pack.type == "local" || pack.type == "imported"){
                    menu.push({
                        type: "basic",
                        text: "Delete",
                        icon: "assets/icons/delete.png",
                        handler: async () => {
                            const really = await new ConfirmationModal<boolean>({
                                body:
                                    pack.type == "local"
                                        ? `Are you sure you want to delete the local pack ${pack.name}? There is no way to undo this action!`
                                        : `Are you sure you want to remove this imported pack? You will need to reimport it again.`,
                                options: [
                                    {kind: "neutral", text: "Cancel", value: false},
                                    {kind: "cancel", text: "Delete", value: true},
                                ]
                            }).do()

                            if (really) {
                                await manager.deletePack(pack)

                                Dependencies.instance().app.notifications.notify({
                                    type: "information",
                                    duration: 3000
                                }, `Deleted pack '${this.pack.name}'`)
                            }
                        }
                    })

                    menu.push({
                        type: "basic",
                        text: "Export",
                        handler: () => {
                            new ExportStringModal(exp({type: "method-pack", version: 1},
                                true,
                                true
                            )(pack)).show()
                        }
                    })
                }

                new ContextMenu(menu).showFromEvent(event)
            })
        }
    }
}