import {Path} from "../../../../lib/runescape/pathing";
import {MovementAbilities} from "../../../../lib/runescape/movement";
import * as leaflet from "leaflet";
import {Rectangle, Vector2} from "../../../../lib/math";
import {floor_t, TileCoordinates, TileRectangle} from "../../../../lib/runescape/coordinates";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import Widget from "../../../../lib/ui/Widget";
import {PathStepProperties} from "../../pathing/PathStepProperties";
import Dependencies from "../../../dependencies";
import {GameLayer} from "../../../../lib/gamemap/GameLayer";
import {CursorType} from "../../../../lib/runescape/CursorType";
import {TransportData} from "../../../../data/transports";
import {TeleportSpotEntity} from "./TeleportSpotEntity";
import {GameMapContextMenuEvent} from "../../../../lib/gamemap/MapEvents";
import {Menu} from "../../widgets/ContextMenu";
import {FloorLevels} from "../../../../lib/gamemap/ZoomLevels";
import {Transportation} from "../../../../lib/runescape/transportation";
import {PathGraphics} from "../../path_graphics";
import arrow = PathGraphics.arrow;
import createX = PathGraphics.createX;

export class PathStepEntity extends MapEntity {

  floor_sensitivity_layers: FloorLevels<{ correct_level: boolean }>

  constructor(public step: Path.Step) {
    super()

    this.floor_sensitivity_layers = new FloorLevels([
      {floors: [Path.Step.level(step)], value: {correct_level: true}},
      {floors: floor_t.all, value: {correct_level: false}},
    ])

    this.setTooltip(() => new PathStepProperties(this.step, Dependencies.instance().app.template_resolver))
  }

  bounds(): Rectangle {
    return Path.Step.bounds(this.step)
  }

