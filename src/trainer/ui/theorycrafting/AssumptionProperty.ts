import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {SolvingMethods} from "../../model/methods";
import ClueAssumptions = SolvingMethods.ClueAssumptions;
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import * as lodash from "lodash";
import Widget from "../../../lib/ui/Widget";

export class AssumptionProperty extends AbstractEditWidget<ClueAssumptions> {
    relevant_assumptions: Set<keyof SolvingMethods.ClueAssumptions> = new Set([
        "meerkats_active", "way_of_the_footshaped_key", "full_globetrotter",
        "double_surge", "double_escape", "mobile_perk"
    ])

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

    setRelevantAssumptions(relevant: Set<keyof SolvingMethods.ClueAssumptions> = null): this {
        this.relevant_assumptions = relevant

        this.render()

        return this
    }

    private updateAssumptions(f: (_: ClueAssumptions) => void) {
        const cp = lodash.cloneDeep(this.get())

        f(cp)

        this.commit(cp)
    }
}

export namespace AssumptionProperty {
    export function icons(assumptions: ClueAssumptions): Widget[] {
        let icons: Widget[] = []

        if (assumptions.double_escape) icons.push(C.inlineimg("assets/icons/doubleescape.png"))
        if (assumptions.double_surge) icons.push(C.inlineimg("assets/icons/doublesurge.png"))
        if (assumptions.mobile_perk) icons.push(C.inlineimg("assets/icons/mobile.png"))
        if (assumptions.full_globetrotter) icons.push(C.inlineimg("assets/icons/Globetrotter_jacket.png"))
        if (assumptions.meerkats_active) icons.push(C.inlineimg("assets/icons/Meerkats_pouch.png"))
        if (assumptions.way_of_the_footshaped_key) icons.push(C.inlineimg("assets/icons/Key_(Treasure_Trails).png"))

        return icons
    }
}