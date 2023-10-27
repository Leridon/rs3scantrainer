import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {type Application} from "trainer/application";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import AugmentedDecisionTree = ScanTree.Augmentation.AugmentedDecisionTree;
import {Observable, observe} from "../../../lib/properties/Observable";
import {SolvingMethods} from "../../model/methods";
import MethodWithClue = SolvingMethods.MethodWithClue;
import {NewCluePanel, SidePanel} from "../SidePanelControl";
import {ClueStep, ScanStep} from "../../../lib/runescape/clues";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import {modal, Modal} from "../widgets/modal";
import {scan_tree_template_resolvers, ScanExplanationModal} from "../map/methodlayer";
import Widget from "../widgets/Widget";
import TemplateResolver from "../../../lib/util/TemplateResolver";
import {util} from "../../../lib/util/util";
import natural_join = util.natural_join;
import shorten_integer_list = util.shorten_integer_list;
import spotNumber = ScanTree.spotNumber;
import {TextRendering} from "../TextRendering";
import render_digspot = TextRendering.render_digspot;
import LightButton from "../widgets/LightButton";
import {Scans} from "../../../lib/runescape/clues/scans";
import Order = util.Order;
import Pulse = Scans.Pulse;
import {ScanLayer} from "../map/layers/ScanLayer";

abstract class NewMethodPanel extends SidePanel {
    protected constructor(modal: Modal | null = null) {
        super();

        if (modal) {
            c("<span class='img-button'><img class='inline-img' src='assets/icons/info.png'></span>")
                .tapRaw(e => e.on("click", () => modal.show()))
        }
    }
}

class ScanTreeSolvingLayer extends ScanLayer {
    node: Observable<AugmentedDecisionTree> = observe(null)

    constructor(options: {
        show_edit_button?: boolean
    } = {}) {
        super(options);


        this.node.subscribe((node, old_node) => {
            if (old_node == null) {
                this.spots.set(node.root.remaining_candidates)
                this.spot_order.set(node.raw_root.spot_ordering)
            }

            this.active_spots.set(node.remaining_candidates)

            // TODO: Render paths
        })
    }

}

class ScanTreeMethodPanel extends NewMethodPanel {
    node: Observable<AugmentedDecisionTree> = observe(null)

    private ui_nav: Widget
    private ui_next_step: Widget
    private ui_tree: Widget

    constructor(private template_resolver: TemplateResolver) {
        super(modal("modal-scantree-method-explanation", ScanExplanationModal));

        this.ui_nav = c(`<nav style='display: inline-block;'></nav>`)
            .css("--bs-breadcrumb-divider", "'>'")
            .appendTo(this)
        c("<div class='nextstep'>Next: </div>").append(this.ui_next_step = c("<span>")).appendTo(this)
        this.ui_tree = c("<div style='padding-left: 15px;'></div>").appendTo(this)

        this.title.set("Scan Tree")

        this.node.subscribe(() => this.render())
    }

    private render() {
        let node = this.node.get()

        {
            this.ui_nav.empty()
            let list = c("<ol class='breadcrumb' style='margin-bottom: unset'></ol>").appendTo(this.ui_nav)

            AugmentedDecisionTree.collect_parents(node)
                .map(n =>
                    c("<span class='nisl-textlink'>")
                        .tapRaw(e => e.on("click", () => this.node.set(n)))
                        .text(AugmentedDecisionTree.decision_string(n))
                ).forEach(w => w.appendTo(c("<li>").addClass("breadcrumb-item").appendTo(list)))

            let last = list.container.children().last()

            last.text(last.children().first().text()).addClass("active")
        }

        let text: string = "INVALID DATA"

        if (node.raw.directions) {
            text = this.template_resolver
                .with(scan_tree_template_resolvers(node))
                .resolve(node.raw.directions)
        } else {
            if (node.remaining_candidates.length > 1) {
                if (node.parent && node.parent.key.pulse == 3) {
                    text = `Which spot of ${natural_join(shorten_integer_list(node.remaining_candidates.map(c => spotNumber(node.raw_root, c)), render_digspot))}?`
                } else {
                    text = `No more instructions. Check remaining spots:`
                }
            }
        }

        this.ui_next_step.container.html(text)

        this.renderChildren(node, 0, this.ui_tree.empty())
    }

