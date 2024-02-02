import {Path} from "./pathing";
import {Rectangle, Vector2} from "../math";
import {TileRectangle} from "./coordinates";
import {TileCoordinates} from "./coordinates";
import {direction} from "./movement";

export namespace Shortcuts {
    import entity = Path.entity;
    export type shortcut_orientation_type =
        { type: "forced", direction: direction, relative: boolean }
        | { type: "byoffset" }
        | { type: "toentitybefore" }
        | { type: "toentityafter" }
        | { type: "keep" }

    export type entity_shortcut_action = {
        cursor: Path.InteractionType,
        interactive_area: TileRectangle,
        time: number,
        name: string,
        movement: { type: "offset", offset: Vector2 & { level: number } }
            | { type: "fixed", target: TileCoordinates, relative: boolean },
        orientation: shortcut_orientation_type
    }

    export type shortcut_base = { source_loc?: number }

    export type entity_shortcut = shortcut_base & {
        type: "entity",
        entity: entity,
        clickable_area: TileRectangle,
        actions: entity_shortcut_action[]
    }

    export type door_shortcut = shortcut_base & {
        type: "door",
        position: TileCoordinates,
        direction: direction,
        name: string,
    }

    export type shortcut = entity_shortcut | door_shortcut

    /**
     * Coalesces all shortcuts into the general entity_shortcut.
     * More specifically, it transforms door shortcuts into an equivalent {@link entity_shortcut} to allow unified handling across the code base.
     * Doors are modelled differently in case their handling for pathing is ever changed from the current, hacky variant.
     * @param shortcut
     */
    export function normalize(shortcut: shortcut): entity_shortcut {
        if (shortcut.type == "entity") return shortcut

        const off = direction.toVector(shortcut.direction)

        return {
            type: "entity",
            source_loc: shortcut.source_loc,
            entity: {kind: "static", name: shortcut.name},
            clickable_area: TileRectangle.extend(TileRectangle.from(TileCoordinates.move(shortcut.position, Vector2.scale(0.5, off))), 0.5),
            actions: [{
                cursor: "open",
                interactive_area: TileRectangle.from(shortcut.position),
                time: 1,
                name: `Cross ${direction.toString(shortcut.direction)}`,
                movement: {type: "offset", offset: {...off, level: 0}},
                orientation: {type: "forced", direction: shortcut.direction, relative: true}
            }, {
                cursor: "open",
                interactive_area: TileRectangle.from(TileCoordinates.move(shortcut.position, off)),
                time: 1,
                name: `Cross ${direction.toString(direction.invert(shortcut.direction))}`,
                movement: {type: "offset", offset: {...direction.toVector(direction.invert(shortcut.direction)), level: 0}},
                orientation: {type: "forced", direction: direction.invert(shortcut.direction), relative: true}
            }]
        }
    }

    export function bounds(shortcut: shortcut): TileRectangle {
        switch (shortcut.type) {
            case "entity":
                return TileRectangle.lift(Rectangle.combine(
                    shortcut.clickable_area,
                    ...shortcut.actions.map(a => a.interactive_area)
                ), shortcut.clickable_area.level)
            case "door":
                return TileRectangle.from(shortcut.position, TileCoordinates.move(shortcut.position, direction.toVector(shortcut.direction)))
        }
    }

    export function position(shortcut: shortcut): TileCoordinates {
        switch (shortcut.type) {
            case "entity":
                return TileRectangle.center(shortcut.clickable_area)
            case "door":
                return TileCoordinates.move(shortcut.position, Vector2.scale(0.5, direction.toVector(shortcut.direction)))
        }
    }

    export function name(shortcut: shortcut): string {
        switch (shortcut.type) {
            case "entity":
                return shortcut.entity.name
            case "door":
                return shortcut.name

        }
    }
}