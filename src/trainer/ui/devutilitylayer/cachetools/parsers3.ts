import {TransportParser, TransportParser2} from "./TransportParser";
import {CacheTypes} from "./CacheTypes";
import {Transportation} from "../../../../lib/runescape/transportation";
import {TileCoordinates, TileRectangle} from "../../../../lib/runescape/coordinates";
import {direction} from "../../../../lib/runescape/movement";
import {TileTransform} from "../../../../lib/runescape/coordinates/TileTransform";
import {Transform, Vector2} from "../../../../lib/math";
import LocInstance = CacheTypes.LocInstance;
import {ParsingParameter} from "./ParsingParameters";
import PP = ParsingParameter

function parse<GroupT, InstanceT>(id: string,
                                  name: string,
                                  groupPar: ParsingParameter<GroupT>,
                                  instancePar: ParsingParameter<InstanceT>,
                                  apply: (instance: CacheTypes.LocInstance, args: { per_loc: unknown; per_instance?: unknown }) => Promise<Transportation.Transportation[]>) {

    return (new class extends TransportParser2 {
        constructor() {
            super(id, name);

            this.per_loc_group_parameter = groupPar
            this.per_instance_parameter = instancePar
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
        TileTransform.translation(Vector2.sub(use.origin, current_origin), use.plane),
    )

    if (transport.type == "entity") {
        transport.clickable_area = TileRectangle.extend(transport.clickable_area, 0.5)
    }

    return transport
}

export const parsers3: TransportParser2[] = [
    parse("west-facing-doors", "Standard West Doors", null, null, async (instance) => {

            const door: Transportation.DoorTransportation = {
                type: "door",
                position: instance.origin,
                direction: direction.west,
                name: instance.prototype.name ?? "Door",
            }

            return [transformWithLoc(door, instance)]
        }
    ),
    parse("ignore", "Ignore", null, null, async (instance) => {
            return []
        }
    ),
    parse("ladders", "Ladders", PP.rec()
            .element("Across", "across", PP.bool(), false)
        , null, async (instance, args: {
            per_instance?: { across: boolean },

        }) => {


            return []
        })
]

export namespace Parsers3 {
    export function getById(id: string): TransportParser2 {
        return parsers3.find(p => p.id == id)
    }
}