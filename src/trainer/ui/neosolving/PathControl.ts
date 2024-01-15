import Behaviour from "../../../lib/ui/Behaviour";
import * as leaflet from "leaflet";
import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import {Path} from "../../../lib/runescape/pathing";
import Widget from "../../../lib/ui/Widget";
import {createStepGraphics} from "../path_graphics";
import * as lodash from "lodash";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import span = C.span;
import {SolvingMethods} from "../../model/methods";
import GenericPathMethod = SolvingMethods.GenericPathMethod;
import {AugmentedMethod} from "../../model/MethodPackManager";
import MethodSelector from "./MethodSelector";

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
                                section_id > 0 ? span("P").on("click", () => {
                                    let cp = lodash.clone(this.current_section)
                                    cp[i] -= 1
                                    this.setCurrentSection(cp)
                                }) : undefined,
                                span(sections[section_id].name).css("flex-grow", "1").css("text-align", "center"),
                                section_id < sections.length - 1 ? span("N").on("click", () => {
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

            for (let step of path) {
                c().setInnerHtml(this.parent.app.template_resolver.resolve(step.description)).appendTo(body)
            }
        }

        if (w.container.is(":empty")) return

        this.widget = w.appendTo(this.parent.layer.path_container)
    }
}