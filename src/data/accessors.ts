import {Clues} from "lib/runescape/clues";
import {SolvingMethods} from "../trainer/model/methods";
import Method = SolvingMethods.Method;
import MethodWithClue = SolvingMethods.MethodWithClue;


export class MethodIndex {
    constructor(private data: Method[]) { }

    forStepId(id: number): Method[] {
        return this.data.filter((m) => m.clue_id == id)
    }

    forStep<StepT extends Clues.Step>(step: StepT): MethodWithClue<Method>[] {
        // TODO: Only use methods that are actually compatible with this step type

        return this.data.filter((m) => m.clue_id == step.id).map((m) => SolvingMethods.withClue(m, step))
    }
}