import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import ControlWithHeader from "../map/ControlWithHeader";
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import GameLayer, {time} from "lib/gamemap/GameLayer";
import * as leaflet from "leaflet"
import {tileHalfPolygons, tilePolygon} from "../polygon_helpers";
import {direction, MovementAbilities} from "../../../lib/runescape/movement";
import possibility_raster = MovementAbilities.possibility_raster;
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import {Vector2} from "../../../lib/math";
import {PathBuilder2} from "./PathBuilder";
import {PathEditor} from "./PathEditor";

export class AbilityLens extends leaflet.FeatureGroup {
    constructor(private tile: TileCoordinates, private surge_escape_for: direction[] = []) {
        super();

        this.render()
    }

    async render() {
        let raster = await time("Possibility raster", async () => await possibility_raster(this.tile, direction.all))

        function style(color: string): leaflet.PolylineOptions {
            return {
                fillOpacity: 0.2,
                stroke: false,
                fillColor: color,
            }
        }

        const polygons: leaflet.Polygon[] = []

        for (let dx = 0; dx < raster.data.size.x; dx++) {
            for (let dy = 0; dy < raster.data.size.y; dy++) {
                const tile = TileCoordinates.move(raster.data.origin, {x: dx, y: dy})

                const works = raster.data.query(tile)

                if (works) {

                    if (this.surge_escape_for.length > 0) {

                        const surge = raster.targets.some(t => Vector2.eq(tile, t.surge))
                        const escape = raster.targets.some(t => Vector2.eq(tile, t.escape))

                        if (surge && escape) {
                            const [s, e] = tileHalfPolygons(tile,
                                [style("#426896"), style("#234709")],
                            )

                            polygons.push(s, e)
                        } else if (surge) {
                            polygons.push(
                                tilePolygon(tile, style("#426896"))
                            )
                        } else if (escape) {
                            polygons.push(
                                tilePolygon(tile, style("#234709"))
                            )
                        } else {
                            polygons.push(
                                tilePolygon(tile, style("#e2c40c"))
                            )
                        }
                    } else {
                        polygons.push(
                            tilePolygon(tile, style("#e2c40c"))
                        )
                    }
                } else {
                    polygons.push(
                        tilePolygon(tile, style("red"))
                    )
                }

            }
        }

        polygons.push(
            tilePolygon(this.tile, style("blue"))
        )
        polygons.forEach(p => p.addTo(this))
    }
}

export class StateAbilityLensLayer extends leaflet.FeatureGroup {

    active_lens: AbilityLens = null

    constructor(builder: PathBuilder2) {
        super();

        builder.cursor_state.subscribe((state) => {
            if (this.active_lens) {
                this.active_lens.remove()
                this.active_lens = null
            }

            if (!state?.state?.position?.tile) return

            this.active_lens = new AbilityLens(state.state.position.tile,
                state.state.position.direction ?
                    [state.state.position.direction] : direction.all
            ).addTo(this)
        }, true)

    }
}

export class PathEditOverlayControl extends GameMapControl {
    lens_layer: StateAbilityLensLayer

    constructor(editor: PathEditor) {
        super({
            position: "top-right",
            type: "floating",
        }, c());

        this.setContent(new ControlWithHeader("Overlay")
            .append(new Checkbox("Ability Lens")
                .onCommit(v => {
                    if (this.lens_layer) {
                        this.lens_layer?.remove()
                        this.lens_layer = null
                    }

                    if (v) {
                        this.lens_layer = new StateAbilityLensLayer(editor.value).addTo(this)
                    }
                })))
    }
}