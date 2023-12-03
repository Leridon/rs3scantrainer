import MapSideBar from "../MapSideBar";
import TheoryCrafter from "./TheoryCrafter";
import PackWidget from "./PackWidget";
import {MethodPackManager, Pack} from "../../model/MethodPackManager";
import * as lodash from "lodash";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import LightButton from "../widgets/LightButton";
import btnrow = C.btnrow;
import h = C.h;
import ImportStringModal from "../widgets/modals/ImportStringModal";
import {ExportImport} from "../../../lib/util/exportString";
import imp = ExportImport.imp;

export default class TheoryCraftingSidebar extends MapSideBar {

    private methods: MethodPackManager

    constructor(public theorycrafter: TheoryCrafter) {
        super("Theorycrafter");

        this.css("width", "300px")

        this.methods = theorycrafter.app.methods

        this.header.close_handler.set(() => theorycrafter.stop())

        this.methods.pack_set_changed.on((p) => this.render(p)).bindTo(theorycrafter.handler_pool)
        this.methods.all().then(p => this.render(p))
    }

    render(packs: Pack[]) {
        this.body.empty()

        let grouped = lodash.groupBy(packs, p => p.type)

        h(2, "Default Packs").appendTo(this.body)
        grouped["default"].forEach(p => {
            new PackWidget(p, this.theorycrafter.app.methods).appendTo(this.body)
        })

        h(2, "Imported Packs").appendTo(this.body)
        let imported = grouped["imported"] || []

        imported.forEach(p => {
            new PackWidget(p, this.theorycrafter.app.methods).appendTo(this.body)
        })

        if (imported.length == 0) {
            c().text("No imported method packs.").appendTo(this.body)
        }

        btnrow(
            new LightButton("Import", "rectangle")
                .onClick(async () => {
                    await this.methods.import(await ImportStringModal.do<Pack>(imp({expected_type: "method-pack", expected_version: 1})))
                })
        ).appendTo(this.body)

        let locals = grouped["local"] || []

        h(2, "Local Packs").appendTo(this.body)

        locals.forEach(p => {
            new PackWidget(p, this.theorycrafter.app.methods).appendTo(this.body)
        })

        if (locals.length == 0) {
            c().text("No local method packs.").appendTo(this.body)
        }

        btnrow(
            new LightButton("+ Create New", "rectangle")
                .onClick(() => {
                    this.methods.create({
                        type: "local",
                        id: "",
                        timestamp: 0,
                        author: "Anonymous",
                        name: "New Method Pack",
                        description: "No description",
                        methods: []
                    })
                })
        ).appendTo(this.body)

    }
}