import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {SolvingMethods} from "../../model/methods";
import ClueAssumptions = SolvingMethods.ClueAssumptions;
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import * as lodash from "lodash";

export default class AssumptionProperty extends AbstractEditWidget<ClueAssumptions> {
    relevant_assumptions: Set<keyof SolvingMethods.ClueAssumptions> = new Set(Object.keys(ClueAssumptions) as (keyof SolvingMethods.ClueAssumptions)[])

    constructor() {
        super();
    }

    protected render() {
        const relevant = this.relevant_assumptions
        const value = this.get()

        vbox(
            !relevant.has("meerkats_active") ? undefined :
                new Checkbox("Using Meerkats Familiar").setValue(!!value.meerkats_active)
                    .onCommit(v => this.updateAssumptions(a => a.meerkats_active = v))
            ,
            !relevant.has("full_globetrotter") ? undefined :
                new Checkbox("Full Globetrotter").setValue(!!value.full_globetrotter)
                    .onCommit(v => this.updateAssumptions(a => a.full_globetrotter = v))
            ,
            !relevant.has("way_of_the_footshaped_key") ? undefined :
                new Checkbox("Way of the foot-shaped key").setValue(!!value.way_of_the_footshaped_key)
                    .onCommit(v => this.updateAssumptions(a => a.way_of_the_footshaped_key = v))
            ,
            !relevant.has("double_surge") ? undefined :
                new Checkbox("Double Surge").setValue(!!value.double_surge)
                    .onCommit(v => this.updateAssumptions(a => a.double_surge = v))
            ,
            !relevant.has("double_escape") ? undefined :
                new Checkbox("Double Escape").setValue(!!value.double_escape)
                    .onCommit(v => this.updateAssumptions(a => a.double_escape = v))
            ,
            !relevant.has("mobile_perk") ? undefined :
                new Checkbox("Mobile Perk").setValue(!!value.mobile_perk)
                    .onCommit(v => this.updateAssumptions(a => a.mobile_perk = v))
            ,
        ).appendTo(this)
    }

    setRelevantAssumptions(relevant: Set<keyof SolvingMethods.ClueAssumptions>) {
        this.relevant_assumptions = relevant

        this.render()
    }

    private updateAssumptions(f: (_: ClueAssumptions) => void) {
        const cp = lodash.cloneDeep(this.get())

        f(cp)

        this.commit(cp)
    }
}