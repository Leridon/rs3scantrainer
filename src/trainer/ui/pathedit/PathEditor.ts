import * as leaflet from "leaflet";
import {Path} from "lib/runescape/pathing";
import {util} from "lib/util/util";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import movement_state = Path.movement_state;
import Behaviour from "lib/ui/Behaviour";
import {Transportation} from "../../../lib/runescape/transportation";
import {Rectangle, Vector2} from "lib/math";
import TemplateResolver from "lib/util/TemplateResolver";
import {GameMapContextMenuEvent} from "lib/gamemap/MapEvents";
import GameLayer from "lib/gamemap/GameLayer";
import {DrawAbilityInteraction} from "./interactions/DrawAbilityInteraction";
import PathEditActionBar from "./PathEditActionBar";
import InteractionLayer, {InteractionGuard} from "lib/gamemap/interaction/InteractionLayer";
import {Observable, ObservableArray, observe} from "../../../lib/reactive";
import {floor_t, TileCoordinates} from "../../../lib/runescape/coordinates";
import * as assert from "assert";
import * as lodash from "lodash";
import {MenuEntry} from "../widgets/ContextMenu";
import PlaceRedClickInteraction from "./interactions/PlaceRedClickInteraction";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import InteractionTopControl from "../map/InteractionTopControl";
import DrawRunInteraction from "./interactions/DrawRunInteraction";
import {PathFinder} from "../../../lib/runescape/movement";
import index = util.index;
import {PathStepEntity} from "../map/entities/PathStepEntity";
import TransportLayer from "../map/TransportLayer";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";
import {CursorType} from "../../../lib/runescape/CursorType";
import {boxPolygon} from "../polygon_helpers";
import EntityTransportation = Transportation.EntityTransportation;
import {TeleportSpotEntity} from "../map/entities/TeleportSpotEntity";
import {EntityTransportEntity} from "../map/entities/EntityTransportEntity";
import activate = TileArea.activate;
import default_interactive_area = Transportation.EntityTransportation.default_interactive_area;
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {EditedPathOverview} from "./EditedPathOverview";
import todo = util.todo;
import {StateStack} from "../../../lib/UndoRedo";

function needRepairing(state: movement_state, shortcut: Path.step_transportation): boolean {
    return state.position.tile
        && activate(shortcut.internal.actions[0].interactive_area ?? default_interactive_area(shortcut.internal.clickable_area))
            .query(state.position.tile)
        && !TileCoordinates.eq2(state.position.tile, shortcut.assumed_start)
}

function repairShortcutStep(state: movement_state, shortcut: Path.step_transportation): void {
    shortcut.assumed_start = state.position.tile
}

class PathEditorGameLayer extends GameLayer {
    constructor(private editor: PathEditor) {
        super();

        new TransportLayer(true).addTo(this)
    }

