import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {type Application} from "trainer/application";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";

import {observe} from "../../../lib/properties/Observable";
import {SolvingMethods} from "../../model/methods";
import MethodWithClue = SolvingMethods.MethodWithClue;
import {NewCluePanel} from "../SidePanelControl";
import {ClueStep} from "../../../lib/runescape/clues";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import {SolveScanTreeSubBehaviour} from "./ScanSolving";


class NoMethodSubBehaviour extends Behaviour {
    protected begin() {
        // TODO: Display generic solution layer
    }

    protected end() { }
}

export default class SolveBehaviour extends Behaviour {
    private clue = observe<ClueStep | null>(null).equality((a, b) => a?.id == b?.id)
    private method = observe<MethodWithClue | null>(null)

    private clue_panel: NewCluePanel = null

    private method_subbehaviour = this.withSub(new SingleBehaviour())

    constructor(public parent: Application) {
        super();

        this.clue.subscribe(clue => {
            if (this.isActive()) {
                if (this.clue_panel) {
                    this.clue_panel.remove()
                    this.clue_panel = null
                }

                if (clue) {
                    this.parent.sidepanels.add(this.clue_panel = new NewCluePanel(clue), 0)
                }
            }
        })

        this.method.subscribe(method => {
            let behaviour = (() => {
                switch (method?.type) {
                    case "scantree":
                        return new SolveScanTreeSubBehaviour(this, method as ScanTreeWithClue)
                    case null:
                    default:
                        return new NoMethodSubBehaviour()
                }
            })()

            this.method_subbehaviour.set(behaviour)
        })
    }

    setClue(clue: ClueStep) {
        this.clue.set(clue)
        this.method.set(null)
    }

    setMethod(method: MethodWithClue) {
        this.clue.set(method.clue)
        this.method.set(method)
    }

    protected begin() {
        // TODO:
        //  - Set sidepanels
        //  - Construct and set layer
    }

    protected end() {
    }
}