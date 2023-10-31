import {GameMapControl} from "../../../lib/gamemap/GameMapControl";

export default class PathEditActionBar extends GameMapControl {
    constructor() {
        super({
            position: "bottom-center",
            type: "gapless"
        });

        this.content.text("Actionbar")
    }
}