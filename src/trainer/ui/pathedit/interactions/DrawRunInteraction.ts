import {MapCoordinate} from "../../../../lib/runescape/coordinates";
import * as leaflet from "leaflet";
import {PathFinder} from "../../../../lib/runescape/movement";
import LightButton from "../../widgets/LightButton";
import {createStepGraphics} from "../../path_graphics";
import Widget from "../../../../lib/ui/Widget";
import InteractionLayer from "../../../../lib/gamemap/interaction/InteractionLayer";
import {GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";
import {Path} from "../../../../lib/runescape/pathing";
import {GameMapControl} from "../../../../lib/gamemap/GameMapControl";

export default class DrawRunInteraction extends InteractionLayer {
    pathfinding_state: PathFinder.state = null

    top_control = (new class extends GameMapControl {
        instruction_div: Widget
        reset_button: LightButton
        cancel_button: LightButton

        constructor(outer: DrawRunInteraction) {
            super({
                position: "top-center",
                type: "gapless"
            })


            this.instruction_div = c("<div style='text-align: center'>").appendTo(this.content)

            let control_row = c("<div style='text-align: center'>").appendTo(this.content)

            this.cancel_button = new LightButton("Cancel")
                .on("click", () => outer.cancel())
                .appendTo(control_row)

            this.reset_button = new LightButton("Reset Start")
                .on("click", () => outer.setStartPosition(null))
                .appendTo(control_row)
        }
    }(this)).addTo(this)

    constructor(private config: {
        done_handler: (_: Path.step_run) => void
    }) {
        super()

    }

    last_previewed_to: MapCoordinate = null

    setStartPosition(pos: MapCoordinate): this {
        if (pos) this.pathfinding_state = PathFinder.init_djikstra(pos)
        else this.pathfinding_state = null

        this.update_preview(null)
        return this
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(async () => {
            event.stopAllPropagation()

            let tile = event.tile()

            if (!this.pathfinding_state) {
                this.setStartPosition(tile)
                await this.update_preview(null)
            } else {
                let path = await PathFinder.find(this.pathfinding_state, tile)

                if (path) {
                    this.config.done_handler({
                        type: "run",
                        waypoints: path,
                        description: `Run to ${tile.x} | ${tile.y}`
                    })

                    this.cancel()
                    return
                }
            }
        })
    }

    eventHover(event: GameMapMouseEvent) {
        event.onPre(() => this.update_preview(event.tile()))
    }

    _preview: leaflet.Layer = null

    async update_preview(to: MapCoordinate) {
        if (to == null || !this.pathfinding_state || !MapCoordinate.eq2(this.last_previewed_to, to)) {
            if (this._preview) {
                this._preview.remove()
                this._preview = null
            }
        }

        if (!this.pathfinding_state) {
            this.top_control.instruction_div.empty()
            this.top_control.instruction_div.text(`Click where you want to start running.`)
        } else if (to && !MapCoordinate.eq2(this.last_previewed_to, to)) {
            let path = await PathFinder.find(this.pathfinding_state, to)

            if (this._preview) {
                this._preview.remove()
                this._preview = null
            }

            if (path) {
                this._preview = createStepGraphics({
                    type: "run",
                    description: "",
                    waypoints: path
                }).addTo(this)
            }

            this.top_control.instruction_div.empty()
            this.top_control.instruction_div.append(c().text(`Running from ${this.pathfinding_state.start.x} | ${this.pathfinding_state.start.y}.`))
            this.top_control.instruction_div.append(c().text(`Currently selected path: ${path.length - 1} tiles/${Math.ceil((path.length - 1) / 2)} ticks.`))
            this.top_control.instruction_div.append(c().text(`Click map to confirm.`))
        }

        this.last_previewed_to = to

        this.top_control.reset_button.setVisible(!!this.pathfinding_state)

        //let path = await PathFinder.pathFinder(HostedMapData.get(), this._start, this._to)
        /*let path = await PathFinder.find(PathFinder.init_djikstra(this._start), this._to)

       if (this._preview) {
           this._preview.remove()
           this._preview = null
       }

       if (path) {
           this._preview = createStepGraphics({
               type: "run",
               waypoints: path,
               description: ""
           }).addTo(this.layer)
       }*/
    }
}