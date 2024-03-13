import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import {DropdownSelection} from "../widgets/DropdownSelection";
import {MethodPackManager, Pack} from "../../model/MethodPackManager";
import Widget from "../../../lib/ui/Widget";
import * as lodash from "lodash";
import {C} from "../../../lib/ui/constructors";
import span = C.span;
import {util} from "../../../lib/util/util";
import copyUpdate = util.copyUpdate;

export type DisplayedRouteFilter = {
    type: "favourites" | "pack" | "none",
    local_pack_id?: string
}

export class DisplayedRouteFilterEdit extends AbstractEditWidget<DisplayedRouteFilter> {
    method_dropdown: DropdownSelection<Pack>

    constructor() {
        super();
    }

    setValue(v: DisplayedRouteFilter): this {
        if (!v) v = {type: "none"}

        return super.setValue(v)
    }

    protected async render() {
        this.empty()

        const filter = this.get()

        const group = new Checkbox.Group<DisplayedRouteFilter["type"]>([
            {value: "none", button: new Checkbox("None")},
            {value: "favourites", button: new Checkbox("Preferred")},
            {value: "pack", button: new Checkbox("Method Pack")},
        ])
            .setValue(filter.type)
            .onChange(async kind => {
                console.log("Change")

                this.method_dropdown.setEnabled(kind == "pack")

                const default_pack = (await MethodPackManager.instance().all())[0]

                this.commit(copyUpdate(this.get(), filter => {
                    filter.type = kind

                    if (kind == "pack") {
                        filter.local_pack_id ??= default_pack.local_id
                    }
                }))
            })

        this.append(...group.checkboxes())

        this.method_dropdown = new DropdownSelection({
                type_class: {
                    toHTML(v: Pack): Widget {
                        if (v) return span(`${lodash.capitalize(v.type)}: ${v.name}`)
                        else return span("None")
                    }
                },
                can_be_null: false
            },
            await MethodPackManager.instance().all()
        )
            .setValue(await MethodPackManager.instance().getPack(filter.local_pack_id))
            .setEnabled(filter.type == "pack")
            .onSelection(pack => {
                this.commit(copyUpdate(this.get(), filter => {
                    filter.local_pack_id = pack.local_id
                }))
            })
            .appendTo(this)
    }

}