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
import {radiansToDegrees, Rectangle, Transform, Vector2} from "../../../../lib/math";
import spacer = C.spacer;
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import cls = C.cls;
import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {TeleportSpotEntity} from "../../map/entities/TeleportSpotEntity";
import * as lodash from "lodash";

class CompassHandlingLayer extends GameLayer {
  private lines: {
    line: leaflet.Layer
  }[] = []

  private known_spot_markers: KnownCompassSpot[]

  constructor(private solving: CompassSolving) {
    super()

    this.known_spot_markers = this.solving.clue.spots.map((e, i) =>
      new KnownCompassSpot(this.solving.clue, i)
        .setInteractive(true)
        .addTo(this)
    )
  }

  updateOverlay() {
    this.lines.forEach(l => {
      l.line.remove()
    })

    this.lines = []

    const information = this.solving.entries.filter(e => e.position && e.angle != null).map<Compasses.TriangulationPoint>(e => {

      return {
        position: e.position.coords,
        angle_radians: e.angle
      }
    })

    this.lines = information.map(info => {
      console.log(radiansToDegrees(info.angle_radians).toFixed(0))

      const from = info.position

      const off = Vector2.transform(Vector2.scale(2000, Compasses.ANGLE_REFERENCE_VECTOR), Transform.rotationRadians(info.angle_radians))

      const to = Vector2.add(from, off)

      const corner_a = Vector2.add(from, Vector2.transform(off, Transform.rotationRadians(-Compasses.EPSILON)))
      const corner_b = Vector2.add(from, Vector2.transform(off, Transform.rotationRadians(Compasses.EPSILON)))

      return {
        line:
          leaflet.featureGroup([
            //leaflet.polyline([Vector2.toLatLong(from), Vector2.toLatLong(to)]),
            leaflet.polygon([
              Vector2.toLatLong(from),
              Vector2.toLatLong(corner_a),
              Vector2.toLatLong(corner_b),
            ])
          ]).addTo(this)

      }
    })

    this.known_spot_markers.forEach(m => {
      m.setOpacity(Compasses.isPossible(information, m.spot) ? 1 : 0.5)
    })
  }

  eventClick(event: GameMapMouseEvent) {
    event.onPost(() => {

      if (event.active_entity instanceof TeleportSpotEntity) {
        this.solving.registerSpot(event.active_entity.teleport.centerOfTarget())
      }

      //this.solving.pending[0].position = event.tile()
      //this.solving.renderWidget()
    })
  }
}

class KnownCompassSpot extends MapEntity {
  public readonly spot: TileCoordinates

  constructor(public readonly clue: Clues.Compass, public readonly spot_id: number) {
    super()

    this.spot = clue.spots[spot_id]

    this.setTooltip(() => {
      return c().text(`${radiansToDegrees(Compasses.getExpectedAngle({x: 2114, y: 3915, level: 0}, this.spot)).toFixed()}°`)
    })
  }

  bounds(): Rectangle {
    return Rectangle.from(this.spot)
  }

  protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {
    const marker = new TileMarker(this.spot).withMarker(null, props.highlight ? 1.5 : 1).addTo(this)
      .setOpacity(props.opacity)

    return marker.marker.getElement()
  }
}

export class CompassSolving extends NeoSolvingSubBehaviour {
  layer: CompassHandlingLayer

  entries: {
    position?: {
      coords: TileCoordinates
      teleport_id?: {
        group: string,
        spot: string,
        access?: string
      }
    },
    angle: number | null,
  }[] = [
    {position: {coords: {"x": 2112, "y": 3913, "level": 0}, teleport_id: {group: "lunarspellbook", spot: "moonclan"}}, angle: null},
    {position: {coords: {"x": 2416, "y": 2851, "level": 0}, teleport_id: {group: "normalspellbook", spot: "southfeldiphills"}}, angle: null},
  ]

  selection_index: number = 0

  lines: {
    line: leaflet.Layer
  }[] = []

  private debug_solution: TileCoordinates

  constructor(parent: NeoSolvingBehaviour, public clue: Clues.Compass) {
    super(parent, true)

    this.debug_solution = clue.spots[lodash.random(0, clue.spots.length)]
  }

  renderWidget() {
    this.parent.layer.compass_container.empty()

    const container = this.parent.layer.compass_container

    cls("ctr-neosolving-solution-row")
      .text("Compass Solver")
      .appendTo(container)

    this.entries.forEach((element, i) => {
      const row = hbox()
        .on("click", () => {
          this.selection_index = i
          this.renderWidget()
        })

      if (this.selection_index == i) {
        row.css("border", "1px solid red")
      }

      if (element.angle != null) {
        row.append(
          span(`${radiansToDegrees(element.angle).toFixed(0)}°`),
        )
      } else {
        row.append(
          span(`NULL°`),
        )
      }

      if (element.position) {
        row.append(span(TileCoordinates.toString(element.position.coords)))
      } else {
        row.append(span("???"))
      }

      row.append(spacer())

      if (element.angle != null) {
        row.append(c().text("X").css("border", "1px solid red")
          .on("click", () => {
            this.discard(i)
          }))
      } else {
        row.append(c().text("J").css("border", "1px solid green")
          .on("click", () => {
            this.commit(i)
          }))
      }


      row.appendTo(container)
    })
  }

  discard(i: number) {
    if (!this.entries[i]) return

    this.entries.splice(i, 1)

    if (this.selection_index >= i) this.selection_index--

    this.layer.updateOverlay()
    this.renderWidget()
  }

  commit(i: number = undefined) {
    if (i == undefined) i = this.selection_index

    if (!this.entries[i]?.position) return
    if (this.entries[i].angle != null) return

    this.entries[i].angle = Compasses.getExpectedAngle(this.entries[i].position.coords, this.debug_solution)

    if (!this.entries.some(e => e.angle == null)) {
      this.entries.push({
        position: {coords: {x: 2114, y: 3915, level: 0}},
        angle: null
      })
    }

    this.selection_index = this.entries.findIndex(e => e.angle == null)

    this.renderWidget()
    this.layer.updateOverlay()
  }

  registerSpot(coords: TileCoordinates): void {
    this.entries[this.selection_index] = {
      position: {
        coords: coords,
      },
      angle: null
    }

    this.renderWidget()
  }

  protected begin() {
    this.layer = new CompassHandlingLayer(this)

    this.renderWidget()
    this.layer.updateOverlay()

    this.parent.layer.add(this.layer)
  }

  protected end() {
    this.layer.remove()
  }
}