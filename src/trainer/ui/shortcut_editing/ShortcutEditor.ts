import Behaviour from "lib/ui/Behaviour";
import {Application} from "../../application";
import {GameMapControl} from "lib/gamemap/GameMapControl";
import GameLayer from "lib/gamemap/GameLayer";
import {Shortcuts} from "lib/runescape/shortcuts";
import {LeafletEventHandlerFn} from "leaflet";
import {Rectangle} from "lib/math"
import {ActionBar} from "../map/ActionBar";
import {InteractionGuard} from "lib/gamemap/interaction/InteractionLayer";
import {storage} from "lib/util/storage";
import ShortcutEditSidePanel from "./ShortcutEditSidePanel";
import shortcuts from "../../../data/shortcuts";
import {DrawDoor} from "./interactions/DrawDoor";
import {GameMapContextMenuEvent} from "lib/gamemap/MapEvents";
import {DrawGeneralEntity} from "./interactions/DrawGeneralEntity";
import {ShortcutViewLayer} from "./ShortcutView";
import {PlaceShortcut} from "./interactions/PlaceShortcut";
import {ObservableArray, observeArray} from "../../../lib/reactive";
import {tap} from "lodash";
import ObservableArrayValue = ObservableArray.ObservableArrayValue;
import {GameMap} from "../../../lib/gamemap/GameMap";
import SidePanelControl from "../SidePanelControl";
import {PathEditor} from "../pathedit/PathEditor";
import {TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";

export class ShortcutEditGameLayer extends GameLayer {
    interactionGuard: InteractionGuard = new InteractionGuard().setDefaultLayer(this)

    view: ShortcutViewLayer = null

    constructor(public editor: ShortcutEditor) {
        super();

        let action_bar_control = new GameMapControl({
            type: "gapless",
            position: "bottom-center"
        }).addTo(this)

        action_bar_control.content.append(new ShortcutEditActionBar(this))

        this.view = new ShortcutViewLayer(this.editor.data).addTo(this)
    }

    eventContextMenu(event: GameMapContextMenuEvent) {
        event.onPost(() => {
            this.editor.data.value().filter(s => {
                if (s.value().is_builtin) return false

                return Rectangle.contains(Shortcuts.bounds(s.value()), event.coordinates)
            }).forEach(s => {
                event.add({
                    type: "basic",
                    text: `Delete ${s.value().name}`,
                    handler: () => s.remove()
                })
                event.add({
                    type: "basic",
                    text: `Copy ${s.value().name}`,
                    handler: () => this.startPlacement(s.value(), event.tile())
                })
                event.add({
                    type: "basic",
                    text: `Move ${s.value().name}`,
                    handler: () => this.startMove(s, event.tile())
                })
            })
        })
    }

    startMove(s: ShortcutEditor.OValue, origin: TileCoordinates = null) {
        if (!origin) origin = TileRectangle.center(Shortcuts.bounds(s.value()))

        this.interactionGuard.set(new PlaceShortcut(s.value(), origin, n => this.editor.data.add(Object.assign(n, {is_builtin: false})))
            .onCommit(n => s.set(Object.assign(n, {is_builtin: false})))
            .onStart(() => this.view.getView(s).setOpacity(0))
            .onEnd(() => this.view.getView(s)?.setOpacity(1))
        )
    }

    startPlacement(s: ShortcutEditor.Value, origin: TileCoordinates = null) {
        if (!origin) origin = TileRectangle.center(Shortcuts.bounds(s))

        this.interactionGuard.set(new PlaceShortcut(s, origin, n => this.editor.data.add(Object.assign(n, {is_builtin: false})))
            .onCommit(n => this.editor.data.add(Object.assign(n, {is_builtin: false})))
        )
    }
}

class ShortcutEditActionBar extends ActionBar {
    constructor(private parent_layer: ShortcutEditGameLayer) {
        super([
            new ActionBar.ActionBarButton("assets/icons/cursor_open.png",  () => {
                return this.parent_layer.interactionGuard.set(new DrawDoor({
                    done_handler: (step) => this.parent_layer.editor.data.add(Object.assign(step, {is_builtin: false}))
                }))
            }),
            new ActionBar.ActionBarButton("assets/icons/cursor_generic.png",  () => {
                return this.parent_layer.interactionGuard.set(new DrawGeneralEntity({
                    done_handler: (step) => this.parent_layer.editor.data.add(Object.assign(step, {is_builtin: false}))
                }))
            }),
        ]);
    }
}

export class ShortcutEditor extends Behaviour {
    layer: ShortcutEditGameLayer

    private storage = new storage.Variable<Shortcuts.shortcut[]>("local_shortcuts", [])
    public data: ShortcutEditor.Data

    constructor(public deps: {
        map: GameMap,
        sidepanels: SidePanelControl
    }) {
        super();

        this.data = observeArray([].concat(
            shortcuts.map(s => Object.assign(s, {is_builtin: true})),
            this.storage.get().map(s => Object.assign(s, {is_builtin: false}))
        ))

        this.data.changed.on(({value}) => this.storage.set(value.filter(v => !v.value().is_builtin).map(v => v.value())))
    }

    protected begin() {
        this.layer = new ShortcutEditGameLayer(this).addTo(this.deps.map)

        this.deps.sidepanels.empty()

        this.deps.sidepanels.add(tap(
                new ShortcutEditSidePanel(this),
                e => e.centered.on((s => {
                    this.layer.getMap().fitView(Shortcuts.bounds(s), {
                        maxZoom: 5
                    })
                })))
            , 0)
    }

    protected end() {
        this.layer.remove()
        this.deps.sidepanels.empty()
    }
}

export namespace ShortcutEditor {
    export type Value = Shortcuts.shortcut & { is_builtin: boolean }
    export type OValue = ObservableArrayValue<Value>
    export type Data = ObservableArray<Value>
}