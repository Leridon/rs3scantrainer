import GameLayer from "../../../lib/gamemap/GameLayer";
import * as leaflet from "leaflet";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";
import Widget from "../../../lib/ui/Widget";
import TextField from "../../../lib/ui/controls/TextField";
import ControlWithHeader from "./ControlWithHeader";
import {ActionBar} from "./ActionBar";
import {DrawRegionAction} from "../theorycrafting/scanedit/TreeEdit";
import {boxPolygon, tilePolygon} from "../polygon_helpers";
import LightButton from "../widgets/LightButton";
import {Rectangle, Vector2} from "../../../lib/math";
import {TileRectangle} from "../../../lib/runescape/coordinates";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import InteractionTopControl from "./InteractionTopControl";
import {GameMapKeyboardEvent} from "../../../lib/gamemap/MapEvents";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import hbox = C.hbox;
import spacer = C.spacer;
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import {GridLayer, LatLngBounds} from "leaflet";
import Graticule from "../../../lib/gamemap/defaultlayers/Graticule";
import TransportLayer from "../../../lib/gamemap/defaultlayers/TransportLayer";
import shortcuts from "../../../data/shortcuts";

class ChunkGridGraticule extends Graticule {
    constructor() {
        super({
            intervals: [
                {min_zoom: -Infinity, interval: 64},
            ],
            lineStyle: {
                stroke: true,
                weight: 2,
                color: "white",
                fill: false
            }
        });
    }

    override onRemove(map): this {
        super.onRemove(map);

        this.clearLayers()

        return this
    }

    override constructLines(bounds: LatLngBounds, interval: number) {
        super.constructLines(bounds, interval)

        let mins = {
            x: Math.max(0, Math.floor(bounds.getWest() / interval)),
            y: Math.max(0, Math.floor(bounds.getSouth() / interval))
        };

        let max = {
            x: Math.min(99, Math.ceil(bounds.getEast() / interval)),
            y: Math.min(199, Math.ceil(bounds.getNorth() / interval))
        };

        for (let x = mins.x; x <= max.x; x++) {
            for (let y = mins.y; y <= max.y; y++) {
                leaflet.marker([y * 64 + 31.5, x * 64 + 31.5], {
                    icon: leaflet.divIcon({
                        iconSize: [100, 40],
                        html: `${x}|${y}`,
                        className: "ctr-map-utility-chunk-index"
                    }),
                }).addTo(this)
            }
        }
    }
}

export default class UtilityLayer extends GameLayer {
    preview: leaflet.Layer

    chunk_grid: leaflet.FeatureGroup = null

    guard: InteractionGuard

    output: Widget
    value: string
    chunk_in: TextField
    coords_in: TextField

    constructor() {
        super();

        new TransportLayer(shortcuts, true).addTo(this)

        this.guard = new InteractionGuard().setDefaultLayer(this)

        let layer_control = new ControlWithHeader("Utility")
        layer_control.append(new Checkbox("Chunks")
            .onCommit(v => {
                console.log(this.chunk_grid)

                this.chunk_grid?.clearLayers()
                this.chunk_grid?.remove()
                this.chunk_grid = null

                if (v) {
                    this.chunk_grid = new ChunkGridGraticule().addTo(this)
                }

                console.log(this.chunk_grid)
            }))

        new GameMapControl({
            position: "top-right",
            type: "floating",
        }, layer_control).addTo(this)

        let bottom_control = new ControlWithHeader("Utility")

        bottom_control.body.append(
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
                    new LightButton("Chunk").onClick(() => {
                        let [cx, cy, ...rest] = this.chunk_in.get().split(new RegExp("[^0-9]"))
                            .map(e => e.trim())
                            .filter(e => e.length > 0)
                            .map(e => Number(e))

                        this.getMap().fitView(TileRectangle.lift(Rectangle.from({x: cx * 64, y: cy * 64}, {x: cx * 64 + 63, y: cy * 64 + 63}), 0))
                    })
                ),
                hbox(
                    this.coords_in = new TextField(),
                    spacer(),
                    new LightButton("Coords").onClick(() => {
                        let [cx, cy, ...rest] = this.coords_in.get().split(new RegExp("[^0-9]"))
                            .map(e => e.trim())
                            .filter(e => e.length > 0)
                            .map(e => Number(e))

                        this.getMap().fitView(TileRectangle.lift(Rectangle.from({x: cx, y: cy}), 0))
                    })
                ),
            )
        )

        this.add(new GameMapControl({
            type: "gapless",
            position: "bottom-center"
        }, bottom_control))
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