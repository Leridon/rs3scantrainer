import {ClueStep, ClueTier, ClueType} from "../../../lib/runescape/clues";
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
import {TileCoordinates} from "../../../lib/runescape/coordinates";

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

    export function apply(f: FilterT, clue: ClueStep): boolean {
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

    constructor(private clue: ClueStep) {
        super();

        debugger

        this.markers = (() => {
            switch (clue.solution.type) {
                case "simple":
                    return [clue.solution.coordinates]
                case "variants":
                    return clue.solution.variants.map(v => v.solution.coordinates)
                case "coordset":
                    return clue.solution.candidates
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
            props.named("Clue", c().text(this.clue.clue))
            props.named("Spot", c().text(`${spot.x}|${spot.y}|${spot.level}`))

            return tippy.default(marker.marker.getElement(), {
                content: () => c("<div style='background: rgb(10, 31, 41); border: 2px solid white'></div>").append(props).container.get()[0],
            })
        })

    }
}

export default class OverviewLayer extends GameLayer {
    filter_control: FilterControl

    public clue_index: ClueIndex<{ marker: ClueOverviewMarker }>
    singleton_tooltip: tippy.Instance = null

    constructor(private app: Application) {
        super();

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
