import Behaviour from "../../../lib/ui/Behaviour";
import * as leaflet from "leaflet";
import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import {Path} from "../../../lib/runescape/pathing";
import Widget from "../../../lib/ui/Widget";
import {PathGraphics} from "../path_graphics";
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
import img = C.img;
import InteractionType = Path.InteractionType;
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
import {Observable, observe} from "../../../lib/reactive";
import {Teleports} from "../../../lib/runescape/teleports";
import ManagedTeleportData = Teleports.ManagedTeleportData;
import {PathStepProperties} from "../pathing/PathStepProperties";
import TemplateResolver from "../../../lib/util/TemplateResolver";
import * as tippy from "tippy.js";
import {followCursor} from "tippy.js";

class PathSectionControl extends Widget {
    constructor(
        private sections: SectionedPath,
        private current_section_id: number[],
        private teleport_data: ManagedTeleportData,
        private step_graphics: TreeArray<StepGraphics, {}>,
        private template_resolver: TemplateResolver,
    ) {
        super()

        this.render()
    }

    render() {
        this.empty()

        if (this.sections && this.current_section_id) {
            let section_link = TreeArray.getPath(this.sections, this.current_section_id)

            {
                section_link.forEach((node, i) => {
                    if (i == 0 || node.type == "leaf") return // Ignore root node and steps

                    let parent = section_link[i - 1]

                    assert(parent.type == "inner")

                    if (parent.children.length <= 1) return // Don't draw section controls if there is just one

                    let section_id = parent.children.indexOf(node)

                    if (node.type == "inner") {
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
                            .appendTo(this)
                    }
                })
            }

            let currently_shown_path = (() => {
                let n = index(section_link, -2)
                assert(n.type == "inner")

                return n.children.map(c => {
                    assert(c.type == "leaf")
                    return c.value
                })
            })()

            if (this.step_graphics) {
                TreeArray.forLeafs(this.step_graphics, graphics => {
                    graphics.setHighlightable(false)
                })
            }

            currently_shown_path.forEach((step, index) => {
                let sectionindex = lodash.clone(this.current_section_id)
                sectionindex[sectionindex.length - 1] = index

                let graphics_node = TreeArray.index(this.step_graphics, sectionindex)
                assert(graphics_node.type == "leaf")

                new PathSectionControl.StepRow(
                    this.teleport_data,
                    sectionindex,
                    step,
                    this.template_resolver
                )
                    .setAssociatedGraphics(graphics_node.value)
                    .appendTo(this)
            })
        }
    }

    private setCurrentSection(ids: number[]) {
        this.current_section_id = TreeArray.fixIndex(this.sections, ids)
        this.render()
    }
}

namespace PathSectionControl {
    import ManagedTeleportData = Teleports.ManagedTeleportData;

    export class StepRow extends Widget {
        highlighted: Observable<boolean> = observe(false)
        associated_graphics: StepGraphics = null

        tooltip_instance: tippy.Instance = null

        constructor(private teleport_data: ManagedTeleportData,
                    private section_index: number[],
                    private step: Path.step,
                    private template_resolver: TemplateResolver
        ) {
            super();

            this.highlighted.subscribe(v => {
                this.toggleClass("ctr-neosolving-path-legend-highlighted", v)
                this.associated_graphics?.highlighted?.set(v)

                if (!v) this.tooltip_instance?.destroy()
                else {
                    let tooltip = new PathStepProperties(this.step, this.template_resolver)

                    this.tooltip_instance = tippy.default(this.raw(), {
                        content: c("<div style='background: rgb(10, 31, 41); border: 2px solid white;padding: 3px'></div>")
                            .append(tooltip).raw(),
                        arrow: true,
                        animation: false,
                        trigger: "manual",
                        zIndex: 10001,
                        delay: 0,
                        followCursor: true,
                        plugins: [followCursor]
                    })

                    this.tooltip_instance.show()
                }
            })

            const index = util.index(this.section_index, -1)

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
                    let flat = this.teleport_data.get2(step.id)

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
                        entity(shortcut.entity)
                    )

                    break;
            }

            hboxl(order, icon, content).addClass("ctr-neosolving-path-legend")
                .on("mouseover", () => this.setHighlight(true))
                .on("mouseleave", () => this.setHighlight(false))
                .appendTo(this)
        }

        setAssociatedGraphics(graphics: StepGraphics): this {
            this.associated_graphics = graphics

            if (graphics) {
                graphics.setHighlightable(true)

                this.associated_graphics.highlighted.subscribe(v => {
                    this.setHighlight(v)
                })
            }

            return this
        }

        setHighlight(v: boolean) {
            this.highlighted.set(v)
        }
    }
}

export default class PathControl extends Behaviour {
    private method: AugmentedMethod<GenericPathMethod> = null
    private sectioned_path: SectionedPath = null

    private path_layer: leaflet.FeatureGroup = new OpacityGroup()
    private step_graphics: TreeArray<StepGraphics, {}> = null

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
        this.set(null, Path.Section.split_into_sections(path))
    }

    setSections(sections: SectionedPath, active_id: number[] = null) {
        this.set(null, sections, active_id)
    }

    setMethod(method: AugmentedMethod<GenericPathMethod>) {
        let sectioned: Path.SectionedPath = TreeArray.init({name: "root"})

        /*
        if (method.method.path_to_key_or_hideyhole) {
            TreeArray.add(sectioned,
                Path.Section.split_into_sections(method.method.path_to_key_or_hideyhole, "Pre Path")
            )
        }

         */

        TreeArray.add(sectioned,
            Path.Section.split_into_sections(method.method.path_to_spot, "To Spot")
        )

        /*
        if (method.method.path_back_to_hideyhole) {
            TreeArray.add(sectioned,
                Path.Section.split_into_sections(method.method.path_back_to_hideyhole, "Back to Hideyhole")
            )
        }*/

        if (sectioned.children.length == 1) sectioned = sectioned.children[0]

        this.set(method, sectioned)
    }

    private set(method: AugmentedMethod<GenericPathMethod>,
                sections: SectionedPath,
                active_id: number[] = null
    ) {
        this.sectioned_path = sections
        this.method = method
        let section_id = TreeArray.fixIndex(this.sectioned_path, active_id || [])

        this.path_layer.clearLayers()
        this.step_graphics = TreeArray.map(this.sectioned_path, (step) => {
            return new StepGraphics(step, this.parent.app.data.teleports).addTo(this.path_layer)
        })

        this.renderWidget(section_id)
    }

    reset(): this {
        this.sectioned_path = null
        this.method = null

        this.widget?.remove()
        this.widget = null
        this.path_layer.clearLayers()

        return this
    }

    private renderWidget(active_id: number[]) {
        this.widget?.remove()
        this.widget = null

        let w = c()

        if (this.method) {
            new MethodSelector(this.parent)
                .addClass("ctr-neosolving-solution-row")
                .appendTo(w)
        }

        if (this.sectioned_path) {
            new PathSectionControl(
                this.sectioned_path,
                active_id,
                this.parent.app.data.teleports,
                this.step_graphics,
                this.parent.app.template_resolver
            )
                .addClass("ctr-neosolving-solution-row")
                .appendTo(w)
        }

        if (w.container.is(":empty")) return

        this.widget = w.appendTo(this.parent.layer.path_container)
    }
}