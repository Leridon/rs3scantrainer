import Behaviour from "../../../lib/ui/Behaviour";
import {type Application} from "trainer/application";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import augmented_decision_tree = ScanTree.augmented_decision_tree;
import {Observable, observe} from "../../../lib/properties/Observable";
import {SolvingMethods} from "../../model/methods";
import MethodWithClue = SolvingMethods.MethodWithClue;

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
    method: Observable<MethodWithClue> = observe(null)

    constructor(private parent: Application) {
        super();

        this.method.subscribe(m => {
            if (m.type == "scantree") {
                this.withSub(new SolveScanSubBehaviour())
            }
        })
    }

    protected begin() {
        // TODO:
        //  - Set sidepanels
        //  - Construct and set layer
    }

    protected end() {
    }
}