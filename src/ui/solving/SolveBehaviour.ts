import Behaviour from "../../lib/ui/Behaviour";
import {type Application} from "../../application";
import {resolved, method} from "../../model/methods";
import {ClueStep} from "../../model/clues";
import {ScanTree} from "../../model/scans/ScanTree";
import augmented_decision_tree = ScanTree.augmented_decision_tree;

export class SolveScanSubBehaviour extends Behaviour<SolveBehaviour> {
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

export default class SolveBehaviour extends Behaviour<Application> {
    constructor(m: method & resolved<ClueStep>) {
        super();

        if (m.type == "scantree") {
            this.withSub(new SolveScanSubBehaviour())
        }
    }

    protected begin() {
        // TODO:
        //  - Set sidepanels
        //  - Construct and set layer
    }

    protected end() {
    }
}