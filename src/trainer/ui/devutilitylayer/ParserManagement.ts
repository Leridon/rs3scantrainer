import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {FilteredLocLayer, LocInstanceEntity} from "./FilteredLocLayer";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import ButtonRow from "../../../lib/ui/ButtonRow";
import {LocParsingTable, LocParsingTableData} from "./cachetools/LocParsingAssociation";
import KeyValueStore from "../../../lib/util/KeyValueStore";
import LightButton from "../widgets/LightButton";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import {util} from "../../../lib/util/util";
import cleanedJSON = util.cleanedJSON;
import {parsers3} from "./cachetools/parsers3";
import {LocUtil} from "./cachetools/util/LocUtil";
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import {Parsing} from "./cachetools/Parsing";
import {CacheTypes} from "./cachetools/CacheTypes";
import LocDataFile = CacheTypes.LocDataFile;

export class ParserManagementLayer extends GameLayer {
    loc_layer: FilteredLocLayer

    local_store_id = "devutility/locparsing/parserassociations"
    repo_version_number: number

    parsing_table: LocParsingTable
    data_file: LocDataFile

    constructor() {
        super();

        new GameMapControl({type: "gapless", position: "bottom-center"}, c())
            .setContent(
                new ButtonRow()
                    .buttons(
                        new LightButton("Export")
                            .onClick(() => {
                                new ExportStringModal(cleanedJSON(this.parsing_table.data)).show()
                            }),
                        new LightButton("Apply parsers")
                            .onClick(async () => {
                                const results = await Parsing.applyParsing(parsers3, this.data_file, this.parsing_table)

                                new ExportStringModal(cleanedJSON(results)).show()
                            })
                    )
            ).addTo(this)

        this.init()
    }

    async init() {

        let local_data: LocParsingTableData = await KeyValueStore.instance().get<LocParsingTableData>(this.local_store_id)
        let repo_data: LocParsingTableData = await (await fetch("map/parsing_associations.json")).json().catch(() => undefined)

        this.repo_version_number = repo_data?.version ?? -1

        let most_current_data: LocParsingTableData = {
            version: 0,
            associations: []
        }

        if (local_data?.version ?? -1 > most_current_data.version) most_current_data = local_data
        if (repo_data?.version ?? -1 > most_current_data.version) most_current_data = repo_data

        this.parsing_table = new LocParsingTable(most_current_data)

        this.parsing_table.version.subscribe(async () => {
            await KeyValueStore.instance().set(this.local_store_id, this.parsing_table.data)
        })

        this.data_file = await LocDataFile.fromURL("map/raw_loc_data.json")

        this.loc_layer = new FilteredLocLayer(this.data_file, this.parsing_table).addTo(this)
    }

    eventContextMenu(event: GameMapContextMenuEvent) {

        event.onPre(() => {
            if (event.active_entity instanceof LocInstanceEntity) {
                const instance = event.active_entity.instance

                event.addForEntity({
                    type: "basic",
                    text: "Associate with door parser",
                    handler: () => {
                        this.parsing_table.associateNewGroup(instance.loc_id, "west-facing-doors")

                    }
                })
            }
        })
    }
}