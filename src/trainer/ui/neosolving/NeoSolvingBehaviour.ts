import Behaviour, {SingleBehaviour} from "../../../lib/ui/Behaviour";
import {Application} from "../../application";
import GameLayer from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {C} from "../../../lib/ui/constructors";
import Widget from "../../../lib/ui/Widget";
import Button from "../../../lib/ui/controls/Button";
import TextField from "../../../lib/ui/controls/TextField";
import {ExpansionBehaviour} from "../../../lib/ui/ExpansionBehaviour";
import {AbstractDropdownSelection} from "../widgets/AbstractDropdownSelection";
import {Clues} from "../../../lib/runescape/clues";
import {clue_data} from "../../../data/clues";
import PreparedSearchIndex from "../../../lib/util/PreparedSearchIndex";
import {Ewent, Observable, observe} from "../../../lib/reactive";
import {TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import * as lodash from "lodash";
import {Rectangle, Vector2} from "../../../lib/math";
import span = C.span;
import {util} from "../../../lib/util/util";
import {Path} from "../../../lib/runescape/pathing";
import InteractionType = Path.InteractionType;
import todo = util.todo;
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {ScanTheory} from "../../../lib/cluetheory/scans/Scans";
import PulseInformation = ScanTheory.PulseInformation;
import {Scans} from "../../../lib/runescape/clues/scans";
import Pulse = Scans.Pulse;
import {SolvingMethods} from "../../model/methods";
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import {ScanTree} from "../../../lib/cluetheory/scans/ScanTree";
import {scan_tree_template_resolvers, SolveScanTreeSubBehaviour} from "../solving/scans/ScanSolving";
import LightButton from "../widgets/LightButton";
import hbox = C.hbox;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import * as leaflet from "leaflet"
import {createStepGraphics} from "../path_graphics";

class NeoReader {
    read: Ewent<{ step: Clues.Step, text_index: number }>
    compass_angle_read: Ewent<{ angle: number }>
    pulse_read: Ewent<Pulse>
}

class FavoriteIndex {
    constructor(private methods: MethodPackManager) {

    }

    getTalkId(clue: Clues.Step): number {
        todo()
    }

    setTalkId(clue: Clues.Step, id: number): void {
        todo()
    }

    getChallengeAnswerId(clue: Clues.Step): number {
        todo()
    }

    setChallengeAnswerId(clue: Clues.Step, answer_id: number): void {
        todo()
    }

    getMethod(step: Clues.ClueSpot): AugmentedMethod {
        const candidates = this.methods.getForClue(step.clue.id, step.spot)

        // TODO: Get real favourite

        return null
    }

    setMethod(method: AugmentedMethod): void {
        todo()
    }
}

class NeoSolvingLayer extends GameLayer {
    public control_bar: NeoSolvingLayer.MainControlBar
    public clue_container: Widget
    public solution_container: Widget
    public scantree_container: Widget

    private sidebar: GameMapControl

    constructor(private behaviour: NeoSolvingBehaviour) {
        super();

        this.sidebar = new GameMapControl({
            position: "top-left",
            type: "floating",
            no_default_styling: true
        }, c().addClass("ctr-neosolving-sidebar")).addTo(this)

        this.sidebar.content.append(
            new NeoSolvingLayer.MainControlBar(behaviour),
            this.clue_container = c(),
            this.solution_container = c(),
            this.scantree_container = c()
        )
    }

    fit(view: TileRectangle): this {
        let copy = lodash.cloneDeep(view)

        // Modify the rectangle to center the view on the space right of the sidebar.
        {
            const sidebar_w = this.sidebar.content.raw().clientWidth + 20
            const total_w = this.getMap().container.get()[0].clientWidth

            const f = sidebar_w / Math.max(sidebar_w, total_w - sidebar_w)

            copy.topleft.x -= f * Rectangle.width(view)
        }

        this.map.fitView(copy, {
            maxZoom: 4,
        })

        return this
    }
}

namespace NeoSolvingLayer {
    import spacer = C.spacer;
    import hbox = C.hbox;
    import Step = Clues.Step;


    class MainControlButton extends Button {
        constructor(options: { icon?: string, text?: string }) {
            super();

            if (options.icon) {
                this.append(c(`<img src="${options.icon}" class="ctr-neosolving-main-bar-icon">`))
            }

            if (options.text) {
                this.append(c().text(options.text))
                if (options.icon) {
                    this.append(spacer())
                } else {
                    this.css("justify-content", "center")
                }
                this.css("flex-grow", "1")
            }

            this.addClass("ctr-neosolving-main-bar-button")
                .addClass("ctr-neosolving-main-bar-section")
        }
    }

    export class MainControlBar extends Widget {
        search_bar: TextField
        rest: Widget

        search_bar_collapsible: ExpansionBehaviour
        rest_collapsible: ExpansionBehaviour

        dropdown: AbstractDropdownSelection.DropDown<{ step: Clues.Step, text_index: number }> = null

        prepared_search_index: PreparedSearchIndex<{ step: Clues.Step, text_index: number }>

        constructor(private parent: NeoSolvingBehaviour) {
            super();

            this.addClass("ctr-neosolving-main-bar")

            this.prepared_search_index = new PreparedSearchIndex<{ step: Clues.Step, text_index: number }>(
                clue_data.all.flatMap(step => step.text.map((_, i) => ({step: step, text_index: i}))),
                (step) => step.step.text[step.text_index]
                , {
                    all: true,
                    threshold: -10000
                }
            )

            this.dropdown = new AbstractDropdownSelection.DropDown<{ step: Clues.Step, text_index: number }>({
                dropdownClass: "ctr-neosolving-search-dropdown",
                renderItem: e => {
                    return c().text(Step.shortString(e.step, e.text_index))
                }
            })
                .onSelected(async clue => {
                    this.parent.setClue(clue)

                    let m = await this.parent.app.methods.getForClue(clue.step.id)
                    // TODO: Get from favourites instead
                    if (m.length > 0) this.parent.setMethod(m[0])
                })
                .onClosed(() => {
                    this.search_bar_collapsible.collapse()
                })
                .setItems([])

            this.append(
                new MainControlButton({icon: "assets/icons/glass.png"})
                    .append(this.search_bar = new TextField()
                        .css("flex-grow", "1")
                        .setPlaceholder("Enter Search Term...")
                        .toggleClass("nisinput", false)
                        .addClass("ctr-neosolving-main-bar-search")
                        .setVisible(false)
                        .onChange(({value}) => {
                            let results = this.prepared_search_index.search(value)

                            this.dropdown.setItems(results)
                        })
                    )
                    .onClick((e) => {
                        e.stopPropagation()

                        if (this.search_bar_collapsible.isExpanded()) {
                            e.preventDefault()
                        } else {
                            this.search_bar_collapsible.expand()
                            this.search_bar.container.focus()
                            this.search_bar.setValue("")
                        }
                    }),
                this.rest = hbox(
                    new MainControlButton({text: "Solve"}),
                    new MainControlButton({icon: "assets/icons/lock.png", text: "Auto"})
                        .setToggleable(true),
                    new MainControlButton({icon: "assets/icons/fullscreen.png"})
                        .setToggleable(true),
                    new MainControlButton({icon: "assets/icons/settings.png"})
                ).css("flex-grow", "1"),
            )

            this.search_bar_collapsible = ExpansionBehaviour.horizontal({widget: this.search_bar, starts_collapsed: true, duration: 100})
                .onChange(v => {
                    if (v) this.dropdown?.close()
                    else {
                        this.dropdown.setItems(this.prepared_search_index.items())
                        this.dropdown?.open(this, this.search_bar)
                    }

                    this.rest_collapsible.setCollapsed(!v)
                })

            this.rest_collapsible = ExpansionBehaviour.horizontal({widget: this.rest, starts_collapsed: false})
        }
    }
}

class ScanTreeSolvingControl extends Behaviour {
    node: ScanTree.Augmentation.AugmentedScanTreeNode = null
    augmented: ScanTree.Augmentation.AugmentedScanTree = null

    tree_widget: Widget

    constructor(public parent: NeoSolvingBehaviour, public method: AugmentedMethod<ScanTreeMethod, Clues.Scan>) {
        super()

        this.augmented = ScanTree.Augmentation.basic_augmentation(method.method.tree, method.clue)
    }

    private fit() {
        // TODO: This is a copy of the old implementation
        let node = this.node

        let bounds = leaflet.bounds([])

        //1. If no children: All Candidates
        if (node.children.length == 0)
            node.remaining_candidates.map(Vector2.toPoint).forEach((c) => bounds.extend(c))

        //2. All children that are leafs in the augmented tree (i.e. spots directly reached from here)
        /* //TODO: Rethink this, disabled to get the build working again
        this.node.get().children.filter(c => c.value.is_leaf)
            .map(c => c.value.remaining_candidates.map(Vector2.toPoint).forEach(spot => bounds.extend(spot)))

         */

        //4. "Where"
        if (node.region) {
            bounds.extend(Vector2.toPoint(node.region.area.topleft))
            bounds.extend(Vector2.toPoint(node.region.area.botright))
        }

        // 5. parent.where if not far away
        if (node.parent && node.parent.node.region) {
            let o = leaflet.bounds([])

            o.extend(Vector2.toPoint(node.parent.node.region.area.topleft))
            o.extend(Vector2.toPoint(node.parent.node.region.area.botright))

            if (o.getCenter().distanceTo(bounds.getCenter()) < 60) {
                bounds.extend(o)
            }
        }

        // 6. The path
        // TODO: Include path bounds, without augmenting it!

        this.parent.layer.getMap().fitBounds(util.convert_bounds(bounds).pad(0.1), {
            maxZoom: 4,
            animate: true,
        })
    }


    setNode(node: ScanTree.Augmentation.AugmentedScanTreeNode) {
        this.node = node

        this.tree_widget.empty()

        this.parent.path_control.setSections(Path.split_into_sections(node.raw.path))
        this.fit()

        const resolvers = this.parent.app.template_resolver.with(scan_tree_template_resolvers(node))

        {
            let row = c("<div tabindex='-1'>").addClass("ctr-neosolving-solution-row").text(this.method.method.name)

            row.on("click", async () => {
                new AbstractDropdownSelection.DropDown<AugmentedMethod>({renderItem: m => c().text(m.method.name)})
                    .setItems(await this.parent.app.methods.getForClue(this.parent.active_clue.step.id))
                    .onSelected(m => {
                        this.parent.setMethod(m)
                    })
                    .open(row, row)
            })

            this.tree_widget.append(row)
        }

        {
            let ui_nav = c()

            let list = c("<ol class='breadcrumb' style='margin-bottom: unset'></ol>").appendTo(ui_nav)

            AugmentedScanTree.collect_parents(node)
                .map(n =>
                    c("<span class='nisl-textlink'>")
                        .tapRaw(e => e.on("click", () => this.setNode(n)))
                        .text(AugmentedScanTree.decision_string(n))
                ).forEach(w => w.appendTo(c("<li>").addClass("breadcrumb-item").appendTo(list)))

            let last = list.container.children().last()

            last.text(last.children().first().text()).addClass("active")

            this.tree_widget.append(ui_nav)
        }

        this.tree_widget.append(c().addClass('nextstep').setInnerHtml(resolvers.resolve(node.raw.directions)))

        for (let child of node.children) {
            hbox(
                new LightButton(child.key.pulse.toString(), "rectangle")
                    .onClick(() => {
                        this.setNode(child.value)
                    }),
                c().setInnerHtml(resolvers.resolve(child.value.raw.directions))
            ).css("justify-content", "left").appendTo(this.tree_widget)
        }
    }

    protected begin() {
        this.tree_widget = c().appendTo(this.parent.layer.scantree_container)

        this.setNode(this.augmented.root_node)
    }

    protected end() {
        this.tree_widget.remove()
    }
}

class PathControl extends Behaviour {
    private path_layer: leaflet.FeatureGroup = new OpacityGroup()

    constructor(private parent: NeoSolvingBehaviour) {
        super();
    }


    protected begin() {
        this.path_layer.addTo(this.parent.layer)
    }

    protected end() {
        this.path_layer.remove()
    }

    setSections(sections: Path.Section[]): void {
        this.path_layer.clearLayers()

        for (let section of sections) {
            for (let step of section.steps) {
                createStepGraphics(step).addTo(this.path_layer)
            }
        }
    }
}

export default class NeoSolvingBehaviour extends Behaviour {
    layer: NeoSolvingLayer

    active_clue: { step: Clues.Step, text_index: number } = null

    auto_solving: Observable<boolean> = observe(false)

    private scantree_behaviour = this.withSub(new SingleBehaviour<ScanTreeSolvingControl>())
    public path_control = this.withSub(new PathControl(this))

    constructor(public app: Application) {
        super();
    }

    /**
     * Sets the active clue. Builds the ui elements and moves the map view to the appropriate spot.
     *
     * @param step The clue step combined with the index of the selected text variant.
     */
    setClue(step: { step: Clues.Step, text_index: number }): void {
        this.reset()

        if (this.active_clue && this.active_clue.step.id == step.step.id && this.active_clue.text_index == step.text_index) {
            return
        }

        this.active_clue = step

        const settings = NeoSolving.Settings.DEFAULT

        const clue = step.step

        {
            let w = c()

            if (step.step.type == "map") {
                w.append(c(`<img src='${step.step.image_url}' style="width: 100%">`).addClass("ctr-neosolving-solution-row").text(step.step.text[step.text_index]))
            } else {
                w.append(c().addClass("ctr-neosolving-solution-row").text(step.step.text[step.text_index]))
            }

            if (step.step.solution) {
                const sol = step.step.solution

                switch (sol?.type) {
                    case "talkto":
                        if (!settings.talks.at_all) break

                        let npc_spot_id = 0 // TODO

                        w.append(c().addClass("ctr-neosolving-solution-row")
                            .append(
                                c("<img src='assets/icons/cursor_talk.png'>"),
                                span("Talk to "),
                                C.npc(sol.npc, true)
                                    .tooltip("Click to center")
                                    .on("click", () => {
                                        this.layer.fit(sol.spots[npc_spot_id].range)
                                    }),
                                settings.talks.description
                                    ? span(" " + sol.spots[npc_spot_id].description)
                                    : undefined
                            ))

                        break;
                    case "search":
                        if (!settings.searches.at_all) break

                        if (sol.key && settings.searches.key_solution) {
                            w.append(c().addClass("ctr-neosolving-solution-row").append(
                                c("<img src='assets/icons/key.png'>"),
                                span(sol.key.answer).addClass("ctr-clickable").on("click", () => {
                                    this.layer.fit(sol.key.area)
                                }),
                            ))
                        }

                        w.append(c().addClass("ctr-neosolving-solution-row").append(
                            c("<img src='assets/icons/cursor_talk.png'>"),
                            span("Search "),
                            C.entity(sol.entity, true)
                                .tooltip("Click to center")
                                .on("click", () => {
                                    this.layer.fit(TileRectangle.from(sol.spot))
                                })
                        ))
                        break;
                    case "dig":
                        if (!settings.digs.description && !settings.digs.coordinates) break

                        w.append(c().addClass("ctr-neosolving-solution-row").append(
                            c("<img src='assets/icons/cursor_shovel.png'>"),
                            span("Dig"),
                            settings.digs.coordinates
                                ? span(` at ${TileCoordinates.toString(sol.spot)}`)
                                : null,
                            settings.digs.description && sol.description
                                ? span(sol.description)
                                : null
                        ))

                        break;
                }
            }

            if (clue.type == "emote") {
                if (settings.emotes.hidey_hole && clue.hidey_hole) {
                    w.append(c().addClass("ctr-neosolving-solution-row").append(
                        c("<img src='assets/icons/cursor_search.png'>"),
                        span("Get items from "),
                        C.entity(clue.hidey_hole.name)
                            .tooltip("Click to center")
                            .addClass("ctr-clickable")
                            .on("click", () => {
                                this.layer.fit(TileRectangle.from(clue.hidey_hole.location))
                            })
                    ))
                }

                if (settings.emotes.items) {
                    let row = c().addClass("ctr-neosolving-solution-row").append(
                        c("<img src='assets/icons/cursor_equip.png'>"),
                        span("Equip "),
                    ).appendTo(w)

                    for (let i = 0; i < clue.items.length; i++) {
                        const item = clue.items[i]

                        if (i > 0) {
                            if (i == clue.items.length - 1) row.append(", and ")
                            else row.append(", ")
                        }

                        const is_none = item.startsWith("Nothing") || item.startsWith("No ")

                        row.append(span(item)
                            .toggleClass("nisl-item", !is_none)
                            .toggleClass("nisl-noitem", is_none)
                        )
                    }
                }

                if (settings.emotes.emotes) {
                    let row = c().addClass("ctr-neosolving-solution-row").append(
                        c("<img src='assets/icons/emotes.png'>"),
                    ).appendTo(w)

                    for (let i = 0; i < clue.emotes.length; i++) {
                        const item = clue.emotes[i]

                        if (i > 0) {
                            if (i == clue.emotes.length - 1) row.append(", then ")
                            else row.append(", ")
                        }

                        row.append(item).addClass("nisl-emote")
                    }
                }

                if (settings.emotes.double_agent && clue.double_agent) {
                    w.append(c().addClass("ctr-neosolving-solution-row").append(
                        c("<img src='assets/icons/cursor_attack.png'>"),
                        span("Kill "),
                        C.npc("Double Agent")
                    ))
                }
            } else if (clue.type == "skilling") {
                w.append(c().addClass("ctr-neosolving-solution-row").append(
                    c(`<img src="${InteractionType.meta(clue.cursor).icon_url}">`),
                    span(clue.answer)
                ))
            }

            if (!w.container.is(":empty"))
                this.layer.solution_container.append(w)
        }


    }

    /**
     * Sets the active solving method.
     * Use {@link setClue} to activate the related clue first!
     * Builds the necessary ui elements and potentially zooms to the start point.
     *
     * @param method
     */
    setMethod(method: AugmentedMethod): void {
        if (method.clue.id != this.active_clue?.step?.id) return

        if (method.method.type == "scantree") {
            console.log("Setting method")
            this.scantree_behaviour.set(
                new ScanTreeSolvingControl(this, method as AugmentedMethod<ScanTreeMethod, Clues.Scan>)
            )
        }
    }

    /**
     * Resets both the active clue and method, resets all displayed pathing.
     */
    reset() {
        this.layer.clue_container.empty()
        this.layer.solution_container.empty()

        this.scantree_behaviour.set(null)
    }

    /**
     * Sets the active path displayed in the pathing widget and on the map.
     * Dissects the path into sections automatically.
     *
     * @param path The displayed path.
     */
    private setPath(path: Path.raw) {
        todo()
    }

    /**
     * Sets the active path displayed in the pathing widget, pre-dissected into sections.
     *
     * @param sections
     * @private
     */
    private setPathSections(sections: Path.step[][]) {
        todo()
    }

    /**
     * Adds angle information for a compass clue into the current solving process.
     *
     * @param info
     * @private
     */
    private addCompassInfo(info: { angle: number, position: Vector2 }) {
        todo()
    }

    /**
     * Adds pulse information for a scan clue into the current solving process.
     *
     * @param info
     * @private
     */
    private addScanInfo(info: { position: TileCoordinates, pulse: PulseInformation, range: number }) {
        todo()
    }


    protected begin() {
        this.app.map.addGameLayer(this.layer = new NeoSolvingLayer(this))
    }

    protected end() {
        this.layer.remove()
    }
}

export namespace NeoSolving {


    export type Settings = {
        clue: "full" | "short" | "none",
        talks: {
            at_all: boolean,
            description: boolean,
        }
        digs: {
            coordinates: boolean,
            description: boolean
        },
        searches: {
            at_all: boolean,
            key_solution: boolean
        },
        emotes: {
            hidey_hole: boolean,
            items: boolean,
            emotes: boolean,
            double_agent: boolean
        }
        scan_solving: "always" | "scantree_fallback" | "never",
    }

    export namespace Settings {
        export const DEFAULT: Settings = {
            clue: "full",
            talks: {
                at_all: true,
                description: true
            },
            digs: {
                coordinates: true,
                description: true,
            },
            searches: {
                at_all: true,
                key_solution: true,
            },
            emotes: {
                hidey_hole: true,
                items: true,
                emotes: true,
                double_agent: true
            },
            scan_solving: "always"
        }
    }
}