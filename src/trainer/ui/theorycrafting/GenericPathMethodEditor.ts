import MethodSubEditor from "./MethodSubEditor";
import MethodEditor from "./MethodEditor";
import {AugmentedMethod} from "../../model/MethodPackManager";
import {SolvingMethods} from "../../model/methods";
import GenericPathMethod = SolvingMethods.GenericPathMethod;

export default class GenericPathMethodEditor extends MethodSubEditor {
    constructor(parent: MethodEditor,
                public value: AugmentedMethod<GenericPathMethod>,
    ) {
        super(parent);
    }


    relevantAssumptions(): Set<keyof SolvingMethods.ClueAssumptions> {
        let set = new Set<keyof SolvingMethods.ClueAssumptions>(["meerkats_active", "double_escape", "double_surge", "mobile_perk"])

        if (this.value.clue.solution && this.value.clue.solution.type == "search" && this.value.clue.solution.key) {
            set.add("way_of_the_footshaped_key")
        }

        if (this.value.clue.type == "emote") {
            set.add("full_globetrotter")
        }

        return set
    }

    protected begin() {

        // Create widgets for every part of the path
        // - Pre-Path for keys (if not way of the foot shaped key) and hidey holes (if not full globetrotter && hideyhole not in area)
        // - Main Path
        // - Post-Path for hidey holes (if not full globetrotter && hideyhole not in area)

        // Integrate Path Editor
        // - Auto active if only main path exists
        // - Auto commit changed (?)
    }

    protected end() {

    }

}