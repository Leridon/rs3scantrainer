import {NisModal} from "../lib/ui/NisModal";
import Properties from "./ui/widgets/Properties";
import {BigNisButton} from "./ui/widgets/BigNisButton";
import {C} from "../lib/ui/constructors";
import {deps} from "./dependencies";
import Widget from "../lib/ui/Widget";
import * as jquery from "jquery";
import hbox = C.hbox;
import inlineimg = C.inlineimg;

class ClickToCopy extends Widget {
  constructor(text: string) {
    super(jquery("<span>"));

    this.text(text).addClass("nisl-click-to-copy")

    this.tooltip("Click to copy")

    this.on("click", async () => {
      await navigator.clipboard.writeText(text)

      this.css("min-width", this._raw.offsetWidth + "px")

      this.toggleClass("copied-recently", true)

      this.text("Copied!")

      setTimeout(() => {
        this.text(text)
        this.css("width", null)
        this.toggleClass("copied-recently", false)
      }, 3000)
    })
  }
}

export class Alt1Modal extends NisModal {

  constructor(private url_override?: string) {
    super();

    this.title.set("Alt1 Toolkit")
  }

  private addToAlt1Link(): string {
    if (this.url_override) {
      return `alt1://addapp/${this.url_override}/appconfig.json`

    } else {
      return `alt1://addapp/${window.location.protocol}//${window.location.host}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1)}appconfig.json`
    }
  }

  render() {
    super.render()

    const layout = new Properties().appendTo(this.body)

    layout.paragraph("Clue trainer is a fully featured clue solver for the Alt1 Toolkit. It can automatically read clues and puzzles and show their solutions. Click below to install Clue Trainer into Alt1.")

    layout.row(
      c(`<a href='${this.addToAlt1Link()}'></a>`)
        .append(new BigNisButton("", "confirm")
          .setContent(hbox(
            inlineimg("assets/icons/Alt1.png"),
            "Add to Alt1 Toolkit"
          )))
    )

    layout.paragraph("Alternatively, visit ",
      new ClickToCopy(this.url_override ?? window.location.toString()),
      " in Alt1's builtin browser to get an installation prompt.")

    layout.header("About Alt1")

    layout.paragraph("The Alt1 Toolkit is an overlay tool for RuneScape 3 created by Skillbert. It offers a variety of helpful builtin tools as well as the option to install third party plugins such as Clue Trainer. You can get it at <a href='https://runeapps.org/alt1'>runeapps.org</a>.")
  }
}