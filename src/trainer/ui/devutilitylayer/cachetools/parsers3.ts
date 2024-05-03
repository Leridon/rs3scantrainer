import {TransportParser} from "./TransportParser";
import {CacheTypes} from "./CacheTypes";
import {Transportation} from "../../../../lib/runescape/transportation";
import {TileRectangle} from "../../../../lib/runescape/coordinates";
import {direction} from "../../../../lib/runescape/movement";
import {TileTransform} from "../../../../lib/runescape/coordinates/TileTransform";
import {Transform, Vector2} from "../../../../lib/math";
import {ParsingParameter} from "./ParsingParameters";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {EntityTransportationBuilder} from "./util/GeneralEntityTransportationBuilder";
import {MovementBuilder} from "./util/MovementBuilder";
import LocInstance = CacheTypes.LocInstance;
import PP = ParsingParameter;
import rec = ParsingParameter.rec;
import offset = MovementBuilder.offset;
import fixed = MovementBuilder.fixed;
import EntityActionMovement = Transportation.EntityActionMovement;

const orientation: ParsingParameter<{}> = PP.either({
  simple: PP.choose<EntityActionMovement["orientation"]>({
    toHTML: (v) => c().text(v)
  }, ["bymovement", "toentitybefore", "toentityafter", "keep", "forced"]),
  forced: PP.rec({
    dir: PP.element("Direction", PP.dir()),
    relative: PP.element("Relative", PP.bool())
  })
})

const actions_parameter = PP.list(PP.rec({
  action: PP.element("Action", PP.action()),
  area: PP.element("Area", PP.tileArea(true), true),
  movements: PP.element("Movements", PP.list(PP.rec({
    valid_from: PP.element("Valid", PP.tileArea(true), true),
    orientation: PP.element("Orientation", PP.either({
      simple: PP.choose<EntityActionMovement["orientation"]>({
        toHTML: (v) => c().text(v)
      }, ["bymovement", "toentitybefore", "toentityafter", "keep", "forced"]),
      forced: PP.rec({
        dir: PP.element("Direction", PP.dir()),
        relative: PP.element("Relative", PP.bool())
      })
    }), true),
    movement: PP.element("Movement", PP.either({
      offset: PP.offset(),
      fixed: PP.rec({
        area: PP.element("Area", PP.tileArea(true)),
        origin_only: PP.element("Origin only", PP.bool()),
      }),
    })),
    time: PP.element("Time", PP.int([0, 30]).default(3))
  })))
}))

function parse<GroupT, InstanceT>(id: string,
                                  name: string,
                                  groupPar: ParsingParameter<GroupT>,
                                  instancePar: ParsingParameter<InstanceT>,
                                  instance_group_required: boolean,
                                  apply: (instance: CacheTypes.LocInstance, args: { per_loc: GroupT; per_instance?: InstanceT }) => Promise<Transportation.Transportation[]>) {

  return (new class extends TransportParser {
    constructor() {
      super(id, name);

      this.per_loc_group_parameter = groupPar
      this.per_instance_parameter = instancePar
      this.instance_group_required = instancePar && instance_group_required
    }

    apply(instance: CacheTypes.LocInstance, args: { per_loc: GroupT; per_instance?: InstanceT }): Promise<Transportation.Transportation[]> {
      return apply(instance, args)
    }
  })
}

function transformWithLoc(transport: Transportation.GeneralEntityTransportation, use: LocInstance): Transportation.GeneralEntityTransportation
function transformWithLoc(transport: Transportation.EntityTransportation, use: LocInstance): Transportation.EntityTransportation
function transformWithLoc(transport: Transportation.DoorTransportation, use: LocInstance): Transportation.DoorTransportation
function transformWithLoc(transport: Transportation.EntityTransportation, use: LocInstance): Transportation.EntityTransportation {
  // Apply rotation
  if (use.rotation != 0) {
    transport = Transportation.transform(transport, TileTransform.normalize(
      Transform.rotation((4 - use.rotation) % 4), // Cache rotation is clockwise, while Transform.rotation is counterclockwise
    ))
  }

  const current_origin = transport.type == "entity"
    ? TileRectangle.bl(transport.clickable_area)
    : transport.position

  transport = Transportation.transform(transport,
    TileTransform.translation(Vector2.sub(use.origin, current_origin), use.effectiveLevel - current_origin.level),
  )

  if (transport.type == "entity") {
    transport.clickable_area = TileRectangle.extend(transport.clickable_area, 0.5)
  }

  return transport
}

