import {Clues, ClueTier, ClueType} from "../../../lib/runescape/clues";
import {TileMarker} from "../../../lib/gamemap/TileMarker";
import {Application} from "../../application";
import GameLayer from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import {SmallImageButton, SmallImageToggleButton} from "../widgets/SmallImageButton";
import {storage} from "../../../lib/util/storage";
import spacer = C.spacer;
import ControlWithHeader from "../map/ControlWithHeader";
import span = C.span;
import sitog = SmallImageButton.sitog;
import {Observable, observe} from "../../../lib/reactive";
import * as leaflet from "leaflet"
import {ClueIndex} from "../../../data/ClueIndex";
import Properties from "../widgets/Properties";
import * as tippy from "tippy.js";
import {floor_t, GieliCoordinates, TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import vbox = C.vbox;
import Widget from "../../../lib/ui/Widget";
import {Rectangle} from "../../../lib/math";
import {clue_data} from "../../../data/clues";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {Constants} from "../../constants";
import {util} from "../../../lib/util/util";
import natural_join = util.natural_join;
import UtilityLayer from "../map/UtilityLayer";
import * as lodash from "lodash";
import LightButton from "../widgets/LightButton";
import {v4 as uuidv4} from 'uuid';

type FilterT = {
    [P in ClueType | ClueTier]?: boolean
}

namespace FilterT {
    export function normalize(f: FilterT): FilterT {
        for (let key of [].concat(ClueType.all, ClueTier.all)) {
            let old = f[key]

            f[key] = old == undefined || old
        }

        return f
    }

    export function apply(f: FilterT, clue: Clues.Step): boolean {
        return f[clue.type] && f[clue.tier]
    }
}

class FilterControl extends GameMapControl<ControlWithHeader> {
    private stored_filter = new storage.Variable<FilterT>("preferences/cluefilters2", {})
    public filter: Observable<FilterT> = observe({})

    constructor() {
        super({
            type: "floating",
            position: "top-left"
        }, new ControlWithHeader("Clue Filter"))

        // TODO: Also filter for challenge types

        this.filter.set(FilterT.normalize(this.stored_filter.get()))

        this.filter.subscribe(f => {this.stored_filter.set(f)})

        let buttons: {
            tier: { tier: ClueTier, btn: SmallImageToggleButton }[],
            type: { type: ClueType, btn: SmallImageToggleButton }[],
        } = {
            tier: ClueTier.all.map(t => {
                return {
                    tier: t, btn: sitog(ClueType.meta(t).icon_url, (v) => this.filter.update(f => f[t] = v)).setState(this.filter.value()[t])
                        .tooltip(ClueType.meta(t).name)
                }
            }),
            type: ClueType.all.map(t => {
                return {
                    type: t, btn: sitog(ClueType.meta(t).icon_url, (v) => this.filter.update(f => f[t] = v)).setState(this.filter.value()[t])
                        .tooltip(ClueType.meta(t).name)
                }
            })
        }

        this.content.body.append(
            hbox(
                span("Tier"),
                ...buttons.tier.map(s => s.btn),
                spacer()
            ).addClass("ctr-filter-control-row"),
            hbox(
                span("Type"),
                ...buttons.type.map(s => s.btn),
                spacer()
            ).addClass("ctr-filter-control-row"),
        )
    }
}

class MethodWidget extends Widget {
    constructor(methods: AugmentedMethod[],
                private edit_handler: (_: AugmentedMethod) => any
    ) {
        super();

        let pack = methods[0].pack

        this.append(
            c(`<div class="ctr-method-widget-pack-header">${lodash.capitalize(pack.type)} Pack <span>${pack.name}</span></span></div>`)
                .tooltip(`By ${pack.author}. ${pack.description}`)
        )

        for (let m of methods) {
            function render_for() {
                if (m.method.for.spot) return `spot ${TileCoordinates.toString(m.method.for.spot)} in clue ${m.method.for.clue}`
                if (m.method.for.spot) return `clue ${m.method.for.clue}`
            }

            let header = hbox(
                vbox(
                    c(`<div><span style="font-style: italic">${m.method.name}</span></div>`),
                ),
                spacer().css("min-width", "30px"),
                span("F")
            ).addClass("ctr-method-widget-header")
                .appendTo(this)
                .tapRaw(r => r.on("click", () => {
                    body.container.animate({"height": "toggle"})
                }))

            let body = new Properties().appendTo(this)
                .addClass("ctr-method-widget-body")
                .css("display", "None")

            body.row(c().text(m.method.description))
            body.row(hbox(
                new LightButton("Edit", "rectangle").setEnabled(pack.type == "local")
                    .onClick(() => this.edit_handler(m))
                ,
                new LightButton("Edit Copy", "rectangle")
                    .onClick(() => {

                        let c = lodash.cloneDeep(m.method)

                        c.id = uuidv4()

                        this.edit_handler({pack: null, clue: m.clue, method: c})
                    })
                ,
                new LightButton("Delete", "rectangle"),
            ).addClass("ctr-button-container"))
        }

        this.addClass("ctr-method-widget")
    }
}

class ClueOverviewMarker extends leaflet.FeatureGroup {
    private marker: TileMarker

    tippy: tippy.Instance = null

    constructor(private clue: Clues.Step,
                private methods: MethodPackManager,
                private edit_handler: (_: AugmentedMethod) => any,
                private spot_alternative?: TileCoordinates,
                private talk_alternative_index?: number,
    ) {
        super();

        let coord: TileCoordinates

        switch (clue.type) {
            case "anagram":
            case "simple":
            case "cryptic":
            case "map":
                switch (clue.solution?.type) {
                    case "talkto":
                        if (talk_alternative_index != null && clue.solution?.spots[talk_alternative_index])
                            coord = TileRectangle.center(clue.solution.spots[talk_alternative_index].range)
                        break;
                    case "dig":
                    case "search":
                        coord = clue.solution.spot
                        break;
                    default:
                        coord = {x: 0, y: 0, level: 0}
                }
                break
            case "compass":
                coord = this.spot_alternative
                break
            case "coordinates":
                coord = GieliCoordinates.toCoords(clue.coordinates)
                break
            case "emote":
                if (clue.area)
                    coord = TileRectangle.center(clue.area)
                break;
            case "scan":
                coord = TileCoordinates.lift(Rectangle.center(Rectangle.from(...clue.spots)), Math.min(...clue.spots.map(s => s.level)) as floor_t)
                break;
            case "skilling":
                coord = {x: 0, y: 0, level: 0}
                //coord = clue.area ? TileRectangle.center(clue.area) : null
                break
        }

        if (!coord) coord = {x: 0, y: 0, level: 0}

        this.marker = new TileMarker(coord).withMarker().addTo(this)
    }

    static forClue(step: Clues.Step, method_index: MethodPackManager,
                   edit_handler: (_: AugmentedMethod) => any): ClueOverviewMarker[] {

        let variants: { spot?: TileCoordinates, instance_index?: number }[] = (() => {
            if (step?.solution?.type == "talkto" && step.solution.spots) {
                if (!step.solution.spots.map) debugger

                return step.solution.spots.map((s, i) => ({instance_index: i}))
            } else if (step.type == "compass") return step?.spots?.map((s) => ({spot: s})) || [{}]
            else return [{}]
        })()

        return variants.map(({spot, instance_index}) => new ClueOverviewMarker(step, method_index, edit_handler, spot, instance_index))
    }

    async createTooltip(): Promise<tippy.Instance> {
        if (this.tippy) {
            this.tippy.destroy()
            this.tippy = null
        }

        let self = this

        return this.tippy = tippy.default(this.marker.marker.getElement(), {
            content: () => {
                console.log("Getting content")

                let props = new Properties()
                props.row(hbox(
                    span(`${ClueType.meta(this.clue.tier).name} ${ClueType.meta(this.clue.type).name} Step (Id ${this.clue.id})`).css("font-weight", "bold"),
                    spacer().css("min-width", "30px"),
                    c(`<img class="icon" src='${this.clue.tier ? Constants.icons.tiers[this.clue.tier] : ""}' title="${ClueType.pretty(this.clue.tier)}">`),
                    c(`<img class="icon" src='${Constants.icons.types[this.clue.type]}' title="${ClueType.pretty(this.clue.type)}">`))
                )


                function renderSolution(props: Properties, sol: Clues.Solution): void {
                    try {
                        props.named("Solution", (() => {
                            switch (sol.type) {
                                case "dig":
                                    return c(`<span><img src='assets/icons/cursor_shovel.png' class="inline-img"> Dig at ${TileCoordinates.toString(sol.spot)}</span>`)
                                case "search":
                                    return c(`<span><img src='assets/icons/cursor_search.png' class="inline-img"> Search <span class="nisl-entity">${sol.entity}</span> at ${TileCoordinates.toString(sol.spot)}</span>`)
                                case "talkto":
                                    return c(`<span><img src='assets/icons/cursor_talk.png' class="inline-img"> Talk to <span class="nisl-npc">${sol.npc}</span> near ${TileCoordinates.toString(TileRectangle.center(sol.spots[self.talk_alternative_index || 0].range))}</span>`)
                            }
                        })())

                        if (sol.type == "search" && sol.key) {
                            props.named("Key", c(`<span><span style="font-style: italic">${sol.key.instructions}</span> (${sol.key.answer})</span>`))
                        }
                    } catch (e) {
                    }
                }

                switch (this.clue.type) {
                    case "scan":
                        props.named("Area", c().text(`${this.clue.scantext}`))
                        props.named("Range", c().text(`${this.clue.range}`))
                        props.named("Spots", c().text(`${this.clue.spots.length}`))
                        break
                    case "compass":
                        renderSolution(props, {type: "dig", spot: this.spot_alternative})
                        props.named("Total", c().text(`${this.clue.spots.length}`))
                        break
                    case "coordinates":
                        props.named("Text", c().text(this.clue.text[0]).css("font-style", "italic"))
                        props.named("Coordinates", c().text(GieliCoordinates.toString(this.clue.coordinates)))
                        renderSolution(props, {type: "dig", spot: GieliCoordinates.toCoords(this.clue.coordinates)})
                        break
                    case "simple":
                    case "cryptic":
                    case "anagram":
                        props.named("Text", c().text(this.clue.text[0]).css("font-style", "italic"))
                        renderSolution(props, this.clue.solution)
                        break
                    case "map":
                        props.row(
                            c(`<div style="text-align: center"><img src="${this.clue.image_url}" style="height: 150px; width: auto"></div>`)
                        )
                        props.named("Transcript", c().text(this.clue.text[0]))
                        renderSolution(props, this.clue.solution)
                        break
                    case "emote":
                        props.named("Text", c().text(this.clue.text[0]))
                        props.named("Equip", c().text(natural_join(this.clue.items, "and")))

                        if (this.clue.emotes.length > 1)
                            props.named("Emotes", c().text(natural_join(this.clue.emotes, "then")))
                        else
                            props.named("Emote", c().text(this.clue.emotes[0]))

                        props.named("Agent", c().text(this.clue.double_agent ? "Yes" : "No"))
                        break
                    case "skilling":
                        props.named("Text", c().text(this.clue.text[0]))
                        break
                }

                function render_challenge(challenge: Clues.Challenge) {
                    switch (challenge.type) {
                        case "wizard":
                            return c(`<div><img src='assets/icons/cursor_attack.png' class="inline-img"> Wizard</div>`);
                        case "slider":
                            return c(`<div><img src='assets/icons/slider.png' class="inline-img"> Puzzle box</div>`);
                        case "celticknot":
                            return c(`<div><img src='assets/icons/celticknot.png' class="inline-img"> Celtic Knot</div>`);
                        case "lockbox":
                            return c(`<div><img src='assets/icons/lockbox.png' class="inline-img"> Lockbox</div>`);
                        case "towers":
                            return c(`<div><img src='assets/icons/towers.png' class="inline-img"> Towers Puzzle</div>`);
                        case "challengescroll":
                            return c(`<div><img src='assets/icons/cursor_talk.png' class="inline-img"> <span style="font-style: italic">${challenge.question}</span> (Answer: ${natural_join(challenge.answers.map(a => a.note ? `${a.answer} (${a.note}` : a.answer), "or")})</div>`);
                    }
                }

                if (this.clue.challenge?.length > 0) {
                    props.named("Challenge", vbox(...this.clue.challenge.map(render_challenge)))
                }

                this.methods.getForClue(this.clue.id, this.spot_alternative)
                    .then(methods => {
                        if (methods.length > 0) {
                            props.header("Methods")

                            let grouped = lodash.groupBy(methods, e => e.pack.id)

                            for (let methods_in_pack of Object.values(grouped)) {
                                props.row(new MethodWidget(methods_in_pack, this.edit_handler))
                            }
                        }
                    })

                return c("<div style='background: rgb(10, 31, 41); border: 1px solid white; width: 400px'></div>").append(props).raw()
            },
        })
    }
}

export default class OverviewLayer extends GameLayer {
    filter_control: FilterControl

    public clue_index: ClueIndex<{ markers: ClueOverviewMarker[] }>
    singleton_tooltip: tippy.Instance = null

    constructor(private app: Application, private edit_handler: (_: AugmentedMethod) => any) {
        super();

        this.add(new UtilityLayer())

        this.filter_control = new FilterControl().addTo(this)

        this.clue_index = clue_data.index.with(() => ({markers: []}))

        this.on("add", () => {
            this.filter_control.filter.subscribe(async (f) => {
                this.clue_index.filtered().forEach(c => {
                    let visible = FilterT.apply(f, c.clue)

                    if (!visible && c.markers.length > 0) {
                        c.markers.forEach(c => c.remove())
                        c.markers = []
                    } else if (visible && c.markers.length == 0) {
                        c.markers = ClueOverviewMarker.forClue(c.clue, app.methods, this.edit_handler)
                        c.markers.forEach(m => m.addTo(this))
                    }
                })

                let instances = await Promise.all(this.clue_index
                    .filtered()
                    .flatMap(c => c.markers.map(m => {
                        try {
                            return m.createTooltip()
                        } catch (e) {
                            return null
                        }
                    }))
                    .filter(i => i != null))

                if (this.singleton_tooltip) {
                    this.singleton_tooltip.destroy()
                    this.singleton_tooltip = null
                }

                this.singleton_tooltip = tippy.createSingleton(instances, {
                    interactive: true,
                    interactiveBorder: 20,
                    interactiveDebounce: 0.5,
                    arrow: true,
                    appendTo: () => document.body,
                    delay: 0,
                    animation: false,
                })

            }, true)
        })
    }
}
