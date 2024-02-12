import {Rectangle, Vector2} from "../math";
import {TileRectangle} from "./coordinates";
import {TileCoordinates} from "./coordinates";
import {direction} from "./movement";
import {TileArea} from "./coordinates/TileArea";
import {TileTransform} from "./coordinates/TileTransform";
import {util} from "../util/util";
import {CursorType} from "./CursorType";
import {EntityName} from "./EntityName";

export namespace Transportation {
    import todo = util.todo;

    export type transportation_base = { type: string, source_loc?: number }

    export type ImageUrl = { url: string, width?: number, height?: number }

    export type EntityActionMovement = {
        valid_from?: TileArea, // Default: Entire interactive area
        offset?: Vector2 & { level: number },
        fixed_target?: { target: TileCoordinates, relative?: boolean },
        orientation?: "bymovement" | "toentitybefore" | "toentityafter" | "keep" | "forced", // Default: "bymovement"
        forced_orientation?: { dir: direction, relative?: boolean },
    }

    export type EntityAction = {
        cursor?: CursorType,
        time: number,
        name: string,
        movement: EntityActionMovement[],
        interactive_area?: TileArea, // Default: clickable area extended by 1
    }

    export type GeneralEntityTransportation = transportation_base & {
        type: "entity",
        entity: EntityName,
        clickable_area: TileRectangle,
        actions: EntityAction[]
    }

    export type DoorTransportation = transportation_base & {
        type: "door",
        position: TileCoordinates,
        direction: direction,
        name: string,
    }

    export type TeleportGroupSpot = {
        id: string
        spot: TileCoordinates
        facing?: direction
        code?: string
        name: string
        menu_ticks: number
        animation_ticks: number
        img?: ImageUrl
    }

    export type TeleportAccess = {
        additional_ticks?: number,
        img?: ImageUrl
    } & ({
        type: "item",
        name: EntityName & { kind: "item" },
        action_name: string,
        cursor?: CursorType
    } | {
        type: "entity",
        name: EntityName & { kind: "npc" | "static" },
        area: TileArea,
        action_name: string,
        cursor: CursorType,
    } | {
        type: "spellbook",
        name: string
    })

    export type TeleportGroup = {
        type: "teleports"
        id: string
        name: string
        img: ImageUrl
        can_be_in_pota?: boolean
        spots: TeleportGroupSpot[]
        access: TeleportAccess[]
    }

    export type EntityTransportation = GeneralEntityTransportation | DoorTransportation

    export type Transportation = GeneralEntityTransportation | DoorTransportation | TeleportGroup

    export namespace TeleportGroup {
        export namespace TeleportAccess {
            export function isAnywhere(access: TeleportAccess): boolean {
                return access.type == "item" || access.type == "spellbook"
            }
        }

        export function canBeAccessedAnywhere(group: TeleportGroup): boolean {
            return group.access.some(TeleportAccess.isAnywhere)
        }

        export type SpotId = {
            group: string,
            sub: string,
            network_access_id?: string
        }

        export type TeleportCustomization = {
            fairy_ring_favourites: string[],
            potas: {
                color: "red" | "purple" | "green" | "yellow",
                slots: string[],
                active: boolean
            }[]
        }

        export class Spot {
            public readonly spot_index: number
            public readonly spot: TeleportGroupSpot

            private pota_slot: {
                img: ImageUrl,
                code_prefix: string,
            } | null

            constructor(public readonly group: TeleportGroup,
                        private subid: string,
                        private settings: TeleportCustomization
            ) {

                this.spot_index = this.group.spots.findIndex(s => s.id == subid)
                this.spot = this.group.spots[this.spot_index]

                if (this.spot_index < 0) throw TypeError(`No such spot ${subid} in group ${group.id}`)

                const pota = this.group.can_be_in_pota
                    ? this.settings.potas.find((p) => p.active && p.slots.includes(this.group.id))
                    : null

                if (pota) {
                    this.pota_slot = {
                        img: {url: `pota_${pota.color}.png`},
                        code_prefix: `${pota.slots.indexOf(group.id) + 1},`
                    }
                }
            }

            hover(): string {
                return (this.group.name && this.spot.name)
                    ? `${this.group.name} - ${this.spot.name}`
                    : this.group.name || this.spot.name
            }

            image(): ImageUrl {
                return this.spot.img ?? this.group.img
            }

            code(): string {
                let base_code = (this.spot.code ?? "")

                if (this.group.id == "fairyring") {
                    const i = this.settings.fairy_ring_favourites.indexOf(this.spot.code)

                    if (i > 0) base_code = ((i + 1) % 10).toString()
                }

                return (this.pota_slot?.code_prefix ?? "") + base_code
            }

            target(): TileCoordinates {
                return this.spot.spot
            }

            id(): SpotId {
                return {
                    group: this.group.id,
                    sub: this.spot.id
                }
            }
        }
    }

    export namespace EntityAction {
        export function findApplicable(action: EntityAction, tile: TileCoordinates): EntityActionMovement {
            return action.movement.find(movement => {
                return !movement.valid_from || TileArea.contains(movement.valid_from, tile)
            })
        }
    }

    export namespace EntityTransportation {
        export function default_interactive_area(area: TileRectangle): TileArea {
            const extended = TileRectangle.extend(area, 0.5)

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
     * Coalesces all shortcuts into the general EntityTransportation.
     * More specifically, it transforms door shortcuts into an equivalent {@link GeneralEntityTransportation} to allow unified handling across the code base.
     * Doors are modelled differently in case their handling for pathing is ever changed from the current, hacky variant.
     * @param shortcut
     */
    export function normalize(shortcut: EntityTransportation): GeneralEntityTransportation {
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

    export function bounds(shortcut: Transportation): TileRectangle {
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

    export function position(shortcut: Transportation): TileCoordinates {
        switch (shortcut.type) {
            case "entity":
                return TileRectangle.center(shortcut.clickable_area)
            case "door":
                return TileCoordinates.move(shortcut.position, Vector2.scale(0.5, direction.toVector(shortcut.direction)))
        }
    }

    export function name(shortcut: Transportation): string {
        switch (shortcut.type) {
            case "entity":
                return shortcut.entity.name
            case "door":
                return shortcut.name
        }
    }

    export function transform(transport: Transportation, transform: TileTransform): Transportation {

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