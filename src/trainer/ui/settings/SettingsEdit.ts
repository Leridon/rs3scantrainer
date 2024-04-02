import Widget from "../../../lib/ui/Widget";
import {Application} from "../../application";
import {NisModal} from "../../../lib/ui/NisModal";
import {deps} from "../../dependencies";
import {C} from "../../../lib/ui/constructors";
import {Observable, observe} from "../../../lib/reactive";
import {BigNisButton} from "../widgets/BigNisButton";
import Properties, {SlotLayout} from "../widgets/Properties";
import {FairyRingSelector, PotaJewellrySelector} from "./FairyRingSelector";
import {Settings} from "./Settings";
import {Checkbox} from "../../../lib/ui/controls/Checkbox";
import * as lodash from "lodash";
import {DropdownSelection} from "../widgets/DropdownSelection";
import LightButton from "../widgets/LightButton";
import {ClueTier, ClueType} from "../../../lib/runescape/clues";
import ButtonRow from "../../../lib/ui/ButtonRow";
import {ConfirmationModal} from "../widgets/modals/ConfirmationModal";
import {FormModal} from "../../../lib/ui/controls/FormModal";
import TextField from "../../../lib/ui/controls/TextField";
import {NeoSolving} from "../neosolving/NeoSolvingBehaviour";
import cls = C.cls;
import PotaColor = Settings.PotaColor;
import hbox = C.hbox;
import vbox = C.vbox;
import inlineimg = C.inlineimg;
import hgrid = C.hgrid;
import hboxl = C.hboxl;

class SectionControl extends Widget {
  menu_bar: Widget
  content: Widget

  private entry_buttons: {
    original: {
      section: SectionControl.Section,
      entry: SectionControl.Entry
    },
    button: Widget
  }[] = []

  private active_entry: Observable<string> = observe(null)

  constructor(private sections: SectionControl.Section[]) {
    super(cls("ctr-section-control"));

    this.active_entry.subscribe(active => {
      this.entry_buttons.forEach(e => {
        const isActive = active == e.original.entry.id

        e.button.toggleClass("active", isActive)

        if (isActive) {
          this.content.empty()

          this.content.append(
            C.cls("ctr-section-control-content-header")
              .css("padding-left", "0")
              .text(e.original.entry.name),
            e.original.entry.renderer()
          )
        }
      })
    })

    this.render()

    this.active_entry.set(sections[0].entries[0].id)
  }

  private render() {
    this.empty()

    this.append(
      this.menu_bar = cls("ctr-section-control-menu"),
      this.content = cls("ctr-section-control-content")
    )

    for (const section of this.sections) {
      cls("ctr-section-control-menu-header")
        .text(section.name)
        .appendTo(this.menu_bar)

      for (const entry of section.entries) {
        const button = cls("ctr-section-control-menu-entry")
          .on("click", () => {
            this.active_entry.set(entry.id)
          })
          .text(entry.short_name ?? entry.name)
          .appendTo(this.menu_bar)

        this.entry_buttons.push({
          original: {section, entry},
          button: button
        })
      }
    }
  }
}

namespace SectionControl {

  export type Entry = {
    id: string,
    name: string,
    short_name?: string,
    renderer: () => Widget
  }

  export type Section = {
    name: string,
    entries: Entry[]
  }
}

class TeleportSettingsEdit extends Widget {
  private layout: Properties

  constructor(private value: Settings.TeleportSettings) {
    super();

    this.layout = new Properties().appendTo(this)

    this.render()
  }

