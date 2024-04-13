import {NisModal} from "../lib/ui/NisModal";
import Properties from "./ui/widgets/Properties";
import {C} from "../lib/ui/constructors";
import hgrid = C.hgrid;
import inlineimg = C.inlineimg;
import hbox = C.hbox;


export class AboutModal extends NisModal {
  constructor() {
    super();

    this.title.set("About")
  }

  render() {
    super.render();

    const layout = new Properties().appendTo(this.body)

    layout.header("About Clue Trainer")

    layout.paragraph("Clue Trainer is a new generation clue solver for Alt1 and developed by Zyklop Marco in the Clue Chasers discord. Originally intended to provide an interactive way to learn optimal scan routes, the scope has gradually increased and is now on-route to be a fully-featured clue solver and a test bed for new ways to solve clues in Runescape 3.")

    layout.paragraph("Visit Clue Trainer at",
      " <a href='https://github.com/Leridon/rs3scantrainer' target=”_blank”><img class='inline-img' src='assets/icons/github-mark-white.png'> GitHub</a>",
      " or the <a href='https://discord.gg/cluechasers' target=”_blank”><img class='inline-img' src='assets/icons/cluechasers.png'> Clue Chasers </a>discord.")

    layout.header("Credits")

    layout.paragraph("Clue Trainer is a team effort that requires much more than just the programming and I want to mention a few people specifically that contributed to this journey.")

    layout.paragraph("<strong>Skillbert</strong> for his work on <a href='https://www.runeapps.org'>runeapps.org</a> and the Alt1 toolkit. Clue Trainer includes code from Alt1's official clue solver with kind permission from Skillbert.")

    layout.paragraph("<strong>Ngis</strong> for being very enthusiastic about Clue Trainer's editor tools and contributing the builtin method packs for easy, medium and hard clues.")

    layout.paragraph("<strong>Fiery</strong> for creating the original scan guide spreadsheet that prompted the original creation of this tool as 'Scan Trainer' and is the basis of many of the included scan routes.")

    layout.header("Legal disclaimer")
    layout.paragraph("Icons and other assets used are owned by Jagex Ltd. and their use is intended to fall under fair dealing as a fan project.")
  }
}