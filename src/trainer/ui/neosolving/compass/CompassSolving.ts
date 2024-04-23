import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {GameLayer} from "../../../../lib/gamemap/GameLayer";
import {Clues} from "../../../../lib/runescape/clues";
import {TileMarker} from "../../../../lib/gamemap/TileMarker";
import {TileCoordinates, TileRectangle} from "../../../../lib/runescape/coordinates";
import {GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";
import {C} from "../../../../lib/ui/constructors";
import * as leaflet from "leaflet"
import {degreesToRadians, radiansToDegrees, Rectangle, Transform, Vector2} from "../../../../lib/math";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {TeleportSpotEntity} from "../../map/entities/TeleportSpotEntity";
import * as lodash from "lodash";
import {isArray} from "lodash";
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
import {deps} from "../../../dependencies";
import {clue_data} from "../../../../data/clues";
import hbox = C.hbox;
import span = C.span;
import cls = C.cls;
import MatchedUI = ClueReader.MatchedUI;
import TeleportGroup = Transportation.TeleportGroup;
import findBestMatch = util.findBestMatch;
import stringSimilarity = util.stringSimilarity;
import angleDifference = Compasses.angleDifference;


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

    const information = this.solving.entries.filter(e => e.position && e.angle != null).map<Compasses.TriangulationPoint>(e =>
      Compasses.TriangulationPoint.construct(CompassSolving.Spot.coords(e.position), e.angle)
    )

    this.lines = information.map(info => {
      const from = info.position.center()

      const off = Vector2.transform(Vector2.scale(2000, Compasses.ANGLE_REFERENCE_VECTOR), Transform.rotationRadians(info.angle_radians))

      const to = Vector2.add(from, off)

      const right = Vector2.transform(info.direction, Transform.rotationRadians(Math.PI / 2))

      const corner_near_left = Vector2.add(from, Vector2.scale(info.uncertainty, right))
      const corner_near_right = Vector2.add(from, Vector2.scale(-info.uncertainty, right))
      const corner_far_left = Vector2.add(from, Vector2.transform(off, Transform.rotationRadians(-CompassReader.EPSILON)))
      const corner_far_right = Vector2.add(from, Vector2.transform(off, Transform.rotationRadians(CompassReader.EPSILON)))

      return {
        line:
          leaflet.featureGroup([
            leaflet.polyline([Vector2.toLatLong(from), Vector2.toLatLong(to)])
            ,
            leaflet.polygon([
              Vector2.toLatLong(corner_near_left),
              Vector2.toLatLong(corner_near_right),
              Vector2.toLatLong(corner_far_left),
              Vector2.toLatLong(corner_far_right),
            ]).setStyle({
              stroke: false,
              fillOpacity: 0.2
            })
          ]).addTo(this)
      }
    })

    let possible_count = 0

    this.known_spot_markers.forEach(m => {
      const p = Compasses.isPossible(information, m.spot)

      if (p) possible_count++

      m.setPossible(p)
    })

    if (possible_count <= 5) {
      this.getMap().fitView(TileRectangle.from(
        ...this.known_spot_markers.filter(s => s.isPossible()).map(s => s.spot)
      ))
    }
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

  private possible = observe(true)

  constructor(public readonly clue: Clues.Compass, public readonly spot_id: number) {
    super()

    this.spot = clue.spots[spot_id]

    this.possible.subscribe(v => {
      this.setOpacity(v ? 1 : 0.5)
    })
  }

  setPossible(v: boolean): this {
    this.possible.set(v)
    return this
  }

  isPossible(): boolean {
    return this.possible.value()
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

  constructor(private matched_ui: MatchedUI.Compass,
              private calibration_mode: CompassReader.CalibrationMode
  ) {
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

      const read = CompassReader.readCompassState(
        CompassReader.find(img, Rectangle.screenOrigin(capture_rect)),
        this.calibration_mode
      )

      switch (read.type) {
        case "likely_closed":
          this.closed.trigger(this)
          break;
        case "likely_concealed":
          break;
        case "success":
          this.angle.set(read.state.angle)

          break;
      }

      if (this.angle.value() != null) {
        this.overlay.text(`${radiansToDegrees(this.angle.value()).toFixed(2)}°`,
          Vector2.add(Rectangle.center(capture_rect), {x: 5, y: 8}), {
            shadow: true,
            centered: true,
            width: 15,
            color: mixColor(255, 255, 255)
          })
      }


      this.overlay.render()
      await this.checkTime()
    }

    this.overlay?.clear()
    this.overlay?.render()
  }

}

