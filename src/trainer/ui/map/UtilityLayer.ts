import GameLayer from "../../../lib/gamemap/GameLayer";
import * as leaflet from "leaflet";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";
import Widget from "../../../lib/ui/Widget";
import TextField from "../../../lib/ui/controls/TextField";
import ControlWithHeader from "./ControlWithHeader";
import {ActionBar} from "./ActionBar";
import {DrawRegionAction} from "../scanedit/TreeEdit";
import {boxPolygon, tilePolygon} from "../polygon_helpers";
import LightButton from "../widgets/LightButton";
import {Rectangle, Vector2} from "../../../lib/math";
import {TileRectangle} from "../../../lib/runescape/coordinates";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import InteractionTopControl from "./InteractionTopControl";
import {GameMapKeyboardEvent} from "../../../lib/gamemap/MapEvents";

export default class UtilityLayer extends GameLayer {
    preview: leaflet.Layer

    guard: InteractionGuard

    output: Widget
    value: string
    chunk_in: TextField

    constructor() {
        super();

        this.guard = new InteractionGuard().setDefaultLayer(this)

        let control = new ControlWithHeader("Utility", () => this.remove())

        control.body.append(
            vbox(
                new ActionBar([
                    new ActionBar.ActionBarButton("assets/icons/cursor_generic.png", () => {
                        this.startSelectTile()
                    }),
                    new ActionBar.ActionBarButton("assets/icons/cursor_use.png", () => {
                        this.startSelectArea()
                    }), ,
                    new ActionBar.ActionBarButton("assets/icons/cursor_talk.png", () => {

                        this.guard.set(new DrawRegionAction(""))
                            .onCommit((a) => {
                                this.setLayer(boxPolygon(a.area))

                                this.setValue({range: a.area})
                            })
                    }),
                ]),
                hbox(
                    this.output = c(),
                    spacer(),
                    new LightButton("Copy").onClick(() => {
                        if (this.value) navigator.clipboard.writeText(this.value)
                    })
                ),
                hbox(
                    this.chunk_in = new TextField(),
                    spacer(),
                    new LightButton("Jump").onClick(() => {
                        let [cx, cy, ...rest] = this.chunk_in.get().split(new RegExp("[^0-9]"))
                            .map(e => e.trim())
                            .filter(e => e.length > 0)
                            .map(e => Number(e))

                        Vector2.mul({x: cx, y: cy}, {x: 64, y: 64})

                        this.getMap().fitView(TileRectangle.lift(Rectangle.from({x: cx * 64, y: cy * 64}, {x: cx * 64 + 63, y: cy * 64 + 63}), 0))
                    })
                )
            )
        )

        this.add(new GameMapControl({
            type: "gapless",
            position: "bottom-center"
        }, control))
    }

    private setLayer(l: leaflet.Layer) {
        if (this.preview) {
            this.preview.remove()
            this.preview = null
        }

        this.preview = l.addTo(this)
    }

    private setValue(s: object) {
        this.value = JSON.stringify(s)
        if (this.value) navigator.clipboard.writeText(this.value)
        this.output.text(this.value)
    }

    private startSelectTile() {
        let i = new SelectTileInteraction()

        i.add(new InteractionTopControl({
            name: "Select tile", cancel_handler: () => i.cancel()
        }).setText("Click a tile"))

        this.guard.set(i
            .onCommit((t) => {
                this.setLayer(tilePolygon(t))

                this.setValue(t)
            }))
    }

    private startSelectArea() {
        this.guard.set(new DrawRegionAction(""))
            .onCommit((a) => {
                this.setLayer(boxPolygon(a.area))

                this.setValue(a.area)
            })
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        event.onPost(() => {
            if (event.original.key.toLowerCase() == "t") {
                this.startSelectTile()
            } else if (event.original.key.toLowerCase() == "a") {
                this.startSelectArea()
            }
        })
    }
}