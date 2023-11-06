import InteractionLayer from "lib/gamemap/interaction/InteractionLayer";
import GameMapDragAction from "lib/gamemap/interaction/GameMapDragAction";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import {Shortcuts} from "lib/runescape/shortcuts";
import InteractionTopControl from "../../map/InteractionTopControl";
import {ShortcutViewLayer} from "../ShortcutView";
import {observe} from "../../../../lib/reactive";

export class DrawGeneralEntity extends InteractionLayer {
    constructor(public config: {
        done_handler: (_: Shortcuts.shortcut) => void
    }) {
        super();

        new InteractionTopControl({
            name: "Draw Entity",
            cancel_handler: () => this.cancel()
        }).setText("Draw interactive entity's clickable rectangle.")
            .addTo(this)

        new GameMapDragAction({
            preview_render: (area) => new ShortcutViewLayer.ShortcutPolygon(observe(DrawGeneralEntity.transform(area)))
        })
            .onCommit((area) => {
                this.config.done_handler(DrawGeneralEntity.transform(area))
                this.cancel()
            })
            .onEnd(() => this.cancel())
            .addTo(this)
    }
}

export namespace DrawGeneralEntity {
    export function transform(area: TileRectangle): Shortcuts.entity_shortcut {
        return {
            type: "entity",
            name: "Entity",
            clickable_area: TileRectangle.extend(area, 0.5),
            actions: [{
                cursor: "generic",
                interactive_area: TileRectangle.extend(area, 1),
                movement: {type: "offset", offset: {x: 0, y: 0}, level_offset: area.level},
                name: "Use",
                time: 3
            }],
        }
    }
}