export const parsers3: TransportParser[] = [
  parse("west-facing-doors", "Standard West Doors", null, null, false, async (instance) => {

      const door: Transportation.DoorTransportation = {
        type: "door",
        position: instance.origin,
        direction: direction.west,
        name: instance.prototype.name ?? "Door",
      }

      return [transformWithLoc(door, instance)]
    }
  ),
  parse("ignore", "Ignore", null, null, false, async (instance) => {
      return []
    }
  ),
  parse("ladders", "Ladders", PP.rec({
      across: PP.element("Across", PP.bool()),
      single_side: PP.element("Side", PP.dir(), true),
      up: PP.element("Up", PP.locAction(), true),
      down: PP.element("Down", PP.locAction(), true),
      top: PP.element("Top/Bottom", PP.rec({
        action: PP.element("Action", PP.locAction()),
        level: PP.element("Floor", PP.floor())
      }), true),
    })
    , null, false, async (instance, {per_loc}) => {
      const builder = EntityTransportationBuilder.from(instance)

      const off = per_loc.single_side && per_loc.across
        ? Vector2.scale(-2, direction.toVector(per_loc.single_side))
        : {x: 0, y: 0}

      const interactive = per_loc.single_side
        ? TileArea.init({...direction.toVector(per_loc.single_side), level: 0})
        : undefined

      if (per_loc.up != null) {
        builder.action({
            index: per_loc.up.id,
            interactive_area: interactive
          },
          offset({...off, level: 1})
            .orientation("toentitybefore")
            .time(3)
        )
      }

      if (per_loc.down != null) {
        builder.action({
            index: per_loc.down.id,
            interactive_area: interactive
          },
          offset({...off, level: -1})
            .orientation("toentitybefore")
            .time(3)
        )
      }

      if (per_loc.top != null) {
        builder.action({
            index: per_loc.top.action.id,
            interactive_area: interactive
          },
          offset({...off, level: per_loc.top.level - instance.box.level})
            .orientation("toentitybefore")
            .time(3)
        )
      }

      return [builder.finish()]
    }),
  parse("simpleremotetransport", "Remote",
    PP.rec({
      action: PP.element("Action", PP.locAction()),
      time: PP.element("Time", PP.int([0, 100]).default(3)),
      area: PP.element("Area", PP.tileArea(true), true),
    }), PP.rec({
      target: PP.element("Target", PP.tileArea(false)),
    }), true, async (instance, {per_loc, per_instance}) => {
      const builder = EntityTransportationBuilder.from(instance)

      builder.action({
        index: per_loc.action.id,
        interactive_area: per_loc.area
      }, fixed(per_instance.target))

      return [builder.finish()]
    }).makeLegacy(),
  parse("simpleremotetransportlegacy", "Remote (LEGACY)",
    PP.rec({
      action: PP.element("Action", PP.locAction()),
      time: PP.element("Time", PP.int([0, 100]).default(3)),
      area: PP.element("Area", PP.tileArea(true), true),
    }), PP.rec({
      target: PP.element("Target", PP.tileArea()),
    }), true, async (instance, {per_loc, per_instance}) => {
      const builder = EntityTransportationBuilder.from(instance)

      builder.action({
        index: per_loc.action.id,
        interactive_area: per_loc.area
      }, fixed(TileArea.transform(per_instance.target, LocInstance.getTransform(instance))))

      return [builder.finish()]
    }).makeLegacy(),
  parse("prototypecopyloc", "Prototype",
    rec({
      actions: PP.element("Actions", actions_parameter)
    }), rec({
      actions: PP.element("Actions", actions_parameter)
    }), false,
    async (instance, {per_loc, per_instance}) => {
      const builder = EntityTransportationBuilder.from(instance)

      for (const action of [...per_loc.actions, ...(per_instance?.actions ?? [])]) {
        builder.action(
          {
            index:
              action.action.custom
                ? null
                : action.action.loc.id,
            name: action.action.custom
              ? action.action.custom.name
              : null,
            cursor: action.action.custom
              ? action.action.custom.cursor
              : null,
            interactive_area: action.area
          }, ...action.movements.map(m => {

            let b: MovementBuilder = null

            if (m.movement.fixed) {

              // Tile Area is in a local, untransformed coordinate system
              let a = m.movement.fixed.area

              if (m.movement.fixed.origin_only) {
                a = TileArea.transform(a, LocInstance.getTransform(instance))
                a = TileArea.init(a.origin)
                a = TileArea.transform(a, LocInstance.getInverseTransform(instance))
              }

              b = fixed(a, true)

            } else if (m.movement.offset) b = offset(m.movement.offset)

            if (m.orientation) {
              if (m.orientation.simple) b.orientation(m.orientation.simple)
              if (m.orientation.forced) b.forcedOrientation(m.orientation.forced.dir, !!m.orientation.forced.relative)
            }

            b.time(m.time ?? 3)

            if (m.valid_from) {
              b.restrict(m.valid_from)
            }

            return b
          }))
      }

      return [builder.finish()]
    }
  ),
  parse("prototypecopylocperinstancelegacy", "(LEGACY) Prototype Per Instance",
    null,
    rec({
      actions: PP.element("Actions", PP.list(PP.rec({
        action: PP.element("Action", PP.locAction()),
        area: PP.element("Area", PP.tileArea(), true),
        movements: PP.element("Movements", PP.list(PP.rec({
          valid_from: PP.element("Valid", PP.tileArea(), true),
          orientation: PP.element("Orientation", PP.either({
            simple: PP.choose<EntityActionMovement["orientation"]>({
              toHTML: (v) => c().text(v)
            }, ["bymovement", "toentitybefore", "toentityafter", "keep"]),
            forced: PP.rec({
              dir: PP.element("Direction", PP.dir()),
              relative: PP.element("Relative", PP.bool())
            })
          }), true),
          movement: PP.element("Movement", PP.either({
            offset: PP.offset(),
            fixed: PP.rec({
              area: PP.element("Area", PP.tileArea()),
              relative: PP.element("Relative", PP.bool()),
              origin_only: PP.element("Origin only", PP.bool()),
            }),
          })),
          time: PP.element("Time", PP.int([0, 30]).default(3))
        })))
      })))
    }), true,
    async (instance, {per_instance}) => {
      const builder = EntityTransportationBuilder.from(instance)

      for (const action of per_instance.actions) {
        builder.action({
          index: action.action.id,
          interactive_area: action.area
        }, ...action.movements.map(m => {

          let b: MovementBuilder = null

          if (m.movement.fixed) {

            if (m.movement.fixed.origin_only) {
              let a = m.movement.fixed.area

              if (m.movement.fixed.relative) {
                a = TileArea.transform(a, LocInstance.getTransform(instance))
              }

              a = TileArea.init(a.origin)

              if (m.movement.fixed.relative) {
                a = TileArea.transform(a, LocInstance.getInverseTransform(instance))
              }

              b = fixed(a, m.movement.fixed.relative)
            } else {
              b = fixed(m.movement.fixed.area, m.movement.fixed.relative)
            }

          } else if (m.movement.offset) b = offset(m.movement.offset)

          if (m.orientation) {
            if (m.orientation.simple) b.orientation(m.orientation.simple)
            if (m.orientation.forced) b.forcedOrientation(m.orientation.forced.dir, !!m.orientation.forced.relative)
          }

          b.time(m.time ?? 3)

          if (m.valid_from) {
            b.restrict(m.valid_from)
          }

          return b
        }))
      }

      return [builder.finish()]
    }
  ).makeLegacy(),

]

export function hardcoded_transports(): Transportation.Transportation[] {
  return []
}

export namespace Parsers3 {
  export function getById(id: string): TransportParser {
    return parsers3.find(p => p.id == id)
  }
}