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
import {ClueIndex, ClueSpotIndex} from "../../../data/ClueIndex";
import Properties from "../widgets/Properties";
import * as tippy from "tippy.js";
import {floor_t, GieliCoordinates, TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import vbox = C.vbox;
import Widget from "../../../lib/ui/Widget";
import {Rectangle} from "../../../lib/math";
import {clue_data} from "../../../data/clues";
import {AugmentedMethod, MethodPackManager, Pack} from "../../model/MethodPackManager";
import {Constants} from "../../constants";
import {util} from "../../../lib/util/util";
import natural_join = util.natural_join;
import UtilityLayer from "../map/UtilityLayer";
import * as lodash from "lodash";
import LightButton from "../widgets/LightButton";
import {v4 as uuidv4} from 'uuid';
import {DropdownSelection} from "../widgets/DropdownSelection";
import TextField from "../../../lib/ui/controls/TextField";
import ClueSpot = Clues.ClueSpot;
import {SolvingMethods} from "../../model/methods";

type FilterT = {
    tiers?: { [P in ClueTier]: boolean },
    types?: { [P in ClueType]: boolean },
    method_pack?: string,
    method_mode?: "none" | "at_least_one"
}

namespace FilterT {
    import ClueSpot = Clues.ClueSpot;

    export function normalize(f: FilterT): FilterT {
        if (!f.types) {
            f.types = {
                simple: true,
                anagram: true,
                compass: true,
                coordinates: true,
                cryptic: true,
                emote: true,
                map: true,
                scan: true,
                skilling: true
            }
        }

        if (!f.tiers) {
            f.tiers = {
                easy: true,
                elite: true,
                hard: true,
                master: true,
                medium: true
            }
        }

        if (!f.method_mode) f.method_mode = "at_least_one"

        return f
    }

    export async function apply(f: FilterT, clue: ClueSpot, methods?: MethodPackManager): Promise<boolean> {
        if (!(f.types[clue.clue.type] && f.tiers[clue.clue.tier])) return false

        if (methods && f.method_pack) {
            let ms = await methods.getForClue(clue.clue.id, clue.spot)

            switch (f.method_mode) {
                case "none":
                    if (ms.some(m => m.pack.local_id == f.method_pack)) return false
                    break
                case "at_least_one":
                    if (!ms.some(m => m.pack.local_id == f.method_pack)) return false
                    break
            }
        }

        return true
    }
}

class FilterControl extends GameMapControl<ControlWithHeader> {
    private stored_filter = new storage.Variable<FilterT>("preferences/cluefilters2", () => FilterT.normalize({}))
    public filter: Observable<FilterT> = observe({})

    constructor(
        private methods: MethodPackManager
    ) {
        super({
            type: "floating",
            position: "top-left"
        }, new ControlWithHeader("Clue Filter"))

        this.filter.set(FilterT.normalize(this.stored_filter.get()))
        this.filter.subscribe(f => {this.stored_filter.set(f)})

        this.renderFilter()
    }

    async renderFilter(): Promise<void> {
        let props = new Properties()
        // TODO: Also filter for challenge types

        let buttons: {
            tier: { tier: ClueTier, btn: SmallImageToggleButton }[],
            type: { type: ClueType, btn: SmallImageToggleButton }[],
        } = {
            tier: ClueTier.all.map(t => {
                return {
                    tier: t, btn: sitog(ClueType.meta(t).icon_url, (v) => this.filter.update(f => f.tiers[t] = v))
                        .setState(this.filter.value().tiers[t])
                        .tooltip(ClueType.meta(t).name)
                }
            }),
            type: ClueType.all.map(t => {
                return {
                    type: t, btn: sitog(ClueType.meta(t).icon_url, (v) => this.filter.update(f => f.types[t] = v))
                        .setState(this.filter.value().types[t])
                        .tooltip(ClueType.meta(t).name)
                }
            })
        }

        props.named("Tier", hbox(...buttons.tier.map(s => s.btn), spacer()).addClass("ctr-filter-control-row"))
        props.named("Type", hbox(...buttons.type.map(s => s.btn), spacer()).addClass("ctr-filter-control-row"))

        /*
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
        )*/

        this.content.body.append(props)

        if (this.methods) {
            let specifics_container = hbox()

            let selection = new DropdownSelection({
                    type_class: {
                        toHTML(v: Pack): Widget {
                            if (v) return span(`${lodash.capitalize(v.type)}: ${v.name}`)
                            else return span("None")
                        }
                    },
                    can_be_null: true
                },
                await this.methods.all()
            )

            props.named("Methods",
                vbox(
                    selection,
                    specifics_container
                )
            )

            selection.onSelection(s => {
                this.filter.update(f => f.method_pack = s?.local_id)

                specifics_container.empty()
                if (s) {
                    specifics_container.append(
                        span("None"),
                        span("At least one")
                    )
                }
            })
        }

        props.named("Search", new TextField().setPlaceholder("Search"))
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

    constructor(private clue: Clues.ClueSpot,
                private methods: MethodPackManager,
                private edit_handler: (_: AugmentedMethod) => any,
                private talk_alternative_index?: number,
    ) {
        super();

        let coord: TileCoordinates

        switch (clue.clue.type) {
            case "anagram":
            case "simple":
            case "cryptic":
            case "map":
                switch (clue.clue.solution?.type) {
                    case "talkto":
                        if (talk_alternative_index != null && clue.clue.solution?.spots[talk_alternative_index])
                            coord = TileRectangle.center(clue.clue.solution.spots[talk_alternative_index].range)
                        break;
                    case "dig":
                    case "search":
                        coord = clue.clue.solution.spot
                        break;
                }
                break
            case "compass":
                coord = this.clue.spot
                break
            case "coordinates":
                coord = GieliCoordinates.toCoords(clue.clue.coordinates)
                break
            case "emote":
                if (clue.clue.area)
                    coord = TileRectangle.center(clue.clue.area)
                break;
            case "scan":
                coord = TileCoordinates.lift(Rectangle.center(Rectangle.from(...clue.clue.spots)), Math.min(...clue.clue.spots.map(s => s.level)) as floor_t)
                break;
            case "skilling":
                // TODO:
                coord = {x: 0, y: 0, level: 0}
                //coord = clue.area ? TileRectangle.center(clue.area) : null
                break
        }

        if (!coord) coord = {x: 0, y: 0, level: 0}

        this.marker = new TileMarker(coord).withMarker().addTo(this)
    }

    static forClue(spot: ClueSpot, method_index: MethodPackManager,
                   edit_handler: (_: AugmentedMethod) => any): ClueOverviewMarker[] {

        let variants: { instance_index?: number }[] = (() => {
            if (spot.clue.solution?.type == "talkto" && spot.clue.solution.spots) {
                return spot.clue.solution.spots.map((s, i) => ({instance_index: i}))
            } else return [{}]
        })()

        return variants.map(({instance_index}) => new ClueOverviewMarker(spot, method_index, edit_handler, instance_index))
    }

    async createTooltip(): Promise<tippy.Instance> {
        if (this.tippy) {
            this.tippy.destroy()
            this.tippy = null
        }

        let self = this

        async function construct(): Promise<Widget> {

            let props = new Properties()
            props.row(hbox(
                span(`${ClueType.meta(self.clue.clue.tier).name} ${ClueType.meta(self.clue.clue.type).name} Step (Id ${self.clue.clue.id})`).css("font-weight", "bold"),
                spacer().css("min-width", "30px"),
                c(`<img class="icon" src='${self.clue.clue.tier ? Constants.icons.tiers[self.clue.clue.tier] : ""}' title="${ClueType.pretty(self.clue.clue.tier)}">`),
                c(`<img class="icon" src='${Constants.icons.types[self.clue.clue.type]}' title="${ClueType.pretty(self.clue.clue.type)}">`))
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

            switch (self.clue.clue.type) {
                case "scan":
                    props.named("Area", c().text(`${self.clue.clue.scantext}`))
                    props.named("Range", c().text(`${self.clue.clue.range}`))
                    props.named("Spots", c().text(`${self.clue.clue.spots.length}`))
                    break
                case "compass":
                    renderSolution(props, {type: "dig", spot: self.clue.spot})
                    props.named("Total", c().text(`${self.clue.clue.spots.length}`))
                    break
                case "coordinates":
                    props.named("Text", c().text(self.clue.clue.text[0]).css("font-style", "italic"))
                    props.named("Coordinates", c().text(GieliCoordinates.toString(self.clue.clue.coordinates)))
                    renderSolution(props, {type: "dig", spot: GieliCoordinates.toCoords(self.clue.clue.coordinates)})
                    break
                case "simple":
                case "cryptic":
                case "anagram":
                    props.named("Text", c().text(self.clue.clue.text[0]).css("font-style", "italic"))
                    renderSolution(props, self.clue.clue.solution)
                    break
                case "map":
                    props.row(
                        c(`<div style="text-align: center"><img src="${self.clue.clue.image_url}" style="height: 150px; width: auto"></div>`)
                    )
                    props.named("Transcript", c().text(self.clue.clue.text[0]))
                    renderSolution(props, self.clue.clue.solution)
                    break
                case "emote":
                    props.named("Text", c().text(self.clue.clue.text[0]))
                    props.named("Equip", c().text(natural_join(self.clue.clue.items, "and")))

                    if (self.clue.clue.emotes.length > 1)
                        props.named("Emotes", c().text(natural_join(self.clue.clue.emotes, "then")))
                    else
                        props.named("Emote", c().text(self.clue.clue.emotes[0]))

                    props.named("Agent", c().text(self.clue.clue.double_agent ? "Yes" : "No"))
                    break
                case "skilling":
                    props.named("Text", c().text(self.clue.clue.text[0]))
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

            if (self.clue.clue.challenge?.length > 0) {
                props.named("Challenge", hbox(...self.clue.clue.challenge.map(render_challenge).map(s => s.css("flex-grow", "1"))))
            }

            let methods = await self.methods.getForClue(self.clue.clue.id, self.clue.spot)
            props.header("Methods")

            if (methods.length > 0) {
                let grouped = lodash.groupBy(methods, e => e.pack.local_id)

                for (let methods_in_pack of Object.values(grouped)) {
                    props.row(new MethodWidget(methods_in_pack, self.edit_handler))
                }
            } else {
                if (self.clue.spot) {
                    props.row(c().text("No methods for this spot."))
                } else {
                    props.row(c().text("No methods for this clue."))
                }
            }

            props.row(hbox(new LightButton("+ New Method", "rectangle").onClick(() => {
                self.edit_handler({
                    clue: self.clue.clue,
                    pack: null,
                    method: SolvingMethods.init(self.clue)
                })
            })).addClass("ctr-button-container"))

            return c("<div style='background: rgb(10, 31, 41); border: 1px solid white; width: 400px'></div>").append(props)

        }

        //let cont = await construct()

        let lock = false

        this.tippy = tippy.default(this.marker.marker.getElement(), {
            onBeforeUpdate: (instance): void => {
                if (lock) return

                (async () => {
                    lock = true
                    await construct().then(w => instance.setContent(w.raw()))
                    lock = false
                })()
            },
            onShow: (instance) => {
                construct().then(w => instance.setContent(w.raw()))
            },
            content: () => c().text("Loading").raw(),
        })

        return this.tippy
    }
}

export default class OverviewLayer extends GameLayer {
    filter_control: FilterControl

    public marker_index: ClueSpotIndex<{ markers: ClueOverviewMarker[] }>
    singleton_tooltip: tippy.Instance = null

    constructor(private app: Application, private edit_handler: (_: AugmentedMethod) => any) {
        super();

        this.add(new UtilityLayer())

        this.filter_control = new FilterControl(app.methods).addTo(this)

        this.marker_index = clue_data.spot_index.with(() => ({markers: []}))

        this.on("add", () => {
            this.filter_control.filter.subscribe(async (f) => {
                await Promise.all(this.marker_index.flat().map(async c => {
                        let visible = await FilterT.apply(f, c.for, this.app.methods)

                        if (!visible && c.markers.length > 0) {
                            c.markers.forEach(c => c.remove())
                            c.markers = []
                        } else if (visible && c.markers.length == 0) {
                            c.markers = ClueOverviewMarker.forClue(c.for, app.methods, this.edit_handler)
                            c.markers.forEach(m => m.addTo(this))
                        }
                    })
                )

                let instances = await Promise.all(
                    this.marker_index
                        .flat()
                        .flatMap(c => c.markers.map(m => {
                            try {
                                return m.createTooltip()
                            } catch (e) {
                                return null
                            }
                        }))
                        .filter(i => i != null)
                )

                if (this.singleton_tooltip) {
                    this.singleton_tooltip.destroy()
                    this.singleton_tooltip = null
                }

                this.singleton_tooltip = tippy.createSingleton(instances, {
                    interactive: true,
                    interactiveBorder: 20,
                    interactiveDebounce: 0.5,
                    arrow: true,
                    overrides: ["onShow", "onBeforeUpdate"],
                    appendTo: () => document.body,
                    delay: 0,
                    animation: false,
                })

            }, true)
        })
    }
}
