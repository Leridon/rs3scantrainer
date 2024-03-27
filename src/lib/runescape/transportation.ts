import {Rectangle, Transform, Vector2} from "../math";
import {TileCoordinates, TileRectangle} from "./coordinates";
import {direction} from "./movement";
import {TileArea} from "./coordinates/TileArea";
import {TileTransform} from "./coordinates/TileTransform";
import {CursorType} from "./CursorType";
import {EntityName} from "./EntityName";

export namespace Transportation {


  export type transportation_base = { type: string, source_loc?: number }

  export type ImageUrl = { url: string, width?: number, height?: number }

  export type EntityActionMovement = {
    valid_from?: TileArea, // Default: Entire interactive area
    offset?: EntityActionMovement.Offset,
    fixed_target?: { target: TileArea | TileCoordinates, relative?: boolean }
    orientation?: "bymovement" | "toentitybefore" | "toentityafter" | "keep" | "forced", // Default: "bymovement"
    forced_orientation?: { dir: direction, relative?: boolean },
    time: number,
  }

  export namespace EntityActionMovement {
    export type Offset = Vector2 & { level: number }

    export namespace Offset {
      export function transform(offset: Offset, transform: Transform): Offset {
        return {
          ...Vector2.snap(Vector2.transform(offset, transform)),
          level: offset.level,
        }
      }
    }
  }

