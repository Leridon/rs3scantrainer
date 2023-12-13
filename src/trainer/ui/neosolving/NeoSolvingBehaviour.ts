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
import {TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import * as lodash from "lodash";
import {Rectangle} from "../../../lib/math";

class NeoSolvingLayer extends GameLayer {
    public control_bar: NeoSolvinglayer.MainControlBar
    public clue_container: Widget
    public solution_container: Widget

    private sidebar: GameMapControl

    constructor(private behaviour: NeoSolvingBehaviour) {
        super();

        this.sidebar = new GameMapControl({
            position: "top-left",
            type: "floating",
            no_default_styling: true
        }, c().addClass("ctr-neosolving-sidebar")).addTo(this)

        this.sidebar.content.append(
            new NeoSolvinglayer.MainControlBar(behaviour),
            this.clue_container = c(),
            this.solution_container = c()
        )
    }

    fit(view: TileRectangle): this {
        let copy = lodash.cloneDeep(view)

        // Modify the rectangle to center the view on the space right of the sidebar.
        {
            const sidebar_w = this.sidebar.content.raw().clientWidth + 20
            const total_w = this.getMap().container.get()[0].clientWidth

            const f = sidebar_w / Math.max(sidebar_w, total_w - sidebar_w)

            copy.topleft.x -= f * Rectangle.width(view)
        }

        this.map.fitView(copy, {
            maxZoom: 4,
        })

        return this
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
                    this.parent.solveClue(clue)
                })
                .onClosed(() => {
                    this.search_bar_collapsible.collapse()
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

        this.layer.solution_container.empty()
        {
            let w = c()

            const s = step.step.solution

            if (s) {
                switch (s.type) {
                    case "talkto":
                        w.append(c().append(
                            "Talk to ",
                            C.npc(s.npc).on("click", () => {
                                this.layer.fit(s.spots[0].range)
                            })
                        ))
                        break;
                    case "search":
                        w.append(c().append(
                            "Search ",
                            C.entity(s.entity).on("click", () => {
                                this.layer.fit(TileRectangle.from(s.spot))
                            })
                        ))
                        break;
                    case "dig":
                        w.append(c().text(`Dig at ${TileCoordinates.toString(s.spot)}`))
                        break;
                }
            }

            this.layer.solution_container.append(w)
        }
    }

    protected begin() {
        this.app.map.addGameLayer(this.layer = new NeoSolvingLayer(this))
    }

    protected end() {
        this.layer.remove()
    }
}