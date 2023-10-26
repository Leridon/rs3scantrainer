import {Application} from "trainer/application";
import * as fuzzysort from "fuzzysort";
import {Constants} from "trainer/constants";

export default class SearchControl {
    private menubarcontrols = $("#menubarcontrols")
    private are_controls_visible = true

    private search_box =
        $("#cluesearchbox")
            .on("input", (e) => {
                this.update()

                if (this.are_controls_visible) {
                    this.menubarcontrols.animate({"width": 'toggle'})
                    this.are_controls_visible = false
                }
            })
            .on("focusin", () => {
                this.search_box.val("")
                this.update()

                if (this.are_controls_visible) {
                    this.menubarcontrols.animate({"width": 'toggle'})
                    this.are_controls_visible = false
                }
            })
            .on("focusout", (e) => {
                let reltgt = $(e.relatedTarget)

                this.search_box.val("")

                if (reltgt.hasClass("cluesearchresult") && reltgt.data("clue")) {
                    this.app.sidepanels.clue_panel.selectClue(reltgt.data("clue"))
                    this.search_box.val("")
                }

                this.search_results.hide()

                if (!this.are_controls_visible) {
                    this.menubarcontrols.animate({"width": 'toggle'})
                    this.are_controls_visible = true
                }
            })

    private search_results = $("#searchresults").hide()
        .on("click", (e) => {
            if ($(e.target).data("clue")) {
                this.app.sidepanels.clue_panel.selectClue($(e.target).data("clue"))
                this.search_box.val("")
            }
        })

    constructor(private app: Application) {
        $(".filterbutton").each((i, e) => {
            let src = ""

            if ($(e).data().type) {
                src = Constants.icons.types[$(e).data().type]
            } else if ($(e).data().tier) {
                src = Constants.icons.tiers[$(e).data().tier]
            }

            $(e).children("img").first().attr("src", src)
        })
    }

    update() {
        let term = this.search_box.val() as string

        let results = fuzzysort.go(term, this.app.menubar.filter.getCandidates(), {
            key: "clue",
            all: true,
            threshold: -10000
        })

        if (results.length > 0) this.search_results.show()
        else this.search_results.hide()

        let box = this.search_results.empty()

        for (let e of results) {
            let inner = term
                ? fuzzysort.highlight(e, `<span class="fuzzyhighlight">`, "</span>")
                : e.target

            $("<div>")
                .addClass("cluesearchresult")
                .attr("tabindex", -1)
                .data("clue", e.obj)
                .html(inner)
                .appendTo(box)
        }
    }
}
