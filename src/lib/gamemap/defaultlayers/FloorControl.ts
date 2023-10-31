import {GameMapControl} from "../GameMapControl";
import GameLayer from "../GameLayer";
import {floor_t} from "../../runescape/coordinates";
import {GameMap} from "../GameMap";

function clamp_floor(n: number): floor_t {
    return Math.max(0, Math.min(3, n)) as floor_t
}

class FloorControl extends GameMapControl {
    up: JQuery
    down: JQuery
    current: JQuery

    constructor() {
        super({
            position: "bottom-left",
            type: "floating"
        }, $("<div style='display: flex' class='nis-map-control'>"));

        this.down = $("<div style='cursor: pointer'><img src='assets/icons/stairdown.png' style='width: 20px; padding: 4px'></div>")
            .on("click", (e) => {
                e.stopPropagation()
                this.parent.getMap().floor.set(clamp_floor(this.parent.getMap().floor.get() - 1))
            })
            .appendTo(this.container)
        this.current = $("<div style='border-left: 1px solid rgb(5, 56, 66); border-right: 1px solid rgb(5, 56, 66); padding-left: 4px; padding-right: 4px; line-height: 20px'>Floor 0</div>").appendTo(this.container)
        this.up = $("<div style='cursor: pointer'><img src='assets/icons/stairup.png' style='width: 20px; padding: 4px'></div>")
            .on("click", (e) => {
                e.stopPropagation()
                this.parent.getMap().floor.set(clamp_floor(this.parent.getMap().floor.get() + 1))
            })
            .appendTo(this.container)

        this.container.on("click", (e) => e.stopPropagation())

    }

    onAdd(map: GameMap) {
        console.log("On Add of Floor Control")
        map.floor.subscribe((f) => this.current.text(`Floor ${f}`))
    }
}

export default class FloorControlLayer extends GameLayer {
    constructor() {
        super();

        this.addControl(new FloorControl())
    }
}