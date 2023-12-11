import {Application} from "trainer/application";
import SearchControl from "./SearchControl";
import SolveControl from "./SolveControl";


export default class MenuBarControl {
    public search: SearchControl
    public solve: SolveControl

    constructor(private app: Application) {
        this.search = new SearchControl(app)
        this.solve = new SolveControl(app)
    }
}