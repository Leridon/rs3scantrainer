import Widget from "../../../lib/ui/Widget";
import {FavouriteIcon, NislIcon} from "../nisl";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {Observable, observe} from "../../../lib/reactive";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {C} from "../../../lib/ui/constructors";
import {AbstractDropdownSelection} from "../widgets/AbstractDropdownSelection";
import {Clues} from "../../../lib/runescape/clues";
import spacer = C.spacer;
import span = C.span;
import hbox = C.hbox;
import ClueSpot = Clues.ClueSpot;

export default class MethodSelector extends Widget {
  public method: Observable<AugmentedMethod>

  private row: Widget

  constructor(private parent: NeoSolvingBehaviour, private clue: ClueSpot.Id) {
    super()

    this.method = observe(parent.active_method)

    this.method.subscribe(m => this.render(m), true)
  }

  private renderName(method: AugmentedMethod): Widget {
    const div = hbox()
      .css2({
        overflow: "hidden",
        "white-space": "nowrap"
      })

    if (method.method.name && method.method.name.length > 0) {
      div.append(C.span(method.method.name)
        .css2({
          overflow: "hidden",
          "text-overflow": "ellipsis",
        })
      )
    } else {
      div.append(C.italic("Unnamed Method")
        .css2({
          overflow: "hidden",
          "text-overflow": "ellipsis",
        }))
    }

    div.append(
      C.space(),
      span(` (${method.method.expected_time.toFixed(method.method.type == "scantree" ? 1 : 0) ?? "?"} ticks)`)
    )

    return div
  }

  private render(method: AugmentedMethod) {

    this.row = hbox(
      method
        ? this.renderName(method)
        : c("<span style='font-style: italic; color: gray'> No method selected</span>"),
      spacer(),
      NislIcon.dropdown()
        .css("margin-right", "3px")
        .css("margin-left", "3px"),
    )
      .addClass("ctr-clickable")
      .setAttribute("tabindex", "-1")

    this.row.on("click", () => this.openMethodSelection())
      .appendTo(this)
  }

  private dropdown: AbstractDropdownSelection.DropDown<AugmentedMethod> = null

  private async openMethodSelection() {
    if (!this.dropdown) {
      this.dropdown = new AbstractDropdownSelection.DropDown<AugmentedMethod>({
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
              this.renderName(m),
              spacer()
            ).tooltip(m.method.description)
          }
        }
      })
        .setItems((await MethodPackManager.instance().getForClue(this.clue)).concat([null]))
        .onSelected(m => {
          this.parent.app.favourites.setMethod(this.clue, m)
          this.parent.setMethod(m)
        })
        .onClosed(() => {
          this.dropdown = null
        })
        .open(this, this.row)
    }
  }
}