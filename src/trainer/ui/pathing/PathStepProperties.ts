import Properties from "../widgets/Properties";
import {Path} from "../../../lib/runescape/pathing";
import TemplateResolver from "../../../lib/util/TemplateResolver";
import {direction, PathFinder} from "../../../lib/runescape/movement";
import {C} from "../../../lib/ui/constructors";
import entity = C.entity;
import staticentity = C.staticentity;
import inlineimg = C.inlineimg;
import bold = C.bold;
import {CursorType} from "../../../lib/runescape/CursorType";

export class PathStepProperties extends Properties {

    constructor(private step: Path.Step,
                private template_resolver: TemplateResolver
    ) {
        super();

        this.render()
    }

    private info(text: string): this {

        return this.row(c().addClass("ctr-step-properties-explanation")
            .append(
                inlineimg("assets/icons/info.png"),
                " ",
                text
            )
        )
    }

    private render(): void {
        switch (this.step.type) {
            case "orientation":
                this.header(
                    c().append(
                        "Manually face ",
                        bold(direction.toString(this.step.direction))
                    )
                )

                this.info(
                    "Manual orientation is useful when you want to surge directly after teleporting."
                )

                break;

            case "redclick":
                this.header(c().append(
                    inlineimg(CursorType.meta(this.step.how).icon_url),
                    " Target ",
                    staticentity("Entity")
                ))

                this.info(
                    "Targeting an entity (sometimes referred to as 'redclicking') and then clicking a tile to run somewhere causes your character to turn towards that entity when arriving at that tile. "
                    + "This is useful to line up surges that would otherwise not be possible or require additional walking."
                )

                break;
            case "powerburst":
                this.header(c().append(
                    `Drink `,
                    entity({kind: "item", name: "Powerburst of Acceleration"}),
                ))
                break;
            case "transport":
                let shortcut = this.step.internal
                let action = shortcut.actions[0]

                this.header(c().append(
                    inlineimg(CursorType.meta(this.step.internal.actions[0].cursor).icon_url),
                    " ",
                    action.name,
                    " ",
                    entity(shortcut.entity)
                ))

                break;
            case "run":

                this.header(c().append(
                    "Run ",
                    this.step.to_text
                        ? this.step.to_text
                        : `${PathFinder.pathLength(this.step.waypoints)} tiles`)
                )

                break;

            case "ability":
            case "teleport":
            default:
                this.header(PathStepProperties.header_text(this.step))
        }

        if (this.step.description) {
            this.header("Additional Info")

            this.row(c().setInnerHtml(this.template_resolver.resolve(this.step.description)))
        }
    }
}

export namespace PathStepProperties {
    export function header_text(step: Path.Step) {
        switch (step.type) {
            case "orientation":
                return "Manual Orientation"
            case "ability":
                switch (step.ability) {
                    case "surge":
                        return "Surge"
                    case "dive":
                        return "Dive"
                    case "escape":
                        return "Escape"
                    case "barge":
                        return "Barge"
                }
                return ""
            case "run":
                return "Run"
            case "teleport":
                return "Teleport"
            case "redclick":
                return "Target Entity"
            case "powerburst":
                return "Powerburst"
            case "transport":
                return "Use entity"

        }
    }
}