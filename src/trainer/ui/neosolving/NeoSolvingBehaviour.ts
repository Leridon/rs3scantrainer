import Behaviour from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import GameLayer from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {C} from "../../../lib/ui/constructors";
import Widget from "../../../lib/ui/Widget";
import Button from "../../../lib/ui/controls/Button";
import TextField from "../../../lib/ui/controls/TextField";
import {ExpansionBehaviour} from "../../../lib/ui/ExpansionBehaviour";
import {AbstractDropdownSelection} from "../widgets/AbstractDropdownSelection";
import {Clues} from "../../../lib/runescape/clues";
import {clue_data} from "../../../data/clues";
import PreparedSearchIndex from "../../../lib/util/PreparedSearchIndex";
import {Observable, observe} from "../../../lib/reactive";

class NeoSolvingLayer extends GameLayer {
    public control_bar: NeoSolvinglayer.MainControlBar
    public clue_container: Widget
    public solution_container: Widget

    constructor(private behaviour: NeoSolvingBehaviour) {
        super();

        let sidebar = new GameMapControl({
            position: "top-left",
            type: "floating",
            no_default_styling: true
        }, c().addClass("ctr-neosolving-sidebar")).addTo(this)

        sidebar.content.append(
            new NeoSolvinglayer.MainControlBar(behaviour),
            this.clue_container = c(),
            this.solution_container = c()
        )
    }
}

namespace NeoSolvinglayer {
    import spacer = C.spacer;
    import hbox = C.hbox;
    import Step = Clues.Step;


    class MainControlButton extends Button {
        constructor(options: { icon?: string, text?: string }) {
            super();

            if (options.icon) {
                this.append(c(`<img src="${options.icon}" class="ctr-neosolving-main-bar-icon">`))
            }

            if (options.text) {
                this.append(c().text(options.text))
                if (options.icon) {
                    this.append(spacer())
                } else {
                    this.css("justify-content", "center")
                }
                this.css("flex-grow", "1")
            }

            this.addClass("ctr-neosolving-main-bar-button")
                .addClass("ctr-neosolving-main-bar-section")
        }
    }

    export class MainControlBar extends Widget {
        search_bar: TextField
        rest: Widget

        search_bar_collapsible: ExpansionBehaviour
        rest_collapsible: ExpansionBehaviour

        dropdown: AbstractDropdownSelection.DropDown<{ step: Clues.Step, text_index: number }> = null

        prepared_search_index: PreparedSearchIndex<{ step: Clues.Step, text_index: number }>

        constructor(private parent: NeoSolvingBehaviour) {
            super();

            this.addClass("ctr-neosolving-main-bar")

            this.prepared_search_index = new PreparedSearchIndex<{ step: Clues.Step, text_index: number }>(
                clue_data.all.flatMap(step => step.text.map((_, i) => ({step: step, text_index: i}))),
                (step) => step.step.text[step.text_index]
                , {
                    all: true,
                    threshold: -10000
                }
            )

            this.dropdown = new AbstractDropdownSelection.DropDown<{ step: Clues.Step, text_index: number }>({
                dropdownClass: "ctr-neosolving-search-dropdown",
                renderItem: e => {
                    return c().text(Step.shortString(e.step, e.text_index))
                }
            })
                .onSelected(clue => {
                    this.search_bar_collapsible.collapse()

                    this.parent.solveClue(clue)
                })
                .setItems([])

            this.append(
                new MainControlButton({icon: "assets/icons/glass.png"})
                    .append(this.search_bar = new TextField()
                        .css("flex-grow", "1")
                        .setPlaceholder("Enter Search Term...")
                        .toggleClass("nisinput", false)
                        .addClass("ctr-neosolving-main-bar-search")
                        .setVisible(false)
                        .onChange(({value}) => {
                            let results = this.prepared_search_index.search(value)

                            this.dropdown.setItems(results)
                        })
                        .on("focusout", (e) => {
                            this.search_bar_collapsible.collapse()
                        })
                    )
                    .onClick((e) => {
                        e.stopPropagation()

                        if (this.search_bar_collapsible.isExpanded()) {
                            e.preventDefault()
                        } else {
                            this.search_bar_collapsible.expand()
                            this.search_bar.container.focus()
                            this.search_bar.setValue("")
                        }
                    }),
                this.rest = hbox(
                    new MainControlButton({text: "Solve"}),
                    new MainControlButton({icon: "assets/icons/lock.png", text: "Auto"})
                        .setToggleable(true),
                    new MainControlButton({icon: "assets/icons/fullscreen.png"})
                        .setToggleable(true),
                    new MainControlButton({icon: "assets/icons/settings.png"})
                ).css("flex-grow", "1"),
            )

            this.search_bar_collapsible = ExpansionBehaviour.horizontal({widget: this.search_bar, starts_collapsed: true, duration: 100})
                .onChange(v => {
                    if (v) this.dropdown?.close()
                    else {
                        this.dropdown.setItems(this.prepared_search_index.items())
                        this.dropdown?.open(this, this.search_bar)
                    }

                    this.rest_collapsible.setCollapsed(!v)
                })

            this.rest_collapsible = ExpansionBehaviour.horizontal({widget: this.rest, starts_collapsed: false})
        }
    }
}

export default class NeoSolvingBehaviour extends Behaviour {
    layer: NeoSolvingLayer

    auto_solving: Observable<boolean> = observe(false)

    constructor(private app: Application) {
        super();
    }

    solveClue(step: { step: Clues.Step, text_index: number }): void {
        this.layer.clue_container.text(step.step.text[step.text_index])
    }

    protected begin() {
        this.app.map.addGameLayer(this.layer = new NeoSolvingLayer(this))
    }

    protected end() {
        this.layer.remove()
    }
}