    eventContextMenu(event: GameMapContextMenuEvent) {
        event.onPost(() => {
            if (this.editor.isActive()) {

                if (!event.active_entity) {
                    event.add({
                        type: "basic",
                        text: "Walk here",
                        icon: "assets/icons/yellowclick.png",
                        handler: () => {

                        }
                    })

                    event.add({
                        type: "submenu",
                        text: "Create Redclick",
                        icon: "assets/icons/redclick.png",
                        children: CursorType.all().map((i): MenuEntry => ({
                            type: "basic",
                            text: i.description,
                            icon: i.icon_url,
                            handler: () => {
                                this.editor.value.create({
                                    type: "redclick",
                                    target: CursorType.defaultEntity(i.type),
                                    where: event.tile(),
                                    how: i.type
                                })
                            }
                        }))
                    })
                } else if (event.active_entity instanceof TeleportSpotEntity) {
                    const t = event.active_entity.config.teleport

                    if (t.group.access.length == 1) {
                        const a = t.group.access[0]

                        event.addForEntity({
                            type: "basic",
                            text: c().append(`Use via `, TeleportSpotEntity.accessNameAsWidget(a)),
                            handler: () => {
                                this.editor.value.add({
                                    raw: {
                                        type: "teleport",
                                        spot: t.centerOfTarget(),
                                        id: {...t.id(), access: a.id},
                                    }
                                })
                            }
                        })
                    } else {
                        event.addForEntity({
                            type: "submenu",
                            text: `Use via`,
                            children: t.group.access.map(a => {
                                return {
                                    type: "basic",
                                    text: c().append(TeleportSpotEntity.accessNameAsWidget(a)),
                                    handler: () => {
                                        this.editor.value.add({
                                            raw: {
                                                type: "teleport",
                                                spot: t.centerOfTarget(),
                                                id: {...t.id(), access: a.id},
                                            }
                                        })
                                    }
                                }
                            })
                        })
                    }
                } else if (event.active_entity instanceof EntityTransportEntity) {

                    let s = Transportation.normalize(event.active_entity.config.shortcut)

                    s.actions.forEach(a => {
                        event.add({
                            type: "basic",
                            text: `${s.entity.name}: ${a.name}`,
                            icon: CursorType.meta(a.cursor).icon_url,
                            handler: async () => {
                                const t = this.editor.value.post_state.value()?.position?.tile

                                let assumed_start = t
                                const interactive_area = a.interactive_area || EntityTransportation.default_interactive_area(s.clickable_area)

                                if (t) {
                                    const path_to_start = await PathFinder.find(
                                        PathFinder.init_djikstra(t),
                                        interactive_area
                                    )

                                    if (path_to_start && path_to_start.length > 1) {
                                        if (assumed_start) assumed_start = index(path_to_start, -1)
                                        this.editor.value.create({
                                            type: "run",
                                            waypoints: path_to_start,
                                        })
                                    }
                                }

                                assumed_start ??=
                                    t ? TileRectangle.clampInto(t, TileArea.toRect(
                                            interactive_area,
                                        ))
                                        : interactive_area.origin

                                let clone = lodash.cloneDeep(s)
                                clone.actions = [lodash.cloneDeep(a)]

                                this.editor.value.create({
                                    type: "transport",
                                    assumed_start: assumed_start,
                                    internal: clone
                                })
                            }
                        })
                    })
                } else if (event.active_entity instanceof PathStepEntity) {
                    let i = this.editor.value.value().findIndex(v => v.value().associated_preview == event.active_entity)

                    if (i >= 0) {
                        let v = this.editor.value.value()[i]

                        event.addForEntity({
                            type: "basic",
                            text: `Remove`,
                            handler: () => this.editor.value.remove(v)
                        })

                        if (v.value().raw.type == "ability") {

                            event.addForEntity({
                                type: "basic",
                                text: `Redraw`,
                                handler: () => this.editor.redrawAbility(v)
                            })
                        }

                        if (v.value().raw.type == "powerburst" || v.value().raw.type == "redclick" || v.value().raw.type == "teleport") {

                            event.addForEntity({
                                type: "basic",
                                text: `Move`,
                                handler: () => this.editor.moveStep(v)
                            })
                        }

                    }
                }
            }
        })
    }
}
export class PathBuilder extends ObservableArray<PathEditor.Value> {


    create(step: Path.Step) {
        this.add({raw: step})
    }

    override add(v: PathEditor.Value): ObservableArray.ObservableArrayValue<PathEditor.Value> {
        if (!v.augmented) v.augmented = observe(null)

        if (!v) {
            console.log("PANIC, adding null to step list")
            debugger
        }

        return super.add(v);
    }

    override setTo(data: PathEditor.Value[]): this {
        data.forEach(v => {
            if (!v.augmented) v.augmented = observe(null)
        })

        if (data.some(s => !s)) {
            console.log("PANIC, adding null to step list")
            debugger
        }

        return super.setTo(data)
    }

