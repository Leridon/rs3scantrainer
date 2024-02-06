import {Path} from "./pathing";
import {Rectangle, Vector2} from "../math";
import {TileRectangle} from "./coordinates";
import {TileCoordinates} from "./coordinates";
import {direction} from "./movement";
import {TileArea} from "./coordinates/TileArea";
import {TileTransform} from "./coordinates/TileTransform";
import {util} from "../util/util";

export namespace Transportation {
    import entity = Path.entity;
    import todo = util.todo;

    export type transportation_base = { type: string, source_loc?: number }

    export type EntityActionMovement = {
        valid_from?: TileArea, // Default: Entire interactive area
        offset?: Vector2 & { level: number },
        fixed_target?: { target: TileCoordinates, relative?: boolean },
        orientation?: "bymovement" | "toentitybefore" | "toentityafter" | "keep" | "forced", // Default: "bymovement"
        forced_orientation?: { dir: direction, relative?: boolean },
    }

    export type EntityAction = {
        cursor?: Path.InteractionType,
        time: number,
        name: string,
        movement: EntityActionMovement[],
        interactive_area?: TileArea, // Default: clickable area extended by 1
    }

    export type entity_transportation = transportation_base & {
        type: "entity",
        entity: entity,
        clickable_area: TileRectangle,
        actions: EntityAction[]
    }

    export type door = transportation_base & {
        type: "door",
        position: TileCoordinates,
        direction: direction,
        name: string,
    }

    export type transportation = entity_transportation | door

    export namespace EntityAction {
        export function findApplicable(action: EntityAction, tile: TileCoordinates): EntityActionMovement {
            return action.movement.find(movement => {
                return !movement.valid_from || TileArea.contains(movement.valid_from, tile)
            })
        }
    }

    export namespace EntityTransportation {
        export function default_interactive_area(area: TileRectangle): TileArea {
            const extended = TileRectangle.extend(area, 1)

            let tiles = TileArea.fromRect(extended, false)

            // west
            TileArea.setRectangle(tiles, TileRectangle.from(
                TileCoordinates.move(TileRectangle.bl(extended), direction.toVector(direction.north)),
                TileCoordinates.move(TileRectangle.tl(extended), direction.toVector(direction.south)),
            ), true)

            // north
            TileArea.setRectangle(tiles, TileRectangle.from(
                TileCoordinates.move(TileRectangle.tl(extended), direction.toVector(direction.west)),
                TileCoordinates.move(TileRectangle.tr(extended), direction.toVector(direction.east)),
            ), true)

            // east
            TileArea.setRectangle(tiles, TileRectangle.from(
                TileCoordinates.move(TileRectangle.tr(extended), direction.toVector(direction.south)),
                TileCoordinates.move(TileRectangle.br(extended), direction.toVector(direction.north)),
            ), true)

            // south
            TileArea.setRectangle(tiles, TileRectangle.from(
                TileCoordinates.move(TileRectangle.br(extended), direction.toVector(direction.west)),
                TileCoordinates.move(TileRectangle.bl(extended), direction.toVector(direction.east)),
            ), true)

            return tiles
        }
    }

    /**
     * Coalesces all shortcuts into the general entity_shortcut.
     * More specifically, it transforms door shortcuts into an equivalent {@link entity_transportation} to allow unified handling across the code base.
     * Doors are modelled differently in case their handling for pathing is ever changed from the current, hacky variant.
     * @param shortcut
     */
    export function normalize(shortcut: transportation): entity_transportation {
        if (shortcut.type == "entity") return shortcut

        const off = direction.toVector(shortcut.direction)

        const other = TileCoordinates.move(shortcut.position, off)

        return {
            type: "entity",
            source_loc: shortcut.source_loc,
            entity: {kind: "static", name: shortcut.name},
            clickable_area: TileRectangle.extend(TileRectangle.from(TileCoordinates.move(shortcut.position, Vector2.scale(0.5, off))), 0.5),
            actions: [{
                cursor: "open",
                interactive_area: TileArea.fromRect(TileRectangle.from(shortcut.position, other), true),
                time: 1,
                name: `Pass`,
                movement: [
                    {
                        offset: {...off, level: 0},
                        valid_from: {origin: shortcut.position},
                    },
                    {
                        offset: {...direction.toVector(direction.invert(shortcut.direction)), level: 0},
                        valid_from: {origin: other}
                    },
                ]
            }]
        }
    }

    export function bounds(shortcut: transportation): TileRectangle {
        switch (shortcut.type) {
            case "entity":
                return TileRectangle.lift(Rectangle.combine(
                    shortcut.clickable_area,
                    //...shortcut.actions.map(a => a.interactive_area)
                ), shortcut.clickable_area.level)
            case "door":
                return TileRectangle.from(shortcut.position, TileCoordinates.move(shortcut.position, direction.toVector(shortcut.direction)))
        }
    }

    export function position(shortcut: transportation): TileCoordinates {
        switch (shortcut.type) {
            case "entity":
                return TileRectangle.center(shortcut.clickable_area)
            case "door":
                return TileCoordinates.move(shortcut.position, Vector2.scale(0.5, direction.toVector(shortcut.direction)))
        }
    }

    export function name(shortcut: transportation): string {
        switch (shortcut.type) {
            case "entity":
                return shortcut.entity.name
            case "door":
                return shortcut.name
        }
    }

    export function transform(transport: transportation, transform: TileTransform): transportation {

        todo()// TODO: Reimplement if neede

        //return transport
        /*
        switch (transport.type) {
            case "door":
                return {
                    type: "door",
                    name: transport.name,
                    position: transport.position,
                    direction: direction.transform(transport.direction, transform.matrix)
                }
            case "entity":
                return {
                    type: "entity",
                    entity: transport.entity,
                    clickable_area: TileRectangle.transform(transport.clickable_area, transform),
                    actions: transport.actions.map(a => ({
                        cursor: a.cursor,
                        interactive_area: TileRectangle.transform(a.interactive_area, transform),
                        movement: (() => {
                            switch (a.movement.type) {
                                case "fixed":
                                    return (a.movement.relative)
                                        ? {
                                            type: "fixed",
                                            target: TileCoordinates.transform(a.movement.target, transform),
                                            relative: true
                                        }
                                        : {
                                            type: "fixed",
                                            target: a.movement.target,
                                            relative: false
                                        }
                                case "offset":
                                    return {
                                        type: "offset",
                                        offset: {...Vector2.snap(Vector2.transform(a.movement.offset, transform.matrix)), level:a.movement.offset.level + transform.level_offset}
                                    }
                            }
                        })(),
                        orientation: (() => {
                            switch (a.orientation.type) {
                                case "byoffset":
                                    return {type: "byoffset"}
                                case "keep":
                                    return {type: "keep"}
                                case "toentityafter":
                                    return {type: "toentityafter"}
                                case "toentitybefore":
                                    return {type: "toentitybefore"}
                                case "forced":
                                    return (a.orientation.relative)
                                        ? {
                                            type: "forced",
                                            direction: direction.transform(a.orientation.direction, transform.matrix),
                                            relative: true
                                        }
                                        : {
                                            type: "forced",
                                            direction: a.orientation.direction,
                                            relative: false
                                        }
                            }
                        })(),
                        name: a.name,
                        time: a.time,
                    }))
                }


        }*/
    }
}