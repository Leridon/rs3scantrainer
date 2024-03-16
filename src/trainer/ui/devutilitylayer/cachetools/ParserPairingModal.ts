import {FormModal} from "../../../../lib/ui/controls/FormModal";
import {CacheTypes} from "./CacheTypes";
import LocInstance = CacheTypes.LocInstance;
import {TransportParser2} from "./TransportParser";
import Properties from "../../widgets/Properties";
import {Parsers3, parsers3} from "./parsers3";
import {DropdownSelection} from "../../widgets/DropdownSelection";
import Widget from "../../../../lib/ui/Widget";
import {LocParsingTable, ParserPairing, ParsingAssociationGroup} from "./ParsingTable";
import {BigNisButton} from "../../widgets/BigNisButton";
import {LocInstanceProperties} from "./LocInstanceProperties";
import {SearchSelection} from "../../widgets/SearchSelection";
import {Checkbox} from "../../../../lib/ui/controls/Checkbox";
import {exit} from "process";
import TextField from "../../../../lib/ui/controls/TextField";


export class ParserPairingEdit extends Widget {

    constructor(private loc: LocInstance, private parsing_table: LocParsingTable, private pairing: ParserPairing) {
        super();

        if (!pairing) this.pairing = {group: null, instance_group: null}

        this.render()
    }

    protected render() {
        this.empty()

        c().css("border", "1px dashed white")
            .append(new LocInstanceProperties(this.loc, this.parsing_table))
            .appendTo(this)


        const props = new Properties()

        props.row(new Checkbox("Associate with parsing group")
            .setValue(!!this.pairing.group)
            .onCommit(v => {
                if (v) {
                    this.pairing.group = {
                        id: -1,
                        name: "New group",
                        parser: Parsers3.getById("ignore"),
                        argument: undefined // TODO: Default argument?
                    }
                } else {
                    this.pairing.group = undefined
                    this.pairing.instance_group = undefined
                }

                this.render()
            })
        )

        if (this.pairing.group) {
            props.header("Loc Group")

            props.named("Group", new SearchSelection<ParsingAssociationGroup>({
                type_class: {
                    toHTML: item => {
                        if (item) return c().text(item.group_name)
                        else return c().text("Create new group")
                    },
                },
                search_term: item => {
                    return item ? item.group_name : "Create new group"
                }
            }, []))
                .setValue(null)
                .onSelection(group => {
                    if (group) {
                        this.pairing.group.id = group.group_id
                        this.pairing.group.name = group.group_name
                        this.pairing.group.parser = Parsers3.getById(group.parser_id)
                        this.pairing.group.argument = group.per_group_arg
                    } else {
                        this.pairing.group.id = -1
                        this.pairing.group.name = "New group"
                        this.pairing.group.parser = Parsers3.getById("ignore")
                        this.pairing.group.argument = undefined // TODO: default arg by type
                    }

                    this.render()
                })

            props.named("Parser", new DropdownSelection<TransportParser2>({
                    type_class: {
                        toHTML: (v: TransportParser2) => c().text(v ? v.name : "None")
                    }
                }, parsers3)
                    .setValue(this.pairing.group.parser)
                    .onSelection(parser => {
                        this.pairing.group.parser = parser
                    })
            )

            props.named("Name", new TextField()
                .setValue(this.pairing.group.name)
                .onCommit(v => {
                    this.pairing.group.name = v
                })
            )

        }

        props.appendTo(this)
    }

    get(): ParserPairing {
        return this.pairing
    }
}

export class ParserPairingModal extends FormModal<{
    type: "cancelled" | "saved",
    pairing?: ParserPairing | null
}> {

    edit: ParserPairingEdit

    constructor(private loc: LocInstance, private parsing_table: LocParsingTable, private existing_pairing: ParserPairing) {
        super({
            size: "small"
        });

        this.title.set("Edit Parser Pairing")
    }

    render() {
        super.render()

        this.edit = new ParserPairingEdit(this.loc, this.parsing_table, this.existing_pairing).appendTo(this.body)
    }

    getButtons(): BigNisButton[] {

        if (this.existing_pairing.group) {
            return [
                new BigNisButton("Remove Loc Pairing", "cancel")
                    .onClick(() => this.confirm({type: "saved", pairing: null})),
                new BigNisButton("Remove Instance Pairing", "cancel")
                    .setEnabled(!!this.existing_pairing.instance_group)
                    .onClick(() => this.confirm({
                        type: "saved", pairing: {
                            group: this.existing_pairing.group,
                            instance_group: undefined
                        }
                    })),
                new BigNisButton("Cancel", "neutral")
                    .onClick(() => this.confirm({type: "cancelled"})),
                new BigNisButton("Save", "confirm")
                    .onClick(() => this.confirm({type: "saved", pairing: this.edit.get()})),
            ]
        } else {
            return [
                new BigNisButton("Cancel", "neutral")
                    .onClick(() => this.confirm({type: "cancelled"})),
                new BigNisButton("Save", "confirm")
                    .onClick(() => this.confirm({type: "saved", pairing: this.edit.get()})),
            ]
        }


    }

    protected getValueForCancel(): { type: "cancelled" | "saved"; pairing: ParserPairing } {
        return {type: "cancelled", pairing: this.edit.get()}
    }
}