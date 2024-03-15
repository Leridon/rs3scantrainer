import {FormModal} from "../../../../lib/ui/controls/FormModal";
import {CacheTypes} from "./CacheTypes";
import LocInstance = CacheTypes.LocInstance;
import {TransportParser2} from "./TransportParser";
import Properties from "../../widgets/Properties";
import {parsers3} from "./parsers3";
import {DropdownSelection} from "../../widgets/DropdownSelection";
import Widget from "../../../../lib/ui/Widget";
import {ParserPairing} from "./LocParsingAssociation";
import {BigNisButton} from "../../widgets/BigNisButton";


export class ParserPairingEdit extends Widget {

    constructor(private pairing: ParserPairing) {
        super();

        if (!pairing) this.pairing = {parser: null}

        this.render()
    }

    protected render() {
        this.empty()

        const props = new Properties()

        props.named("Parser", new DropdownSelection<TransportParser2>({
                type_class: {
                    toHTML: (v: TransportParser2) => c().text(v ? v.name : "None")
                }
            }, [null].concat(parsers3))
                .onSelection(parser => {
                    this.pairing.parser = parser
                })
        )

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

    constructor(private loc: LocInstance, private existing_pairing: ParserPairing) {
        super({
            size: "small"
        });

        this.title.set("Edit Parser Pairing")
    }

    render() {
        super.render()

        this.edit = new ParserPairingEdit(this.existing_pairing).appendTo(this.body)
    }


    getButtons(): BigNisButton[] {

        if (this.existing_pairing) {
            return [
                new BigNisButton("Remove Loc Pairing", "cancel")
                    .onClick(() => this.confirm({type: "saved", pairing: null})),
                new BigNisButton("Remove Instance Pairing", "cancel")
                    .setEnabled(this.existing_pairing.instance_data)
                    .onClick(() => this.confirm({
                        type: "saved", pairing: {
                            parser: this.existing_pairing.parser,
                            group_data: this.existing_pairing.group_data,
                            instance_data: undefined
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