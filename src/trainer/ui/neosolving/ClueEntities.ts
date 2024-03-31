import {Rectangle} from "lib/math";
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";

export namespace ClueEntities {

  export class NpcEntity extends MapEntity {
    constructor(private name: string, private range: TileArea) {
      super();
    }

    bounds(): Rectangle {
      return TileArea.toRect(this.range)
    }

    protected render_implementation(props: MapEntity.RenderProps): Promise<Element> {
      return Promise.resolve(undefined);
    }
  }
}