import MapSideBar from "../MapSideBar";
import TheoryCrafter from "./TheoryCrafter";
import PackWidget from "./PackWidget";
import {MethodPackManager, Pack} from "../../model/MethodPackManager";
import * as lodash from "lodash";
import {C} from "../../../lib/ui/constructors";
import LightButton from "../widgets/LightButton";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import {ExportImport} from "../../../lib/util/exportString";
import {NewMethodPackModal} from "./MethodPackModal";
import btnrow = C.btnrow;
import h = C.h;
import imp = ExportImport.imp;

export default class TheoryCraftingSidebar extends MapSideBar {

  private methods: MethodPackManager

  constructor(public theorycrafter: TheoryCrafter) {
    super("Theorycrafter");

    this.css("width", "300px")

    this.methods = MethodPackManager.instance()

    this.methods.saved.on(async (p) => this.render(await this.methods.all())).bindTo(theorycrafter.handler_pool)
    this.methods.all().then(p => this.render(p))
  }

  render(packs: Pack[]) {
    this.body.empty()

    let grouped = lodash.groupBy(packs, p => p.type)

    h(2, "Default Method-Packs").appendTo(this.body)
    grouped["default"].forEach(p => {
      new PackWidget(p, MethodPackManager.instance(), {buttons: true, collapsible: true}).appendTo(this.body)
    })

    h(2, "Imported Method-Packs").appendTo(this.body)
    let imported = grouped["imported"] || []

    imported.forEach(p => {
      new PackWidget(p, MethodPackManager.instance(), {buttons: true, collapsible: true}).appendTo(this.body)
    })

    if (imported.length == 0) {
      c().text("No imported method packs.").appendTo(this.body)
    }

    btnrow(
      new LightButton("Import", "rectangle")
        .onClick(async () => {
          const imported = await new ImportStringModal<Pack>(imp({expected_type: "method-pack", expected_version: 1})).do()

          // TODO: This kinda sucks maybe

          if (imported?.imported) this.methods.import(imported.imported)
        })
    ).appendTo(this.body)

    let locals = grouped["local"] || []

    h(2, "Local Method-Packs").appendTo(this.body)

    locals.forEach(p => {
      new PackWidget(p, MethodPackManager.instance(), {buttons: true, collapsible: true}).appendTo(this.body)
    })

    if (locals.length == 0) {
      c().text("No local method packs.").appendTo(this.body)
    }

    btnrow(
      new LightButton("+ Create New", "rectangle")
        .onClick(() => {
          new NewMethodPackModal().do()
        })
    ).appendTo(this.body)

  }
}