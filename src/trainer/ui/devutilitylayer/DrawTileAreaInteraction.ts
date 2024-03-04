import {ValueInteraction} from "../../../lib/gamemap/interaction/ValueInteraction";
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import {GameMapMouseEvent} from "../../../lib/gamemap/MapEvents";
import * as leaflet from "leaflet"
import {tilePolygon} from "../polygon_helpers";
import InteractionTopControl from "../map/InteractionTopControl";
import {GameMap} from "../../../lib/gamemap/GameMap";
import ButtonRow from "../../../lib/ui/ButtonRow";
import LightButton from "../widgets/LightButton";
import {deps} from "../../dependencies";
import {util} from "../../../lib/util/util";
import cleanedJSON = util.cleanedJSON;
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";

export class DrawTileAreaInteraction extends ValueInteraction<TileCoordinates[]> {
    drawing: {
        additive: boolean
    } | null

    tiles: TileCoordinates[] = []

    constructor() {
        super({
            preview_render: area => {
                console.log("Preview rendering")
                console.log(area)

                let lay = leaflet.featureGroup()

                for (let tile of area) {
                    tilePolygon(tile)
                        .setStyle({
                            color: "blue",
                            fillOpacity: 0.4,
                            stroke: false
                        }).addTo(lay)
                }

                return lay
            }
        });

        this.attachTopControl(new InteractionTopControl({name: "Draw Tile Area"})
            .setContent(
                c("<div style='font-family: monospace; white-space:pre'></div>")
                    .append(c().text(`[Shift + Mouse] add tiles`))
                    .append(c().text(`[Alt + Mouse] remove tiles`))
                    .append(new ButtonRow()
                        .buttons(
                            new LightButton("Commit")
                                .onClick(() => {
                                    this.commit(this.tiles)
                                }),
                            new LightButton("Copy")
                                .onClick(() => {
                                    if (this.tiles.length > 0) {
                                        navigator.clipboard.writeText(cleanedJSON(TileArea.fromTiles(this.tiles)))
                                        deps().app.notifications.notify({}, "Copied")
                                    } else {
                                        deps().app.notifications.notify({type: "error"}, "No tiles")
                                    }
                                }),
                            new LightButton("Copy Array")
                                .onClick(() => {
                                    if (this.tiles.length > 0) {
                                        navigator.clipboard.writeText(cleanedJSON(this.tiles))
                                        deps().app.notifications.notify({}, "Copied")
                                    } else {
                                        deps().app.notifications.notify({type: "error"}, "No tiles")
                                    }

                                }),
                        )
                    )
            )
        )
    }


    onAdd(map: GameMap): this {
        super.onAdd(map)

        map.dragging.disable()
        return this
    }

    onRemove(map: GameMap): this {
        super.onRemove(map)
        map.dragging.enable()
        return this
    }

    private set(tile: TileCoordinates, adding: boolean) {
        const index = this.tiles.findIndex(t => TileCoordinates.eq2(t, tile))
        const contains = index >= 0

        if (adding !== contains) {
            if (adding) this.tiles.push(tile)
            else this.tiles.splice(index, 1)

            this.preview(this.tiles)
        }
    }

    private toggle(tile: TileCoordinates): boolean {
        const index = this.tiles.findIndex(t => TileCoordinates.eq2(t, tile))
        const contains = index >= 0

        if (!contains) this.tiles.push(tile)
        else this.tiles.splice(index, 1)

        this.preview(this.tiles)

        return !contains
    }

    eventMouseDown(event: GameMapMouseEvent) {
        super.eventMouseDown(event);

        if (event.original.shiftKey || event.original.altKey) {

            event.onPost(() => {
                this.getMap().dragging.disable()

                this.drawing = {
                    additive: event.original.shiftKey
                }

                this.set(event.tile(), event.original.shiftKey)
            })
        }

    }

    eventMouseUp(event: GameMapMouseEvent) {
        this.drawing = null

        this.getMap().dragging.enable()
    }

    eventHover(event: GameMapMouseEvent) {
        super.eventHover(event);

        if (this.drawing) {
            event.onPost(() => {
                this.set(event.tile(), this.drawing.additive)
            })
        }
    }
}