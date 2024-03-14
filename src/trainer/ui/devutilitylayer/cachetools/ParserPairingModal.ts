import {FormModal} from "../../../../lib/ui/controls/FormModal";
import {CacheTypes} from "./CacheTypes";
import LocInstance = CacheTypes.LocInstance;
import {TransportParser2} from "./TransportParser";
import Properties from "../../widgets/Properties";
import {parsers3} from "./parsers3";
import {DropdownSelection} from "../../widgets/DropdownSelection";
import Widget from "../../../../lib/ui/Widget";
import {ParserPairing} from "./LocParsingAssociation";


export class ParserPairingEdit extends Widget {

    constructor(private pairing: ParserPairing) {
        super();

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
}

export class ParserPairingModal extends FormModal<any> {

    constructor() {
        super();
    }

    render() {
        super.render()

        new ParserPairingEdit().appendTo(this.body)
    }
}