export class CompassSolving extends NeoSolvingSubBehaviour {
  readonly settings: CompassSolving.Settings

  layer: CompassHandlingLayer

  process: CompassReadService

  entries: {
    position?: TileCoordinates | TeleportGroup.Spot,
    angle: number | null,
  }[] = [
    /*{
      position: null,
      angle: null
    },*/
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

    this.settings = deps().app.settings.settings.solving.compass

    this.debug_solution = clue.spots[lodash.random(0, clue.spots.length)]

    if (ui) {
      this.process = new CompassReadService(this.ui,
        this.settings.calibration_mode
      )

      this.process.closed.on(() => {
        this.stop()
      })

      this.process.angle.subscribe((new_angle, old_angle) => {
        if (old_angle != null && this.settings.auto_commit_on_angle_change && angleDifference(new_angle, old_angle) > CompassSolving.ANGLE_CHANGE_COMMIT_THRESHOLD) {
          this.commit()
        }
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

      {
        const position = cls("ctr-neosolving-compass-entry-position").appendTo(row)

        if (element.position) {
          if (element.position instanceof TeleportGroup.Spot) {
            position.append(PathGraphics.Teleport.asSpan(element.position),
              span(element.position.spot.name)
            )
          } else {
            position.append(span(TileCoordinates.toString(element.position)))
          }
        }
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
        position: null,
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
  }[] =
    [
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
    }, {
      expected: "Cast Paddewwa Teleport",
      teleport_id: {group: "ancientspellook", spot: "paddewwa"}
    }, {
      expected: "Cast Senntisten Teleport",
      teleport_id: {group: "ancientspellook", spot: "senntisten"}
    }, {
      expected: "Cast Kharyll Teleport",
      teleport_id: {group: "ancientspellook", spot: "kharyll"}
    }, {
      expected: "Cast Lassar Teleport",
      teleport_id: {group: "ancientspellook", spot: "lassar"}
    }, {
      expected: "Cast Dareeyak Teleport",
      teleport_id: {group: "ancientspellook", spot: "dareeyak"}
    }, {
      expected: "Cast Carrallanger Teleport",
      teleport_id: {group: "ancientspellook", spot: "carallaner"}
    }, {
      expected: "Cast Annakarl Teleport",
      teleport_id: {group: "ancientspellook", spot: "annakarl"}
    }, {
      expected: "Cast Ghorrock Teleport",
      teleport_id: {group: "ancientspellook", spot: "ghorrock"}
    },

      {expected: "Cast Moonclan Teleport", teleport_id: {group: "lunarspellbook", spot: "moonclan"}},
      {expected: "Cast Ourania Altar Teleport", teleport_id: {group: "lunarspellbook", spot: "ourania"}},
      {expected: "Cast South Falador Teleport", teleport_id: {group: "lunarspellbook", spot: "southfalador"}},
      {expected: "Cast Waterbirth Teleport", teleport_id: {group: "lunarspellbook", spot: "waterbirth"}},
      {expected: "Cast Barbarian Teleport", teleport_id: {group: "lunarspellbook", spot: "barbarian"}},
      {expected: "Cast North Ardougne Teleport", teleport_id: {group: "lunarspellbook", spot: "northardougne"}},
      {expected: "Cast Khazard Teleport", teleport_id: {group: "lunarspellbook", spot: "khazard"}},
      {expected: "Cast Fishing Guild Teleport", teleport_id: {group: "lunarspellbook", spot: "fishing"}},
      {expected: "Cast Catherby Teleport", teleport_id: {group: "lunarspellbook", spot: "catherby"}},
      {expected: "Cast Ice Plateau Teleport", teleport_id: {group: "lunarspellbook", spot: "iceplateu"}},
      {expected: "Cast Trollheim Farm Teleport", teleport_id: {group: "lunarspellbook", spot: "trollheim"}},

      {expected: "Quick teleport Al Kharid Lodestone", teleport_id: {group: "home", spot: "alkharid"}},
      {expected: "Teleport Al Kharid Lodestone", teleport_id: {group: "home", spot: "alkharid"}},
      {expected: "Quick teleport Anachronia Lodestone", teleport_id: {group: "home", spot: "anachronia"}},
      {expected: "Teleport Anachronia Lodestone", teleport_id: {group: "home", spot: "anachronia"}},
      {expected: "Quick teleport Ardounge Lodestone", teleport_id: {group: "home", spot: "ardougne"}},
      {expected: "Teleport Ardounge Lodestone", teleport_id: {group: "home", spot: "ardougne"}},
      {expected: "Quick teleport Ashdale Lodestone", teleport_id: {group: "home", spot: "ashdale"}},
      {expected: "Teleport Ashdale Lodestone", teleport_id: {group: "home", spot: "ashdale"}},
      {expected: "Quick teleport Bandit Camp Lodestone", teleport_id: {group: "home", spot: "banditcamp"}},
      {expected: "Teleport Bandit Camp Lodestone", teleport_id: {group: "home", spot: "banditcamp"}},
      {expected: "Quick teleport Burthorpe Lodestone", teleport_id: {group: "home", spot: "burthorpe"}},
      {expected: "Teleport Burthorpe Lodestone", teleport_id: {group: "home", spot: "burthorpe"}},
      {expected: "Quick teleport Canifis Lodestone", teleport_id: {group: "home", spot: "canifis"}},
      {expected: "Teleport Canifis Lodestone", teleport_id: {group: "home", spot: "canifis"}},
      {expected: "Quick teleport Catherby Lodestone", teleport_id: {group: "home", spot: "catherby"}},
      {expected: "Teleport Catherby Lodestone", teleport_id: {group: "home", spot: "catherby"}},
      {expected: "Quick teleport Draynor Lodestone", teleport_id: {group: "home", spot: "draynor"}},
      {expected: "Teleport Draynor Lodestone", teleport_id: {group: "home", spot: "draynor"}},
      {expected: "Quick teleport Eagles` Peak Lodestone", teleport_id: {group: "home", spot: "eaglespeak"}},
      {expected: "Teleport Eagles` Peak Lodestone", teleport_id: {group: "home", spot: "eaglespeak"}},
      {expected: "Quick teleport Edgeville Lodestone", teleport_id: {group: "home", spot: "edgeville"}},
      {expected: "Teleport Edgeville Lodestone", teleport_id: {group: "home", spot: "edgeville"}},
      {expected: "Quick teleport Falador Lodestone", teleport_id: {group: "home", spot: "falador"}},
      {expected: "Teleport Falador Lodestone", teleport_id: {group: "home", spot: "falador"}},
      {expected: "Quick teleport Fremmenik Province Lodestone", teleport_id: {group: "home", spot: "fremmenik"}},
      {expected: "Teleport Fremmenik Province Lodestone", teleport_id: {group: "home", spot: "fremmenik"}},
      {expected: "Quick teleport Karamja Lodestone", teleport_id: {group: "home", spot: "karamja"}},
      {expected: "Teleport Karamja Lodestone", teleport_id: {group: "home", spot: "karamja"}},
      {expected: "Quick teleport Lumbridge Lodestone", teleport_id: {group: "home", spot: "lumbridge"}},
      {expected: "Teleport Lumbridge Lodestone", teleport_id: {group: "home", spot: "lumbridge"}},
      {expected: "Quick teleport Lunar Isle Lodestone", teleport_id: {group: "home", spot: "lunarisle"}},
      {expected: "Teleport Lunar Isle Lodestone", teleport_id: {group: "home", spot: "lunarisle"}},
      {expected: "Quick teleport Oo´glog Lodestone", teleport_id: {group: "home", spot: "ooglog"}},
      {expected: "Teleport Oo´glog Lodestone", teleport_id: {group: "home", spot: "ooglog"}},
      {expected: "Quick teleport Port Sarim Lodestone", teleport_id: {group: "home", spot: "portsarim"}},
      {expected: "Teleport Port Sarim Lodestone", teleport_id: {group: "home", spot: "portsarim"}},
      {expected: "Quick teleport Prifddinas Lodestone", teleport_id: {group: "home", spot: "prifddinas"}},
      {expected: "Teleport Prifddinas Lodestone", teleport_id: {group: "home", spot: "prifddinas"}},
      {expected: "Quick teleport Seers´ Village Lodestone", teleport_id: {group: "home", spot: "seersvillage"}},
      {expected: "Teleport Seers´ Village Lodestone", teleport_id: {group: "home", spot: "seersvillage"}},
      {expected: "Quick teleport Taverley Lodestone", teleport_id: {group: "home", spot: "taverley"}},
      {expected: "Teleport Taverley Lodestone", teleport_id: {group: "home", spot: "taverley"}},
      {expected: "Quick teleport Tirannwn Lodestone", teleport_id: {group: "home", spot: "tirannwn"}},
      {expected: "Teleport Tirannwn Lodestone", teleport_id: {group: "home", spot: "tirannwn"}},
      {expected: "Quick teleport Varrock Lodestone", teleport_id: {group: "home", spot: "varrock"}},
      {expected: "Teleport Varrock Lodestone", teleport_id: {group: "home", spot: "varrock"}},
      {expected: "Quick teleport Wilderness Lodestone", teleport_id: {group: "home", spot: "wilderness"}},
      {expected: "Teleport Wilderness Lodestone", teleport_id: {group: "home", spot: "wilderness"}},
      {expected: "Quick teleport Yanille Lodestone", teleport_id: {group: "home", spot: "yanille"}},
      {expected: "Teleport Yanille Lodestone", teleport_id: {group: "home", spot: "yanille"}},
      {expected: "Quick teleport Menaphos Lodestone", teleport_id: {group: "home", spot: "menaphos"}},
      {expected: "Teleport Menaphos Lodestone", teleport_id: {group: "home", spot: "menaphos"}},
      {expected: "Quick teleport Fort Forinthry Lodestone", teleport_id: {group: "home", spot: "fortforinthry"}},
      {expected: "Teleport Fort Forinthry Lodestone", teleport_id: {group: "home", spot: "fortforinthry"}},
      {expected: "Quick teleport City of Um Lodestone", teleport_id: {group: "home", spot: "cityofum"}},
      {expected: "Teleport City of Um Lodestone", teleport_id: {group: "home", spot: "cityofum"}},
    ]

  export const ANGLE_CHANGE_COMMIT_THRESHOLD = degreesToRadians(10)

  export type Settings = {
    auto_commit_on_angle_change: boolean,
    calibration_mode: CompassReader.CalibrationMode,
    active_triangulation_presets: {
      compass_id: number,
      preset_id: number | null
    }[],
    custom_triangulation_presets: TriangulationPreset[],
  }

  export type TriangulationPreset = {
    id: number,
    compass_id: number,
    name: string,
    sequence: {
      tile?: TileCoordinates,
      teleport?: TeleportGroup.SpotId
    }[]
  }

  export namespace TriangulationPreset {

    export const elite_moonclan_southfeldiphills: TriangulationPreset = {
      compass_id: clue_data.gielinor_compass.id,
      id: -1,
      name: "{{teleport lunarspellbook moonclan}} Moonclan - {{teleport normalspellbook southfeldiphills}} South Feldip Hills",
      sequence: [
        {teleport: {group: "lunarspellbook", spot: "moonclan"}},
        {teleport: {group: "normalspellbook", spot: "southfeldiphills"}},
      ]
    }

    export const elite_moonclan_iceplateu: TriangulationPreset = {
      compass_id: clue_data.gielinor_compass.id,
      id: -2,
      name: "{{teleport lunarspellbook moonclan}} Moonclan - {{teleport lunarspellbook iceplateu}} Ice Plateau",
      sequence: [
        {teleport: {group: "lunarspellbook", spot: "moonclan"}},
        {teleport: {group: "lunarspellbook", spot: "iceplateu"}},
      ]
    }

    export const master_turtle_island: TriangulationPreset = {
      compass_id: clue_data.arc_compass.id,
      id: -3,
      name: "{{teleport arctabs turtleislands}} Turtle Island",
      sequence: [
        {teleport: {group: "arctabs", spot: "turtleislands"}},
      ]
    }

    export const builtin: TriangulationPreset[] = [
      elite_moonclan_southfeldiphills,
      elite_moonclan_iceplateu,
      master_turtle_island
    ]
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      auto_commit_on_angle_change: true,
      calibration_mode: "off",
      custom_triangulation_presets: [],
      active_triangulation_presets: []
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return DEFAULT

      if (!isArray(settings.custom_triangulation_presets)) settings.custom_triangulation_presets = []
      if (!isArray(settings.active_triangulation_presets)) settings.active_triangulation_presets = []
      if (![true, false].includes(settings.auto_commit_on_angle_change)) settings.auto_commit_on_angle_change = DEFAULT.auto_commit_on_angle_change

      if (!Object.keys(CompassReader.calibration_tables).includes(settings.calibration_mode)) settings.calibration_mode = DEFAULT.calibration_mode

      return settings
    }
  }
}