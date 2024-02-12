import Widget from "../../../lib/ui/Widget";
import {FavouriteIcon, NislIcon} from "../nisl";
import NeoSolvingBehaviour, {NeoSolving} from "./NeoSolvingBehaviour";
import {Observable, observe} from "../../../lib/reactive";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {C} from "../../../lib/ui/constructors";
import spacer = C.spacer;
import span = C.span;
import hbox = C.hbox;
import bold = C.bold;
import {AbstractDropdownSelection} from "../widgets/AbstractDropdownSelection";

export default class MethodSelector extends Widget {
    public method: Observable<AugmentedMethod>

    private row: Widget

    constructor(private parent: NeoSolvingBehaviour) {
        super()

        this.method = observe(parent.active_method)

        this.method.subscribe(m => this.render(m), true)
    }

    private render(method: AugmentedMethod) {
        this.row = hbox(
            method
                ? bold(method.method.name)
                : c("<span style='font-style: italic; color: gray'> No method selected</span>"),
            spacer(),
            NislIcon.dropdown(),
        )
            .addClass("ctr-clickable")
            .setAttribute("tabindex", "-1")

        this.row.on("click", () => this.openMethodSelection())
            .appendTo(this)
    }

    private async openMethodSelection() {
        new AbstractDropdownSelection.DropDown<AugmentedMethod>({
            dropdownClass: "ctr-neosolving-favourite-dropdown",
            renderItem: m => {

                if (!m) {
                    return hbox(
                        new FavouriteIcon().set(m == this.parent.active_method),
                        span("None"),
                        spacer()
                    )
                } else {
                    // TODO: Add tippy tooltip with more details for the method

                    return hbox(
                        new FavouriteIcon().set(m == this.parent.active_method),
                        span(`${m.method.name} (${m.method.expected_time ?? "?"} ticks)`),
                        spacer()
                    ).tooltip(m.method.description)
                }
            }
        })
            .setItems((await MethodPackManager.instance().getForClue(this.parent.active_clue.step.id)).concat([null]))
            .onSelected(m => {
                this.parent.app.favourites.setMethod(m)
                this.parent.setMethod(m)
            })
            .open(this.row, this.row)
    }
}