import {SidePanel} from "../SidePanelControl";
import Widget from "../../../lib/ui/Widget";
import {Shortcuts} from "../../../lib/runescape/shortcuts";
import SmallImageButton from "../widgets/SmallImageButton";
import {ObservableShortcutCollectionBuilder} from "./ShortcutEditBehaviour";
import Properties from "../widgets/Properties";
import TextField from "../../../lib/ui/controls/TextField";
import LightButton from "../widgets/LightButton";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import InteractionSelect from "../pathedit/InteractionSelect";
import NumberInput from "../../../lib/ui/controls/NumberInput";
import MapCoordinateEdit from "../widgets/MapCoordinateEdit";
import {DropdownSelection} from "../widgets/DropdownSelection";
import * as lodash from "lodash"
import {Rectangle, Vector2} from "../../../lib/math/Vector";
import {floor_t, MapCoordinate, MapRectangle} from "../../../lib/runescape/coordinates";
import GameMapDragAction from "../../../lib/gamemap/interaction/GameMapDragAction";
import {ShortcutViewLayer} from "./ShortcutView";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import InteractionTopControl from "../map/InteractionTopControl";
import {DrawOffset} from "./interactions/DrawOffset";

class ShortcutEdit extends Widget<{
    "changed": Shortcuts.new_shortcut,
    "centered": Shortcuts.new_shortcut
}> {
    private header: Widget
    private body: Widget

    constructor(private value: ObservableShortcutCollectionBuilder.WrappedValue,
                private associated_preview: ShortcutViewLayer.ShortcutPolygon,
                private interaction_guard: InteractionGuard) {
        super();

        this.addClass("ctr-shortcut-edit")

        this.render()
    }

    private render() {
        this.empty()

        this.associated_preview?.render()

        this.header = c("<div class='ctr-shortcut-edit-header'></div>")
            .append(c().text(this.value.get().name))
            .append(c("<div style='flex-grow: 1'></div>"))
            .append(SmallImageButton.new("assets/icons/fullscreen.png")
                .on("click", () => {
                    this.emit("centered", this.value.get())
                }))
            .append(SmallImageButton.new("assets/icons/delete.png")
                .on("click", () => {
                    this.value.delete()
                })
                .setEnabled(!this.value.is_builtin))
            .appendTo(this)
            .tapRaw(r => {
                r.on("click", () => {
                    this.body.container.animate({"height": "toggle"})
                })
            })

        let props = new Properties()

        let v = this.value.get()

        props.named("Name", new TextField()
            .setValue(this.value.get().name)
            .on("changed", v => {
                this.value.update(o => o.name = v)
                this.render()
            }))

        if (v.type == "door") {
            props.named("Bounds", new LightButton("Draw"))
        } else {
            props.named("Click-Area",
                c("<div style='display: flex'></div>")
                    .append(c("<span style='margin-right: 5px;'></span>").text(`${Rectangle.width(v.clickable_area)}x${Rectangle.height(v.clickable_area)} at ${v.clickable_area.topleft.x}|${v.clickable_area.botright.y}`))
                    .append(c().css("flex-grow", "1"))
                    .append(
                        new LightButton("Select")
                            .on("click", () => {
                                this.interaction_guard.set(
                                    new GameMapDragAction({
                                        preview_render: (area) => {
                                            return ShortcutViewLayer.render_clickable(Rectangle.extend(area, 0.5), (v as Shortcuts.new_shortcut_entity).actions[0]?.cursor || "generic")
                                        }
                                    }).onStart(() => {
                                        this.associated_preview?.updateConfig(c => c.draw_clickable = false)
                                    }).onEnd(() => {
                                        this.associated_preview?.updateConfig(c => c.draw_clickable = true)
                                    }).onCommit(a => {
                                        this.value.update(v => (v as Shortcuts.new_shortcut_entity).clickable_area = MapRectangle.extend(a, 0.5))
                                        this.render()
                                    }).attachTopControl(new InteractionTopControl().setName("Selecting clickable area").setText("Click and drag a rectangle around the area that is clickable for this entity."))
                                )
                            }))
            )

            for (let action of v.actions) {
                props.row(
                    c("<div style='display: flex'></div>")
                        .append(c(`<div class='nisl-property-header' style="flex-grow: 1">${action.name}</div>`))
                        .append(SmallImageButton.new("assets/icons/delete.png")
                            .on("click", () => {
                                this.value.update((v: Shortcuts.new_shortcut_entity) => v.actions.splice(v.actions.indexOf(action), 1))
                                this.render()
                            })))

                props.named("Name", new TextField()
                    .setValue(action.name)
                    .on("changed", v => {
                        this.value.update(() => action.name = v)
                        this.render()
                    }))

                props.named("Cursor", new InteractionSelect()
                    .setValue(action.cursor)
                    .on("selection_changed", (v) => {
                        this.value.update(() => action.cursor = v)
                    })
                )
                props.named("Ticks", new NumberInput(0, 100)
                    .setValue(action.time)
                    .on("changed", (v) => this.value.update(() => action.time = v))
                )
                props.named("Area",
                    c("<div style='display: flex'></div>")
                        .append(c("<span style='margin-right: 5px;'></span>").text(`${Rectangle.tileWidth(action.interactive_area)}x${Rectangle.tileHeight(action.interactive_area)} at ${action.interactive_area.topleft.x}|${action.interactive_area.botright.y}`))
                        .append(c().css("flex-grow", "1"))
                        .append(
                            new LightButton("Select")
                                .on("click", () => {
                                    this.interaction_guard.set(
                                        new GameMapDragAction({
                                            preview_render: (area) => ShortcutViewLayer.render_interactive_area(area)
                                        }).onStart(() => {
                                            this.associated_preview?.updateConfig(c => c.hidden_actions.push(action))
                                        }).onEnd(() => {
                                            this.associated_preview?.updateConfig(c => c.hidden_actions = c.hidden_actions.filter(x => x != action))
                                        }).onCommit(a => {
                                            this.value.update(v => action.interactive_area = a)
                                            this.render()
                                        }).attachTopControl(new InteractionTopControl().setName("Selecting interactive area").setText("Click and drag a rectangle around the area where this interaction can be triggered from."))
                                    )
                                })))
                props.named("Targeting", new DropdownSelection<"offset" | "fixed">({
                        type_class: {
                            toHTML: (v: string) => c().text(lodash.capitalize(v))
                        }
                    }, ["offset", "fixed"])
                        .setValue(action.movement.type)
                        .on("selection_changed", (v) => {
                            switch (v) {
                                case "offset": {
                                    this.value.update(() => {
                                        if (action.movement.type == "fixed") {
                                            action.movement = {
                                                type: "offset",
                                                level: action.movement.target.level,
                                                offset: Vector2.sub(action.movement.target, Rectangle.center(action.interactive_area))
                                            }
                                        }
                                    })
                                    this.render()
                                    break;
                                }
                                case "fixed": {
                                    this.value.update(() => {
                                        if (action.movement.type == "offset") {
                                            action.movement = {
                                                type: "fixed",
                                                target: MapCoordinate.lift(Vector2.add(action.movement.offset, Rectangle.center(action.interactive_area)), action.movement.level)
                                            }
                                        }
                                    })
                                    this.render()

                                    break;
                                }
                            }
                        })
                )

                switch (action.movement.type) {
                    case "offset":
                        props.named("Offset",
                            c("<div style='display: flex'></div>")
                                .append(c("<span style='margin-right: 5px;'></span>").text(`${action.movement.offset.x}|${action.movement.offset.y}`))
                                .append(c().css("flex-grow", "1"))
                                .append(
                                    new LightButton("Draw")
                                        .on("click", () => {

                                            this.interaction_guard.set(
                                                new DrawOffset()
                                                    .onCommit((v) => {
                                                        this.value.update(() => {
                                                            if (action.movement.type == "offset") action.movement.offset = v.offset
                                                        })
                                                        this.render()
                                                    })
                                            )
                                        })
                                ))

                        props.named("Level", new NumberInput(0, 3).setValue(action.movement.level)
                            .on("changed", (v) => {
                                this.value.update(() => {
                                    if (action.movement.type == "offset") action.movement.level = v as floor_t
                                })
                                this.render()
                            })
                        )
                        break

                    case "fixed":
                        props.named("Target", new MapCoordinateEdit(
                            action.movement.target,
                            () => this.interaction_guard.set(new SelectTileInteraction({
                                    preview_render: (target) => ShortcutViewLayer.render_transport_arrow(Rectangle.center(action.interactive_area, true), target)
                                }).attachTopControl(new InteractionTopControl().setName("Selecting tile").setText("Select the target of this map connection."))
                            )))
                            .on("changed", (v) => {
                                this.value.update(() => {
                                    if (action.movement.type == "fixed") action.movement.target = v
                                })
                                this.render()
                            })
                        break
                }

            }

            props.row(new LightButton("+ Add Action")
                .on("click", () => {
                    this.value.update((v: Shortcuts.new_shortcut_entity) => v.actions.push({
                            cursor: v.actions[0]?.cursor || "generic",
                            interactive_area: MapRectangle.extend(v.clickable_area, 0.5),
                            movement: {type: "offset", offset: {x: 0, y: 0}, level: v.clickable_area.level},
                            name: v.actions[0]?.name || "Use",
                            time: v.actions[0]?.time || 3
                        }
                    ))
                    this.render()
                })
            )
        }

        this.body = props.appendTo(this)
    }
}

