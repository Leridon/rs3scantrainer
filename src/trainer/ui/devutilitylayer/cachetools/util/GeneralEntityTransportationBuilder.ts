import {Transportation} from "../../../../../lib/runescape/transportation";
import {MovementBuilder} from "./MovementBuilder";
import {LocUtil} from "./LocUtil";
import {CacheTypes} from "../CacheTypes";
import {Transform, Vector2} from "../../../../../lib/math";
import {TileTransform} from "../../../../../lib/runescape/coordinates/TileTransform";
import {TileRectangle} from "../../../../../lib/runescape/coordinates";
import {CursorType} from "../../../../../lib/runescape/CursorType";
import {TileArea} from "../../../../../lib/runescape/coordinates/TileArea";
import EntityAction = Transportation.EntityAction;
import EntityTransportation = Transportation.EntityTransportation;
import GeneralEntityTransportation = Transportation.GeneralEntityTransportation;
import getAction = LocUtil.getAction;
import LocInstance = CacheTypes.LocInstance;
import getNthAction = LocUtil.getNthAction;

export class EntityActionBuilder {

  constructor(public value: EntityAction) {

  }

  movement(...movement: MovementBuilder[]): this {
    this.value.movement.push(...movement.map(m => m.done()))

    return this
  }
}

export class EntityTransportationBuilder {
  private plane_offset = 0

  constructor(public underlying: LocInstance,
              public value: EntityTransportation) {}

  planeOffset(offset: number): this {
    this.plane_offset = offset

    return this
  }

  finish(): EntityTransportation {
    let transport = this.value
    let use = this.underlying

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
      TileTransform.translation(Vector2.sub(use.origin, current_origin), use.plane + this.plane_offset),
    )

    if (transport.type == "entity") {
      transport.clickable_area = TileRectangle.extend(transport.clickable_area, 0.5)
    }

    return this.value = transport
  }
}

export class GeneralEntityTransportationBuilder extends EntityTransportationBuilder {
  constructor(
    public underlying: LocInstance,
    public value: GeneralEntityTransportation) {

    super(underlying, value)
  }

  action(override: {
    index?: number,
    cursor?: CursorType,
    name?: string,
    interactive_area?: TileArea,
  } = {}, ...movements: MovementBuilder[]) {

    const action =
      override.index != null
        ? getAction(this.underlying.prototype, override.index)!
        : getNthAction(this.underlying.prototype, 0)

    const a = new EntityActionBuilder({
      name: override.name ?? action?.name ?? "Unnamed Action",
      cursor: override.cursor ?? action.cursor ?? "generic",
      interactive_area: override.interactive_area ?? undefined,
      movement: [],
    })

    a.movement(...movements)

    this.value.actions.push(a.value)

    return this
  }
}

export namespace EntityTransportationBuilder {

  import LocInstance = CacheTypes.LocInstance;

  export function from(instance: LocInstance): GeneralEntityTransportationBuilder {
    const transport: Transportation.EntityTransportation = {
      type: "entity",
      entity: {name: instance.prototype.name!!, kind: "static"},
      clickable_area: TileRectangle.from(
        {x: 0, y: 0, level: 0},
        {x: (instance.prototype.width ?? 1) - 1, y: (instance.prototype.length ?? 1) - 1, level: 0},
      ),
      actions: [],
    }

    return new GeneralEntityTransportationBuilder(instance, transport)
  }
}