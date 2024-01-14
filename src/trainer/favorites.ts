import {AugmentedMethod, MethodPackManager} from "./model/MethodPackManager";
import {Clues} from "../lib/runescape/clues";
import {util} from "../lib/util/util";
import todo = util.todo;

export class FavoriteIndex {
    constructor(private methods: MethodPackManager) {

    }

    getTalkId(clue: Clues.Step): number {
        todo()
    }

    setTalkId(clue: Clues.Step, id: number): void {
        todo()
    }

    getChallengeAnswerId(clue: Clues.Step): number {
        todo()
    }

    setChallengeAnswerId(clue: Clues.Step, answer_id: number): void {
        todo()
    }

    getMethod(step: Clues.ClueSpot): AugmentedMethod {
        const candidates = this.methods.getForClue(step.clue.id, step.spot)

        // TODO: Get real favourite

        return null
    }

    setMethod(method: AugmentedMethod): void {
        //todo()
    }
}