    augmented_value: Observable<{ path: Path.augmented, steps: PathEditor.OValue[] }> = observe({path: null, steps: []})
    post_state: Observable<movement_state>


    augmenting_lock: Promise<void> = null

    private async updateAugment() {
        await this.augmenting_lock

        this.augmenting_lock = (async () => {
            let v = this._value

            let aug = await Path.augment(v.map(s => s.value().raw), this.meta.start_state, this.meta.target)

            for (let i = 0; i < aug.steps.length; i++) {
                if (!aug.steps[i]) debugger

                v[i].value().augmented?.set(aug.steps[i])
            }

            this.augmented_value.set({path: aug, steps: v})
        })()
    }

    constructor(private meta: {
        target?: TileRectangle,
        start_state?: movement_state,
        preview_layer?: GameLayer
    } = {}) {
        super();

        this.post_state = this.augmented_value.map(({path}) => path?.post_state)

        this.element_changed.on(() => this.updateAugment())
        this.array_changed.on(v => this.updateAugment())

        this.element_added.on(e => this.updatePreview(e))
        this.element_removed.on(e => e.value().associated_preview?.remove())
        this.element_changed.on(e => this.updatePreview(e))

        this.augmented_value.subscribe(v => {
            for (let i = 0; i < v.path.steps.length; i++) {
                let step = v.path.steps[i]

                if (step.raw.type == "transport" && needRepairing(step.pre_state, step.raw)) {

                    this._value[i].update(s => {
                        assert(s.raw.type == "transport")
                        repairShortcutStep(step.pre_state, s.raw)
                    })

                    return
                }
            }
        })
    }

    private updatePreview(o: PathEditor.OValue) {
        let value = o.value()

        if (value.associated_preview) {
            value.associated_preview.remove()
            value.associated_preview = null
        }

        if (this.meta.preview_layer) {
            value.associated_preview =
                new PathStepEntity({step: value.raw, highlightable: true, interactive: true})
                    .addTo(this.meta.preview_layer)
        }
    }

    public construct(): Path.raw {
        return lodash.cloneDeep(this.value().map(s => s.value().raw))
    }

    public load(p: Path.raw): void {
        this.setTo(p.map(s => ({raw: lodash.cloneDeep(s)})))
    }
}

export class PathEditor extends Behaviour {
    private control: EditedPathOverview = null
    private handler_layer: PathEditorGameLayer = null

    private you_are_here_marker: leaflet.Layer = null

    action_bar: PathEditActionBar

    interaction_guard: InteractionGuard

    value: PathEditor.Data

    constructor(public game_layer: GameLayer,
                public template_resolver: TemplateResolver,
                public options: PathEditor.options_t
    ) {
        super()

        // Set up handler layer, but don't add it anywhere yet.
        this.handler_layer = new PathEditorGameLayer(this)

        this.value = new PathBuilder({
            target: this.options.target,
            start_state: this.options.start_state,
            preview_layer: this.handler_layer
        })

        this.value.augmented_value.subscribe(({path}) => {
            if (this.action_bar) this.action_bar.state.set(path.post_state)
        })

        this.value.post_state.subscribe(state => {

            if (this.you_are_here_marker) {
                this.you_are_here_marker.remove()
                this.you_are_here_marker = null
            }

            if (state.position.tile) {
                this.you_are_here_marker = leaflet.marker(Vector2.toLatLong(state.position.tile), {
                    icon: leaflet.icon({
                        iconUrl: "assets/icons/youarehere.png",
                        iconSize: [25, 25],
                        iconAnchor: [13, 13],
                    })
                }).addTo(this.handler_layer)
            }
        })

        new GameMapControl({
                position: "left-top",
                type: "floating"
            },
            this.control = new EditedPathOverview(this, this.value.augmented_value)
        ).addTo(this.handler_layer)

        this.interaction_guard = new InteractionGuard().setDefaultLayer(this.handler_layer)
        this.action_bar = new PathEditActionBar(this, this.interaction_guard).addTo(this.handler_layer)

        this.value.load(options.initial)
    }

