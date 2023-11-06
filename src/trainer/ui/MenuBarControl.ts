import {Application} from "trainer/application";
import SearchControl from "./SearchControl";
import FilterControl from "./FilterControl";
import SolveControl from "./SolveControl";


export default class MenuBarControl {
    public filter: FilterControl
    public search: SearchControl
    public solve: SolveControl

    constructor(private app: Application) {
        this.filter = new FilterControl(app)
        this.search = new SearchControl(app)
        this.solve = new SolveControl(app)

        // Hide for now
        $("#infobutton").on("click", () => app.about_modal.show())
        $("#settingsbutton").hide()
    }
}