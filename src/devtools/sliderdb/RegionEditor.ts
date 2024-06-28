import AbstractEditWidget from "../../trainer/ui/widgets/AbstractEditWidget";
import {Region} from "../../lib/cluetheory/sliders/Region";
import {C} from "../../lib/ui/constructors";
import Widget from "../../lib/ui/Widget";
import {util} from "../../lib/util/util";
import hbox = C.hbox;
import numberWithCommas = util.numberWithCommas;
import {RegionChain} from "../../lib/cluetheory/sliders/RegionChain";
import Properties from "../../trainer/ui/widgets/Properties";
import LightButton from "../../trainer/ui/widgets/LightButton";
import vbox = C.vbox;
import {Checkbox} from "../../lib/ui/controls/Checkbox";
import hboxc = C.hboxc;
import {NislIcon} from "../../trainer/ui/nisl";

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

      let text = `${numberWithCommas(r.size)}`

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

export class RegionChainEditor extends AbstractEditWidget<RegionChain<undefined>> {
  private region_layout: Properties

  private mtm_toggle: Checkbox.Group<boolean>

  constructor() {
    super();

    const vertical = hbox().appendTo(this)

    hboxc(
      this.region_layout = new Properties()
      .css2({
        "padding-left": "3px",
        "padding-right": "3px",
        "max-height": "500px",
        "overflow-y": "auto"
      })
    ).css("flex-grow", 1).appendTo(vertical)


    const menu = new Properties().appendTo(vertical)
      .css("border-left", "1px solid gray")
      .css("display", "inline-block")
      .css2({
        "padding-left": "3px",
        "padding-right": "3px",
      })

    menu.row(new LightButton("New Chain", "rectangle").css("margin", "2px")
      .onClick(() => {
        this.setValue([{
          region: Region.empty(),
          value: undefined
        }])
      })
    )
    menu.row(new LightButton("Import", "rectangle").css("margin", "2px"))
    menu.row(new LightButton("Export", "rectangle").css("margin", "2px"))

    menu.row(vbox(
      ...(this.mtm_toggle = new Checkbox.Group([
        {button: new Checkbox("STM"), value: false},
        {button: new Checkbox("MTM"), value: true},
      ])).checkboxes()
    ))

    menu.divider()

    menu.row(new LightButton("New Region", "rectangle").css("margin", "2px")
      .onClick(() => {
        const copy = [...this.get()]
        copy.push({region: Region.empty(), value: undefined})

        this.commit(copy, true)
      })
    )

    menu.divider()

    menu.row(new LightButton("Create tables", "rectangle").css("margin", "2px"))
  }

  protected render() {
    const chain = this.get()

    this.region_layout.empty()

    for (let i = 0; i < chain.length; i++) {
      const region = chain[i]

      if (i > 0) this.region_layout.divider()

      this.region_layout.header(
        hbox(
          hboxc(`Region ${i}`).css("flex-grow", 1),
          NislIcon.delete()
            .on("click", () =>  {
              const copy = [...this.get()]

              copy.splice(i, 1)

              this.commit(copy, true)
            })
        )
      )

      this.region_layout.row(new RegionEditor().setValue(region.region)
        .onCommit(r => {
          const copy = [...chain]
          copy[i].region = r

          this.commit(copy)
        })
      )
    }
  }
}