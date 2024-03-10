import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import ControlWithHeader from "../map/ControlWithHeader";
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import * as leaflet from "leaflet"
import {tileHalfPolygons, tilePolygon} from "../polygon_helpers";
import {direction, MovementAbilities} from "../../../lib/runescape/movement";
import possibility_raster = MovementAbilities.possibility_raster;
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import {Vector2} from "../../../lib/math";
import {PathBuilder} from "./PathBuilder";
import {PathEditor} from "./PathEditor";
import {Observable, observe} from "../../../lib/reactive";
import observe_combined = Observable.observe_combined;

export class AbilityLens extends leaflet.FeatureGroup {
    constructor(private tile: TileCoordinates, private surge_escape_for: direction[] = []) {
        super();

        this.render()
    }

    async render() {
        let raster = await possibility_raster(this.tile, this.surge_escape_for)

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

        polygons.forEach(p => p.addTo(this))
    }
}

export class StateAbilityLensLayer extends leaflet.FeatureGroup {

    active_lens: AbilityLens = null

    enabled1 = observe(true)
    enabled2 = observe(true)

    constructor(builder: PathBuilder) {
        super();

        observe_combined({
            enabled1: this.enabled1,
            enabled2: this.enabled2,
            state: builder.cursor_state
        }).subscribe(({enabled1, enabled2, state}) => {
            if (this.active_lens) {
                this.active_lens.remove()
                this.active_lens = null
            }

            if (!state?.state?.position?.tile) return
            if (!enabled1 || !enabled2) return;

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

        this.lens_layer = new StateAbilityLensLayer(editor.value).addTo(this)

        this.lens_layer.enabled1.set(false)

        this.setContent(new ControlWithHeader("Overlay")
            .append(new Checkbox("Ability Lens")
                .onCommit(v => {
                    this.lens_layer.enabled1.set(v)
                })))
    }
}