export default class ShortcutEditSidePanel extends SidePanel<{
    "centered": Shortcuts.new_shortcut
}> {
    search_container: Widget
    result_container: Widget

    constructor(private data: ObservableShortcutCollectionBuilder,
                private view_layer: ShortcutViewLayer,
                private interaction_guard: InteractionGuard) {
        super();

        this.search_container = c().appendTo(this)

        c("<div style='text-align: center'></div>")
            .append(new LightButton("Edit Builtins")
                .on("click", () => {
                    this.data.editBuiltins()
                }))
            .append(new LightButton("Export All")
                .on("click", () => {
                    ExportStringModal.do(JSON.stringify(data.value.get().map(v => v.get()), null, 2))
                })
            )
            .append(new LightButton("Export Local")
                .on("click", () => {
                    ExportStringModal.do(JSON.stringify(data.value.get().filter(s => !s.is_builtin).map(v => v.get()), null, 2))
                })
            )
            .appendTo(this.search_container)

        this.result_container = c().addClass("ctr-shortcut-edit-panel-results").appendTo(this)

        data.value.subscribe((value) => {
            this.renderResults(value)
        }, true)
    }

    renderResults(value: ObservableShortcutCollectionBuilder.WrappedValue[]) {
        this.result_container.empty()

        value.forEach(s => {
            new ShortcutEdit(s, this.view_layer.getView(s.get()), this.interaction_guard).appendTo(this.result_container).on("centered", (v) => {
                this.emit("centered", v)
            })
        })
    }
}