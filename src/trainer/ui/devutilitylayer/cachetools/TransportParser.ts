import {CacheTypes} from "./CacheTypes";
import {Transportation} from "../../../../lib/runescape/transportation";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {EntityTransportationBuilder, GeneralEntityTransportationBuilder} from "./util/GeneralEntityTransportationBuilder";
import {direction} from "../../../../lib/runescape/movement";
import {LocUtil} from "./util/LocUtil";
import {ParsingParameter} from "./ParsingParameters";
import LocWithUsages = CacheTypes.LocWithUsages;
import LocInstance = CacheTypes.LocInstance;
import getInstances = LocUtil.getInstances;

export abstract class TransportParser<
  PerLocData,
  PerInstanceData
> {
  public _name: string = "Unnamed"
  private instance_data_required: boolean = false

  public locs: {
    for: number[],
    data?: PerLocData,
    instance_data: {
      instance: TileCoordinates,
      data: PerInstanceData
    }[]
  }[] = []

  constructor() {

  }

  requireInstanceData(): this {
    this.instance_data_required = true

    return this
  }

  gather(loc: LocWithUsages): Transportation.Transportation[] {
    const loc_data = this.locs.find(l => l.for.includes(loc.id))

    const results = getInstances(loc).flatMap(instance => {
      try {
        const instance_data = loc_data?.instance_data.find(t => TileCoordinates.eq2(t.instance, instance.origin))?.data

        if (this.instance_data_required && instance_data == null) return []

        let result =
          this.apply(instance, {
              per_loc: loc_data?.data!!,
              per_instance: instance_data!!,
            },
          )

        if (!Array.isArray(result)) result = [result]

        return result
      } catch (e) {
        console.error(`Parser ${this._name} failed!`)
        console.error(e)
        return []
      }
    })

    results.forEach(s => s.source_loc = loc.id)

    return results
  }

  loc(data: PerLocData | undefined = undefined): (...loc: number[]) => (...instance_data: [TileCoordinates, PerInstanceData | undefined][]) => this {
    return (...loc: number[]) => (...instance_data: [TileCoordinates, PerInstanceData | undefined][]): this => {
      this.locs.push({
        for: loc,
        data: data,
        instance_data: instance_data.map(([instance, value]) => {
          return {
            instance: instance,
            data: value!!
          }
        })
      })

      return this
    }
  }

  name(name: string): this {
    this._name = name
    return this
  }

  abstract apply(instance: LocInstance, data: { per_loc: PerLocData, per_instance?: PerInstanceData }): Transportation.Transportation[]
}

export abstract class TransportParser2 {
  per_loc_group_parameter: ParsingParameter
  per_instance_parameter: ParsingParameter

  constructor(public readonly id: string, public readonly name: string) { }

  abstract apply(instance: LocInstance, args: { per_loc: any, per_instance?: any }): Promise<Transportation.Transportation[]>
}

export namespace TransportParser {

  export abstract class Simple<LocT, InstanceT, BuilderT extends EntityTransportationBuilder> extends TransportParser<LocT & { plane_offset?: number }, InstanceT> {

    protected constructor(private f: HandlerFunction<LocT, InstanceT, BuilderT>) {super();}

    map(f: HandlerFunction<LocT, InstanceT, BuilderT>): this {

      const old = this.f

      this.f = (builder, data, instance) => {
        old(builder, data, instance)
        f(builder, data, instance)
      }

      return this
    }

    apply(instance: LocInstance, data: { per_loc: LocT & { plane_offset?: number }; per_instance?: InstanceT }): Transportation.Transportation[] {
      const builder = this.instantiate(instance, data)

      this.f(builder, data, instance)

      builder.finish()

      if (data.per_loc?.plane_offset != null) {
        builder.planeOffset(data.per_loc.plane_offset)
      }

      return [builder.value]
    }

    protected abstract instantiate(instance: LocInstance, data: { per_loc: LocT & { plane_offset?: number }; per_instance?: InstanceT }): BuilderT
  }

  export function simple<LocT = undefined, InstanceT = undefined>(name: string = "Anonymous"): Simple<LocT, InstanceT, GeneralEntityTransportationBuilder> {
    return (new class extends Simple<LocT, InstanceT, GeneralEntityTransportationBuilder> {
      constructor() {super(() => {});}

      protected instantiate(instance: LocInstance): GeneralEntityTransportationBuilder {
        return GeneralEntityTransportationBuilder.from(instance);
      }
    }).name(name)
  }

  export function door<LocT = {}, InstanceT = {}>(name: string = "Anonymous"): Simple<LocT & {
    base_direction?: direction
  }, InstanceT, EntityTransportationBuilder> {
    return (new class extends Simple<LocT & { base_direction?: direction }, InstanceT, EntityTransportationBuilder> {
      constructor() {super(() => {});}

      protected instantiate(instance: LocInstance, data: {
        per_loc: LocT & { base_direction?: direction };
        per_instance?: InstanceT
      }): EntityTransportationBuilder {
        return new EntityTransportationBuilder(instance, {
          type: "door",
          name: instance.prototype.name!!,
          direction: data.per_loc.base_direction ?? direction.west,
          position: {x: 0, y: 0, level: 0}
        })
      }
    }).name(name)
  }

  export type HandlerFunction<LocT, InstanceT, BuilderT extends EntityTransportationBuilder> = (
    transport: BuilderT,
    data: { per_loc: LocT; per_instance?: InstanceT },
    instance: LocInstance
  ) => void

  export function ignore(name: string, ...locs: number[]): TransportParser<any, any> {
    return (new class extends TransportParser<any, any> {

      apply(instance: LocInstance, data: { per_loc: any; per_instance?: any }): Transportation.Transportation[] {
        return [];
      }
    })
      .loc()(...locs)()
      .name(name)
  }
}