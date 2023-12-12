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

class NeoSolvingLayer extends GameLayer {
    constructor() {
        super();

        let sidebar = new GameMapControl({
            position: "top-left",
            type: "floating",
            no_default_styling: true
        }, c().addClass("ctr-neosolving-sidebar")).addTo(this)

        sidebar.content.append(
            new NeoSolvinglayer.MainControlBar(),
            c().text("I am another test thing")
        )
    }
}

namespace NeoSolvinglayer {
    import spacer = C.spacer;
    import hbox = C.hbox;
    import ClueSpot = Clues.ClueSpot;

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

        dropdown: AbstractDropdownSelection.DropDown<Clues.Step> = null

        constructor() {
            super();

            this.addClass("ctr-neosolving-main-bar")

            this.dropdown = new AbstractDropdownSelection.DropDown<Clues.Step>({
                dropdownClass: "ctr-neosolving-search-dropdown"
            })
                .onSelected(clue => {
                    this.search_bar_collapsible.collapse()
                })
                .setItems(clue_data.index.filtered().map(a => a.clue).slice(0, 30))

            this.append(
                new MainControlButton({icon: "assets/icons/glass.png"})
                    .append(this.search_bar = new TextField()
                        .css("flex-grow", "1")
                        .setPlaceholder("Enter Search Term...")
                        .toggleClass("nisinput", false)
                        .addClass("ctr-neosolving-main-bar-search")
                        .setVisible(false)
                        .on("focusout", (e) => {
                            //this.search_bar_collapsible.collapse()
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
                            this.dropdown.open(this, this.search_bar)
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

                    this.rest_collapsible.setCollapsed(!v)
                })

            this.rest_collapsible = ExpansionBehaviour.horizontal({widget: this.rest, starts_collapsed: false})
        }
    }
}

export default class NeoSolvingBehaviour extends Behaviour {
    layer: NeoSolvingLayer

    constructor(private app: Application) {
        super();
    }

    protected begin() {
        this.app.map.addGameLayer(this.layer = new NeoSolvingLayer())
    }

    protected end() {
        this.layer.remove()
    }
}