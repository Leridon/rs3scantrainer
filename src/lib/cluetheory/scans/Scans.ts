import {MapCoordinate, MapRectangle} from "../../runescape/coordinates";
import {Scans} from "../../runescape/clues/scans";
import {ScanTree} from "./ScanTree";
import {Rectangle} from "../../math/Vector";
import {rangeRight} from "lodash";

export namespace ScanTheory {

    import Pulse = Scans.Pulse;
    import ScanInformation = ScanTree.ScanInformation;
    import get_pulse = Scans.get_pulse;
    import complementSpot = Scans.complementSpot;
    import distance = Scans.distance;

    export type PulseInformation = Scans.Pulse & ({
        pulse: 3
        spot?: MapCoordinate
    } | { pulse: 1 | 2 })

    export namespace PulseInformation {

        export function equals(a: PulseInformation, b: PulseInformation): boolean {
            return Pulse.equals(a, b) && !(a.pulse == 3 && (b.pulse == 3) && !MapCoordinate.eq2(a?.spot, b.spot))
        }
    }

    export function spot_narrowing(candidates: MapCoordinate[], area: MapRectangle, range: number): {
        pulse: PulseInformation,
        narrowed_candidates: MapCoordinate[]
    }[] {
        return Pulse.all.flatMap((p) => {
            let remaining = narrow_down(candidates, {area: area, pulse: p.pulse, different_level: p.different_level}, range)

            if (p.pulse == 3) {
                return remaining.map(r => {
                    return {
                        pulse: {
                            pulse: 3,
                            different_level: p.different_level,
                            spot: r
                        },
                        narrowed_candidates: [r]
                    }
                })
            } else {
                return [{
                    pulse: p,
                    narrowed_candidates: remaining
                }]
            }
        })
    }

    export function area_pulse(spot: MapCoordinate, area: MapRectangle, range: number): Pulse[] {
        let pulses: Pulse[]

        let max = get_pulse(spot, MapRectangle.clampInto(spot, area), range).pulse

        // This breaks if areas are so large they cover both cases. But in that case: Wtf are you doing?
        if (max == 1) {
            pulses = []

            let complement_spot = complementSpot(spot)

            if (spot.level != area.level || distance(complement_spot, Rectangle.clampInto(complement_spot, area)) <= (range + 15)) {
                // Any tile in area triggers different level
                pulses.push({
                    pulse: 1,
                    different_level: true
                })
            }

            if ((distance(complement_spot, area.topleft) > (range + 15)
                    || distance(complement_spot, area.botright) > (range + 15))
                && spot.level == area.level
            ) { // Any tile in area does not trigger different level
                pulses.push({
                    pulse: 1,
                    different_level: false
                })
            }
        } else {
            let min = Math.min(
                get_pulse(spot, MapRectangle.tl(area), range).pulse,
                get_pulse(spot, MapRectangle.br(area), range).pulse,
            )

            pulses = rangeRight(min, max + 1, 1).map((p: 1 | 2 | 3) => {
                return {
                    pulse: p,
                    different_level: spot.level != area.level
                }
            })
        }

        return pulses
    }

    export function narrow_down(candidates: MapCoordinate[], information: ScanInformation, range: number): MapCoordinate[] {
        return candidates.filter((s) => area_pulse(s, information.area, range).some((p2) => Pulse.equals(information, p2)))
    }
}