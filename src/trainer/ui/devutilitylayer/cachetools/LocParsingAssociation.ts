import {Vector2} from "../../../../lib/math";
import {Observable, observe} from "../../../../lib/reactive";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {CacheTypes} from "./CacheTypes";
import LocInstance = CacheTypes.LocInstance;

export type LocParsingAssociation = {
    parser_id: string,
    loc_groups: {
        locs_ids: number[],
        per_group_arg?: any,
        per_instance_data?: [
            { origin: TileCoordinates, data?: any }
        ]
    }[]
}

export type LocParsingTableData = {
    version: number,
    associations: LocParsingAssociation[]
}

export class LocParsingTable {
    data: LocParsingTableData
    loc_index: LocParsingAssociation[]

    version: Observable<number>

    constructor(data: LocParsingTableData) {
        this.data = data

        this.version = observe(data.version)

        this.loc_index = new Array(1000000)
    }

    associateNewGroup(loc_id: number, parser_id: string, data?: any): void {
        this.data.associations.push(this.loc_index[loc_id] = {
            parser_id: parser_id,
            loc_groups: [{locs_ids: [loc_id], per_group_arg: data}]
        })

        this.bumpVersion()
    }

    hasParser(instance: LocInstance): boolean {
        return !!this.loc_index[instance.loc_id]
    }

    associateLocWithExistingGroup(loc_id: number, parser_id: string, existing_loc: number): void {
        let association = this.data.associations.find(a => a.parser_id == parser_id)

        if (association) {

            const group = association.loc_groups.find(g => g.locs_ids.includes(existing_loc))

            if (group) {
                group.locs_ids.push(loc_id)
            }
        }
    }

    setInstanceData(loc_id: number, origin: Vector2, data: any) {

    }

    private bumpVersion() {
        this.data.version += 1

        this.version.set(this.data.version)
    }
}