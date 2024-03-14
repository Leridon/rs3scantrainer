import {Vector2} from "../../../../lib/math";
import {Observable, observe} from "../../../../lib/reactive";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {CacheTypes} from "./CacheTypes";
import LocInstance = CacheTypes.LocInstance;
import {TransportParser2} from "./TransportParser";
import {util} from "../../../../lib/util/util";
import todo = util.todo;
import {parsers3} from "./parsers3";

export type LocParsingAssociation = {
    parser_id: string,
    loc_ids: number[],
    per_group_arg?: any,
    per_instance_data?: {
        loc_id: number,
        origin: TileCoordinates,
        data: any
    }[]
}

export type LocParsingTableData = {
    version: number,
    associations: LocParsingAssociation[]
}


export type ParserPairing = {
    parser: TransportParser2,
    same_group_as_loc?: number,
    group_data?: any,
    instance_data?: any,
} | null

export class LocParsingTable {
    data: LocParsingTableData
    loc_index: LocParsingAssociation[]

    version: Observable<number>

    constructor(data: LocParsingTableData) {
        this.data = data

        this.version = observe(data.version)

        this.loc_index = new Array(1000000)

        this.data.associations.forEach(association => {
            association.loc_ids.forEach(loc_id => {
                this.loc_index[loc_id] = association
            })
        })
    }

    setPairing(loc: LocInstance, pairing: ParserPairing): void {

        const existing = this.loc_index[loc.loc_id]

        if (!existing || existing.parser_id != pairing?.parser?.id || !existing.loc_ids.includes(pairing?.same_group_as_loc)) {
            // Either the loc has no association at all, or its association is with the wrong parser group

            if (existing) {
                // An association exists, which means it must be completely removed

                // Remove entire loc from group
                existing.loc_ids.splice(existing.loc_ids.indexOf(loc.loc_id), 1)

                if (existing.loc_ids.length < 0) {
                    // Group is now empty, remove it entirely
                    this.data.associations.splice(this.data.associations.indexOf(existing), 1)
                } else {
                    // Remove instance data for all instances of the loc we just removed from the group
                    if (existing.per_instance_data) {
                        existing.per_instance_data = existing.per_instance_data.filter(i => i.loc_id != loc.loc_id)
                    }
                }

                this.loc_index[loc.loc_id] = undefined
            }

            if (pairing) {
                // Should create an association

                // Find a fitting group
                let group = this.data.associations.find(g =>
                    g.parser_id == pairing.parser.id &&
                    (!pairing.parser.per_loc_group_parameter || g.loc_ids.includes(pairing.same_group_as_loc))
                )

                if (!group) {
                    // No group exists, create one

                    group = {
                        parser_id: pairing.parser.id,
                        loc_ids: [],
                    }

                    this.data.associations.push(group)
                }

                group.loc_ids.push(loc.loc_id)

                if (pairing.group_data) {
                    group.per_group_arg = pairing.group_data
                }

                if (pairing.parser.per_instance_parameter && pairing.instance_data) {
                    group.per_instance_data = [{
                        loc_id: loc.loc_id,
                        origin: loc.origin,
                        data: pairing.instance_data
                    }]
                }

                this.loc_index[loc.loc_id] = group
            }
        } else {
            // An association exists and is in the correct group

            if (pairing.parser.per_loc_group_parameter) {
                // Set the group arg to the new value
                existing.per_group_arg = pairing.group_data ?? existing.per_group_arg
            }

            if (pairing.parser.per_instance_parameter) {
                if (!existing.per_instance_data) {
                    existing.per_instance_data = []
                }

                const existing_instance_data = existing.per_instance_data.find(i => {
                    i.loc_id == loc.loc_id && TileCoordinates.eq(i.origin, loc.origin)
                })

                if (existing_instance_data) {
                    existing_instance_data.data = pairing.instance_data
                } else {
                    existing.per_instance_data.push({
                        loc_id: loc.loc_id,
                        origin: loc.origin,
                        data: pairing.instance_data
                    })
                }
            }
        }

        this.bumpVersion()
    }

    getPairing(loc: LocInstance): ParserPairing {
        const group = this.loc_index[loc.loc_id]

        if (!group) return null

        return {
            parser: parsers3.find(p => p.id == group.parser_id),
            same_group_as_loc: group.loc_ids.find(i => i != loc.loc_id),
            group_data: group.per_group_arg,
            instance_data: group.per_instance_data?.find(i =>
                i.loc_id == loc.loc_id && TileCoordinates.eq(i.origin, loc.origin)
            )?.data
        }

    }

    private bumpVersion() {
        this.data.version += 1

        this.version.set(this.data.version)
    }
}