import {Path} from "../../../../lib/runescape/pathing";
import {MovementAbilities} from "../../../../lib/runescape/movement";
import * as leaflet from "leaflet";
import {Rectangle, Vector2} from "../../../../lib/math";
import {floor_t, TileCoordinates, TileRectangle} from "../../../../lib/runescape/coordinates";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
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
import {MapIcon} from "../MapIcon";
import {CTRIcon} from "../../../CTRIcon";
import {areaPolygon} from "../../polygon_helpers";
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
    return Path.Step.bounds(this.step, false)
  }

  protected override async render_implementation(options: MapEntity.RenderProps): Promise<Element> {
    const step = this.step

    const floor_group = this.floor_sensitivity_layers.get(options.floor_group_index)

    const cls = floor_group.value.correct_level ? "ctr-step-graphics" : "ctr-step-graphics-dl"

    const scale = options.highlight ? 1.5 : 1
    const weight = scale * 3

    const opacity = options.opacity

    const element: Element = (() => {
      switch (step.type) {
        case "orientation":
          return null
        case "ability": {
          const meta: Record<MovementAbilities.movement_ability, { color: string, icon: CTRIcon.ID }> = {
            barge: {color: "#a97104", icon: "ability-barge"},
            dive: {color: "#e7d82c", icon: "ability-dive-combined"},
            escape: {color: "#56ba0f", icon: "ability-escape"},
            surge: {color: "#0091f2", icon: "ability-surge"}
          }

          arrow(step.from, step.to)
            .setStyle({
              color: meta[step.ability].color,
              weight: weight,
              interactive: true,
              className: cls,
              opacity: opacity
            }).addTo(this)

          const marker = new MapIcon(Vector2.scale(1 / 2, Vector2.add(step.from, step.to)), {
            icon: CTRIcon.get(meta[step.ability].icon),
            scale: scale,
            cls: cls,
            opacity
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
              weight: weight,
              className: cls,
              opacity
            }
          ).addTo(this)

          let marker = createX(step.waypoints[step.waypoints.length - 1],
            "yellow",
            scale * 16,
            cls,
            opacity
          ).addTo(this)

          return marker.getElement()
        }
        case "teleport": {
          let teleport = TransportData.resolveTeleport(step.id)

          const marker = leaflet.marker(Vector2.toLatLong(step.spot ?? teleport.centerOfTarget()), {
            icon: new TeleportSpotEntity.TeleportMapIcon(teleport, scale, w => w.addClass(cls)),
            riseOnHover: true,
            opacity
          }).addTo(this)

          if (options.highlight) {
            areaPolygon(teleport.targetArea())
              .setStyle({
                fillColor: "lightgreen",
                color: "lightgreen",
                stroke: true,
                opacity
              }).addTo(this)
          }

          return marker.getElement()
        }
        case "redclick": {

          createX(step.where, "red",
            scale * 20,
            "ctr-step-graphics",
            opacity
          ).addTo(this)

          const marker = new MapIcon(step.where, {
            icon: CursorType.getIcon(step.how),
            scale: scale,
            cls: cls,
            opacity
          }).addTo(this)

          return marker.getElement()
        }
        case "powerburst": {

          const marker = new MapIcon(step.where, {
            icon: CTRIcon.get("item/powerburst-of-acceleration"),
            scale: scale,
            cls: cls,
            opacity
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
              weight: weight,
              dashArray: '10, 10',
              className: cls,
              opacity
            }).addTo(this)

          const marker = new MapIcon(center_of_entity, {
            icon: CursorType.getIcon(action.cursor),
            scale: scale,
            cls: cls,
            opacity
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
                weight: weight,
                dashArray: '10, 10',
                className: cls,
                opacity
              }).addTo(this)
          }

          const marker = new MapIcon(marker_pos, {
            icon: CTRIcon.get("item/rotten-potato"),
            cls: cls,
            scale: scale,
            opacity
          }).addTo(this)

          return marker.getElement()
        }

        case "cosmetic": {
          const marker = new MapIcon(step.position, {
            icon: CTRIcon.get(step.icon),
            scale: options.highlight ? 1.5 : 1,
            cls: cls,
            opacity
          }).addTo(this)

          if (options.highlight || !step.hide_when_not_hovered) {
            if (step.area) {
              areaPolygon(step.area).setStyle({
                color: step.area_color ?? Path.COSMETIC_DEFAULT_COLORS.area,
                weight: weight,
                opacity
              }).addTo(this)
            }

            if (step.arrow) {
              arrow(step.arrow[0], step.arrow[1]).setStyle({
                color: step.arrow_color ?? Path.COSMETIC_DEFAULT_COLORS.arrow,
                weight: weight,
                opacity
              }).addTo(this)
            }
          }

          return marker.getElement()
        }

      }
    })()

    this.setStyle({
      interactive: true,
      className: "ctr-step-graphics",
      opacity
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