    private renderList(node: AugmentedDecisionTree, depth: number, container: Widget): void {
        let resolver = this.template_resolver.with(scan_tree_template_resolvers(node))

        let line = c("<div>")
            .addClass("scantreeline")
            .css("padding-left", `${depth * 18}px`)
            .css("margin-top", "3px")
            .css("margin-bottom", "3px")
            .css("font-size", `${13 /*/ (Math.pow(1.25, depth))*/}px`)

        let link_html = node.parent.key
            ? Pulse.pretty_with_context(node.parent.key, node.parent.node.children.map(c => c.key))
            : resolver.resolve(`Spot {{digspot ${spotNumber(node.raw_root, node.remaining_candidates[0])}}}`)             // Nodes without a parent kind always have exactly one remaining candidate as they are synthetic

        if (depth == 0) {
            new LightButton().on("click", () => this.node.set(node))
                .setHTML(link_html)
                .appendTo(line)
        } else if (depth > 0) {
            c("<span>- <span class='lightlink'></span>: </span>").appendTo(line)
                .container
                .children("span")
                .html(link_html)
                .on("click", () => this.node.set(node))
        }

        if (node.raw.directions != null) {
            c("<span>")
                .setInnerHtml(resolver.resolve(node.raw.directions))
                .appendTo(line)
        } else if (node.children.some(c => c.key == null)) {
            // This node only has synthetic children left

            if (node?.parent?.key && node.parent.key.pulse == 3) {
                // Directly link to triple spots

                line.append(c("<span>").text("at"))

                node.children.map(c => c.value)
                    .sort(Order.comap(Order.natural_order, (c) => spotNumber(node.raw_root, c.remaining_candidates[0])))
                    .forEach((child) => {
                        new LightButton()
                            .setHTML(render_digspot(spotNumber(node.raw_root, child.remaining_candidates[0])))
                            .on("click", () => this.node.set(child))
                            .appendTo(line)
                    })
            } else {
                c("<span>No more instructions</span>").appendTo(line)
            }
        }

        line.appendTo(container)

        this.renderChildren(node, depth + 1, container)
    }

    private renderChildren(node: AugmentedDecisionTree, depth: number, container: Widget): void {
        if (depth >= 2) return

        node.children
            .filter((e) => e.key.pulse != 3)
            .sort(Order.comap(Scans.Pulse.compare, (a) => a.key))
            .forEach((e) => this.renderList(e.value, depth, container))

        let triples = node.children.filter(e => e.key.pulse == 3)

        if (triples.length > 0) {

            let line = c("<div>")
                .appendTo(container)
                .addClass("scantreeline")
                .css("padding-left", `${(depth) * 18}px`)
                .css("margin-top", "3px")
                .css("margin-bottom", "3px")
                .css("font-size", `${13 /*/ (Math.pow(1.25, depth))*/}px`)

            c("<span>- Triple at </span>").appendTo(line)

            triples
                .sort(Order.comap(Order.natural_order, (c) => spotNumber(node.raw_root, c.value.remaining_candidates[0])))
                .forEach((child) => {
                    new LightButton()
                        .setHTML(render_digspot(spotNumber(node.raw_root, child.value.remaining_candidates[0])))
                        .on("click", () => this.node.set(child.value))
                        .appendTo(line)
                })
        }
    }
}

class SolveScanTreeSubBehaviour extends Behaviour {
    node: Observable<AugmentedDecisionTree> = observe(null)

    panel: ScanTreeMethodPanel = null
    layer: ScanTreeSolvingLayer = null

    constructor(private parent: SolveBehaviour, private method: ScanTreeWithClue) {
        super();
    }

    protected begin() {
        this.parent.parent.sidepanels.add(this.panel = new ScanTreeMethodPanel(this.parent.parent.template_resolver), 2)
        this.layer = new ScanTreeSolvingLayer({show_edit_button: !this.parent.parent.in_alt1}).addTo(this.parent.parent.map.map.main_layer)

        this.node.bind(this.panel.node).bind(this.layer.node)

        this.node.setAsync(ScanTree.Augmentation.augment(this.method).then(a => a.root))
    }

    protected end() {
        this.panel.remove()
        this.layer.remove()
    }
}

class NoMethodSubBehaviour extends Behaviour {
    protected begin() {
        // TODO: Display generic solution layer

    }

    protected end() { }
}

export default class SolveBehaviour extends Behaviour {
    private clue = observe<ClueStep | null>(null).equality((a, b) => a?.id == b?.id)
    private method = observe<MethodWithClue | null>(null)

    private clue_panel: NewCluePanel = null

    private method_subbehaviour = this.withSub(new SingleBehaviour())

    constructor(public parent: Application) {
        super();

        this.clue.subscribe(clue => {
            if (this.isActive()) {
                if (this.clue_panel) {
                    this.clue_panel.remove()
                    this.clue_panel = null
                }

                if (clue) {
                    this.parent.sidepanels.add(this.clue_panel = new NewCluePanel(clue), 0)
                }
            }
        })

        this.method.subscribe(method => {
            let behaviour = (() => {
                switch (method?.type) {
                    case "scantree":
                        return new SolveScanTreeSubBehaviour(this, method as ScanTreeWithClue)
                    case null:
                    default:
                        return new NoMethodSubBehaviour()
                }
            })()

            this.method_subbehaviour.set(behaviour)
        })
    }

    setClue(clue: ClueStep) {
        this.clue.set(clue)
        this.method.set(null)
    }

    setMethod(method: MethodWithClue) {
        this.clue.set(method.clue)
        this.method.set(method)
    }

    protected begin() {
        // TODO:
        //  - Set sidepanels
        //  - Construct and set layer
    }

    protected end() {
    }
}