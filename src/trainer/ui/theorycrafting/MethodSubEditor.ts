import Behaviour from "../../../lib/ui/Behaviour";
import type MethodEditor from "./MethodEditor";
import {SolvingMethods} from "../../model/methods";
import ClueAssumptions = SolvingMethods.ClueAssumptions;
import {Observable, observe} from "../../../lib/reactive";

export default abstract class MethodSubEditor extends Behaviour {
    assumptions: Observable<ClueAssumptions> = observe(ClueAssumptions.init())

    protected constructor(protected parent: MethodEditor) {super();}

    abstract relevantAssumptions(): Set<keyof SolvingMethods.ClueAssumptions>

    setAssumptions(assumptions: ClueAssumptions): this {
        this.assumptions.set(assumptions)

        return this
    }
}