    protected begin() {
        this.handler_layer.addTo(this.game_layer)

        this.game_layer.getMap().container.focus()

        const bounds = Rectangle.combine(Path.bounds(this.options.initial), Rectangle.from(this.options.start_state?.position?.tile), this.options.target)

        if (this.options.target) {
            boxPolygon(this.options.target).addTo(this.handler_layer)
        }

        const level = this.options.target?.level ?? this.options.start_state?.position?.tile?.level ?? Math.min(...this.options.initial.map(Path.Step.level))

        if (bounds) this.game_layer.getMap().fitView(TileRectangle.lift(bounds, level as floor_t), {maxZoom: 3})
    }

    protected end() {
        this.handler_layer.remove()
    }

    discard() {
        if (this.options.discard_handler) this.options.discard_handler()
    }

    commit() {
        this.options.commit_handler(this.value.construct())
    }

    close() {
        this.discard()

        this.stop()
    }

    editStep(value: PathEditor.OValue, interaction: InteractionLayer) {
        this.interaction_guard.set(interaction
            .onStart(() => value.value().associated_preview?.setOpacity(0))
            .onEnd(() => value.value().associated_preview?.setOpacity(1))
        )
    }

    redrawAbility(value: PathEditor.OValue) {
        const v = value.value()

        if (v.raw.type == "ability") {
            this.editStep(value,
                new DrawAbilityInteraction(v.raw.ability)
                    .setStartPosition(v.raw.from)
                    .onCommit(new_s => value.update(v => v.raw = new_s))
            )
        } else if (v.raw.type == "run") {
            this.editStep(value,
                new DrawRunInteraction()
                    .setStartPosition(v.raw.waypoints[0])
                    .onCommit(new_s => value.update(v => v.raw = new_s)))
        }
    }

    moveStep(value: PathEditor.OValue) {
        const v = value.value()

        if (v.raw.type == "redclick") {
            this.editStep(
                value,
                new PlaceRedClickInteraction(v.raw.how)
                    .onCommit(new_s => value.update(v => {
                        assert(v.raw.type == "redclick")
                        v.raw.where = new_s.where
                    }))
            )
        } else if (v.raw.type == "powerburst") {
            this.editStep(value,
                new SelectTileInteraction({
                    preview_render: tile => new PathStepEntity({
                        step: {
                            type: "powerburst",
                            where: tile,
                        }
                    })
                })
                    .onCommit(new_s => value.update(v => {
                        assert(v.raw.type == "powerburst")
                        v.raw.where = new_s
                    }))
                    .attachTopControl(new InteractionTopControl().setName("Selecting tile").setText(`Select the location of the powerburst by clicking the tile.`))
            )
        } else if (v.raw.type == "teleport") {
            // TODO: Limit to possible tiles.

            this.editStep(value,
                new SelectTileInteraction({
                    preview_render: tile => {
                        assert(v.raw.type == "teleport")
                        return new PathStepEntity({
                            interactive: false,
                            step: {
                                type: "teleport",
                                id: v.raw.id,
                                spot: tile,
                            }
                        })
                    }
                })
                    .onCommit(new_s => value.update(v => {
                        assert(v.raw.type == "teleport")
                        v.raw.spot = new_s
                    }))
                    .attachTopControl(new InteractionTopControl().setName("Selecting tile").setText(`Select the specific target of the teleport by clicking the tile.`))
            )
        }


    }
}

export namespace PathEditor {

    export type Value = { raw: Path.Step, associated_preview?: PathStepEntity, augmented?: Observable<Path.augmented_step> }
    export type OValue = ObservableArray.ObservableArrayValue<Value>
    export type Data = PathBuilder

    export type options_t = {
        initial: Path.raw,
        commit_handler?: (p: Path.raw) => any,
        discard_handler?: () => any,
        target?: TileRectangle,
        start_state?: movement_state
    }
}