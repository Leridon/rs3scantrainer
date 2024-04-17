import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {GameLayer} from "../../../../lib/gamemap/GameLayer";
import {Clues} from "../../../../lib/runescape/clues";
import {TileMarker} from "../../../../lib/gamemap/TileMarker";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";
import {C} from "../../../../lib/ui/constructors";
import hbox = C.hbox;
import span = C.span;
import * as leaflet from "leaflet"
import {Rectangle, Transform, Vector2} from "../../../../lib/math";
import spacer = C.spacer;
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import cls = C.cls;
import {random} from "lodash";

class CompassHandlingLayer extends GameLayer {
  constructor(private solving: CompassSolving) {
    super()
  }

  eventClick(event: GameMapMouseEvent) {
    event.onPost(() => {
      this.solving.pending[0].position = event.tile()
      this.solving.renderWidget()
    })
  }
}

class KnownCompassSpot extends MapEntity {
  private readonly spot: TileCoordinates

  constructor(private clue: Clues.Compass, private spot_id: number) {
    super()

    this.spot = clue.spots[spot_id]
  }

  bounds(): Rectangle {
    return Rectangle.from(this.spot)
  }

  protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {
    const marker = new TileMarker(this.spot).withMarker(null, props.highlight ? 1.5 : 1).addTo(this)

    return marker.marker.getElement()
  }
}

export class CompassSolving extends NeoSolvingSubBehaviour {
  layer: CompassHandlingLayer

  committed: {
    position: TileCoordinates,
    teleport_id?: {
      group: string,
      spot: string,
      access?: string
    }
    angle: number,
  }[] = []

  pending: {
    position: TileCoordinates,
    teleport_id?: {
      group: string,
      spot: string,
      access?: string
    }
  }[] = [{
    position: {x: 3000, y: 3000, level: 0},
  }]

  lines: {
    line: leaflet.Layer
  }[] = []

  constructor(parent: NeoSolvingBehaviour, private clue: Clues.Compass) {
    super(parent, true)
  }

  updateLines() {

    this.lines.forEach(l => {
      l.line.remove()
    })

    this.lines = []

    this.lines = this.committed.map(e => {
      const from = e.position

      const off = Vector2.transform({x: 1000, y: 0}, Transform.rotationRadians(e.angle))

      const to = Vector2.add(from, off)

      return {
        line: leaflet.polyline([Vector2.toLatLong(from), Vector2.toLatLong(to)])
          .addTo(this.parent.layer)
      }
    })
  }

  renderWidget() {
    this.parent.layer.compass_container.empty()

    const container = this.parent.layer.compass_container

    cls("ctr-neosolving-solution-row")
      .text("Compass Solver")
      .appendTo(container)

    this.committed.forEach((element, i) => {
      hbox(
        span(`${element.angle.toFixed(0)}°`),
        span(TileCoordinates.toString(element.position)),
        spacer(),
        c().text("X").css("border", "1px solid red")
          .on("click", () => {
            this.discard(i)
          })
      ).appendTo(container)
    })

    this.pending.forEach((element, i) => {
      hbox(
        span(TileCoordinates.toString(element.position)),
        spacer(),
        c().text("J").css("border", "1px solid green")
          .on("click", () => {
            this.commit(i)
          })
      ).appendTo(container)
    })
  }

  discard(i: number) {
    if (!this.committed[i]) return

    this.committed.splice(i, 1)

    this.updateLines()
    this.renderWidget()
  }


  commit(i: number = undefined) {
    if (i == undefined) i = 0

    if (!this.pending[i]) return

    this.committed.push({
      ...this.pending[i],
      angle: random(0, 2 * 3.1415)
    })

    this.pending.splice(i, 1)

    if (this.pending.length == 0) {
      this.pending.push({
        position: {x: 3000, y: 3000, level: 0},
      })
    }

    this.renderWidget()
    this.updateLines()
  }

  protected begin() {
    this.layer = new CompassHandlingLayer(this)

    this.clue.spots.forEach((e, i) => {
      this.layer.addLayer(
        new KnownCompassSpot(this.clue, i)
          .setInteractive(true)
      )
    })

    this.renderWidget()
    this.updateLines()

    this.parent.layer.add(this.layer)
  }

  protected end() {
    this.layer.remove()
  }
}