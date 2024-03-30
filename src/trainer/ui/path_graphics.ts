import {direction, MovementAbilities} from "lib/runescape/movement";
import Widget from "lib/ui/Widget";
import {Transportation} from "../../lib/runescape/transportation";
import {C} from "../../lib/ui/constructors";
import {TileCoordinates} from "../../lib/runescape/coordinates";
import {Vector2} from "../../lib/math";
import * as leaflet from "leaflet"
import {Path} from "../../lib/runescape/pathing";
import {TransportData} from "../../data/transports";
import {CursorType} from "../../lib/runescape/CursorType";

export namespace PathGraphics {

  import movement_ability = MovementAbilities.movement_ability;
  import span = C.span;
  import inlineimg = C.inlineimg;
  import resolveTeleport = TransportData.resolveTeleport;

  export namespace Teleport {
    import inlineimg = C.inlineimg;
    import cls = C.cls;

    export function asSpan(tele: Transportation.TeleportGroup.Spot): Widget {

      return c("<span style='position: relative'>")
        .tooltip(tele.hover())
        .append(
          inlineimg(`assets/icons/teleports/${tele.image().url}`),
          cls("tele-icon-code-overlay").append(tele.code() ?? "")
        )
    }
  }

  export function ability_icon(ability: movement_ability): string {
    switch (ability) {
      case "surge":
        return 'assets/icons/surge.png'
      case "escape":
        return 'assets/icons/escape.png'
      case "barge":
        return 'assets/icons/barge.png'
      case "dive":
        return 'assets/icons/dive.png'
    }
  }

  export function asSpan(step: Path.Step): Widget {
    switch (step.type) {
      case "orientation":
        return span().append(inlineimg('assets/icons/compass.png'), direction.toShortString(step.direction))
      case "ability":
        return inlineimg(ability_icon(step.ability))
      case "run":
        return span().append(inlineimg('assets/icons/run.png'), (step.waypoints.length - 1).toString())
      case "teleport":
        let tele = resolveTeleport(step.id)

        if (!tele) return inlineimg('assets/teleports/homeport.png')

        return PathGraphics.Teleport.asSpan(tele)
      case "transport":
        return inlineimg(CursorType.meta(step.internal.actions[0].cursor).icon_url)
      case "redclick":
        return inlineimg('assets/icons/redclick.png')
      case "powerburst":
        return inlineimg('assets/icons/accel.png')
      case "cheat":
        return inlineimg('assets/icons/Rotten_potato.png')
    }
  }

  export function createX(coordinate: TileCoordinates,
                          color: "red" | "yellow",
                          size: number = 16,
                          className: string = undefined
  ): leaflet.Marker {
    const click_icons = {
      "red": "assets/icons/redclick.png",
      "yellow": "assets/icons/yellowclick.png",
    }

    return leaflet.marker(Vector2.toLatLong(coordinate), {
      icon: leaflet.icon({
        iconUrl: click_icons[color],
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className:
          className ? `
      no - antialiasing ${className}`
            : "no-antialiasing"
      }),
      interactive: false,
    })
  }

  const pi = 3.1415

  export function arrow(from: Vector2, to: Vector2): leaflet.Polyline {

    if (!to) debugger

    let off = Vector2.sub(from, to)

    if (Vector2.lengthSquared(off) < 1) return leaflet.polyline([])

    let arm1_offset = Vector2.scale(0.7, Vector2.rotate(Vector2.normalize(off), pi / 4))
    let arm2_offset = Vector2.scale(0.7, Vector2.rotate(Vector2.normalize(off), -pi / 4))

    let tip = Vector2.toLatLong(to)

    return leaflet.polyline([
          [Vector2.toLatLong(from), Vector2.toLatLong(to)],
          [tip, Vector2.toLatLong(Vector2.add(to, arm1_offset))],
          [tip, Vector2.toLatLong(Vector2.add(to, arm2_offset))],
        ]
      )
      .setStyle({
        interactive: true
      })
  }
}

export namespace PathingGraphics {
  export function templateString(step: Path.Step): string {
    switch (step.type) {
      case "orientation":
        return `Face ${direction.toString(step.direction)}`
      case "run":
        return `{{icon run}}`
      case "ability":
        return `{{${step.ability}}}`
      case "teleport":
        return `{{teleport ${step.id.group} ${step.id.spot}}}`
      case "powerburst":
        return `{{icon accel}}`
      case "redclick":
        return `{{icon ${CursorType.meta(step.how).short_icon}}}`
      case "transport":
        return `{{icon ${CursorType.meta(step.internal.actions[0].cursor).short_icon}}}`
      case "cheat":
        return `{{icon Rotten_potato}}`
    }
  }

  export function getIcon(step: Path.Step): Widget {
    switch (step.type) {
      case "orientation":
        return c(`<img class='text-icon' src='assets/icons/compass.png'>`)
      case "run":
        return c(`<img class='text-icon' src='assets/icons/run.png'>`)
      case "ability":
        switch (step.ability) {
          case "surge":
            return c(`<img class='text-icon' src='assets/icons/surge.png'>`)
          case "escape":
            return c(`<img class='text-icon' src='assets/icons/escape.png'>`)
          case "barge":
            return c(`<img class='text-icon' src='assets/icons/barge.png'>`)
          case "dive":
            return c(`<img class='text-icon' src='assets/icons/dive.png'>`)
        }
        break;
      case "teleport":
        return c(`<img class='text-icon' src='assets/icons/teleports/homeport.png'>`)
      case "redclick":
        return c(`<img class='text-icon' src='assets/icons/redclick.png'>`)
      case "powerburst":
        return c(`<img class='text-icon' src='assets/icons/accel.png'>`)
      case "cheat":
        return c(`<img class='text-icon' src='assets/icons/Rotten_potato.png'>`)
    }
  }
}