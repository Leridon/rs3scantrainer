import {Rectangle, Vector2} from "../math";

export type ScreenRectangle = {
  origin: Vector2,
  size: Vector2
}

export namespace ScreenRectangle {
  export function move(rect: ScreenRectangle, offset: Vector2, new_size: Vector2 = null): ScreenRectangle {
    return {
      origin: Vector2.add(rect.origin, offset),
      size: new_size ?? rect.size
    }
  }

  export function fromRectangle(rect: Rectangle): ScreenRectangle {
    return {
      origin: Rectangle.screenOrigin(rect),
      size: {
        x: Rectangle.width(rect) + 1,
        y: Rectangle.height(rect) + 1,
      }
    }
  }

  export function toRectangle(rect: ScreenRectangle): Rectangle {
    return Rectangle.fromOriginAndSize(rect.origin, rect.size)
  }
}