import Behaviour from "../../../lib/ui/Behaviour";
import * as leaflet from "leaflet";
import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import {Path} from "../../../lib/runescape/pathing";
import Widget from "../../../lib/ui/Widget";
import {createStepGraphics, PathGraphics} from "../path_graphics";
import * as lodash from "lodash";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import span = C.span;
import {SolvingMethods} from "../../model/methods";
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import {AugmentedMethod} from "../../model/MethodPackManager";
import MethodSelector from "./MethodSelector";
import {NislIcon} from "../nisl";
import div = C.div;
import hboxl = C.hboxl;
import TeleportIcon from "../widgets/TeleportIcon";
import {Teleports} from "../../../lib/runescape/teleports";
import img = C.img;
import InteractionType = Path.InteractionType;
import inlineimg = C.inlineimg;
import staticentity = C.staticentity;
import ability_icon = PathGraphics.ability_icon;
import {direction, PathFinder} from "../../../lib/runescape/movement";
import bold = C.bold;
import {Vector2} from "../../../lib/math";
import {capitalize, sum} from "lodash";
import {stat} from "copy-webpack-plugin/types/utils";
import entity = C.entity;

export default class PathControl extends Behaviour {
    private method: AugmentedMethod<GenericPathMethod> = null
    private path_layer: leaflet.FeatureGroup = new OpacityGroup()
    private sections: Path.Section[] = null
    private current_section: number[] = null

    private widget: Widget = null

    constructor(private parent: NeoSolvingBehaviour) {
        super();
    }

    protected begin() {
        this.path_layer.addTo(this.parent.layer)
    }

    protected end() {
        this.path_layer.remove()
    }

    /**
     * Sets the path displayed in the legend and on the map.
     * Automatically splits it into appropriate sections, use {@link setSections} for more fine-grained control.
     * @param path
     */
    setPath(path: Path.raw) {
        this.setSections(Path.Section.split_into_sections(path))
    }

    setSections(sections: Path.Section[], active_id: number[] = null) {
        this.sections = sections
        this.current_section = Path.Section.fix_index(this.sections, active_id || [])

        this.path_layer.clearLayers()

        let self = this

        function iterate(section: Path.Section) {
            if (section.subsections) {
                section.subsections.forEach(iterate)
            }
            if (section.steps) {
                for (let step of section.steps) {
                    createStepGraphics(step).addTo(self.path_layer)
                }
            }
        }

        sections.forEach(iterate)

        this.renderWidget()
    }

    setMethod(method: AugmentedMethod<GenericPathMethod>) {
        this.method = method

        let sections: Path.Section[] = []

        if (method.method.path_to_key_or_hideyhole) {
            sections.push({
                name: "Pre Path",
                subsections: Path.Section.split_into_sections(method.method.path_to_key_or_hideyhole)
            })
        }

        sections.push({
            name: "To Spot",
            subsections: Path.Section.split_into_sections(method.method.path_to_spot)
        })

        if (method.method.path_back_to_hideyhole) {
            sections.push({
                name: "Back to Hideyhole",
                subsections: Path.Section.split_into_sections(method.method.path_back_to_hideyhole)
            })
        }

        if (sections.length == 1) sections = sections[0].subsections

        this.setSections(sections)
    }

    reset(): this {
        this.sections = null
        this.current_section = null
        this.method = null

        this.widget?.remove()
        this.widget = null
        this.path_layer.clearLayers()

        return this
    }

    private setCurrentSection(ids: number[]) {
        this.current_section = Path.Section.fix_index(this.sections, ids)
        this.renderWidget()
    }

    private renderWidget() {
        this.widget?.remove()
        this.widget = null

        let w = c()

        if (this.method) {
            new MethodSelector(this.parent)
                .addClass("ctr-neosolving-solution-row")
                .appendTo(w)
        }

        if (this.sections && this.sections.length > 0 && this.current_section) {

            let body = c().addClass("ctr-neosolving-solution-row").appendTo(w)

            {
                let sections = this.sections
                for (let i = 0; i < this.current_section.length; i++) {
                    let section_id = this.current_section[i]

                    if (sections.length > 1) {
                        body.append(
                            hbox(
                                section_id > 0 ? NislIcon.arrow("left").withClick(() => {
                                    let cp = lodash.clone(this.current_section)
                                    cp[i] -= 1
                                    this.setCurrentSection(cp)
                                }) : undefined,
                                span(sections[section_id].name).css("flex-grow", "1").css("text-align", "center"),
                                section_id < sections.length - 1 ? NislIcon.arrow("right").withClick(() => {
                                    let cp = lodash.clone(this.current_section)
                                    cp[i] += 1
                                    this.setCurrentSection(cp)
                                }) : undefined,
                            )
                        )
                    }

                    sections = sections[section_id].subsections
                }
            }

            let path = Path.Section.get_subsection_from_id_list(this.sections, this.current_section).steps

            path.forEach((step, index) => {
                let order = c()
                    .text(`${index + 1}.`)

                if (path.length >= 10) order.css2({
                    "width": "18px",
                    "text-align": "right"
                })

                let icon = c().addClass("ctr-neosolving-path-stepicon")
                let content = div()

                switch (step.type) {
                    case "orientation":

                        content.append(
                            "Face ",
                            bold(direction.toString(step.direction))
                        )

                        break;
                    case "ability":
                        icon.append(img(ability_icon(step.ability)))

                        content.append(
                            capitalize(step.ability),
                            " "
                        )

                        if (step.target) {
                            content.append("on ", entity(step.target))

                            if (step.target_text) {
                                content.append(", ", step.target_text)
                            }
                        } else if (step.target_text) {
                            content.append(step.target_text, " ")
                        } else {
                            content.append(
                                bold(direction.toString(direction.fromVector(Vector2.sub(step.to, step.from))))
                            )
                        }

                        break;
                    case "run":
                        icon.append(img("assets/icons/run.png"))

                        content.append("Run ",)

                        if (step.to_text) {
                            content.append(step.to_text)
                        } else {
                            content.append(`${PathFinder.pathLength(step.waypoints)} tiles`)
                        }

                        break;
                    case "teleport":
                        let flat = this.parent.app.data.teleports.get2(step.id)

                        icon.append(new TeleportIcon(flat)
                            .css2({
                                "display": "inline-block",
                                "height": "20px"
                            }))

                        content.append(
                            "Teleport to ",
                            bold(flat.sub.name || flat.group.name)
                        )
                        break;
                    case "redclick":
                        icon.append(img(InteractionType.meta(step.how).icon_url))

                        content.append(
                            "Target ",
                            staticentity("Entity")
                        )
                        break;
                    case "powerburst":

                        icon.append(img("assets/icons/accel.png")
                            .tooltip("Powerburst of Acceleration"))

                        content.append(
                            "Drink ",
                            span("Powerburst of Acceleration").addClass("nisl-item")
                        )

                        break;
                    case "shortcut_v2":
                        let shortcut = step.internal
                        let action = shortcut.actions[0]

                        icon.append(img(InteractionType.meta(step.internal.actions[0].cursor).icon_url))

                        content.append(
                            action.name, " ",
                            staticentity(shortcut.name)
                        )

                        break;
                }

                hboxl(order, icon, content).addClass("ctr-neosolving-path-legend").appendTo(body)
//c().setInnerHtml(this.parent.app.template_resolver.resolve(step.description))
            })
        }

        if (w.container.is(":empty")) return

        this.widget = w.appendTo(this.parent.layer.path_container)
    }
}