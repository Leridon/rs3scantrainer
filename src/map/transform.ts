import {GieliCoordinates, MapCoordinate} from "../clues";

export namespace transform {
    function sextantToCoord(comp: GieliCoordinates): MapCoordinate {
        const sextant = {
            offsetx: 2440,
            offsetz: 3161,
            degreespertile: 1.875
        }

        return {
            x: sextant.offsetx + Math.round((60 * comp.longitude.degrees + comp.longitude.minutes) * (comp.longitude.direction == "west" ? -1 : 1) / sextant.degreespertile),
            y: sextant.offsetz + Math.round((60 * comp.latitude.degrees + comp.latitude.minutes) * (comp.latitude.direction == "south" ? -1 : 1) / sextant.degreespertile)
        }
    }
}