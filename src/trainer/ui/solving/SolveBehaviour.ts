import Behaviour, {SingleBehaviour} from "lib/ui/Behaviour";
import {type Application} from "trainer/application";
import {CluePanel} from "../SidePanelControl";
import {Clues} from "lib/runescape/clues";
import {SolveScanTreeSubBehaviour} from "./scans/ScanSolving";
import {observe} from "../../../lib/reactive";
import {AugmentedMethod} from "../../model/MethodPackManager";
import {SolvingMethods} from "../../model/methods";
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;

class NoMethodSubBehaviour extends Behaviour {
    protected begin() {
        // TODO: Display generic solution layer
    }

    protected end() { }
}

export default class SolveBehaviour extends Behaviour {
    private clue = observe<Clues.Step | null>(null).equality((a, b) => a?.id == b?.id)
    private method = observe<AugmentedMethod | null>(null)

    private clue_panel: CluePanel = null

    private method_subbehaviour = this.withSub(new SingleBehaviour())

    constructor(public parent: Application) {
        super();

        this.clue.subscribe(clue => {
            if (this.isActive()) {
                if (this.clue_panel) {
                    this.clue_panel.remove()
                    this.clue_panel = null
                }

                if (clue && clue.type == "scan") {
                    /*// TODO
                    this.parent.sidepanels.add(this.clue_panel = new CluePanel(clue, {
                        edit_handler: this.parent.in_alt1 ? undefined : () => {
                            this.parent.main_behaviour.set(new ScanEditor(this.parent, {
                                clue: clue,
                                map: this.parent.map
                            }))
                        }
                    }), 0)*/
                }
            }
        })

        this.method.subscribe(method => {
            let behaviour = (() => {
                switch (method?.method?.type) {
                    case "scantree":
                        return new SolveScanTreeSubBehaviour(this, method as AugmentedMethod<ScanTreeMethod, Clues.Scan>)
                    case null:
                    default:
                        return new NoMethodSubBehaviour()
                }
            })()

            this.method_subbehaviour.set(behaviour)
        })
    }

    setClue(clue: Clues.Step) {
        this.clue.set(clue)
        this.method.set(null)
    }

    setMethod(method: AugmentedMethod) {
        this.clue.set(method.clue)
        this.method.set(method)
    }

    protected begin() {
        // TODO:
        //  - Set sidepanels
        //  - Construct and set layer
    }

    protected end() {
        if (this.clue_panel) this.clue_panel.remove()
    }
}