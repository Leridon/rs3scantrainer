import {GameMapMouseEvent} from "../MapEvents";
import {ValueInteraction} from "./ValueInteraction";
import {TileCoordinates} from "../../runescape/coordinates";
import InteractionTopControl from "../../../trainer/ui/map/InteractionTopControl";

export class SelectTileInteraction extends ValueInteraction<TileCoordinates> {
  constructor(public config: ValueInteraction.option_t<TileCoordinates> = {}, protected off_tile: SelectTileInteraction.OffTileMode = "never") {
    super(config)
  }

  protected coordinatesOfEvent(event: GameMapMouseEvent): TileCoordinates {
    switch (this.off_tile) {
      case "never":
        return event.tile()
      case "always":
        return event.coordinates
      case "optional":
        if (event.original.shiftKey) return event.coordinates
        else return event.tile()

    }
  }

  eventHover(event: GameMapMouseEvent) {
    super.eventHover(event);

    event.onPre(() => {
      this.preview(this.coordinatesOfEvent(event))
    })
  }

  eventClick(event: GameMapMouseEvent) {
    event.onPre(() => {
      event.stopAllPropagation()

      this.commit(this.coordinatesOfEvent(event))
    })
  }
}

export namespace SelectTileInteraction {
  export type OffTileMode = "always" | "never" | "optional"

  export class Standalone extends SelectTileInteraction {
    constructor(config: ValueInteraction.option_t<TileCoordinates> = {}, off_tile: SelectTileInteraction.OffTileMode = "never") {
      super(config, off_tile)

      switch (this.off_tile) {
        case "never":
          this.attachTopControl(new InteractionTopControl({name: "Select Tile"}).setText("Click a tile to select it."))
          break;
        case "optional":
          this.attachTopControl(new InteractionTopControl({name: "Select Tile"}).setContent(
            c("<div style='font-family: monospace; white-space:pre'></div>")
              .append(c().text(`Hold [Shift] to disable snapping`))
          ))
          break;
        case "always":
          this.attachTopControl(new InteractionTopControl({name: "Select Coordinates"}).setText("Click the map to select coordinates."))

      }

    }

  }
}