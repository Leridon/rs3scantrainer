import GameLayer from "../../../lib/gamemap/GameLayer";
import {Clues} from "../../../lib/runescape/clues";
import ClueSpot = Clues.ClueSpot;

export class ClueOverlay extends GameLayer {
    constructor(private clue: ClueSpot) {
        super();

        this.render()
    }

    render() {


    }
}