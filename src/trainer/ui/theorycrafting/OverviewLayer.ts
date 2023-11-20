import {Clues, ClueStep, ClueTier, ClueType, Solution} from "../../../lib/runescape/clues";
import Properties from "../widgets/Properties";
import {TileMarker} from "../../../lib/gamemap/TileMarker";
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import Widget from "../../../lib/ui/Widget";
import LightButton from "../widgets/LightButton";
import {PathEditor} from "../pathedit/PathEditor";
import {Application} from "../../application";
import dig_area = Clues.digSpotArea;
import shortcuts from "../../../data/shortcuts";
import GameLayer from "../../../lib/gamemap/GameLayer";
import * as tippy from "tippy.js";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import {SmallImageButton, SmallImageToggleButton} from "../widgets/SmallImageButton";
import {storage} from "../../../lib/util/storage";
import spacer = C.spacer;
import ControlWithHeader from "../map/ControlWithHeader";
import span = C.span;
import sitog = SmallImageButton.sitog;
import {Observable, ObservableArray, observe} from "../../../lib/reactive";
import * as Tippy from "tippy.js"
import * as leaflet from "leaflet"

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

    clue_index: boolean[]

    public filtered_clues: ObservableArray<{
        clue: ClueStep,
        markers: leaflet.FeatureGroup
    }> = new ObservableArray<{ clue: ClueStep; markers: leaflet.FeatureGroup }>()


    constructor() {
        super({
            type: "floating",
            position: "top-left"
        }, new ControlWithHeader("Clue Filter"))

        this.filter.set(FilterT.normalize(this.stored_filter.get()))

        this.filter.subscribe(f => {
            this.filtered_clues.get().forEach(v => {
                if (!FilterT.apply(f, v.value().clue)) v.remove()


            })
        })

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

export default class OverviewLayer extends GameLayer {
    filter: FilterControl

    current_layer: {
        tippy?: Tippy.Instance,
        layer?: leaflet.FeatureGroup
    } = {}

    public clue_index: {
        clue: ClueStep,
        visible
        markers: leaflet.FeatureGroup
    }[]

    constructor(private clues: ClueStep[], private app: Application) {
        super();

        this.filter = new FilterControl().addTo(this)

        this.on("add", () => {
            this.filter.filter.subscribe(f => {
                if (this.current_layer.layer) {
                    this.current_layer.layer.remove()
                    this.current_layer.layer = null
                }

                if (this.current_layer.tippy) {
                    this.current_layer.tippy.destroy()
                    this.current_layer.tippy = null
                }

                let layer = leaflet.featureGroup()

                // TODO: Only render one marker per Scan
                let spots: {
                    clue: ClueStep,
                    spot: TileCoordinates,
                    marker: TileMarker
                }[] = clues
                    .filter(c => (!c.tier || f[c.tier]) && f[c.type])
                    .flatMap(clue =>
                        (() => {
                            switch (clue.solution.type) {
                                case "simple":
                                    return [clue.solution.coordinates]
                                case "variants":
                                    return clue.solution.variants.map(v => v.solution.coordinates)
                                case "coordset":
                                    return clue.solution.candidates
                            }
                        })().map(s => {
                            return {
                                clue: clue,
                                spot: s,
                                marker: new TileMarker(s).withMarker().addTo(layer)
                            }
                        })
                    )

                // Rendering individual markers is slow, potentially faster alternative: https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet

                this.current_layer.layer = layer.addTo(this)

                let instances = spots.map(({clue, spot, marker}) => {
                    let props = new Properties()
                    props.named("Id", c().text(clue.id))
                    props.named("Clue", c().text(clue.clue))
                    props.named("Spot", c().text(`${spot.x}|${spot.y}|${spot.level}`))

                    return tippy.default(marker.marker.getElement(), {
                        content: () => c("<div style='background: rgb(10, 31, 41); border: 2px solid white'></div>").append(props).container.get()[0],
                    })
                })

                this.current_layer.tippy = tippy.createSingleton(instances, {
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
