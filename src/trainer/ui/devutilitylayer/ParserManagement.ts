import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {FilteredLocLayer, LocInstanceEntity} from "./FilteredLocLayer";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import ButtonRow from "../../../lib/ui/ButtonRow";
import {LocParsingTable, LocParsingTableData, ParserPairing, ParsingAssociationGroup} from "./cachetools/ParsingTable";
import KeyValueStore from "../../../lib/util/KeyValueStore";
import LightButton from "../widgets/LightButton";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import {util} from "../../../lib/util/util";
import {hardcoded_transports, Parsers3, parsers3} from "./cachetools/parsers3";
import {Parsing} from "./cachetools/Parsing";
import {CacheTypes} from "./cachetools/CacheTypes";
import {ParserPairingModal} from "./cachetools/ParserPairingModal";
import {storage} from "../../../lib/util/storage";
import {ConfirmationModal} from "../widgets/modals/ConfirmationModal";
import {PrototypeExplorer} from "./cachetools/PrototypeExplorer";
import ControlWithHeader from "../map/ControlWithHeader";
import {ProcessedCacheTypes} from "./cachetools/ProcessedCacheTypes";
import {FilteredPrototypeLayer, PrototypeFilter, PrototypeInstanceDataSource} from "./cachetools/FilteredPrototypeLayer";
import cleanedJSON = util.cleanedJSON;
import LocDataFile = CacheTypes.LocDataFile;
import LocInstance = CacheTypes.LocInstance;
import PrototypeIndex = ProcessedCacheTypes.PrototypeIndex;

class RecentlyUsedParserGroups {
  last_used_groups = new storage.Variable<number[]>("devutility/locparsing/recentgroups", () => [])

  constructor(private table: LocParsingTable) {

  }

  use(group: number) {
    this.last_used_groups.set([group].concat(this.last_used_groups.get().filter(i => i != group)).slice(0, 5))
  }

  get(): ParsingAssociationGroup[] {
    return this.last_used_groups.get().map(i => this.table.getGroup(i)).filter(g => !!g && g.group_name.length > 0)
  }
}

export class ParserManagementLayer extends GameLayer {
  private prototypes: Promise<PrototypeIndex>

  private loc_layer2: FilteredPrototypeLayer

  loc_layer: FilteredLocLayer

  local_store = KeyValueStore.instance().variable<LocParsingTableData>("devutility/locparsing/parserassociations")
  recents: RecentlyUsedParserGroups

  repo_version_number: number

  parsing_table: LocParsingTable
  data_file: LocDataFile

  private prototype_explorer: PrototypeExplorer

  constructor() {
    super();

    new GameMapControl({type: "floating", position: "left-top"},
      new ControlWithHeader("Prototype Explorer")
        .setContent(this.prototype_explorer = new PrototypeExplorer([]))
    ).addTo(this)

    new GameMapControl({type: "gapless", position: "bottom-center"}, c())
      .setContent(
        new ButtonRow()
          .buttons(
            new LightButton("Export")
              .onClick(() => {
                //download("parsingtable.json", cleanedJSON(this.parsing_table.data))
                new ExportStringModal(cleanedJSON(this.parsing_table.data, 4)).show()
              }),
            new LightButton("Delete local table")
              .onClick(async () => {
                const really = await new ConfirmationModal({
                  body: "Do you really want to delete local parsing associations?",
                  options: [
                    {value: false, kind: "neutral", text: "Cancel"},
                    {value: true, kind: "cancel", text: "Delete"}
                  ]
                }).do()

                if (really) this.parsing_table.reset()
              }),
            new LightButton("Apply parsers")
              .onClick(async () => {
                const results = await Parsing.applyParsing(parsers3, this.data_file, this.parsing_table)

                results.push(...hardcoded_transports())

                new ExportStringModal(cleanedJSON(results), `Parsed ${results.length} transports.`).show()
              }),
          )
      ).addTo(this)

    this.loc_layer2 = new FilteredPrototypeLayer(PrototypeFilter.pre_filter()).addTo(this)

    this.init()
  }

