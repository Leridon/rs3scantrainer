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
import {capitalize} from "lodash";
import entity = C.entity;
import {StepGraphics} from "../pathing/PathGraphics";
import {util} from "../../../lib/util/util";
import {TreeArray} from "../../../lib/util/TreeArray";
import SectionedPath = Path.SectionedPath;
import * as assert from "assert";
import index = util.index;
import GameLayer from "../../../lib/gamemap/GameLayer";

class PathSectionControl extends Widget {
    private path_layer: leaflet.FeatureGroup = null
    private sections: SectionedPath = null
    private current_section_id: number[] = null
    private step_graphics: TreeArray<StepGraphics, {}> = null
    private rows: PathSectionControl.StepRow[] = null

    constructor(private reference_layer: GameLayer | null) {
        super()
    }

    render() {

    }
}

namespace PathSectionControl {
    export class StepRow extends Widget {
        constructor(private parent: PathSectionControl,
                    private section_index: number[],
                    private step: Path.step) {
            super();

            const index = util.index(section_index, -1)

            let order = c().text(`${index + 1}.`)

            /*
            if (path.length >= 10) order.css2({
                "width": "18px",
                "text-align": "right"
            })*/

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
                .on("mouseover", () => {
                    let cp = lodash.clone(this.section_index)
                    cp[cp.length - 1] = index

                    let node = TreeArray.index(this.step_graphics, cp)
                    assert(node.type == "leaf")

                    node.value.highlighted.set(true)
                })
                .on("mouseleave", () => {
                    let cp = lodash.clone(this.current_section_id)
                    cp[cp.length - 1] = index

                    let node = TreeArray.index(this.step_graphics, cp)
                    assert(node.type == "leaf")

                    node.value.highlighted.set(false)
                })


        }
    }
}

export default class PathControl extends Behaviour {
    private method: AugmentedMethod<GenericPathMethod> = null
    private path_layer: leaflet.FeatureGroup = new OpacityGroup()
    private sections: SectionedPath = null
    private current_section_id: number[] = null

    private step_graphics: TreeArray<StepGraphics, {}>

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

    setSections(sections: SectionedPath, active_id: number[] = null) {
        this.sections = sections
        this.current_section_id = TreeArray.fixIndex(this.sections, active_id || [])

        this.path_layer.clearLayers()

        let self = this

        this.step_graphics = TreeArray.map(this.sections, (step) => {
            return new StepGraphics(step).addTo(self.path_layer)
        })

        this.renderWidget()
    }

    setMethod(method: AugmentedMethod<GenericPathMethod>) {
        this.method = method

        let sectioned: Path.SectionedPath = TreeArray.init({name: "root"})

        if (method.method.path_to_key_or_hideyhole) {
            TreeArray.add(sectioned,
                Path.Section.split_into_sections(method.method.path_to_key_or_hideyhole, "Pre Path")
            )
        }
        TreeArray.add(sectioned,
            Path.Section.split_into_sections(method.method.path_to_spot, "To Spot")
        )

        if (method.method.path_back_to_hideyhole) {
            TreeArray.add(sectioned,
                Path.Section.split_into_sections(method.method.path_back_to_hideyhole, "Back to Hideyhole")
            )
        }

        if (sectioned.children.length == 1) sectioned = sectioned.children[0]

        this.setSections(sectioned)
    }

    reset(): this {
        this.sections = null
        this.current_section_id = null
        this.method = null

        this.widget?.remove()
        this.widget = null
        this.path_layer.clearLayers()

        return this
    }

    private setCurrentSection(ids: number[]) {
        this.current_section_id = TreeArray.fixIndex(this.sections, ids)
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

        if (this.sections && this.current_section_id) {

            let body = c().addClass("ctr-neosolving-solution-row").appendTo(w)

            let section_link = TreeArray.getPath(this.sections, this.current_section_id)

            {
                section_link.forEach((node, i) => {
                    if (i == 0 || node.type == "leaf") return // Ignore root node and steps

                    let parent = section_link[i - 1]

                    assert(parent.type == "inner")

                    if (parent.children.length <= 1) return // Don't draw section controls if there is just one

                    let section_id = parent.children.indexOf(node)

                    if (node.type == "inner") {
                        body.append(
                            hbox(
                                section_id > 0 ? NislIcon.arrow("left").withClick(() => {
                                    let cp = lodash.clone(this.current_section_id)
                                    cp[i - 1] -= 1
                                    this.setCurrentSection(cp)
                                }) : undefined,
                                span(node.value.name).css("flex-grow", "1").css("text-align", "center"),
                                section_id < parent.children.length - 1 ? NislIcon.arrow("right").withClick(() => {
                                    let cp = lodash.clone(this.current_section_id)
                                    cp[i - 1] += 1
                                    this.setCurrentSection(cp)
                                }) : undefined,
                            )
                        )
                    }
                })
            }

            let path = (() => {
                let n = index(section_link, -2)
                assert(n.type == "inner")

                return n.children.map(c => {
                    assert(c.type == "leaf")
                    return c.value
                })
            })()

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
                    .on("mouseover", () => {
                        let cp = lodash.clone(this.current_section_id)
                        cp[cp.length - 1] = index

                        let node = TreeArray.index(this.step_graphics, cp)
                        assert(node.type == "leaf")

                        node.value.highlighted.set(true)
                    })
                    .on("mouseleave", () => {
                        let cp = lodash.clone(this.current_section_id)
                        cp[cp.length - 1] = index

                        let node = TreeArray.index(this.step_graphics, cp)
                        assert(node.type == "leaf")

                        node.value.highlighted.set(false)
                    })
            })
        }

        if (w.container.is(":empty")) return

        this.widget = w.appendTo(this.parent.layer.path_container)
    }
}