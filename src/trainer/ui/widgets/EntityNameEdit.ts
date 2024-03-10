import AbstractEditWidget from "./AbstractEditWidget";
import {EntityName} from "../../../lib/runescape/EntityName";
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import {util} from "../../../lib/util/util";
import todo = util.todo;
import hbox = C.hbox;
import TextField from "../../../lib/ui/controls/TextField";
import * as lodash from "lodash";


export class EntityNameEdit extends AbstractEditWidget<EntityName> {
    constructor(private include_item: boolean = false) {
        super(vbox().container);
    }

    protected render() {
        this.empty()

        const buttons: {
            button: Checkbox,
            value: EntityName.Kind
        }[] = [
            {value: "npc", button: new Checkbox("NPC", "radio")},
            {value: "static", button: new Checkbox("Object", "radio")},
        ]

        if (this.include_item) buttons.push({value: "item", button: new Checkbox("Item", "radio")})

        const group = new Checkbox.Group<EntityName.Kind>(buttons, false)
            .setValue(this.get()?.kind || "static")
            .onChange(v => {
                const copy = lodash.cloneDeep(this.get())
                if (copy) {
                    copy.kind = v
                    this.commit(copy)
                }
            })

        const specifics_container = hbox(
            ...group.buttons.map(b => b.button)
        )

        const name = new TextField()
            .css("width", "100%")
            .setValue(this.get()?.name || "")
            .onCommit(v => {
                if (!v) this.commit(null)
                else {
                    let copy = lodash.cloneDeep(this.get())

                    if (!copy) {
                        copy = {name: "", kind: group.get()}
                    }

                    copy.name = v
                    this.commit(copy)
                }

            })

        this.append(
            name, specifics_container
        )
    }
}