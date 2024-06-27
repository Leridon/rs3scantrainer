import AbstractEditWidget from "../../trainer/ui/widgets/AbstractEditWidget";
import {Region} from "../../lib/cluetheory/sliders/Region";
import {C} from "../../lib/ui/constructors";
import Widget from "../../lib/ui/Widget";
import {util} from "../../lib/util/util";
import hbox = C.hbox;
import numberWithCommas = util.numberWithCommas;


class TileEditor extends AbstractEditWidget<Region.Tile> {
  constructor(private locked: boolean = false) {
    super();

    if (locked) this.css("cursor", "not-allowed")
    else this.addClass("ctr-clickable")

    this.css2({
      "width": "30px",
      "height": "30px",
      "border": "1px solid gray",
      "margin": "3px"
    })

    if (!locked) {
      this.on("click", () => {
        this.commit((this.get() + 1) % 3 as Region.Tile, true)
      })
    }
  }

  protected render() {
    if (this.locked) {
      this.css("background-color", "gray")
    } else {
      this.css("background-color", ["white", "orange", "blue"][this.get()])
    }
  }
}

export class RegionEditor extends AbstractEditWidget<Region> {

  description: Widget

  constructor() {
    super();

    this.onCommit(e => {
      this.updatePreview()
    })
  }

  private updatePreview() {
    if (this.description) {
      const r = new Region.Active(this.get())

      let text = `Size: ${numberWithCommas(r.size)}`


      const bytes = r.size / 4
      if (bytes > 1024 * 1024) {
        text += `, ${(bytes / 1024 / 1024).toFixed(1)}MB`
      } else {
        text += `, ${(bytes / 1024).toFixed(1)}KB`
      }

      if (r.solves_puzzle) text += ", Final"

      this.description.text(text)
    }
  }

  protected render() {
    super.render();

    this.empty()

    const region = this.get()

    const grid = c().appendTo(this)

    for (let y = 0; y < 5; y++) {
      const row = hbox().appendTo(grid)
      for (let x = 0; x < 5; x++) {
        const i = y * 5 + x

        new TileEditor([19, 23].includes(i)).setValue(region[i])
          .onCommit(v => {
            const copy = [...this.get()]

            copy[i] = v

            this.commit(copy)
          }).appendTo(row)
      }
    }

    this.description = c().appendTo(this)

    this.updatePreview()
  }
}