  render() {
    this.layout.empty()

    this.layout.header("Owned Passages of the Abyss", "left")

    this.layout.paragraph("Save your owned passages of the abyss.")

    for (let color of PotaColor.values) {
      const definition = this.value.potas.find(pota => pota.color == color)

      this.layout.row(new Checkbox(
          hboxl(inlineimg(PotaColor.iconUrl(color)), `${lodash.capitalize(color)} Passage of the Abyss`)
        )
          .setValue(!!definition)
          .onCommit(v => {
            if (v) {
              // Add definition
              this.value.potas.push({
                color: color,
                slots: [null, null, null, null, null, null]
              })
            } else {
              this.value.potas = this.value.potas.filter(pota => pota.color != color)
            }

            this.render()
          })
      )

      if (definition) {
        this.layout.row(
          new SlotLayout(definition.slots.map((e, i) => {
            return {
              name: (i + 1).toString(),
              content: new PotaJewellrySelector()
                .onSelection(e => {
                  definition.slots[i] = e ? {
                    group_id: e.group.id,
                    access_id: e.access.id
                  } : null
                })
                .set(definition.slots[i])
            }
          }), 2)
        )
      }
    }

    this.layout.divider()

    this.layout.header("Presets", "left")

    this.layout.paragraph("Setup presets to easily switch between.")

    const active_preset = this.value.presets.find(p => p.id == this.value.active_preset)

    this.layout.header("Active Preset", "center", 1)

    this.layout.row(
      new DropdownSelection<any>({
        type_class: {toHTML: e => e.name,}
      }, this.value.presets)
        .setValue(active_preset)
        .onSelection(e => {
          this.value.active_preset = e.id
          this.render()
        }),
    )

    this.layout.row(
      new ButtonRow()
        .buttons(
          new LightButton("New Preset")
            .onClick(() => {
              const next_id = Math.max(...this.value.presets.map(p => p.id)) + 1

              let name: string = null

              for (let name_index = 1; name_index < 100; name_index++) {
                const potential_name = `New Preset ${name_index}`

                const exists = this.value.presets.some(p => p.name == potential_name)

                if (!exists) {
                  name = potential_name
                  break
                }
              }

              if (name) {
                this.value.presets.push({
                  id: next_id,
                  name: name,
                  active_potas: [],
                  fairy_ring_favourites: new Array(10).fill(null),
                })

                this.value.active_preset = next_id

                this.render()
              }


            }),
          new LightButton("Delete")
            .setEnabled(!active_preset.fixed)
            .onClick(async () => {
              const really = await ConfirmationModal.simple("Are you sure?",
                  "Deleting a teleport customization preset can not be undone.",
                  "Cancel",
                  "Delete")
                .do()

              if (really) {
                this.value.presets = this.value.presets.filter(p => p != active_preset)

                this.value.active_preset = this.value.presets[0].id

                this.render()
              }
            }),
          new LightButton("Rename")
            .setEnabled(!active_preset.fixed)
            .onClick(async () => {

              const new_name = await (new class extends FormModal<string> {
                constructor() {
                  super();

                  this.title.set("Rename Teleport Preset")

                  this.shown.on(() => {
                    this.input.raw().focus()
                  })
                }

                input: TextField

                render() {
                  super.render();

                  new Properties().named("New Name",
                    this.input = new TextField()
                      .setValue(active_preset.name)
                  ).appendTo(this.body)
                }

                getButtons(): BigNisButton[] {
                  return [
                    new BigNisButton("Cancel", "neutral")
                      .onClick(() => this.cancel()),
                    new BigNisButton("Save", "confirm")
                      .onClick(() => this.confirm(this.input.get()))
                  ]
                }
              }).do()

              if (new_name) {
                active_preset.name = new_name
                this.render()
              }
            })
        )
    )

    const pota_checks = PotaColor.values.map(color =>
      new Checkbox(
        hboxl(inlineimg(PotaColor.iconUrl(color)), lodash.capitalize(color))
      )
        .setValue(active_preset.active_potas.includes(color))
        .onCommit(v => {
            if (v) {
              active_preset.active_potas.push(color)
            } else {
              active_preset.active_potas = active_preset.active_potas.filter(c => c != color)
            }
          }
        )
    )

    this.layout.named("POTAs",
      vbox(
        hgrid(pota_checks[0], pota_checks[1]),
        hgrid(pota_checks[2], pota_checks[3])
      )
    )

    this.layout.header("Fairy Ring Favourites", "left", 1)

    this.layout.row(new SlotLayout(active_preset.fairy_ring_favourites.map((e, i) => {
      return {
        name: ((i + 1) % 10).toString(),
        content: new FairyRingSelector()
          .set(e)
          .onSelection(s => {
            active_preset.fairy_ring_favourites[i] = s.id
          })
      }
    }), 2))


    this.layout.divider()

    this.layout.row(new Checkbox("Automatically switch preset based on clue tier")
      .setValue(this.value.preset_bindings_active)
      .onCommit(v => {
        this.value.preset_bindings_active = v
        this.render()
      })
    )

    if (this.value.preset_bindings_active) {

      for (let tier of ClueTier.values) {
        const current_binding_id = this.value.preset_bindings[tier]

        const current_binding = current_binding_id != null ? this.value.presets.find(p => p.id == current_binding_id) : null

        this.layout.named(ClueType.meta(tier).name, new DropdownSelection<any>({
            type_class: {
              toHTML: e => {
                if (e) return e.name
                else return "None"
              },
            }
          }, [null].concat(this.value.presets))
            .setValue(current_binding)
            .onSelection(e => {
              this.value.preset_bindings[tier] = e ? e.id : null
            })
        )
      }

    }

    this.layout.row(
      new LightButton(
        hbox("Reset to ",
          inlineimg("assets/icons/cluechasers.png"),
          " Clue Chasers recommendations"
        ),
        "rectangle"
      )
        .onClick(async () => {
          const really = await ConfirmationModal.simple(
            "Reset teleport setup",
            "This will reset your passage of the abyss setups and replace every custom preset except the default one. This can not be undone.",
            "Cancel",
            "Go ahead"
          ).do()

          if (really) {
            const clue_chasers = Settings.TeleportSettings.clueChasersRecommendations()

            this.value.potas = clue_chasers.potas
            this.value.presets = [...this.value.presets.filter(p => p.id >= 0), ...clue_chasers.presets.filter(p => p.id < 0)]
            this.value.active_preset = 0
            this.value.preset_bindings = clue_chasers.preset_bindings

            this.render()
          }
        })
    )
  }

}

