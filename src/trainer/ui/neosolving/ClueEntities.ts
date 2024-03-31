import {Rectangle} from "lib/math";
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";
import {areaPolygon} from "../polygon_helpers";
import {RenderingUtility} from "../map/RenderingUtility";

export namespace ClueEntities {

  import interactionMarker = RenderingUtility.interactionMarker;
  import activate = TileArea.activate;

  export class NpcEntity extends MapEntity {
    constructor(private name: string, private range: TileArea) {
      super();
    }

    bounds(): Rectangle {
      return TileArea.toRect(this.range)
    }

    protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {

      if(props.highlight) {
        const range = areaPolygon(this.range)
          .setStyle({
            color: "yellow",
            interactive: false,
            opacity: 0.5,
            fillOpacity: 0.1
          }).addTo(this)
      }
      
      const marker = interactionMarker(activate(this.range).center(), "talk", props.highlight ? 1.5 : 1, true)
        .addTo(this)

      return marker.getElement()
    }
  }
}