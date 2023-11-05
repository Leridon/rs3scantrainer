import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import {Shortcuts} from "../../../../lib/runescape/shortcuts";
import {Vector2} from "../../../../lib/math/Vector2";
import {TileRectangle} from "../../../../lib/runescape/coordinates/TileRectangle";
import {TileCoordinates} from "../../../../lib/runescape/coordinates/TileCoordinates";

export class PlaceShortcut extends ValueInteraction<Shortcuts.new_shortcut> {

}

export namespace PlaceShortcut {
    function flip_vertically(s: Shortcuts.new_shortcut): Shortcuts.new_shortcut {
        return null
    }

    function flip_horizontally(s: Shortcuts.new_shortcut): Shortcuts.new_shortcut {
        return null
    }

    function rotate_clockwise(s: Shortcuts.new_shortcut): Shortcuts.new_shortcut {
        return null
    }

    function rotate_counterclockwise(s: Shortcuts.new_shortcut): Shortcuts.new_shortcut {
        return null
    }

    function translate(s: Shortcuts.new_shortcut, offset: Vector2): Shortcuts.new_shortcut {
        switch (s.type) {
            case "door":
                return {
                    type: "door",
                    name: s.name,
                    area: TileRectangle.translate(s.area, offset),
                    direction: s.direction
                }
            case "entity":
                return {
                    type: "entity",
                    name: s.name,
                    clickable_area: TileRectangle.translate(s.clickable_area, offset),
                    actions: s.actions.map(a => ({
                        cursor: a.cursor,
                        interactive_area: TileRectangle.translate(a.interactive_area, offset),
                        movement: (() => {
                            switch (a.movement.type) {
                                case "fixed":
                                    return {
                                        type: "fixed",
                                        target: TileCoordinates.move(a.movement.target, offset)
                                    }
                                case "offset":
                                    return {
                                        type: "offset",
                                        offset: a.movement.offset,
                                        level: a.movement.level // TODO: Level offset?
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