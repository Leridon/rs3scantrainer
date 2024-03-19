import {Vector2} from "../../../../lib/math";
import {Observable, observe} from "../../../../lib/reactive";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {CacheTypes} from "./CacheTypes";
import LocInstance = CacheTypes.LocInstance;
import {TransportParser, TransportParser2} from "./TransportParser";
import {util} from "../../../../lib/util/util";
import todo = util.todo;
import {Parsers3, parsers3} from "./parsers3";
import ignore = TransportParser.ignore;

export type ParsingAssociationGroup = {
    parser_id: string,
    group_id: number,
    group_name: string,
    loc_ids: number[],
    per_group_arg?: any,
    instance_groups: {
        id: number
        name: string,
        instances: { loc: number, origin: TileCoordinates }[],
        per_instance_argument: any
    }[]
}

export type LocParsingTableData = {
    version: number,
    associations: ParsingAssociationGroup[]
}


export type ParserPairing = {
    group: {
        parser: TransportParser2,
        id: number,
        name: string,
        argument: any
    } | null,
    instance_group: {
        id: number,
        name: string,
        argument: any
    } | null
}

export class LocParsingTable {
    data: LocParsingTableData
    loc_index: ParsingAssociationGroup[]

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

    setPairing(loc: LocInstance, pairing: ParserPairing): ParserPairing {

        (() => {
            let currently_in_group: ParsingAssociationGroup = this.loc_index[loc.loc_id]

            if (currently_in_group && currently_in_group.group_id != pairing.group?.id) {
                // There already is a pairing for that loc in the wrong group, remove it entirely

                // The loc is in the wrong group, remove it entirely

                // Remove entire loc from group
                currently_in_group.loc_ids.splice(currently_in_group.loc_ids.indexOf(loc.loc_id), 1)

                if (currently_in_group.loc_ids.length < 0) {
                    // Group is now empty, remove it entirely
                    this.data.associations.splice(this.data.associations.indexOf(currently_in_group), 1)
                }

                this.loc_index[loc.loc_id] = currently_in_group = undefined
            }

            // If the pairing is "null", we are done
            if (!pairing.group) return

            if (!currently_in_group) {
                // It's not (anymore) in a loc group but should be, add it

                const correct_group = this.data.associations.find(group => group.group_id == pairing.group.id)

                if (correct_group) {
                    // there already is a group with the desired id
                    correct_group.loc_ids.push(loc.loc_id)
                    currently_in_group = correct_group
                } else {
                    // there is no correct group, create it
                    this.data.associations.push(currently_in_group = {
                        group_id: this.data.version,
                        loc_ids: [loc.loc_id],
                        per_group_arg: undefined,
                        group_name: "",
                        instance_groups: [],
                        parser_id: ""
                    })
                }
            }

            pairing.group.id = currently_in_group.group_id

            // Update group data now
            this.loc_index[loc.loc_id] = currently_in_group

            currently_in_group.parser_id = pairing.group.parser.id
            currently_in_group.per_group_arg = pairing.group.argument
            currently_in_group.group_name = pairing.group.name

            let currently_in_igroup = currently_in_group.instance_groups.find(igroup =>
                igroup.instances.some(i => i.loc == loc.loc_id && TileCoordinates.eq(i.origin, loc.origin))
            )

            if (currently_in_igroup && currently_in_igroup.id != pairing.instance_group?.id) {
                // this instance is already in an instance group, remove it

                const i = currently_in_igroup.instances.findIndex(i => i.loc == loc.loc_id && TileCoordinates.eq(i.origin, loc.origin))

                currently_in_igroup.instances.splice(i, 1)

                currently_in_group.instance_groups = currently_in_group.instance_groups.filter(igroup => igroup.instances.length > 0)

                currently_in_igroup = undefined
            }

            if (!pairing.instance_group) return

            if (!currently_in_igroup) {
                const correct_group = currently_in_group.instance_groups.find(igroup => igroup.id == pairing.instance_group.id)

                if (correct_group) {
                    correct_group.instances.push({loc: loc.loc_id, origin: loc.origin})
                    currently_in_igroup = correct_group
                } else {
                    currently_in_group.instance_groups.push(currently_in_igroup = {
                        id: this.data.version,
                        name: "",
                        instances: [{loc: loc.loc_id, origin: loc.origin}],
                        per_instance_argument: undefined,
                    })
                }
            }

            pairing.instance_group.id = currently_in_igroup.id

            // Finally set the instance group data
            currently_in_igroup.per_instance_argument = pairing.instance_group.argument
            currently_in_igroup.name = pairing.instance_group.name
        })()

        this.bumpVersion()

        return pairing
    }

    reset() {
        this.data.version = -1
        this.data.associations = []

        this.bumpVersion()
    }

    getGroupForLoc(loc_id: number): ParsingAssociationGroup {
        return this.loc_index[loc_id]
    }

    getGroup(group_id: number): ParsingAssociationGroup {
        return this.data.associations.find(g => g.group_id == group_id)
    }

    getGroup2(parser: TransportParser2, id: number): ParserPairing["group"] {
        const a = this.data.associations.find(a => a.parser_id == parser.id && (id < 0 || a.group_id == id))

        if (a) {
            return {
                parser: parser,
                id: a.group_id,
                name: a.group_name,
                argument: a.per_group_arg
            }
        } else {
            return {
                parser: parser,
                id: -1,
                name: "",
                argument: undefined
            }
        }

    }

    getPairing(loc: LocInstance): ParserPairing {
        const group = this.loc_index[loc.loc_id]

        if (!group) return {group: null, instance_group: null}

        const instance_group = group?.instance_groups?.find(igroup =>
            igroup.instances.some(i => i.loc == loc.loc_id && TileCoordinates.eq(i.origin, loc.origin))
        )

        return {
            group:
                group ? {
                    parser: parsers3.find(p => p.id == group.parser_id),
                    id: group.group_id,
                    name: group.group_name,
                    argument: group.per_group_arg
                } : null,
            instance_group: instance_group
                ? {
                    id: instance_group.id,
                    name: instance_group.name,
                    argument: instance_group.per_instance_argument,
                } : null
        }
    }

    private bumpVersion() {
        this.data.version += 1

        this.version.set(this.data.version)
    }
}