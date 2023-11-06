import {ActiveLayer} from "lib/gamemap/activeLayer";
import * as leaflet from "leaflet"
import {LeafletMouseEvent} from "leaflet"
import {Shortcuts} from "lib/runescape/shortcuts";
import {Vector2} from "lib/math";
import {Path} from "lib/runescape/pathing";
import {OpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import * as tippy from 'tippy.js';
import ContextMenu, {MenuEntry} from "../widgets/ContextMenu";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import LayerInteraction from "../map/interactions/LayerInteraction";

export default class SelectShortcutInteraction extends LayerInteraction<ActiveLayer, {
    "selected": Path.step_interact,
    "cancelled": null
}> {

    shortcuts_layer: OpacityGroup = new OpacityGroup()
    context_menu: tippy.Instance<tippy.Props>

    constructor(layer: ActiveLayer, private position: TileCoordinates | null) {
        super(layer);

        Shortcuts.index.forEach(s => {
            leaflet.marker(Vector2.toLatLong(Shortcuts.click.get(s.click, null)), {
                icon: leaflet.icon({
                    iconUrl: Path.InteractionType.meta(s.how).icon_url,
                    iconSize: [28, 31],
                    iconAnchor: [14, 16],
                }),
                interactive: false
            }).addTo(this.shortcuts_layer)
        })

        this.context_menu = tippy.default(this.layer.getMap().container.get()[0], {
            content: 'Context menu',
            placement: 'right-start',
            trigger: 'manual',
            interactive: true,
            arrow: false,
            offset: [0, 0],
        })
    }

    override start() {
        this.layer.getMap().on(this._maphooks)
        this.shortcuts_layer.addTo(this.layer)
    }

    override cancel() {
        this.layer.getMap().off(this._maphooks)
        this.shortcuts_layer.remove()
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)
            e.originalEvent.preventDefault()

            let tile = this.layer.getMap().eventCoordinate(e)

            new ContextMenu(
                Shortcuts.index
                    .filter(s => Vector2.max_axis(Vector2.sub(Shortcuts.click.get(s.click, null), tile)) < 0.5)
                    .map(s => {
                        return {
                            type: "basic",
                            text: s.name,
                            handler: () => {
                            },
                        } as MenuEntry
                    })
            ).show(this.layer.getMap().container.get()[0], {x: e.originalEvent.clientX, y: e.originalEvent.clientY})

            /*
            let menu = new ContextMenuWidget<{
                shortcut: Shortcuts.shortcut | null,
            }>(Shortcuts.index.filter(s => Vector2.max_axis(Vector2.sub(Shortcuts.click.get(s.click, null), tile)) < 0.5)
                .map(s => ({
                    value: {shortcut: s},
                    widget: c().text(s.name),
                }))
                .concat([{
                    value: {shortcut: null},
                    widget: c().text("Create Custom")
                }]))
                .on("cancelled", () => this.context_menu.hide())
                .on("selected", s => {

                    let short: Path.step_interact = null

                    if (s.shortcut) {

                        let starts = Shortcuts.start.get(s.shortcut.start, this.position)

                        short = {
                            type: "interaction",
                            description: s.shortcut.name,
                            ticks: s.shortcut.ticks,
                            where: Shortcuts.click.get(s.shortcut.click, this.position),
                            starts: starts,
                            ends_up: Shortcuts.movement.get(s.shortcut.movement, starts),
                            forced_direction: s.shortcut.forced_orientation,
                            how: s.shortcut.how
                        }
                    } else {
                        let snapped = TileCoordinates.snap(tile)

                        short = Path.auto_describe({
                            type: "interaction",
                            description: "",
                            ticks: 3,
                            where: snapped,
                            starts: snapped,
                            ends_up: snapped,
                            forced_direction: null,
                            how: "generic"
                        })
                    }

                    this.context_menu.hide()

                    this.events.emit("selected", short)
                    this.deactivate()
                })

            this.context_menu.setProps({
                content: menu.raw(),
                getReferenceClientRect: () => ({
                    width: 0,
                    height: 0,
                    top: e.originalEvent.clientY,
                    bottom: e.originalEvent.clientY,
                    left: e.originalEvent.clientX,
                    right: e.originalEvent.clientX,
                }) as ClientRect // typing of tippy is terrible,
            });

            this.context_menu.show()*/
        }
    }
}