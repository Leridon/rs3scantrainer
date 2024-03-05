import * as leaflet from "leaflet";
import {TileMarker} from "../../../lib/gamemap/TileMarker";
import {Clues} from "../../../lib/runescape/clues";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import {floor_t, GieliCoordinates, TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import {Rectangle} from "../../../lib/math";
import Widget from "../../../lib/ui/Widget";
import {ClueProperties} from "./ClueProperties";
import ClueSpot = Clues.ClueSpot;
import * as tippy from "tippy.js";
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import {MenuEntry} from "../widgets/ContextMenu";

export class ClueOverviewMarker extends MapEntity {
    constructor(private clue: Clues.ClueSpot,
                private methods: MethodPackManager,
                private edit_handler: (_: AugmentedMethod) => any,
                private talk_alternative_index?: number,
    ) {
        super({interactive: true, highlightable: true});
    }

    override async renderTooltip(): Promise<{ content: Widget; interactive: boolean; } | null> {
        let self = this

        return {
            content: await new ClueProperties(
                self.clue,
                self.methods,
                self.edit_handler,
                true,
                self.talk_alternative_index
            ).rendered(),
            interactive: true
        }
    }

    override bounds(): TileRectangle {
        return TileRectangle.from(ClueOverviewMarker.position(this.clue, this.talk_alternative_index))
    }

    protected async render_implementation(options: MapEntity.RenderOptions): Promise<Element> {
        let marker = new TileMarker(ClueOverviewMarker.position(this.clue, this.talk_alternative_index)).withMarker().addTo(this)

        marker.setOpacity(options.highlight ? 0.5 : 1)

        return marker.marker.getElement()
    }

    override async contextMenu(event: GameMapContextMenuEvent): Promise<(MenuEntry & { type: "submenu" }) | null> {
        return {
            type: "submenu",
            text: "Methods",
            children: await ClueProperties.methodMenu(this.clue, this.edit_handler)
        }
    }
}

export namespace ClueOverviewMarker {
    export function position(clue: Clues.ClueSpot, alternative_index?: number): TileCoordinates {
        switch (clue.clue.type) {
            case "anagram":
            case "simple":
            case "cryptic":
            case "map":
                switch (clue.clue.solution?.type) {
                    case "talkto":
                        let i = Math.min(alternative_index || 0, clue.clue.solution.spots.length)

                        return TileRectangle.center(clue.clue.solution.spots[i].range)
                    case "dig":
                    case "search":
                        return clue.clue.solution.spot
                }
                return {x: 0, y: 0, level: 0}
            case "compass":
                return clue.spot
            case "coordinates":
                return GieliCoordinates.toCoords(clue.clue.coordinates)
            case "emote":
                return TileRectangle.center(clue.clue.area)
            case "scan":
                return TileCoordinates.lift(Rectangle.center(Rectangle.from(...clue.clue.spots)), Math.min(...clue.clue.spots.map(s => s.level)) as floor_t)
            case "skilling":
                let i = alternative_index || 0

                if (i >= 0 && clue.clue.areas?.length > 0) {
                    if (i >= clue.clue.areas.length) i = 0
                    return TileRectangle.center(clue.clue.areas[i])
                }

                break
        }

        return {x: 0, y: 0, level: 0}
    }


    export function forClue(spot: ClueSpot, method_index: MethodPackManager,
                            edit_handler: (_: AugmentedMethod) => any): ClueOverviewMarker[] {

        let variants: { instance_index?: number }[] = (() => {
            if (spot.clue.solution?.type == "talkto" && spot.clue.solution.spots) {
                return spot.clue.solution.spots.map((s, i) => ({instance_index: i}))
            } else if (spot.clue.type == "skilling") {
                return (spot.clue.areas || []).map((s, i) => ({instance_index: i}))
            } else return [{}]
        })()

        return variants.map(({instance_index}) => new ClueOverviewMarker(spot, method_index, edit_handler, instance_index))
    }
}