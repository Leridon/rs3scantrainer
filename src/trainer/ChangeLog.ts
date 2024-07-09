import Properties from "./ui/widgets/Properties";
import * as lodash from "lodash";
import {NisModal} from "../lib/ui/NisModal";
import Widget from "../lib/ui/Widget";
import {C} from "../lib/ui/constructors";
import * as jquery from "jquery";

export namespace Changelog {

  import Appendable = C.Appendable;

  class List extends Widget {

    constructor() {
      super(jquery("<ul>"));
    }

    item(appendable: Appendable): this {
      this.append(c("<li></li>").append(appendable))

      return this
    }
  }

  type Layout = Properties

  type LogEntry = {
    version: number,
    notification?: string,
    date: Date,
    title: string,
    render: (_: Layout) => void
  }

  export const log: LogEntry[] = lodash.sortBy<LogEntry>([
    {
      version: 1,
      date: new Date(Date.parse("2024-07-09")),
      notification: "Slider Puzzles now have faster solutions",
      title: "New Solving Algorithm for Slider Puzzles",
      render: layout => {
        layout.paragraph(`This update introduces a new solving algorithm for sliding puzzles. The new algorithm is based on a precomputed database that is around 170MB large and will be downloaded when the first puzzle is encountered.`)
        layout.paragraph(`Due to how the algorithm works, this has a more significant effect on multitile moves (mouse mode) than on singletile moves (keyboard mode). Benchmarks suggest a move count reduction of up 30% for multitile moves and up to 10% for singletile moves.`)
        layout.paragraph(`The new algorithm has been developed in cooperation with discord user Shao, who helped out massively with the algorithmic details and the required math.`)
        layout.row(new List()
          .item("Added a new solving algorithm for slider puzzles.")
          .item("Fixed a bug that caused puzzles to not be read with lava in the background.")
          .item("Fixed a bug that caused error recovery to display invalid moves.")
        )
      }
    },
    {
      version: 0,
      date: new Date(Date.parse("2024-06-25")),
      notification: "Clue Trainer now supports Sandy Clues and Tetracompasses",
      title: "Sandy Clues and Tetracompasses",
      render: layout => {
        layout.paragraph(`This update introduces support for sandy clues and tetracompasses.`)
        layout.paragraph(`Also, if you want to support Clue Trainer you can now do so on the newly created <a href='https://ko-fi.com/I2I4XY829' target=”_blank”>KoFi page</a>.`)
        layout.row(new List()
          .item("Sandy Clues can now be solved like any other clue.")
          .item("Tetracompasses can be solved by switching to the 'Tetras' tab in the sidebar.")
          .item("Added in-app update notifications.")
          .item("Moved step information for filter results in the 'Methods' tab to a tooltip.")
        )
      }
    },

  ], e => -e.version)

  export const last_patch = log[0]

  export class Modal extends NisModal {
    constructor() {
      super();

      this.setTitle("Changelog")
    }

    render() {
      super.render();

      const layout = new Properties().appendTo(this.body)

      Intl.DateTimeFormat("de-de", {
        dateStyle: "medium",
        timeStyle: "short"
      })

      log.forEach(entry => {
        layout.header(`${entry.date.toLocaleDateString("en-gb")} - ${entry.title}`)

        entry.render(layout)

        layout.divider()
      })

      layout.paragraph("No patch notes available beyond this point in time.")
    }
  }
}