  export type EntityAction = {
    cursor?: CursorType,
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

  export type TeleportProps = {
    img?: ImageUrl,
    menu_ticks?: number
    animation_ticks?: number
    code?: string
  }

  export type TeleportSpot = {
    id: string
    target: TileArea
    facing?: direction
    name: string
  } & TeleportProps

  export type TeleportAccess = TeleportProps & {
    type: string,
    id: string
    per_spot_props?: Record<string, TeleportProps>
  } & ({
    type: "item",
    name: EntityName & { kind: "item" },
    action_name: string,
    can_be_in_pota?: boolean,
    cursor?: CursorType
  } | {
    type: "entity",
    name: EntityName & { kind: "npc" | "static" },
    clickable_area: TileArea,
    interactive_area?: TileArea,
    action_name: string,
    cursor?: CursorType,
  } | {
    type: "spellbook",
    name: string
  })

  export type TeleportGroup = transportation_base & TeleportProps & {
    type: "teleports"
    id: string
    name: string,
    spots: TeleportSpot[]
    access: TeleportAccess[]
  }

  export type EntityTransportation = GeneralEntityTransportation | DoorTransportation

  export type Transportation = GeneralEntityTransportation | DoorTransportation | TeleportGroup

  export namespace TeleportGroup {
    import activate = TileArea.activate;
    export namespace TeleportAccess {
      export function isAnywhere(access: TeleportAccess): boolean {
        return access.type == "item" || access.type == "spellbook"
      }
    }

    export namespace TeleportProps {
      export function combinePrioritized(...props: (TeleportProps | null)[]): TeleportProps {
        return props.reduce<TeleportProps>((a, b) => ({
          img: a?.img ?? b?.img,
          menu_ticks: a?.menu_ticks ?? b?.menu_ticks,
          animation_ticks: a?.animation_ticks ?? b?.animation_ticks,
          code: a?.code ?? b?.code,
        }), {})
      }
    }

    export function canBeAccessedAnywhere(group: TeleportGroup): boolean {
      return group.access.some(TeleportAccess.isAnywhere)
    }

    export type SpotId = {
      group: string,
      spot: string,
      access?: string
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
      private pota_slot: {
        img: ImageUrl,
        code_prefix: string,
      } | null

      public readonly props: TeleportProps

      constructor(public readonly group: TeleportGroup,
                  public readonly spot: TeleportSpot,
                  public readonly access: TeleportAccess,
                  private settings: TeleportCustomization
      ) {
        const pota = this.access.type == "item" && this.access.can_be_in_pota
          ? this.settings.potas.find((p) => p.active && p.slots.includes(this.group.id))
          : null

        // Props are combined from the various ways they can be specified.
        // Prop definitions for Access x Spot have the highest priority,
        // followed by per-access props, then per-spot props and finally per-group props.
        this.props = TeleportProps.combinePrioritized(
          access?.per_spot_props?.[spot.id],
          access,
          spot,
          group, {
            animation_ticks: 0,
            menu_ticks: 0,
            code: "",
            img: {url: "homeport.png"}
          }
        )

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
        return this.props.img
      }

      code(): string {
        let base_code = this.props.code

        if (this.group.id == "fairyring") {
          const i = this.settings.fairy_ring_favourites.indexOf(this.spot.code)

          if (i > 0) base_code = ((i + 1) % 10).toString()
        }

        return (this.pota_slot?.code_prefix ?? "") + base_code
      }

      centerOfTarget(): TileCoordinates {
        return activate(this.spot.target).center()
      }

      targetArea(): TileArea {
        return this.spot.target
      }

      id(): SpotId {
        return {
          group: this.group.id,
          spot: this.spot.id
        }
      }
    }
  }

  export namespace EntityAction {
    import activate = TileArea.activate;

    export function findApplicable(action: EntityAction, tile: TileCoordinates): EntityActionMovement {
      return action.movement.find(movement => {
        return !movement.valid_from || activate(movement.valid_from).query(tile)
      })
    }
  }

  export namespace EntityTransportation {
    export function default_interactive_area(area: TileRectangle): TileArea {
      const extended = TileRectangle.extend(area, 1)

      let tiles = TileArea.activate(TileArea.fromRect(extended, true))

      tiles.set(TileRectangle.tl(extended), false)
      tiles.set(TileRectangle.tr(extended), false)
      tiles.set(TileRectangle.bl(extended), false)
      tiles.set(TileRectangle.br(extended), false)
      /*
      tiles.setRectangle(area, true)

      // west
      tiles.setRectangle(TileRectangle.from(
        TileCoordinates.move(TileRectangle.bl(area), direction.toVector(direction.north)),
        TileCoordinates.move(TileRectangle.tl(area), direction.toVector(direction.south)),
      ), true)

      // north
      tiles.setRectangle(TileRectangle.from(
        TileCoordinates.move(TileRectangle.tl(area), direction.toVector(direction.west)),
        TileCoordinates.move(TileRectangle.tr(area), direction.toVector(direction.east)),
      ), true)

      // east
      tiles.setRectangle(TileRectangle.from(
        TileCoordinates.move(TileRectangle.tr(area), direction.toVector(direction.south)),
        TileCoordinates.move(TileRectangle.br(area), direction.toVector(direction.north)),
      ), true)

      // south
      tiles.setRectangle(TileRectangle.from(
        TileCoordinates.move(TileRectangle.br(area), direction.toVector(direction.west)),
        TileCoordinates.move(TileRectangle.bl(area), direction.toVector(direction.east)),
      ), true)

      console.log(area)*/

      tiles.save()

      return tiles.parent
    }

    export function isLocal(transport: EntityTransportation): boolean {

      // A shortcut is local if there is no movement action that has a non-relative fixed target

      return transport.type == "door" || !transport.actions.some(a =>
        a.movement.some(m => {
          return !Movement.isLocal(m)
        })
      )
    }

    export namespace Movement {
      export function isLocal(m: EntityActionMovement): boolean {
        // A shortcut is local if there is no movement action that has a non-relative fixed target

        return !(m.fixed_target && !m.fixed_target.relative)
      }
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
        name: `Pass`,
        movement: [
          {
            time: 1,
            offset: {...off, level: 0},
            valid_from: {origin: shortcut.position},
          },
          {
            time: 1,
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

  export function transform(transport: Transportation.GeneralEntityTransportation, transform: TileTransform): Transportation.GeneralEntityTransportation
  export function transform(transport: Transportation.EntityTransportation, transform: TileTransform): Transportation.EntityTransportation
  export function transform(transport: Transportation.DoorTransportation, transform: TileTransform): Transportation.DoorTransportation
  export function transform(transport: Transportation, transform: TileTransform): Transportation {
    switch (transport.type) {
      case "door":
        return {
          type: "door",
          name: transport.name,
          position: TileCoordinates.transform(transport.position, transform),
          direction: direction.transform(transport.direction, transform.matrix),
        }
      case "entity":
        return {
          type: "entity",
          entity: transport.entity,
          clickable_area: TileRectangle.transform(transport.clickable_area, transform),
          actions: transport.actions.map((a): EntityAction => ({
            cursor: a.cursor,
            interactive_area: a.interactive_area ? TileArea.transform(a.interactive_area, transform) : undefined,
            name: a.name,
            movement:
              a.movement.map(movement => {
                return {
                  time: movement.time,
                  valid_from: movement.valid_from
                    ? TileArea.transform(movement.valid_from, transform)
                    : undefined,
                  offset: movement.offset
                    ? EntityActionMovement.Offset.transform(movement.offset, transform.matrix)
                    : undefined,
                  fixed_target: movement.fixed_target
                    ? (movement.fixed_target.relative
                      ? {target: TileArea.transform(TileArea.normalize(movement.fixed_target.target), transform), relative: true}
                      : movement.fixed_target)
                    : undefined,
                  orientation: movement.orientation,
                  forced_orientation: movement.forced_orientation
                    ? (movement.forced_orientation.relative ? {
                      dir: direction.transform(movement.forced_orientation.dir, transform.matrix),
                      relative: true,
                    } : movement.forced_orientation)
                    : undefined,
                }
              }),
          })),
        }
    }
  }
}