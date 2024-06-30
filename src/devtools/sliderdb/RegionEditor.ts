import AbstractEditWidget from "../../trainer/ui/widgets/AbstractEditWidget";
import {Region} from "../../lib/cluetheory/sliders/Region";
import {C} from "../../lib/ui/constructors";
import Widget from "../../lib/ui/Widget";
import {util} from "../../lib/util/util";
import Properties from "../../trainer/ui/widgets/Properties";
import LightButton from "../../trainer/ui/widgets/LightButton";
import {Checkbox} from "../../lib/ui/controls/Checkbox";
import {NislIcon} from "../../trainer/ui/nisl";
import {RegionChainDistanceTable} from "../../lib/cluetheory/sliders/RegionChainDistanceTable";
import {NisModal} from "../../lib/ui/NisModal";
import {BigNisButton} from "../../trainer/ui/widgets/BigNisButton";
import {deflate} from "pako";
import ExportStringModal from "../../trainer/ui/widgets/modals/ExportStringModal";
import ImportStringModal from "../../trainer/ui/widgets/modals/ImportStringModal";
import {ExportImport} from "../../lib/util/exportString";
import hbox = C.hbox;
import numberWithCommas = util.numberWithCommas;
import vbox = C.vbox;
import hboxc = C.hboxc;
import copyUpdate = util.copyUpdate;
import downloadBinaryFile = util.downloadBinaryFile;
import cleanedJSON = util.cleanedJSON;
import imp = ExportImport.imp;

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
      const r = new Region.Indexing(this.get())

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

export class RegionChainEditor extends AbstractEditWidget<RegionChainDistanceTable.Description> {
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
        this.setValue({
          multitile: false,
          regions: [Region.empty()]
        })
      })
    )
    menu.row(new LightButton("Import", "rectangle").css("margin", "2px")
      .onClick(async () => {
        const res = await new ImportStringModal(imp<RegionChainDistanceTable.Description>()).do()

        if (res?.imported) this.commit(res.imported, true)
      })
    )
    menu.row(new LightButton("Export", "rectangle").css("margin", "2px")
      .onClick(() => {
        ExportStringModal.do(
          cleanedJSON(this.get())
        )
      })
    )

    menu.row(vbox(
      ...(this.mtm_toggle = new Checkbox.Group([
        {button: new Checkbox("STM"), value: false},
        {button: new Checkbox("MTM"), value: true},
      ])).checkboxes()
    ))

    menu.divider()

    menu.row(new LightButton("New Region", "rectangle").css("margin", "2px")
      .onClick(() => {
        this.commit(copyUpdate(this.get(), c => {
          c.regions.push(Region.empty())
        }), true)
      })
    )

    menu.divider()

    menu.row(new LightButton("Create tables", "rectangle").css("margin", "2px")
      .onClick(() => {
        const generator = new RegionChainDistanceTable.Generator(this.get());

        const modal = (new class extends NisModal {
          constructor() {
            super();

            this.setTitle("Table Generation")
          }

          render() {
            super.render();

            new RegionChainGeneratorWidget(generator).appendTo(this.body)
          }
        })

        modal.show()

        modal.hidden.on(() => {
          generator.stop()
        })

        modal.shown.on(async () => {
          await generator.run()

          console.log("Chain generator ended")
        })
      })
    )
  }

  protected render() {
    const chain = this.get()

    this.region_layout.empty()

    this.mtm_toggle.setValue(chain.multitile)

    for (let i = 0; i < chain.regions.length; i++) {
      const region = chain.regions[i]

      if (i > 0) this.region_layout.divider()

      const editor = new RegionEditor().setValue(region)

      this.region_layout.header(
        hbox(
          hboxc(`Region ${i}`).css("flex-grow", 1),
          NislIcon.delete()
            .on("click", () => {
              this.commit(copyUpdate(this.get(), e => {
                e.regions.splice(i, 1)
              }), true)
            }),
          NislIcon.from("assets/icons/copy.png")
            .on("click", () => {
              this.commit(copyUpdate(this.get(), c => {
                c.regions.push(Region.child(editor.get()))
              }), true)
            }),
        )
      )

      this.region_layout.row(editor
        .onCommit(r => {

          this.commit(copyUpdate(this.get(),
            e => e.regions[i] = r
          ))
        })
      )
    }
  }
}

class ProgressWidget extends Widget {
  constructor(progress: RegionChainDistanceTable.Generator.Progress) {
    super();

    for (let i = 0; i < progress.sub_progress.length; i++) {
      const sub = progress.sub_progress[i]

      const bar = c().css2({
        height: "30px",
        border: "1px solid gray",
        position: "relative",
        "margin-bottom": "5px"
      }).appendTo(this)

      c().css2({
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        "z-index": 0,
        width: `${(100 * sub.nodes / sub.region.size).toFixed(1)}%`,
        "background-color": "orange"
      }).appendTo(bar)

      c().css2({
        width: "100%",
        height: "100%",
        position: "relative",
        "text-shadow": "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
        "text-align": "center",
        "z-index": 1
      }).text(`Depth ${sub.depth}: ${numberWithCommas(sub.nodes)}/${numberWithCommas(sub.region.size)}`)
        .appendTo(bar)
    }

    if (progress.final_result) {
      new BigNisButton("Download File", "confirm")
        .onClick(() => {
          downloadBinaryFile("pdb.bin", progress.final_result.data)
        }).appendTo(this)

      new BigNisButton("Download Compressed", "confirm")
        .onClick(() => {
          const compressed = deflate(progress.final_result.data)

          downloadBinaryFile("pdb_compressed.bin", compressed)
        }).appendTo(this)
    }
  }

  W
}

export class RegionChainGeneratorWidget extends Widget {
  constructor(private generator: RegionChainDistanceTable.Generator) {
    super();

    generator.onProgress(p => {
      this.empty()
      this.append(new ProgressWidget(p))
    })
  }
}