  protected override async render_implementation(options: MapEntity.RenderProps): Promise<Element> {
    const step = this.step

    const floor_group = this.floor_sensitivity_layers.get(options.floor_group_index)

    const cls = floor_group.value.correct_level ? "ctr-step-graphics" : "ctr-step-graphics-dl"

    const element: Element = (() => {
      switch (step.type) {
        case "orientation":
          return null
        case "ability": {
          const meta: Record<MovementAbilities.movement_ability, { color: string, icon: string }> = {
            barge: {color: "#a97104", icon: "assets/icons/barge.png"},
            dive: {color: "#e7d82c", icon: "assets/icons/dive.png"},
            escape: {color: "#56ba0f", icon: "assets/icons/escape.png"},
            surge: {color: "#0091f2", icon: "assets/icons/surge.png"}
          }

          arrow(step.from, step.to)
            .setStyle({
              color: meta[step.ability].color,
              weight: options.highlight ? 6 : 4,
              interactive: true,
              className: cls
            }).addTo(this)

          const marker = leaflet.marker(Vector2.toLatLong(Vector2.scale(1 / 2, Vector2.add(step.from, step.to))), {
            icon: leaflet.icon({
              iconUrl: meta[step.ability].icon,
              iconSize: options.highlight ? [36, 36] : [24, 24],
              iconAnchor: options.highlight ? [18, 18] : [12, 12],
              className: cls
            })
          }).addTo(this)

          return marker.getElement()
        }
        case "run": {
          let lines: [Vector2, Vector2][] = []

          for (let i = 0; i < step.waypoints.length - 1; i++) {
            const from = step.waypoints[i]
            const to = step.waypoints[i + 1]

            lines.push([from, to])
          }

          lines = lines.filter((l) => !Vector2.eq(l[0], l[1]))

          leaflet.polyline(
            lines.map((t) => t.map(Vector2.toLatLong)),
            {
              color: "#b4b4b4",
              weight: options.highlight ? 6 : 4,
              className: cls
            }
          ).addTo(this)

          let marker = createX(step.waypoints[step.waypoints.length - 1],
            "yellow",
            options.highlight ? 30 : 20,
            cls
          ).addTo(this)

          return marker.getElement()
        }
        case "teleport": {
          let teleport = TransportData.resolveTeleport(step.id)

          const marker = leaflet.marker(Vector2.toLatLong(step.spot ?? teleport.centerOfTarget()), {
            icon: new TeleportSpotEntity.TeleportMapIcon(teleport, options.highlight ? 1.5 : 1),
            riseOnHover: true
          }).addTo(this)

          return marker.getElement()
        }
        case "redclick": {

          createX(step.where, "red",
            options.highlight ? 30 : 20,
            "ctr-step-graphics"
          ).addTo(this)

          const marker = leaflet.marker(Vector2.toLatLong(step.where), {
            icon: leaflet.icon({
              iconUrl: CursorType.meta(step.how).icon_url,
              iconSize: options.highlight ? [42, 48] : [28, 31],
              iconAnchor: options.highlight ? [6, 2] : [4, 1],
              className: cls
            })
          }).addTo(this)

          return marker.getElement()
        }
        case "powerburst": {

          const marker = leaflet.marker(Vector2.toLatLong(step.where), {
            icon: leaflet.icon({
              iconUrl: "assets/icons/accel.png",
              iconSize: options.highlight ? [26, 36] : [18, 24],
              iconAnchor: options.highlight ? [13, 18] : [9, 12],
              className: cls
            })
          }).addTo(this)

          return marker.getElement()
        }
        case "transport": {
          let entity = step.internal
          let action = entity.actions[0]
          const movement = Transportation.EntityAction.findApplicable(action, step.assumed_start) ?? action.movement[0]

          const is_remote = movement.fixed_target && !movement.fixed_target.relative

          let ends_up: TileCoordinates = Path.ends_up([step])

          const center_of_entity = TileRectangle.center(entity.clickable_area, false)

          arrow(step.assumed_start, is_remote ? center_of_entity : ends_up)
            .setStyle({
              color: "#069334",
              weight: options.highlight ? 6 : 4,
              dashArray: '10, 10',
              className: cls
            }).addTo(this)

          const marker = leaflet.marker(Vector2.toLatLong(center_of_entity), {
            icon: leaflet.icon({
              iconUrl: CursorType.meta(action.cursor).icon_url,
              iconSize: options.highlight ? [42, 48] : [28, 31],
              iconAnchor: options.highlight ? [6, 2] : [4, 1],
              className: cls
            }),
          }).addTo(this)

          return marker.getElement();
        }
        case "cheat": {
          const marker_pos = step.assumed_start
            ? Rectangle.center(Rectangle.from(step.assumed_start, step.target), false)
            : step.target

          if (step.assumed_start) {
            arrow(step.assumed_start, step.target)
              .setStyle({
                color: "#069334",
                weight: options.highlight ? 6 : 4,
                dashArray: '10, 10',
                className: cls
              }).addTo(this)
          }

          const marker = leaflet.marker(Vector2.toLatLong(marker_pos), {
            icon: leaflet.icon({
              iconUrl: "assets/icons/Rotten_potato.png",
              iconSize: options.highlight ? [33, 24] : [21, 16],
              iconAnchor: options.highlight ? [15, 12] : [10, 8],
              className: cls
            }),
          }).addTo(this)

          return marker.getElement()

        }

        case "cosmetic": {
          const marker = leaflet.marker(Vector2.toLatLong(step.position), {
            icon: leaflet.icon({
              iconUrl: `assets/icons/${step.icon}`,
              iconSize: options.highlight ? [42, 48] : [28, 31],
              iconAnchor: options.highlight ? [6, 2] : [4, 1],
              className: cls
            })
          }).addTo(this)

          return marker.getElement()
        }

      }
    })()

    this.setStyle({
      interactive: true,
      className: "ctr-step-graphics"
    })

    return element
  }

  override async contextMenu(event: GameMapContextMenuEvent): Promise<Menu | null> {
    return {
      type: "submenu",
      text: Path.Step.name(this.step),
      children: []
    }
  }
}

export namespace PathStepEntity {

  export function renderPath(path: Path.Step[]): GameLayer {
    let group = new GameLayer()

    for (let step of path) new PathStepEntity(step).addTo(group)

    return group
  }
}