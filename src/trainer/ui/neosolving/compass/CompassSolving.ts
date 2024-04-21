import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {GameLayer} from "../../../../lib/gamemap/GameLayer";
import {Clues} from "../../../../lib/runescape/clues";
import {TileMarker} from "../../../../lib/gamemap/TileMarker";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";
import {C} from "../../../../lib/ui/constructors";
import * as leaflet from "leaflet"
import {radiansToDegrees, Rectangle, Transform, Vector2} from "../../../../lib/math";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {TeleportSpotEntity} from "../../map/entities/TeleportSpotEntity";
import * as lodash from "lodash";
import {ClueReader} from "../cluereader/ClueReader";
import {Process} from "../../../../lib/Process";
import * as a1lib from "@alt1/base";
import {mixColor} from "@alt1/base";
import {CompassReader} from "../cluereader/CompassReader";
import {OverlayGeometry} from "../../../../lib/util/OverlayGeometry";
import {Transportation} from "../../../../lib/runescape/transportation";
import {TransportData} from "../../../../data/transports";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {PathGraphics} from "../../path_graphics";
import {util} from "../../../../lib/util/util";
import {ewent, observe} from "../../../../lib/reactive";
import hbox = C.hbox;
import span = C.span;
import cls = C.cls;
import MatchedUI = ClueReader.MatchedUI;
import TeleportGroup = Transportation.TeleportGroup;
import findBestMatch = util.findBestMatch;
import stringSimilarity = util.stringSimilarity;


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
        position: CompassSolving.Spot.coords(e.position),
        angle_radians: e.angle
      }
    })

    this.lines = information.map(info => {
      console.log(radiansToDegrees(info.angle_radians).toFixed(0))

      const from = info.position.center()

      const off = Vector2.transform(Vector2.scale(2000, Compasses.ANGLE_REFERENCE_VECTOR), Transform.rotationRadians(info.angle_radians))

      const to = Vector2.add(from, off)

      const corner_a = Vector2.add(from, Vector2.transform(off, Transform.rotationRadians(-CompassReader.EPSILON)))
      const corner_b = Vector2.add(from, Vector2.transform(off, Transform.rotationRadians(CompassReader.EPSILON)))

      return {
        line:
          leaflet.featureGroup([
            leaflet.polyline([Vector2.toLatLong(from), Vector2.toLatLong(to)]),
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
        this.solving.registerSpot(event.active_entity.teleport)
      } else {
        this.solving.registerSpot(event.tile())
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
  }

  bounds(): Rectangle {
    return Rectangle.from(this.spot)
  }

  protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {
    const marker = new TileMarker(this.spot).withMarker(null, 0.5 * (props.highlight ? 1.5 : 1)).addTo(this)
      .setOpacity(props.opacity)

    return marker.marker.getElement()
  }
}

class CompassReadService extends Process<void> {
  angle = observe<number>(null)
  closed = ewent<this>()

  constructor(private matched_ui: MatchedUI.Compass) {
    super();

    this.asInterval(100)
  }

  private overlay: OverlayGeometry = new OverlayGeometry()

  async implementation(): Promise<void> {

    while (!this.should_stop) {
      const capture_rect = this.matched_ui.rect

      const img = a1lib.captureHold(
        Rectangle.screenOrigin(capture_rect).x,
        Rectangle.screenOrigin(capture_rect).y,
        Rectangle.width(capture_rect) + 5,
        Rectangle.height(capture_rect) + 5,
      )

      this.overlay.clear()
      //this.overlay.rect(capture_rect)

      const read = CompassReader.readCompassState(CompassReader.find(img, Rectangle.screenOrigin(capture_rect)))

      switch (read.type) {
        case "likely_closed":
          this.closed.trigger(this)
          break;
        case "likely_concealed":
          break;
        case "success":
          this.angle.set(read.state.angle)

          this.overlay.text(`${radiansToDegrees(read.state.angle).toFixed(2)}°`,
            Vector2.add(Rectangle.center(capture_rect), {x: 5, y: 8}), {
              shadow: true,
              centered: true,
              width: 15,
              color: mixColor(255, 255, 255)
            })

          break;
      }

      this.overlay.render()
      await this.checkTime()
    }
  }

}

export class CompassSolving extends NeoSolvingSubBehaviour {
  layer: CompassHandlingLayer

  process: CompassReadService

  entries: {
    position?: TileCoordinates | TeleportGroup.Spot,
    angle: number | null,
  }[] = [
    {
      position: TransportData.resolveTeleport({group: "lunarspellbook", spot: "moonclan"}),
      angle: null
    },
    {
      position: TransportData.resolveTeleport({group: "normalspellbook", spot: "southfeldiphills"}),
      angle: null
    },
  ]

  selection_index: number = 0

  lines: {
    line: leaflet.Layer
  }[] = []

  private readonly debug_solution: TileCoordinates

  constructor(parent: NeoSolvingBehaviour, public clue: Clues.Compass, public ui: MatchedUI.Compass | null) {
    super(parent, true)

    this.debug_solution = clue.spots[lodash.random(0, clue.spots.length)]

    if (ui) {
      this.process = new CompassReadService(this.ui)

      this.process.closed.on(() => {
        this.stop()
      })
    }
  }

  renderWidget() {
    this.parent.layer.compass_container.empty()

    const container = this.parent.layer.compass_container

    cls("ctr-neosolving-solution-row")
      .addClass("ctr-neosolving-compass-entries-header")
      .text("Compass Solver")
      .appendTo(container)

    this.entries.forEach((element, i) => {
      const row = hbox()
        .on("click", () => {
          this.selection_index = i
          this.renderWidget()
        })

      if (this.selection_index == i) row.addClass("ctr-neosolving-compass-entry-selected")

      if (element.position) {
        const position = cls("ctr-neosolving-compass-entry-position").appendTo(row)

        if (element.position instanceof TeleportGroup.Spot) {
          position.append(PathGraphics.Teleport.asSpan(element.position),
            span(element.position.spot.name)
          )
        } else {
          position.append(span(TileCoordinates.toString(element.position)))
        }
      } else {
        row.append()
      }

      {
        const angle = cls("ctr-neosolving-compass-entry-angle").appendTo(row)

        if (element.angle != null) {
          angle.append(
            span(`${radiansToDegrees(element.angle).toFixed(0)}°`),
          )
        } else {
          angle.append(
            span(`???°`),
          )
        }
      }

      {
        const button = cls("ctr-neosolving-compass-entry-button")
          .appendTo(row)
          .on("click", () => {
            if (element.angle != null) {
              this.discard(i)
            } else {
              this.commit(i)
            }
          })

        if (element.angle != null) {

          button.addClass("ctr-neosolving-compass-entry-button-discard")
            .text("X")
        } else {

          button.addClass("ctr-neosolving-compass-entry-button-commit")
            .text("J")
        }
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

    this.entries[i].angle = this.process.angle.value()

    if (!this.entries.some(e => e.angle == null)) {
      this.entries.push({
        position: TransportData.resolveTeleport({group: "lunarspellbook", spot: "moonclan"}),
        angle: null
      })
    }

    this.selection_index = this.entries.findIndex(e => e.angle == null)

    this.renderWidget()
    this.layer.updateOverlay()
  }

  registerSpot(coords: TileCoordinates | TeleportGroup.Spot): void {
    this.entries[this.selection_index] = {
      position: coords,
      angle: null
    }

    this.renderWidget()
  }

  protected begin() {
    this.layer = new CompassHandlingLayer(this)

    this.renderWidget()
    this.layer.updateOverlay()

    this.parent.layer.add(this.layer)

    this.process.run()

    this.parent.app.main_hotkey.subscribe(0, e => {
      if (e.text) {
        const matched_teleport = findBestMatch(CompassSolving.teleport_hovers, ref => stringSimilarity(e.text, ref.expected), 0.9)

        if (matched_teleport) {
          const tele = TransportData.resolveTeleport(matched_teleport.value.teleport_id)
          if (!tele) return
          this.registerSpot(tele)
        }
      } else {
        this.commit()
      }
    })
  }

  protected end() {
    this.layer.remove()

    if (this.process) this.process.stop()
  }
}

export namespace CompassSolving {
  export type Spot = TileCoordinates | TeleportGroup.Spot

  export namespace Spot {
    import activate = TileArea.activate;

    export function coords(spot: Spot): TileArea.ActiveTileArea {
      if (spot instanceof TeleportGroup.Spot) return activate(spot.targetArea())
      else return activate(TileArea.init(spot))
    }
  }
  export const teleport_hovers: {
    expected: string,
    teleport_id: TeleportGroup.SpotId
  }[] = [
    {
      expected: "Cast South Feldip Hills Teleport",
      teleport_id: {group: "normalspellbook", spot: "southfeldiphills"}
    }, {
      expected: "Cast Taverley Teleport",
      teleport_id: {group: "normalspellbook", spot: "taverley"}
    }, {
      expected: "Cast Varrock Teleport",
      teleport_id: {group: "normalspellbook", spot: "varrock"}
    }, {
      expected: "Cast Lumbridge Teleport",
      teleport_id: {group: "normalspellbook", spot: "lumbridge"}
    }, {
      expected: "Cast Falador Teleport",
      teleport_id: {group: "normalspellbook", spot: "falador"}
    }, {
      expected: "Cast Camelot Teleport",
      teleport_id: {group: "normalspellbook", spot: "camelot"}
    }, {
      expected: "Cast Ardougne Teleport",
      teleport_id: {group: "normalspellbook", spot: "ardougne"}
    }, {
      expected: "Cast Watchtower Teleport",
      teleport_id: {group: "normalspellbook", spot: "watchtower-yanille"}
    }, {
      expected: "Cast Trollheim Teleport",
      teleport_id: {group: "normalspellbook", spot: "trollheim"}
    }, {
      expected: "Cast God Wars Dungeon Teleport",
      teleport_id: {group: "normalspellbook", spot: "godwars"}
    },
  ]
}