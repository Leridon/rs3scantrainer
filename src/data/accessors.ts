import methods from "./methods";
import {ClueStep} from "../model/clues";
import {indirected, method, resolve, resolved} from "../model/methods";


export class Methods {
    data: (method & indirected)[]

    constructor() {
        this.data = methods
    }

    forStep(step: ClueStep | number): (method & resolved<any>)[] {
        if (typeof step != "number") step = step.id

        return this.data.filter((m) => m.clue == step)
            .map((m) => resolve<ClueStep, method>(m))
    }
}