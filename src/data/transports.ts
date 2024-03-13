import teleport_data from "./teleport_data";
import {Transportation} from "../lib/runescape/transportation";
import Dependencies from "../trainer/dependencies";

export namespace TransportData {
    import TeleportGroup = Transportation.TeleportGroup;

    const cached_data: {
        cache_extracted?: Transportation.EntityTransportation[],
        all_transports?: Transportation.Transportation[]
    } = {}

    export const teleports = teleport_data

    export async function getCacheTransports(): Promise<Transportation.EntityTransportation[]> {
        if (!cached_data.cache_extracted) {
            cached_data.cache_extracted = await (await fetch(`map/cache_transportation.json`, {cache: "no-store"})).json()
        }

        return cached_data.cache_extracted
    }

    export async function getAll(): Promise<Transportation.Transportation[]> {
        if (!cached_data.all_transports) {
            cached_data.all_transports = [].concat(
                await getCacheTransports(),
                teleports
            )
        }

        return cached_data.all_transports
    }

    let teleport_spots: Transportation.TeleportGroup.Spot[] = null

    export function getAllTeleportSpots(
        customization: Transportation.TeleportGroup.TeleportCustomization = Dependencies.instance().app.teleport_settings
    ): Transportation.TeleportGroup.Spot[] {
        if (!teleport_spots) {
            teleport_spots = teleports.filter(TeleportGroup.canBeAccessedAnywhere).flatMap(group => {
                return group.spots.map(spot => {
                    return new Transportation.TeleportGroup.Spot(group, spot, group.access[0], customization)
                })
            })
        }

        return teleport_spots
    }

    export function resolveTeleport(id: Transportation.TeleportGroup.SpotId,
                                    customization: Transportation.TeleportGroup.TeleportCustomization = Dependencies.instance().app.teleport_settings): Transportation.TeleportGroup.Spot {
        const group = teleports.find(g => g.id == id.group)
        const spot = group?.spots?.find(s => s.id == id.spot)
        const access = id.access ? group?.access?.find(a => a.id == id.access) : group?.access[0]

        if (!group || !spot || !access) {
            return undefined
        }

        return new Transportation.TeleportGroup.Spot(group, spot, access, customization)
    }
}