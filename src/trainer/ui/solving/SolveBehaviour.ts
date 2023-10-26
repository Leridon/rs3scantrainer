import Behaviour from "../../../lib/ui/Behaviour";
import {type Application} from "trainer/application";
import {resolved, method} from "../../model/methods";
import {ClueStep} from "lib/runescape/clues";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import augmented_decision_tree = ScanTree.augmented_decision_tree;

export class SolveScanSubBehaviour extends Behaviour {
    protected begin() {
    }

    protected end() {
    }

    setNode(n: augmented_decision_tree) {
        // TODO:
        //  - Update sidepanel
        //  - Update layer
    }
}

export default class SolveBehaviour extends Behaviour {
    constructor(private parent: Application, m: method & resolved<ClueStep>) {
        super();

        if (m.type == "scantree") {
            this.withSub(new SolveScanSubBehaviour())
        }
    }

    setMethod(m: method & resolved<ClueStep>) { }

    protected begin() {
        // TODO:
        //  - Set sidepanels
        //  - Construct and set layer
    }

    protected end() {
    }
}