import MapSideBar from "../MapSideBar";
import TheoryCrafter from "./TheoryCrafter";
import PackWidget from "./PackWidget";
import {Pack} from "../../model/MethodPackManager";

export default class TheoryCraftingSidebar extends MapSideBar {

    constructor(public theorycrafter: TheoryCrafter) {
        super("Theorycrafter");

        this.css("width", "300px")

        this.header.close_handler.set(() => theorycrafter.stop())

        this.theorycrafter.app.methods.pack_set_changed.on((p) => this.render(p)).bindTo(theorycrafter.handler_pool)
        this.theorycrafter.app.methods.all().then(p => this.render(p))
    }

    render(packs: Pack[]) {
        this.body.empty()

        packs.forEach(p => {
            new PackWidget(p, this.theorycrafter.app.methods).appendTo(this.body)
        })
    }
}