import Behaviour from "../../../lib/ui/Behaviour";
import {SolvingMethods} from "../../model/methods";
import type MethodEditor from "./MethodEditor";

export default abstract class MethodSubEditor extends Behaviour {
    constructor(protected parent: MethodEditor) {super();}
}
