import {TransportParser} from "./TransportParser";
import {CacheTypes} from "./CacheTypes";
import {LocParsingTable} from "./ParsingTable";
import {Transportation} from "../../../../lib/runescape/transportation";
import {parsers3} from "./parsers3";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {Rectangle} from "../../../../lib/math";

export namespace Parsing {

  import LocDataFile = CacheTypes.LocDataFile;

  export async function applyParsing(parsers: TransportParser[], data: LocDataFile, parsing_table: LocParsingTable): Promise<Transportation.Transportation[]> {
    let results: Transportation.Transportation[] = []

    for (const loc_group of parsing_table.data.associations) {

      const parser = parsers3.find(p => p.id == loc_group.parser_id)

      if (!parser) {
        console.error(`Parser ${loc_group.parser_id} is not defined!`)
        return
      }

      for (const loc_id of loc_group.loc_ids) {
        const instances = data.get(loc_id)

        if (instances.length == 0) {
          console.error(`Zero instances returned for loc ${loc_id}!`)
        }

        for (const instance of instances) {
          const per_instance_arg =
            parser.per_instance_parameter
              ? loc_group.instance_groups?.find(igroup =>
                igroup.instances.some(i => i.loc == loc_id && TileCoordinates.eq(i.origin, instance.origin))
              )?.per_instance_argument
              : undefined

          if (!parser.instance_group_required || per_instance_arg !== undefined) {
            try {
              const res = await parser.apply(instance, {per_loc: loc_group.per_group_arg, per_instance: per_instance_arg})

              for (const s of res) {
                if (s.type == "entity") {

                  for (const a of s.actions) {
                    for (let m of a.movement) {
                      if (m.fixed_target) {
                        const n = TileArea.normalize(m.fixed_target.target)

                        if (!Rectangle.contains(Rectangle.fromOriginAndSize({x: 0, y: 0}, {x: 100 * 64, y: 200 * 64}), n.origin)) {
                          console.log(instance.locid)
                          debugger
                        }

                      }
                    }
                  }
                }
              }

              results.push(...res)
            } catch (e) {
              console.error(`Parser ${loc_group.parser_id} has thrown an exception!`)
              console.log(e)
            }
          }
        }
      }

    }

    return results
  }
}