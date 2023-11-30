import Behaviour from "../../../lib/ui/Behaviour";
import {SolvingMethods} from "../../model/methods";
import ClueAssumptions = SolvingMethods.ClueAssumptions;

export default abstract class MethodSubEditor extends Behaviour {
    abstract setAssumptions(assumptions: ClueAssumptions)
}
