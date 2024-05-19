import Properties from "../widgets/Properties";
import {Path} from "../../../lib/runescape/pathing";
import {TemplateResolver} from "../../../lib/util/TemplateResolver";
import {direction, PathFinder} from "../../../lib/runescape/movement";
import {C} from "../../../lib/ui/constructors";
import {CursorType} from "../../../lib/runescape/CursorType";
import entity = C.entity;
import staticentity = C.staticentity;
import inlineimg = C.inlineimg;
import bold = C.bold;
import cls = C.cls;
import {PathStepHeader} from "./PathStepHeader";

export class PathStepProperties extends Properties {

  constructor(private step: Path.Step,
              private template_resolver: TemplateResolver
  ) {
    super();

    this.render()
  }

  private info(text: string): this {

    return this.row(cls("ctr-step-properties-explanation")
      .append(
        inlineimg("assets/icons/info.png"),
        " ",
        text
      )
    )
  }

  private render(): void {
    this.header(new PathStepHeader(this.step))

    switch (this.step.type) {
      case "orientation":
        this.info(
          "Manual orientation is useful when you want to surge directly after teleporting."
        )

        break;
      case "redclick":
        this.info(
          "Targeting an entity (sometimes referred to as 'redclicking') and then clicking a tile to run somewhere causes your character to turn towards that entity when arriving at that tile. "
          + "This is useful to line up surges that would otherwise not be possible or require additional walking."
        )

        break;
      case "powerburst":
      case "transport":
      case "run":
      case "cosmetic":
      case "ability":
      case "teleport":
      case "cheat":
      default:
    }

    if (this.step.description) {
      this.paragraph(...this.template_resolver.resolve(this.step.description))
    }
  }
}