import {TransportParsers} from "./parsers2";
import {TransportParser2} from "./TransportParser";
import {CacheTypes} from "./CacheTypes";
import {LocParsingTable} from "./LocParsingAssociation";
import {Transportation} from "../../../../lib/runescape/transportation";
import {parsers3} from "./parsers3";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";

export namespace Parsing {

    import LocDataFile = CacheTypes.LocDataFile;

    export async function applyParsing(parsers: TransportParser2[], data: LocDataFile, parsing_table: LocParsingTable): Promise<Transportation.Transportation[]> {
        let results: Transportation.Transportation[] = []

        for (const association of parsing_table.data.associations) {

            const parser = parsers3.find(p => p.id == association.parser_id)

            if (!parser) {
                console.error(`Parser ${association.parser_id} is not defined!`)
                return
            }

            for (const loc_id of association.loc_ids) {
                const instances = data.get(loc_id)

                if (instances.length == 0) {
                    console.error(`Zero instances returned for loc ${loc_id}!`)
                }

                for (const instance of instances) {
                    const per_instance_arg = association.per_instance_data?.find(({origin}) => TileCoordinates.eq(origin, instance.origin))?.data

                    try {
                        const res = await parser.apply(instance, {per_loc: association.per_group_arg, per_instance: per_instance_arg})

                        results.push(...res)
                    } catch (e) {
                        console.error(`Parser ${association.parser_id} has thrown an exception!`)
                        console.log(e)
                    }
                }
            }

        }

        return results
    }
}