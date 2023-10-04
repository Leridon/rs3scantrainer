import {ActiveLayer} from "../map/activeLayer";
import * as leaflet from "leaflet"
import {LeafletMouseEvent} from "leaflet"
import {Shortcuts} from "../../model/shortcuts";
import {Vector2} from "../../util/math";
import {Path} from "../../model/pathing";
import {OpacityGroup} from "../map/layers/OpacityLayer";
import * as tippy from 'tippy.js';
import ContextMenu from "../widgets/ContextMenu";
import LayerInteraction from "../map/interactions/LayerInteraction";
import Widget from "../widgets/Widget";

export default class SelectShortcutInteraction extends LayerInteraction<ActiveLayer, {
    "selected": Path.step_interact,
    "cancelled": null
}> {

    shortcuts_layer: OpacityGroup = new OpacityGroup()
    context_menu: tippy.Instance<tippy.Props>

    constructor(layer: ActiveLayer) {
        super(layer);

        Shortcuts.index.forEach(s => {
            leaflet.marker(Vector2.toLatLong(s.where), {
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
        this.layer.getMap().map.on(this._maphooks)
        this.shortcuts_layer.addTo(this.layer)
    }

    override cancel() {
        this.layer.getMap().map.off(this._maphooks)
        this.shortcuts_layer.remove()
    }

    override getTopControl(): Widget {
        return super.getTopControl()
            .text("Select a shortcut on the map or click any tile to create a custom one.")
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)
            e.originalEvent.preventDefault()

            let tile = this.layer.getMap().coordinateWithLevel(e)

            let menu = new ContextMenu<{
                shortcut: Shortcuts.shortcut | null,
            }>(Shortcuts.index.filter(s => Vector2.max_axis(Vector2.sub(s.where, tile)) < 0.5)
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

                    let short: Path.step_interact =
                        s.shortcut
                            ? ({
                                description: s.shortcut.name,
                                type: "interaction",
                                ticks: s.shortcut.ticks,
                                where: s.shortcut.where,
                                starts: s.shortcut.starts,
                                ends_up: s.shortcut.ends_up,
                                forced_direction: s.shortcut.forced_orientation,
                                how: s.shortcut.how
                            })
                            : Path.auto_describe({
                                description: "",
                                type: "interaction",
                                ticks: s.shortcut.ticks,
                                where: s.shortcut.where,
                                starts: s.shortcut.starts,
                                ends_up: s.shortcut.ends_up,
                                forced_direction: s.shortcut.forced_orientation,
                                how: s.shortcut.how
                            })

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
                }) as ClientRect /* typing of tippy is terrible*/,
            });

            this.context_menu.show()
        }
    }
}