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

class ShortcutEditGameLayer extends GameLayer {
    interActionGuard: InteractionGuard = new InteractionGuard().setDefaultLayer(this)

    view: ShortcutViewLayer = null

    constructor(public data: ObservableArray<Shortcuts.shortcut & { is_builtin: boolean }>) {
        super();

        let action_bar_control = new GameMapControl({
            type: "gapless",
            position: "bottom-center"
        }).addTo(this)

        action_bar_control.content.append(new ShortcutEditActionBar(this))

        this.view = new ShortcutViewLayer(data).addTo(this)
    }

    eventContextMenu(event: GameMapContextMenuEvent) {
        event.onPost(() => {
            this.data.value().filter(s => {
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
                    handler: () => {
                        this.interActionGuard.set(new PlaceShortcut(s.value(), event.tile(), n => this.data.add(Object.assign(n, {is_builtin: false})))
                            .onCommit(n => this.data.add(Object.assign(n, {is_builtin: false})))
                        )
                    }
                })
                event.add({
                    type: "basic",
                    text: `Move ${s.value().name}`,
                    handler: () => {
                        this.interActionGuard.set(new PlaceShortcut(s.value(), event.tile(), n => this.data.add(Object.assign(n, {is_builtin: false})))
                            .onCommit(n => s.set(Object.assign(n, {is_builtin: false})))
                            .onStart(() => this.view.getView(s).setOpacity(0))
                            .onEnd(() => this.view.getView(s)?.setOpacity(1))
                        )
                    }
                })
            })
        })
    }

    override getEvents(): { [p: string]: LeafletEventHandlerFn } {

        // TODO: Filtered render? Or put that in the viewlayer?
        return {
            "zoomend": () => {
            },
            "moveend": () => {
            }
        }
    }
}

class ShortcutEditActionBar extends ActionBar {
    constructor(private layer: ShortcutEditGameLayer) {
        super([
            new ActionBar.ActionBarButton("assets/icons/cursor_open.png", 0, () => {
                return this.layer.interActionGuard.set(new DrawDoor({
                    done_handler: (step) => layer.data.add(Object.assign(step, {is_builtin: false}))
                }))
            }),
            new ActionBar.ActionBarButton("assets/icons/cursor_generic.png", 0, () => {
                return this.layer.interActionGuard.set(new DrawGeneralEntity({
                    done_handler: (step) => layer.data.add(Object.assign(step, {is_builtin: false}))
                }))
            }),
        ]);
    }
}

export default class ShortcutEditBehaviour extends Behaviour {
    layer: ShortcutEditGameLayer

    private storage = new storage.Variable<Shortcuts.shortcut[]>("local_shortcuts", [])
    private data: ObservableArray<Shortcuts.shortcut & { is_builtin: boolean }>

    constructor(public app: Application) {
        super();

        this.data = observeArray([].concat(
            shortcuts.map(s => Object.assign(s, {is_builtin: true})),
            this.storage.get().map(s => Object.assign(s, {is_builtin: false}))
        ))

        this.data.changed.on(({value}) => this.storage.set(value.filter(v => !v.value().is_builtin).map(v => v.value())))
    }

    protected begin() {
        this.layer = new ShortcutEditGameLayer(this.data)

        this.app.sidepanels.empty()

        this.app.sidepanels.add(tap(
                new ShortcutEditSidePanel(this.data, this.layer.view, this.layer.interActionGuard),
                e => e.centered.on((s => {
                    this.layer.getMap().fitView(Shortcuts.bounds(s), {
                        maxZoom: 5
                    })
                })))
            , 0)

        this.app.map.map.addGameLayer(this.layer)
    }

    protected end() {
        this.layer.remove()
        this.app.sidepanels.empty()
    }
}