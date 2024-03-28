import Widget from "../../../lib/ui/Widget";
import {Application} from "../../application";
import {NisModal} from "../../../lib/ui/NisModal";
import {deps} from "../../dependencies";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import cls = C.cls;
import {Observable, observe} from "../../../lib/reactive";
import {BigNisButton} from "../widgets/BigNisButton";
import entity = C.entity;


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
          .text(entry.name)
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
    renderer: () => Widget
  }

  export type Section = {
    name: string,
    entries: Entry[]
  }
}

export class SettingsEdit extends Widget {

  constructor(app: Application) {
    super();

    new SectionControl([
      {
        name: "General", entries: [
          {id: "map", name: "Map", renderer: () => c().text("Map")},
          {id: "teleports", name: "Teleports", renderer: () => c().text("Teleports")},
          {id: "methods", name: "Methods", renderer: () => c().text("Methods")},
        ]
      },
      {
        name: "Advanced", entries: [
          {id: "map2", name: "Map", renderer: () => c().text("Map")},
          {id: "teleports2", name: "Teleports", renderer: () => c().text("Teleports")},
          {id: "methods2", name: "Methods", renderer: () => c().text("Methods")},
        ]
      },

    ]).appendTo(this)
  }
}

export namespace SettingsEdit {
  export type Section = "map" | "solving"
}

export class SettingsModal extends NisModal {

  constructor() {
    super();

    this.title.set("Settings")
  }

  render() {
    super.render()

    this.body.css("padding", "0")

    this.body.append(new SettingsEdit(deps().app))
  }

  getButtons(): BigNisButton[] {
    return [
      new BigNisButton("Save and Exit", "confirm")
        .onClick(() => this.remove())
        .css("min-width", "150px")
    ]
  }
}