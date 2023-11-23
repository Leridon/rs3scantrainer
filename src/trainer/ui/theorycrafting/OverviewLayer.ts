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
import {GieliCoordinates, TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import {GameMapKeyboardEvent} from "../../../lib/gamemap/MapEvents";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import {ActionBar} from "../map/ActionBar";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";
import vbox = C.vbox;
import TextField from "../../../lib/ui/controls/TextField";
import Widget from "../../../lib/ui/Widget";
import LightButton from "../widgets/LightButton";
import {boxPolygon, tilePolygon} from "../polygon_helpers";
import GameMapDragAction from "../../../lib/gamemap/interaction/GameMapDragAction";
import {DrawRegionAction} from "../scanedit/TreeEdit";
import {Util} from "leaflet";
import InteractionTopControl from "../map/InteractionTopControl";
import {Rectangle, Vector2} from "../../../lib/math";
import {clue_data} from "../../../data/clues";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import * as assert from "assert";
import {Path} from "../../../lib/runescape/pathing";

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
                return {tier: t, btn: sitog(ClueType.meta(t).icon_url, (v) => this.filter.update(f => f[t] = v)).setState(this.filter.value()[t])}
            }),
            type: ClueType.all.map(t => {
                return {type: t, btn: sitog(ClueType.meta(t).icon_url, (v) => this.filter.update(f => f[t] = v)).setState(this.filter.value()[t])}
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

class ClueOverviewMarker extends leaflet.FeatureGroup {
    private marker: TileMarker

    tippy: tippy.Instance = null

    constructor(private clue: Clues.Step,
                methods: MethodPackManager,
                spot_alterantive?: TileCoordinates,
                talk_alterantive_index?: number,
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
                        if (talk_alterantive_index != null && clue.solution?.spots[talk_alterantive_index])
                            coord = TileRectangle.center(clue.solution.spots[talk_alterantive_index].range)
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
                coord = spot_alterantive
                break
            case "coordinates":
                coord = GieliCoordinates.toCoords(clue.coordinates)
                break
            case "emote":
                coord = {x: 0, y: 0, level: 0} //TileRectangle.center(clue.area)
                break;
            case "scan":
                coord = TileRectangle.center(TileRectangle.from(...clue.spots))
                break;
            case "skilling":
                coord = {x: 0, y: 0, level: 0}
                //coord = clue.area ? TileRectangle.center(clue.area) : null
                break
        }

        if (!coord) coord = {x: 0, y: 0, level: 0}


        this.marker = new TileMarker(coord).withMarker().addTo(this)
    }

    static forClue(step: Clues.Step, method_index: MethodPackManager): ClueOverviewMarker[] {

        let variants: { spot?: TileCoordinates, instance_index?: number }[] = (() => {
            if (step?.solution?.type == "talkto" && step.solution.spots) {
                if(!step.solution.spots.map) debugger

                return step.solution.spots.map((s, i) => ({instance_index: i}))
            }
            else if (step.type == "compass") return step?.spots?.map((s) => ({spot: s})) || [{}]
            else return [{}]
        })()

        return variants.map(({spot, instance_index}) => new ClueOverviewMarker(step, method_index, spot, instance_index))
    }

    createTooltip(): tippy.Instance {
        if (this.tippy) {
            this.tippy.destroy()
            this.tippy = null
        }

        let props = new Properties()
        props.named("Id", c().text(this.clue.id))
        props.named("Text", c().text(this.clue.text[0]))
        //props.named("Spot", c().text(`${spot.x}|${spot.y}|${spot.level}`))

        return this.tippy = tippy.default(this.marker.marker.getElement(), {
            content: () => c("<div style='background: rgb(10, 31, 41); border: 2px solid white'></div>").append(props).container.get()[0],
        })
    }
}

class UtilityLayer extends GameLayer {
    preview: leaflet.Layer

    guard: InteractionGuard

    output: Widget
    value: string
    chunk_in: TextField

    constructor() {
        super();

        this.guard = new InteractionGuard().setDefaultLayer(this)

        let control = new ControlWithHeader("Utility", () => this.remove())

        control.body.append(
            vbox(
                new ActionBar([
                    new ActionBar.ActionBarButton("assets/icons/cursor_generic.png", () => {
                        this.startSelectTile()
                    }),
                    new ActionBar.ActionBarButton("assets/icons/cursor_use.png", () => {
                        this.startSelectArea()
                    }), ,
                    new ActionBar.ActionBarButton("assets/icons/cursor_talk.png", () => {

                        this.guard.set(new DrawRegionAction(""))
                            .onCommit((a) => {
                                this.setLayer(boxPolygon(a.area))

                                this.setValue({range: a.area})
                            })
                    }),
                ]),
                hbox(
                    this.output = c(),
                    spacer(),
                    new LightButton("Copy").onClick(() => {
                        if (this.value) navigator.clipboard.writeText(this.value)
                    })
                ),
                hbox(
                    this.chunk_in = new TextField(),
                    spacer(),
                    new LightButton("Jump").onClick(() => {
                        let [cx, cy, ...rest] = this.chunk_in.get().split(new RegExp("[^0-9]"))
                            .map(e => e.trim())
                            .filter(e => e.length > 0)
                            .map(e => Number(e))

                        Vector2.mul({x: cx, y: cy}, {x: 64, y: 64})

                        this.getMap().fitView(TileRectangle.lift(Rectangle.from({x: cx * 64, y: cy * 64}, {x: cx * 64 + 63, y: cy * 64 + 63}), 0))
                    })
                )
            )
        )

        this.add(new GameMapControl({
            type: "gapless",
            position: "bottom-center"
        }, control))
    }

    private setLayer(l: leaflet.Layer) {
        if (this.preview) {
            this.preview.remove()
            this.preview = null
        }

        this.preview = l.addTo(this)
    }

    private setValue(s: object) {
        this.value = JSON.stringify(s)
        if (this.value) navigator.clipboard.writeText(this.value)
        this.output.text(this.value)
    }

    private startSelectTile() {
        let i = new SelectTileInteraction()

        i.add(new InteractionTopControl({
            name: "Select tile", cancel_handler: () => i.cancel()
        }).setText("Click a tile"))

        this.guard.set(i
            .onCommit((t) => {
                this.setLayer(tilePolygon(t))

                this.setValue(t)
            }))
    }

    private startSelectArea() {
        this.guard.set(new DrawRegionAction(""))
            .onCommit((a) => {
                this.setLayer(boxPolygon(a.area))

                this.setValue(a.area)
            })
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        event.onPost(() => {
            if (event.original.key.toLowerCase() == "t") {
                this.startSelectTile()
            } else if (event.original.key.toLowerCase() == "a") {
                this.startSelectArea()
            }
        })
    }
}

export default class OverviewLayer extends GameLayer {
    filter_control: FilterControl

    public clue_index: ClueIndex<{ markers: ClueOverviewMarker[] }>
    singleton_tooltip: tippy.Instance = null

    constructor(private app: Application) {
        super();

        this.add(new UtilityLayer())

        this.filter_control = new FilterControl().addTo(this)

        this.clue_index = clue_data.index.with(() => ({markers: []}))

        this.on("add", () => {
            this.filter_control.filter.subscribe((f) => {
                this.clue_index.filtered().forEach(c => {
                    let visible = FilterT.apply(f, c.clue)

                    if (!visible && c.markers.length > 0) {
                        c.markers.forEach(c => c.remove())
                        c.markers = []
                    } else if (visible && c.markers.length == 0) {
                        c.markers = ClueOverviewMarker.forClue(c.clue, app.methods)
                    }
                })

                let instances = this.clue_index
                    .filtered()
                    .flatMap(c => c.markers.map(m => m.createTooltip()))

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
