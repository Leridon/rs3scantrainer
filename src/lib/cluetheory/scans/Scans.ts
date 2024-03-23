import {Scans} from "../../runescape/clues/scans";
import {ScanTree} from "./ScanTree";
import {TileCoordinates} from "../../runescape/coordinates";
import {TileArea} from "../../runescape/coordinates/TileArea";

export namespace ScanTheory {

  import Pulse = Scans.Pulse;
  import ScanInformation = ScanTree.ScanInformation;
  import get_pulse = Scans.get_pulse;
  import activate = TileArea.activate;

  export type PulseInformation = Scans.Pulse & ({
    pulse: 3
    spot?: TileCoordinates
  } | { pulse: 1 | 2 })

  export namespace PulseInformation {

    export function equals(a: PulseInformation, b: PulseInformation): boolean {
      return Pulse.equals(a, b) && !(a.pulse == 3 && (b.pulse == 3) && !TileCoordinates.eq2(a?.spot, b.spot))
    }
  }

  export function spot_narrowing(candidates: TileCoordinates[], area: TileArea, range: number): {
    pulse: PulseInformation,
    narrowed_candidates: TileCoordinates[]
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

  export function area_pulse(spot: TileCoordinates, area2: TileArea, range: number): Pulse[] {

    const pulse_hashes: Pulse.hash_t[] = []

    activate(area2).getTiles().forEach(t => {
      pulse_hashes.push(Pulse.hash(get_pulse(spot, t, range)))
    })

    return [...new Set(pulse_hashes).values()].map(Pulse.unhash)
  }

  export function narrow_down(candidates: TileCoordinates[], information: ScanInformation, range: number): TileCoordinates[] {
    return candidates.filter((s) => area_pulse(s, information.area, range).some((p2) => Pulse.equals(information, p2)))
  }
}