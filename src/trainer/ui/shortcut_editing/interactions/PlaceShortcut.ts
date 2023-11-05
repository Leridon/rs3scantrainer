import {ValueInteraction} from "lib/gamemap/interaction/ValueInteraction";
import {Shortcuts} from "lib/runescape/shortcuts";
import {Vector2} from "lib/math";
import {TileRectangle} from "lib/runescape/coordinates";
import {TileCoordinates} from "lib/runescape/coordinates";
import {TileTransform} from "lib/runescape/coordinates/TileTransform";
import {floor_t} from "lib/runescape/coordinates";

export class PlaceShortcut extends ValueInteraction<Shortcuts.new_shortcut> {

}

export namespace PlaceShortcut {
    function transform(s: Shortcuts.new_shortcut, trans: TileTransform): Shortcuts.new_shortcut {
        switch (s.type) {
            case "door":
                return {
                    type: "door",
                    name: s.name,
                    area: TileRectangle.transform(s.area, trans),
                    direction: s.direction // TODO!!!!
                }
            case "entity":
                return {
                    type: "entity",
                    name: s.name,
                    clickable_area: TileRectangle.transform(s.clickable_area, trans),
                    actions: s.actions.map(a => ({
                        cursor: a.cursor,
                        interactive_area: TileRectangle.transform(a.interactive_area, trans),
                        movement: (() => {
                            switch (a.movement.type) {
                                case "fixed":
                                    return {
                                        type: "fixed",
                                        target: TileCoordinates.transform(a.movement.target, trans)
                                    }
                                case "offset":
                                    return {
                                        type: "offset",
                                        offset: Vector2.transform(a.movement.offset, trans.matrix),
                                        level_offset: floor_t.clamp(a.movement.level_offset + trans.level_offset)
                                    }
                            }
                        })(),
                        name: a.name,
                        time: a.time
                    }))
                }


        }
    }
}