class SolvingSettingsEdit extends Widget {

  private layout: Properties

  constructor(private value: NeoSolving.Settings) {
    super()

    this.layout = new Properties().appendTo(this)

    this.render()
  }

  render() {
    this.layout.empty()

    this.layout.header("Clue Information in UI")

    this.layout.paragraph("Choose what data about a clue step and its solution is displayed on the UI while solving.")

    this.layout.named("Clue Text", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Full"), value: "full" as const},
        {button: new Checkbox("Abridged"), value: "abridged" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.clue_text = v)
        .setValue(this.value.info_panel.clue_text)
        .checkboxes()
    ))

    this.layout.named("Clue Map", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.map_image = v)
        .setValue(this.value.info_panel.map_image)
        .checkboxes()
    ))

    this.layout.named("Dig Target", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.dig_target = v)
        .setValue(this.value.info_panel.dig_target)
        .checkboxes()
    ))

    this.layout.named("Talk Target", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.talk_target = v)
        .setValue(this.value.info_panel.talk_target)
        .checkboxes()
    ))

    this.layout.named("Search Target", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.search_target = v)
        .setValue(this.value.info_panel.search_target)
        .checkboxes()
    ))

    this.layout.named("Search Key", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.search_key = v)
        .setValue(this.value.info_panel.search_key)
        .checkboxes()
    ))

    this.layout.named("Hidey Hole", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.hidey_hole = v)
        .setValue(this.value.info_panel.hidey_hole)
        .checkboxes()
    ))

    this.layout.named("Emote Items", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.emote_items = v)
        .setValue(this.value.info_panel.emote_items)
        .checkboxes()
    ))


    this.layout.named("Emote(s)", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.emotes = v)
        .setValue(this.value.info_panel.emotes)
        .checkboxes()
    ))

    this.layout.named("Double Agent", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.double_agent = v)
        .setValue(this.value.info_panel.double_agent)
        .checkboxes()
    ))

    this.layout.named("Pathing", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.path_components = v)
        .setValue(this.value.info_panel.path_components)
        .checkboxes()
    ))

    this.layout.named("Puzzles", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Show"), value: "show" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.puzzle = v)
        .setValue(this.value.info_panel.puzzle)
        .checkboxes()
    ))

    this.layout.named("Challenge", hgrid(
      ...new Checkbox.Group([
        {button: new Checkbox("Full"), value: "full" as const},
        {button: new Checkbox("Answer"), value: "answer_only" as const},
        {button: new Checkbox("Hide"), value: "hide" as const},
      ]).onChange(v => this.value.info_panel.challenge = v)
        .setValue(this.value.info_panel.challenge)
        .checkboxes()
    ))

    this.layout.named("Presets",
      new LightButton("Everything")
        .onClick(() => {
          this.value.info_panel = lodash.cloneDeep(NeoSolving.Settings.InfoPanel.EVERYTHING)
          this.render()
        }))

    this.layout.named("",
      new LightButton("Reduced (Recommended)")
        .onClick(() => {
          this.value.info_panel = lodash.cloneDeep(NeoSolving.Settings.InfoPanel.REDUCED)
          this.render()
        }))

    this.layout.named("",
      new LightButton("Nothing")
        .onClick(() => {
          this.value.info_panel = lodash.cloneDeep(NeoSolving.Settings.InfoPanel.NOTHING)
          this.render()
        }))


    this.layout.divider()

    this.layout.header("Informative Entities on Map")

    this.layout.paragraph("Choose which components of a clue step are displayed as interactive elements on the map while solving.")

    this.layout.divider()
    this.layout.header("Zoom Behaviour")
  }
}

export class SettingsEdit extends Widget {
  value: Settings.Settings

  constructor(app: Application) {
    super();

    this.value = lodash.cloneDeep(app.settings.settings)

    new SectionControl([
      {
        name: "General", entries: [
          {
            id: "teleports",
            name: "Teleport Customization",
            short_name: "Teleports",
            renderer: () => new TeleportSettingsEdit(this.value.teleport_customization)
          }, {
            id: "solving",
            name: "Solving Customization",
            short_name: "Solving",
            renderer: () => new SolvingSettingsEdit(this.value.solving)
          },
        ]
      },
    ]).appendTo(this)
  }
}

export class SettingsModal extends NisModal {
  edit: SettingsEdit

  constructor() {
    super();

    this.title.set("Settings")

    this.hidden.on(() => {
      deps().app.settings.set(this.edit.value)
    })
  }

  render() {
    super.render()

    this.body.css("padding", "0")

    this.body.append(this.edit = new SettingsEdit(deps().app))
  }

  getButtons(): BigNisButton[] {
    return [
      new BigNisButton("Save and Exit", "confirm")
        .onClick(() => this.remove())
        .css("min-width", "150px")
    ]
  }
}