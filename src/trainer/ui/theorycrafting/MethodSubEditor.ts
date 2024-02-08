import Behaviour from "../../../lib/ui/Behaviour";
import type MethodEditor from "./MethodEditor";
import {Path} from "../../../lib/runescape/pathing";
import {SolvingMethods} from "../../model/methods";
import ClueAssumptions = SolvingMethods.ClueAssumptions;
export default abstract class MethodSubEditor extends Behaviour {
    protected constructor(protected parent: MethodEditor) {super();}
    abstract relevantAssumptions(): Set<keyof SolvingMethods.ClueAssumptions>
}
