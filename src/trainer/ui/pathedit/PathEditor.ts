import * as leaflet from "leaflet";
import {Path} from "lib/runescape/pathing";
import {util} from "lib/util/util";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import movement_state = Path.movement_state;
import Behaviour from "lib/ui/Behaviour";
import {Transportation} from "../../../lib/runescape/transportation";
import {Rectangle, Vector2} from "lib/math";
import TemplateResolver from "lib/util/TemplateResolver";
import {GameMapContextMenuEvent, GameMapKeyboardEvent} from "lib/gamemap/MapEvents";
import {GameLayer} from "lib/gamemap/GameLayer";
import {DrawAbilityInteraction} from "./interactions/DrawAbilityInteraction";
import PathEditActionBar from "./PathEditActionBar";
import InteractionLayer, {InteractionGuard} from "lib/gamemap/interaction/InteractionLayer";
import {floor_t, TileCoordinates} from "../../../lib/runescape/coordinates";
import * as assert from "assert";
import * as lodash from "lodash";
import {Menu, MenuEntry} from "../widgets/ContextMenu";
import PlaceRedClickInteraction from "./interactions/PlaceRedClickInteraction";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import InteractionTopControl from "../map/InteractionTopControl";
import DrawRunInteraction from "./interactions/DrawRunInteraction";
import {direction, PathFinder} from "../../../lib/runescape/movement";
import index = util.index;
import {PathStepEntity} from "../map/entities/PathStepEntity";
import TransportLayer from "../map/TransportLayer";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";
import {CursorType} from "../../../lib/runescape/CursorType";
import {areaPolygon, boxPolygon, tilePolygon} from "../polygon_helpers";
import EntityTransportation = Transportation.EntityTransportation;
import {TeleportSpotEntity} from "../map/entities/TeleportSpotEntity";
import {EntityTransportEntity} from "../map/entities/EntityTransportEntity";
import activate = TileArea.activate;
import default_interactive_area = Transportation.EntityTransportation.default_interactive_area;
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {EditedPathOverview} from "./EditedPathOverview";
import {PathBuilder} from "./PathBuilder";
import {StepEditModal} from "./StepEditModal";
import {BookmarkStorage} from "./BookmarkStorage";
import {PathEditOverlayControl} from "./PathEditOverlays";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import {PathEditMenuBar} from "./PathEditMenuBar";
import tr = TileRectangle.tr;
import {deps} from "../../dependencies";
import {TeleportAccessEntity} from "../map/entities/TeleportAccessEntity";
import TeleportGroup = Transportation.TeleportGroup;
import {TransportData} from "../../../data/transports";
import resolveTeleport = TransportData.resolveTeleport;
import {RemoteEntityTransportTarget} from "../map/entities/RemoteEntityTransportTarget";
import {DrawCheatInteraction} from "./interactions/DrawCheatInteraction";

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
    constructor(private editor: PathEditor, add_transport_layer: boolean) {
        super();

        if (add_transport_layer) new TransportLayer(true).addTo(this)
    }

    eventContextMenu(event: GameMapContextMenuEvent) {

        event.onPost(() => {
            if (this.editor.isActive()) {
                event.setTitle(`${event.tile().x} | ${event.tile().y} | ${event.tile().level}`)

                if (!event.active_entity) {

                    const current_tile = this.editor.value.cursor_state.value()?.state?.position?.tile
                    const target_tile = event.tile()

                    if (current_tile && !TileCoordinates.eq2(current_tile, target_tile)) {
                        event.add({
                            type: "basic",
                            text: "Walk here",
                            icon: "assets/icons/yellowclick.png",
                            handler: async () => {
                                const path_to_tile = await PathFinder.find(
                                    PathFinder.init_djikstra(this.editor.value.cursor_state.value().state.position.tile),
                                    TileArea.init(target_tile)
                                )

                                if (path_to_tile && path_to_tile.length > 1) {
                                    this.editor.value.add({
                                        type: "run",
                                        waypoints: path_to_tile,
                                    })
                                } else {
                                    deps().app.notifications.notify({
                                        type: "error"
                                    }, "No path found.")
                                }
                            }
                        })
                    }


                    event.add({
                        type: "submenu",
                        text: "Redclick",
                        icon: "assets/icons/cursor_redclick.png",
                        children: CursorType.all().map((i): MenuEntry => ({
                            type: "basic",
                            text: i.description,
                            icon: i.icon_url,
                            handler: () => {
                                this.editor.value.add({
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
                            text: () => c().append(`Use via `, TeleportSpotEntity.accessNameAsWidget(a)),
                            handler: () => {
                                this.editor.value.add({
                                        type: "teleport",
                                        spot: t.centerOfTarget(),
                                        id: {...t.id(), access: a.id},
                                    }
                                )
                            }
                        })
                    } else {
                        event.addForEntity({
                            type: "submenu",
                            text: `Use via`,
                            children: t.group.access.map(a => {
                                return {
                                    type: "basic",
                                    text: () => c().append(TeleportSpotEntity.accessNameAsWidget(a)),
                                    handler: () => {
                                        this.editor.value.add({
                                            type: "teleport",
                                            spot: t.centerOfTarget(),
                                            id: {...t.id(), access: a.id},
                                        })
                                    }
                                }
                            })
                        })
                    }
                } else if (event.active_entity instanceof TeleportAccessEntity) {
                    const access = event.active_entity.config.access
                    const teleport = event.active_entity.config.teleport

                    event.addForEntity({
                        type: "submenu",
                        text: `Use action '${access.action_name}'`,
                        children: event.active_entity.config.teleport.spots.map(spot => {

                            const s = new TeleportGroup.Spot(teleport, spot, access, deps().app.teleport_settings)

                            return {
                                type: "basic",
                                icon: `assets/icons/teleports/${s.image().url}`,
                                text: s.code() ? `${spot.code}: ${spot.name}` : spot.name,
                                handler: async () => {

                                    const current_tile = this.editor.value.cursor_state.value().state?.position?.tile

                                    let assumed_start = current_tile
                                    const target = access.interactive_area || EntityTransportation.default_interactive_area(TileArea.toRect(access.clickable_area))

                                    const steps: Path.Step[] = []

                                    if (current_tile && !activate(target).query(current_tile)) {
                                        const path_to_start = await PathFinder.find(
                                            PathFinder.init_djikstra(current_tile),
                                            target
                                        )

                                        if (path_to_start && path_to_start.length > 1) {

                                            if (assumed_start) assumed_start = index(path_to_start, -1)

                                            steps.push({
                                                type: "run",
                                                waypoints: path_to_start,
                                            })

                                        } else {
                                            deps().app.notifications.notify({
                                                type: "error"
                                            }, "No path to transportation found.")
                                        }
                                    }

                                    steps.push({
                                        type: "teleport",
                                        spot: s.centerOfTarget(),
                                        id: {...s.id(), access: access.id},
                                    })

                                    this.editor.value.add(...steps)
                                }
                            }
                        }),
                    })
                } else if (event.active_entity instanceof EntityTransportEntity) {
                    let s = Transportation.normalize(event.active_entity.config.shortcut)

                    s.actions.forEach(a => {
                        event.addForEntity({
                            type: "basic",
                            text: `Use action '${a.name}'`,
                            icon: CursorType.meta(a.cursor).icon_url,
                            handler: async () => {
                                const current_tile = this.editor.value.cursor_state.value().state?.position?.tile

                                let assumed_start = current_tile
                                const target = a.interactive_area || EntityTransportation.default_interactive_area(s.clickable_area)

                                const steps: Path.Step[] = []

                                if (current_tile && !activate(target).query(current_tile)) {
                                    const path_to_start = await PathFinder.find(
                                        PathFinder.init_djikstra(current_tile),
                                        target
                                    )

                                    if (path_to_start && path_to_start.length > 1) {

                                        if (assumed_start) assumed_start = index(path_to_start, -1)

                                        steps.push({
                                            type: "run",
                                            waypoints: path_to_start,
                                        })

                                    } else {
                                        deps().app.notifications.notify({
                                            type: "error"
                                        }, "No path to transportation found.")
                                    }
                                }

                                assumed_start ??=
                                    current_tile ? TileRectangle.clampInto(current_tile, TileArea.toRect(
                                            target,
                                        ))
                                        : target.origin

                                let clone = lodash.cloneDeep(s)
                                clone.actions = [lodash.cloneDeep(a)]

                                this.editor.value.add(...steps, {
                                    type: "transport",
                                    assumed_start: assumed_start,
                                    internal: clone
                                })
                            }
                        })
                    })
                } else if (event.active_entity instanceof RemoteEntityTransportTarget) {

                } else if (event.active_entity instanceof PathStepEntity) {
                    const step = this.editor.value.committed_value.value().steps.find(v => v.associated_preview == event.active_entity)

                    if (step) {
                        event.addForEntity(...this.editor.contextMenu(step).children)
                    }
                }
            }
        })
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        event.onPost(() => {
            const e = event.original
            const handled = ((): boolean => {

                if (e.ctrlKey && e.key.toLowerCase() == "z") {

                    if (e.shiftKey) {
                        this.editor.value.undoredo.redo()
                    } else {
                        this.editor.value.undoredo.undo()
                    }

                    return true
                } else if (e.ctrlKey && e.key.toLowerCase() == "y") {
                    this.editor.value.undoredo.redo()
                    return true
                } else if (e.ctrlKey && e.key.toLowerCase() == "s") {
                    this.editor.commit()

                    return true
                } else if (e.key == "Backspace") {
                    this.editor.value.delete(this.editor.value.cursor - 1)
                    return true
                } else if (e.key == "Delete") {
                    this.editor.value.delete(this.editor.value.cursor)
                    return true
                }

                return false
            })()

            if (handled) {
                event.stopAllPropagation()
                e.preventDefault()
            }
        })
    }
}

export class PathEditor extends Behaviour {
    private control: EditedPathOverview = null
    private handler_layer: PathEditorGameLayer = null
    overlay_control: PathEditOverlayControl = null

    private you_are_here_marker: leaflet.Layer = null

    action_bar: PathEditActionBar

    interaction_guard: InteractionGuard

    value: PathBuilder

    bookmarks = new BookmarkStorage()

    constructor(public game_layer: GameLayer,
                public template_resolver: TemplateResolver,
                public options: PathEditor.options_t,
                add_transport_layer: boolean
    ) {
        super()

        // Set up handler layer, but don't add it anywhere yet.
        this.handler_layer = new PathEditorGameLayer(this, add_transport_layer)

        this.value = new PathBuilder({
            target: this.options.target,
            start_state: this.options.start_state,
        }, options.initial)

        this.handler_layer.add(this.value.preview_layer)

        this.value.cursor_state.subscribe(({state}) => {
            if (this.action_bar) this.action_bar.state.set(state)

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
            vbox(
                new PathEditMenuBar(this),
                this.control = new EditedPathOverview(this)
            )
        ).addTo(this.handler_layer)

        this.overlay_control = new PathEditOverlayControl(this).addTo(this.handler_layer)

        this.interaction_guard = new InteractionGuard().setDefaultLayer(this.handler_layer)
        this.action_bar = new PathEditActionBar(this, this.interaction_guard).addTo(this.handler_layer)

    }

    protected begin() {
        this.handler_layer.addTo(this.game_layer)

        this.game_layer.getMap().container.focus()

        //const bounds = Rectangle.combine(Path.bounds(this.options.initial), Rectangle.from(this.options.start_state?.position?.tile), TileArea.toRect(this.options.target?.parent))

        if (this.options.target) {
            areaPolygon(this.options.target.parent).addTo(this.handler_layer)
        }

        //const level = this.options.target?.origin?.level ?? this.options.start_state?.position?.tile?.level ?? Math.min(...this.options.initial.map(Path.Step.level))

        // if (bounds) this.game_layer.getMap().fitView(TileRectangle.lift(bounds, level as floor_t), {maxZoom: 7})
    }

    protected end() {
        this.handler_layer.remove()
    }

    discard(): void {
        if (this.options.discard_handler) {
            this.options.discard_handler()
            this.stop()
        }
    }

    commit(): void {
        this.options.commit_handler?.(this.value.get())
    }

    close() {
        this.discard()

        this.stop()
    }

    editStep(value: PathBuilder.Step, interaction: InteractionLayer) {
        this.interaction_guard.set(interaction
            .onStart(() => {
                value.associated_preview?.setVisible(false)
                this.overlay_control.lens_layer.enabled2.set(false)
            })
            .onEnd(() => {
                value.associated_preview?.setVisible(true)
                this.overlay_control.lens_layer.enabled2.set(true)
            })
        )
    }

    async editStepDetails(value: PathBuilder.Step) {
        const result = await new StepEditModal(value.step.raw).do()

        if (result.new_version) {
            this.value.update(value.index, result.new_version)
        }
    }

    redrawAbility(value: PathBuilder.Step) {
        const v = value.step.raw

        if (v.type == "ability") {
            this.editStep(value,
                new DrawAbilityInteraction(v.ability)
                    .setStartPosition(v.from)
                    .onCommit(new_s => value.update(v => Object.assign(v, new_s)))
            )
        } else if (v.type == "run") {
            this.editStep(value,
                new DrawRunInteraction()
                    .setStartPosition(v.waypoints[0])
                    .onCommit(new_s => value.update(v => Object.assign(v, new_s))))
        } else if (v.type == "cheat") {
            this.editStep(value,
                new DrawCheatInteraction(v.assumed_start)
                    .onCommit(new_s => value.update(v => Object.assign(v, new_s)))
            )
        }
    }

    moveStep(value: PathBuilder.Step) {
        const v = value.step

        if (v.raw.type == "redclick") {
            this.editStep(
                value,
                new PlaceRedClickInteraction(v.raw.how)
                    .onCommit(new_s => value.update<Path.step_redclick>(v => {
                        v.where = new_s.where
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
                    .onCommit(new_s => value.update<Path.step_powerburst>(v => {
                        v.where = new_s
                    }))
                    .attachTopControl(new InteractionTopControl().setName("Selecting tile").setText(`Select the location of the powerburst by clicking the tile.`))
            )
        } else if (v.raw.type == "teleport") {
            const spot = resolveTeleport(v.raw.id)

            this.editStep(value,
                new SelectTileInteraction({
                    preview_render: tile => {
                        assert(v.raw.type == "teleport")

                        if (activate(spot.targetArea()).query(tile)) {
                            return new PathStepEntity({
                                interactive: false,
                                step: {
                                    type: "teleport",
                                    id: v.raw.id,
                                    spot: tile,
                                }
                            })
                        } else {
                            return tilePolygon(tile)
                                .setStyle({
                                    fillColor: "red",
                                    color: "red",
                                    stroke: true
                                })
                        }


                    }
                })
                    .addLayer(
                        areaPolygon(spot.targetArea())
                            .setStyle({
                                fillColor: "lightgreen",
                                color: "lightgreen",
                                stroke: true
                            })
                    )
                    .onCommit(new_s => value.update<Path.step_teleport>(v => {
                        v.spot = new_s
                    }))
                    .attachTopControl(new InteractionTopControl().setName("Selecting tile").setText(`Select the specific target of the teleport by clicking the tile.`))
            )
        }
    }

    contextMenu(step: PathBuilder.Step): Menu {
        const entries: MenuEntry[] = []

        entries.push({
            type: "basic",
            icon: "assets/icons/edit.png",
            text: `Edit`,
            handler: () => this.editStepDetails(step)
        })

        entries.push({
            type: "basic",
            icon: "assets/icons/delete.png",
            text: `Remove`,
            handler: () => step.delete()
        })

        if (step.step.raw.type == "ability" || step.step.raw.type == "run" || step.step.raw.type == "cheat") {
            entries.push({
                type: "basic",
                icon: "assets/icons/edit.png",
                text: `Redraw on map`,
                handler: () => this.redrawAbility(step)
            })
        }

        if (step.step.raw.type == "powerburst" || step.step.raw.type == "redclick" || step.step.raw.type == "teleport") {

            entries.push({
                type: "basic",
                icon: "assets/icons/move.png",
                text: `Move on map`,
                handler: () => this.moveStep(step)
            })
        }

        if (step.step.raw.type == "orientation") {
            entries.push({
                type: "submenu",
                icon: "assets/icons/compass.png",
                text: `Choose Direction`,
                children: direction.all.map(dir => ({
                    type: "basic",
                    text: direction.toString(dir),
                    handler: () => {
                        step.update<Path.step_orientation>(s => s.direction = dir)
                    }
                }))
            })
        }

        if (step.step.raw.type == "cheat") {
            entries.push({
                type: "submenu",
                icon: "assets/icons/Rotten_potato.png",
                text: "Choose Orientation",
                children: [undefined].concat(direction.all).map(dir => ({
                    type: "basic",
                    text: direction.toString(dir) ?? "None",
                    handler: () => {
                        step.update<Path.step_cheat>(s => s.orientation = dir)
                    }
                }))
            })
        }

        if (step.step.raw.type == "redclick") {
            entries.push({
                type: "submenu",
                icon: "assets/icons/cursor_redclick.png",
                text: `Choose Cursor`,
                children: CursorType.all().map(cursor => ({
                    type: "basic",
                    text: cursor.description,
                    icon: cursor.icon_url,
                    handler: () => {
                        step.update<Path.step_redclick>(s => s.how = cursor.type)
                    }
                }))
            })
        }


        return {
            type: "submenu",
            text: "",
            children: entries
        }
    }
}

export namespace PathEditor {

    export type options_t = {
        initial: Path.raw,
        commit_handler?: (p: Path.raw) => any,
        discard_handler?: () => any,
        target?: TileArea.ActiveTileArea,
        start_state?: movement_state
    }
}