import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import {ClearMapData, PathFinder} from "lib/runescape/movement";
import {arrow, createStepGraphics} from "../../path_graphics";
import {GameMapKeyboardEvent, GameMapMouseEvent} from "lib/gamemap/MapEvents";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import InteractionTopControl from "../../map/InteractionTopControl";
import {Observable, observe} from "../../../../lib/reactive";
import {util} from "../../../../lib/util/util";
import index = util.index;
import observe_combined = Observable.observe_combined;
import {Path} from "../../../../lib/runescape/pathing";

class DrawRunInteractionInternal extends ValueInteraction<{
    path: TileCoordinates[],
    no_path_to: TileCoordinates
}> {
    private segments: Observable<{
        tiles: TileCoordinates[]
    }[]> = observe([])

    private path = this.segments.map(segments => {
        return segments.flatMap((segment, index) => index == 0 ? segment.tiles : segment.tiles.slice(1))
    })
    private last_position = this.path.map(s => index(s, -1)).equality(TileCoordinates.eq2)

    private cached_pathfinding_state = this.last_position.map(p => p ? PathFinder.init_djikstra(p) : null)

    private previewed_segment: Observable<{
        target: TileCoordinates,
        tiles: TileCoordinates[],
        broken: boolean
    }> = observe(null)

    constructor() {
        super({
            preview_render: (v) => {

                let preview = createStepGraphics({
                    type: "run",
                    waypoints: v.path,
                    description: ""
                })

                if (v.no_path_to) {
                    arrow(index(v.path, -1), v.no_path_to).setStyle({
                        color: "red"
                    }).addTo(preview)
                }

                return preview
            }
        })

        this.attachTopControl(
            new InteractionTopControl({name: "Drawing Run-Path"})
                .setContent(c())
        )

        observe_combined({segments: this.segments, previewed_segment: this.previewed_segment}).subscribe(({segments, previewed_segment}) => {
            let real_segments = segments.map(s => s.tiles)

            if (previewed_segment && !previewed_segment.broken) real_segments.push(previewed_segment.tiles)

            let waypoints = real_segments.flat()

            if (waypoints.length > 0) {
                this.preview({
                    path: waypoints,
                    no_path_to: previewed_segment?.broken ? previewed_segment.target : null
                })
            }
        })
    }

    setStartPosition(pos: TileCoordinates): this {
        if (pos) this.segments.set([{tiles: [pos]}])
        else this.segments.set([])

        return this
    }

    private getPathFindingState(): PathFinder.state {
        return this.cached_pathfinding_state.value()
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(async () => {
            event.stopAllPropagation()

            if (this.segments.value().length == 0) this.setStartPosition(event.tile())
            else {
                let segment =
                    await (event.original.ctrlKey
                        ? PathFinder.idealPath(this.last_position.value(), event.tile())
                        : PathFinder.find(this.getPathFindingState(), event.tile()))

                this.segments.update(w => w.push({tiles: segment}))
                this.previewed_segment.set(null)

                if (!event.original.shiftKey) {
                    this.commit({
                        path: this.path.value(),
                        no_path_to: null
                    })
                }
            }
        })
    }

    eventHover(event: GameMapMouseEvent) {
        event.onPre(async () => {
            this.updatePreview(event.tile(), event.original.ctrlKey)
        })
    }

    private async updatePreview(tile: TileCoordinates, force: boolean) {
        if (this.last_position.value()) {
            let segment =
                await (force
                    ? PathFinder.idealPath(this.last_position.value(), tile)
                    : PathFinder.find(this.getPathFindingState(), tile))

            this.previewed_segment.set({
                target: tile,
                broken: !segment,
                tiles: segment
            })
        } else {
            this.previewed_segment.set(null)
        }
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        event.onPre(() => {
            if (event.original.key == "Control" && this.previewed_segment.value())
                this.updatePreview(this.previewed_segment.value().target, true)
        })
    }

    eventKeyUp(event: GameMapKeyboardEvent) {
        event.onPre(() => {
            if (event.original.key == "Control" && this.previewed_segment.value())
                this.updatePreview(this.previewed_segment.value().target, false)
        })
    }
}

export default class DrawRunInteraction extends ValueInteraction<Path.step_run> {
    internal: DrawRunInteractionInternal

    constructor() {
        super();

        this.internal = new DrawRunInteractionInternal()
            .onCommit(v => {
                this.commit({
                    type: "run",
                    description: "",
                    waypoints: v.path
                })
            }).addTo(this)
    }

    setStartPosition(pos: TileCoordinates): this {
        this.internal.setStartPosition(pos)

        return this
    }
}