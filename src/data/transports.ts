import cache_extracted_shortcuts from "./cache_extracted_shortcuts";
import teleport_data from "./teleport_data";
import {Transportation} from "../lib/runescape/transportation";
import Dependencies from "../trainer/dependencies";

export namespace TransportData {
    import TeleportGroup = Transportation.TeleportGroup;
    export const cache_extracted_transportation = cache_extracted_shortcuts
    export const teleports = teleport_data

    export const all: Transportation.Transportation[] = [].concat(cache_extracted_shortcuts, teleports)

    let teleport_spots: Transportation.TeleportGroup.Spot[] = null

    export function getAllTeleportSpots(
        customization: Transportation.TeleportGroup.TeleportCustomization = Dependencies.instance().app.value().teleport_settings
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
                                    customization: Transportation.TeleportGroup.TeleportCustomization = Dependencies.instance().app.value().teleport_settings): Transportation.TeleportGroup.Spot {
        const group = teleports.find(g => g.id == id.group)
        const spot = group.spots.find(s => s.id == id.spot)
        const access = id.access ? group.access.find(a => a.id == id.access) : group.access[0]

        return new Transportation.TeleportGroup.Spot(group, spot, access, customization)
    }
}