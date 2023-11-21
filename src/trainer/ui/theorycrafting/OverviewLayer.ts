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
import {TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
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
    private markers: { spot: TileCoordinates, marker: TileMarker }[]

    tippies: tippy.Instance[] = []

    constructor(private clue: Clues.Step) {
        super();

        this.markers = [];

        this.markers = (() => {
            switch (clue.type) {
                case "anagram":
                case "simple":
                case "cryptic":
                case "map":
                    return (() => {
                        switch (clue.solution?.type) {
                            case "talkto":
                                return [TileRectangle.center(clue.solution.spots[0])]
                            case "dig":
                            case "search":
                                return [clue.solution.spot]
                            default:
                                return []
                        }
                    })()
                default:
                    return []
            }
        })().flatMap(s => {
            return ({spot: s, marker: new TileMarker(s).withMarker().addTo(this)})
        })
    }

    createTooltips(): tippy.Instance[] {
        this.tippies.forEach(t => t.destroy())

        return this.tippies = this.markers.map(({spot, marker}) => {
            let props = new Properties()
            props.named("Id", c().text(this.clue.id))
            props.named("Text", c().text(this.clue.text))
            props.named("Spot", c().text(`${spot.x}|${spot.y}|${spot.level}`))

            return tippy.default(marker.marker.getElement(), {
                content: () => c("<div style='background: rgb(10, 31, 41); border: 2px solid white'></div>").append(props).container.get()[0],
            })
        })

    }
}

class UtilityLayer extends GameLayer {

    preview: leaflet.Layer

    guard: InteractionGuard

    output: Widget
    value: string

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
                    }),
                ]),
                hbox(
                    this.output = c(),
                    spacer(),
                    new LightButton("Copy").onClick(() => {
                        if (this.value) navigator.clipboard.writeText(this.value)
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

    public clue_index: ClueIndex<{ marker: ClueOverviewMarker }>
    singleton_tooltip: tippy.Instance = null

    constructor(private app: Application) {
        super();

        this.add(new UtilityLayer())

        this.filter_control = new FilterControl().addTo(this)

        this.clue_index = new ClueIndex(() => ({marker: null}))

        this.on("add", () => {
            this.filter_control.filter.subscribe((f) => {
                this.clue_index.filtered().forEach(c => {
                    let visible = FilterT.apply(f, c.clue)

                    if (!visible && c.marker) {
                        c.marker.remove()
                        c.marker = null
                    } else if (visible && !c.marker) {
                        c.marker = new ClueOverviewMarker(c.clue).addTo(this)
                    }
                })

                let instances = this.clue_index.filtered().filter(c => c.marker)
                    .flatMap(({marker}) => marker?.createTooltips())

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
