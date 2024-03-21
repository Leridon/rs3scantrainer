import Behaviour from "../../../lib/ui/Behaviour";
import type MethodEditor from "./MethodEditor";
import {SolvingMethods} from "../../model/methods";
import ClueAssumptions = SolvingMethods.ClueAssumptions;
import {Observable, observe} from "../../../lib/reactive";
import {GameLayer} from "../../../lib/gamemap/GameLayer";
import TransportLayer from "../map/TransportLayer";

export default abstract class MethodSubEditor extends Behaviour {
    protected layer: GameLayer

    assumptions: Observable<ClueAssumptions> = observe(ClueAssumptions.init())

    protected constructor(protected parent: MethodEditor) {
        super();
    }

    protected begin() {
        this.layer.add(new TransportLayer(true))
    }

    setAssumptions(assumptions: ClueAssumptions): this {
        this.assumptions.set(assumptions)

        return this
    }
}
