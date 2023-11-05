import {GameMapControl} from "../GameMapControl";
import {floor_t} from "../../runescape/coordinates";
import {GameMap} from "../GameMap";

export default class FloorControl extends GameMapControl {
    up: JQuery
    down: JQuery
    current: JQuery

    constructor() {
        super({
            position: "bottom-left",
            type: "floating"
        }, c("<div style='display: flex' class='nis-map-control'>"));

        this.down = $("<div style='cursor: pointer'><img src='assets/icons/stairdown.png' style='width: 20px; padding: 4px'></div>")
            .on("click", (e) => {
                e.stopPropagation()
                this.parent.getMap().floor.set(floor_t.clamp(this.parent.getMap().floor.get() - 1))
            })
            .appendTo(this.content.container)
        this.current = $("<div style='border-left: 1px solid rgb(5, 56, 66); border-right: 1px solid rgb(5, 56, 66); padding-left: 4px; padding-right: 4px; line-height: 20px'>Floor 0</div>").appendTo(this.content.container)
        this.up = $("<div style='cursor: pointer'><img src='assets/icons/stairup.png' style='width: 20px; padding: 4px'></div>")
            .on("click", (e) => {
                e.stopPropagation()
                this.parent.getMap().floor.set(floor_t.clamp((this.parent.getMap().floor.get() + 1))
            })
            .appendTo(this.content.container)

        this.content.container.on("click", (e) => e.stopPropagation())

    }

    onAdd(map: GameMap) {
        map.floor.subscribe((f) => this.current.text(`Floor ${f}`))

        return super.onAdd(map)
    }
}