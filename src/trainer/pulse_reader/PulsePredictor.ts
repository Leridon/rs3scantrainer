import Behaviour from "../../lib/ui/Behaviour";
import {Observable, observe} from "../../lib/properties/Observable";
import {Scans} from "../../lib/runescape/clues/scans";
import Pulse = Scans.Pulse;
import ClueScrollReader from "../../skillbertssolver/cluesolver/cluereader";

export default class PulsePredictor extends Behaviour {

    private scan_text: Observable<string>

    prediction: Observable<Pulse> = observe(null).equality(Pulse.equals)
    using_meerkats: Observable<boolean>

    reader = new ClueScrollReader()

    interval: any = null

    constructor(options: {
        interval: number
    }) {
        super();
    }

    protected begin() {

        this.scan_text.subscribe(text => {
            this.using_meerkats.set(text.includes("Your meerkats are increasing your scan range by 5."))

            if (text.includes("Try scanning a different level")) {
                console.log("different level")

                if (text.includes("The orb glows then flickers as you scan.")) console.log("Triple") // TODO
            } else {
                if (text.includes("You are too far away and nothing scans.")) console.log("Single or Double")

                if (text.includes("The orb glows as you scan.")) console.log("Triple")
            }
        })

        this.interval = setInterval(async () => {

            let match = await this.reader.find()

            if (match && match.intf.type == "scan") {
                console.log(this.reader.scantextreader.findText(match.img));
            }

        }, 100)
    }

    protected end() {
    }
}