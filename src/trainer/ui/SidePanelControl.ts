import {ClueStep, ClueType} from "lib/runescape/clues";
import {Constants} from "trainer/constants";
import {Application} from "trainer/application";
import Widget from "./widgets/Widget";
import {observe} from "../../lib/properties/Observable";

export class SidePanel extends Widget {
    protected ui: {
        header: {
            title_span?: Widget,
            right_corner?: Widget
        }
    } = {header: {}}

    public title = observe("")

    constructor() {
        super();

        this.addClass("nisl-panel")

        c("<div style='display: flex'></div>").appendTo(this)
            .append(this.ui.header.title_span = c("<span class='nisl-panel-title'></span>"))
            .append(c("<span class='flex-grow-1'></span>"))
            .append(this.ui.header.right_corner = c("<span></span>"))

        this.title.subscribe(v => this.ui.header.title_span.text(v))
    }
}

export class NewCluePanel extends SidePanel {
    constructor(clue: ClueStep) {
        super();

        this.title.set("Clue")

        this.ui.header.right_corner
            .append(c(`<img class="icon" src='${clue.tier ? Constants.icons.tiers[clue.tier] : ""}' title="${ClueType.pretty(clue.tier)}">`))
            .append(c(`<img class="icon" src='${Constants.icons.types[clue.type]}' title="${ClueType.pretty(clue.type)}">`))


        this.append(c("<span></span>").text(clue.clue))
    }
}

export default class SidePanelControl extends Widget {
    constructor(public app: Application) {
        super($("#sidebar-panels"))

        this.empty()
    }

    add(panel: SidePanel, ordering: number) {
        const ORDER_DATA_NAME = "ctr-panel-index"

        panel.container.data(ORDER_DATA_NAME)

        let next = this.container.children().get().map(e => $(e)).find((e: JQuery) => (e.data(ORDER_DATA_NAME) as number) > ordering)

        if (!next) this.append(panel)
        else panel.container.insertBefore(next)
    }
}