  async init() {
    this.prototypes = fetch("rscache/prototypes.json").then(async res => new PrototypeIndex(await res.json()))

    this.prototypes.then(p => this.prototype_explorer.setPrototypes(p.data))

    fetch("rscache/prototype_instances.json")
      .then(async res => (await res.json()) as ProcessedCacheTypes.Instance[])
      .then(async (res: ProcessedCacheTypes.Instance[]) => {
        const index = await this.prototypes

        console.log(`${res.length} instances`)

        this.loc_layer2.addDataSource(
          PrototypeInstanceDataSource.fromList(res.map(i => index.resolve(i)))
        )
      })

    return // TODO:

    let local_data: LocParsingTableData = await this.local_store.get()
    let repo_data: LocParsingTableData = await (await fetch("map/parsing_associations.json")).json().catch(() => undefined)

    this.repo_version_number = repo_data?.version ?? -1

    let most_current_data: LocParsingTableData = {
      version: 0,
      custom_objects: {
        locs: [],
      },
      associations: []
    }

    if ((local_data?.version ?? -1) > most_current_data.version) most_current_data = local_data
    if ((repo_data?.version ?? -1) > most_current_data.version) most_current_data = repo_data

    this.parsing_table = new LocParsingTable(most_current_data)

    this.recents = new RecentlyUsedParserGroups(this.parsing_table)

    this.parsing_table.version.subscribe(async () => {
      await this.local_store.set(this.parsing_table.data)
    })

    this.data_file = await LocDataFile.fromURL("map/raw_loc_data.json")

    this.loc_layer = new FilteredLocLayer(this.data_file, this.parsing_table).addTo(this)
  }

  commitPairing(loc: LocInstance, pairing: ParserPairing) {
    const resultpair = this.parsing_table.setPairing(loc, pairing)

    if (resultpair.group && resultpair.group.name != "") this.recents.use(resultpair.group.id)
  }

  eventContextMenu(event: GameMapContextMenuEvent) {

    event.onPre(() => {
      if (event.active_entity instanceof LocInstanceEntity) {
        const instance = event.active_entity.instance

        const pairing = this.parsing_table.getPairing(instance)

        const recently_used = this.recents.get()

        event.addForEntity({
          type: "basic",
          text: "Edit pairing",
          handler: async () => {
            let result = await new ParserPairingModal(instance, this.parsing_table, pairing).do()

            if (result.type == "saved") {
              this.commitPairing(instance, result.pairing)
            }
          }
        })

        if (this.parsing_table.getPairing(instance).group) {
          event.addForEntity({
            type: "basic",
            text: "Remove pairing",
            handler: () => this.commitPairing(instance, {group: null, instance_group: null})
          })
        } else {

          recently_used.forEach(g => {
            event.addForEntity({
              type: "basic",
              text: `Pair with '${g.group_name}'`,
              handler: async () => {
                const pair: ParserPairing = {
                  group: {
                    parser: Parsers3.getById(g.parser_id),
                    id: g.group_id,
                    name: g.group_name,
                    argument: g.per_group_arg
                  },
                  instance_group: undefined
                }

                if (pair.group.parser.instance_group_required) {
                  let result = await new ParserPairingModal(instance, this.parsing_table, pair).do()

                  if (result.type == "saved") {
                    this.commitPairing(instance, result.pairing)
                  }
                } else {
                  this.commitPairing(instance, pair)
                }
              }
            })
          })

          /*
          event.addForEntity({
              type: "basic",
              text: "Pair as standard door",
              handler: () => {
                  this.commitPairing(instance, {
                      group: this.parsing_table.getGroup2(Parsers3.getById("west-facing-doors"), -1),
                      instance_group: null
                  })
              }
          })*/
        }
      }
    })
  }
}