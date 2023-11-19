import MapSideBar from "../MapSideBar";
import TheoryCrafter from "./TheoryCrafter";

export default class TheoryCraftingSidebar extends MapSideBar {

    constructor(public theorycrafter: TheoryCrafter) {
        super("Theorycrafter");

        this.header.close_handler.set(() => theorycrafter.stop())
    }

}