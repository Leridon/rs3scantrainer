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

  constructor() {
    super();

    this.title.set("Alt1 Toolkit")
  }

  render() {
    super.render()

    const layout = new Properties().appendTo(this.body)

    layout.paragraph("Clue trainer is a fully featured clue solver for the Alt1 Toolkit. It can automatically read clues and puzzles and show their solutions. Click below to install Clue Trainer into Alt1.")

    layout.row(
      c(`<a href='${deps().app.addToAlt1Link()}' class="ctr-notification-link"></a>`)
        .append(new BigNisButton("", "confirm")
          .setContent(hbox(
            inlineimg("assets/icons/Alt1.png"),
            "Add to Alt1 Toolkit"
          )))
    )

    layout.paragraph("Alternatively, visit ",
      new ClickToCopy(window.location.toString()),
      " in Alt1's builtin browser to get an installation prompt.")

    layout.header("About Alt1")

    layout.paragraph("The Alt1 Toolkit is an overlay tool for RuneScape 3 created by Skillbert. It offers a variety of helpful builtin tools as well as the option to install third party plugins such as Clue Trainer. You can get it at <a href='https://runeapps.org/alt1'>runeapps.org</a>.")
  }
}