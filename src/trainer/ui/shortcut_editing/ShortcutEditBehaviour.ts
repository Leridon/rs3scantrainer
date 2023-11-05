import Behaviour from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import GameLayer from "../../../lib/gamemap/GameLayer";
import {Shortcuts} from "../../../lib/runescape/shortcuts";
import {LeafletEventHandlerFn} from "leaflet";
import {Rectangle} from "../../../lib/math/Vector";
import {ActionBar} from "../map/ActionBar";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";
import {storage} from "../../../lib/util/storage";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {Observable, observe} from "../../../lib/properties/Observable";
import ShortcutEditSidePanel from "./ShortcutEditSidePanel";
import shortcuts from "../../../data/shortcuts";
import {DrawDoor} from "./interactions/DrawDoor";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import {DrawGeneralEntity} from "./interactions/DrawGeneralEntity";
import {ShortcutViewLayer} from "./ShortcutView";

class ShortcutEditGameLayer extends GameLayer {
    interActionGuard: InteractionGuard = new InteractionGuard().setDefaultLayer(this)

    view: ShortcutViewLayer = null

    constructor(public data: ObservableShortcutCollectionBuilder) {
        super();

        let action_bar_control = new GameMapControl({
            type: "gapless",
            position: "bottom-center"
        }).addTo(this)

        action_bar_control.content.append(new ShortcutEditActionBar(this))

        this.view = new ShortcutViewLayer().addTo(this)

        data.value.subscribe((value) => {
            this.view.setValue(value.map(s => s.get()))
        }, true)
    }

    eventContextMenu(event: GameMapContextMenuEvent) {
        event.onPost(() => {
            console.log("context")

            this.data.value.get().filter(s => {
                if (s.is_builtin) return false

                return Rectangle.contains(Shortcuts.new_shortcut.bounds(s.get()), event.coordinates)
            }).forEach(s => {
                console.log("add")
                event.add({
                    type: "basic",
                    text: `Delete ${s.get().name}`,
                    handler: () => s.delete()
                })
            })
        })
    }

    override getEvents(): { [p: string]: LeafletEventHandlerFn } {

        // TODO: Filtered render? Or put that in the viewlayer?
        return {
            "zoomend": () => {},
            "moveend": () => {}
        }
    }
}

class ShortcutEditActionBar extends ActionBar {
    constructor(private layer: ShortcutEditGameLayer) {
        super([
            new ActionBar.ActionBarButton("assets/icons/cursor_open.png", 0, () => {
                return this.layer.interActionGuard.set(new DrawDoor({
                    done_handler: (step) => layer.data.add(step)
                }))
            }),
            new ActionBar.ActionBarButton("assets/icons/cursor_generic.png", 0, () => {
                return this.layer.interActionGuard.set(new DrawGeneralEntity({
                    done_handler: (step) => layer.data.add(step)
                }))
            }),
        ]);
    }
}

export class ObservableShortcutCollectionBuilder extends TypedEmitter<{
    "added": Shortcuts.new_shortcut
}> {
    value: Observable<ObservableShortcutCollectionBuilder.WrappedValue[]> = observe([])

    private storage = new storage.Variable<Shortcuts.new_shortcut[]>("local_shortcuts", [])

    constructor() {
        super()

        this.value.subscribe(() => this.save())
    }

    editBuiltins(): this {
        this.storage.set(shortcuts)
        return this.reload(false)
    }

    reload(include_builtins: boolean): this {
        let builtins = include_builtins
            ? shortcuts.map(s => new ObservableShortcutCollectionBuilder.WrappedValue(this, s, true))
            : []

        let custom = this.storage.get().map(s => new ObservableShortcutCollectionBuilder.WrappedValue(this, s, false))

        this.value.set(builtins.concat(custom))

        return this
    }

    save(): this {
        this.storage.set(this.value.get().filter(s => !s.is_builtin).map(s => s.get()))

        return this
    }

    add(...shortcuts: Shortcuts.new_shortcut[]) {
        this.value.update((val) => {
            val.push(...shortcuts.map(s => new ObservableShortcutCollectionBuilder.WrappedValue(this, s, false)))
        })

        shortcuts.forEach(s => this.emit("added", s))
    }

    delete(shortcut: Shortcuts.new_shortcut) {
        this.value.update(val => {
            let i = val.findIndex(s => s.get() == shortcut)

            if (i >= 0) val.splice(i, 1)
        })
    }
}

export namespace ObservableShortcutCollectionBuilder {
    export class WrappedValue extends Observable<Shortcuts.new_shortcut> {
        constructor(private parent: ObservableShortcutCollectionBuilder,
                    value: Shortcuts.new_shortcut,
                    public is_builtin: boolean) {
            super(value, {})
        }

        update(f: (_: Shortcuts.new_shortcut) => void): void {
            if (!this.is_builtin) {
                super.update(f)

                this.parent.save()
            }
        }

        delete() {
            if (!this.is_builtin) {
                this.parent.delete(this.get())
            }
        }
    }
}

export default class ShortcutEditBehaviour extends Behaviour {
    layer: ShortcutEditGameLayer

    value = new ObservableShortcutCollectionBuilder().reload(true)

    constructor(public app: Application) {
        super();
    }

    protected begin() {
        this.layer = new ShortcutEditGameLayer(this.value)

        this.app.sidepanels.empty()

        this.app.sidepanels.add(new ShortcutEditSidePanel(this.value, this.layer.view, this.layer.interActionGuard)
            .on("centered", (s) => {
                this.layer.getMap().fitView(Shortcuts.new_shortcut.bounds(s), {
                    maxZoom: 5
                })
            }), 0)

        this.app.map.map.addGameLayer(this.layer)
    }

    protected end() {
        this.layer.remove()
        this.app.sidepanels.empty()
    }
}