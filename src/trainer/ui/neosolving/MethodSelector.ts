import Widget from "../../../lib/ui/Widget";
import {NislIcon} from "../nisl";
import NeoSolvingBehaviour, {NeoSolving} from "./NeoSolvingBehaviour";
import {Observable, observe} from "../../../lib/reactive";
import {AugmentedMethod} from "../../model/MethodPackManager";
import {C} from "../../../lib/ui/constructors";
import spacer = C.spacer;
import span = C.span;
import hbox = C.hbox;

export default class MethodSelector extends Widget {
    public method: Observable<AugmentedMethod>

    constructor(private parent: NeoSolvingBehaviour) {
        super()

        this.method = observe(parent.active_method)

        this.method.subscribe(m => this.render(m), true)
    }

    private render(method: AugmentedMethod) {
        let row = hbox(
            method
                ? span(method.method.name)
                : c("<span style='font-style: italic; color: gray'> No method selected</span>"),
            spacer(),
            NislIcon.dropdown(),
        )
            .addClass("ctr-clickable")
            .setAttribute("tabindex", "-1")

        row.on("click", () => NeoSolving.openMethodSelection(this.parent, row))
            .appendTo(this)
    }
}