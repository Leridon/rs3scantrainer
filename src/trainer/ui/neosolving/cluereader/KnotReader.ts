import {CelticKnots} from "../../../../lib/cluetheory/CelticKnots";
import {Rectangle, Vector2} from "../../../../lib/math";
import {ClueReader} from "./ClueReader";
import {util} from "../../../../lib/util/util";
import {OverlayGeometry} from "../../../../lib/util/OverlayGeometry";
import {ImageData, mixColor} from "@alt1/base";
import {ImageFingerprint} from "../../../../lib/util/ImageFingerprint";
import * as lodash from "lodash";
import {identity} from "lodash";


export namespace KnotReader {

  import rgbSimilarity = util.rgbSimilarity;
  import MatchedUI = ClueReader.MatchedUI;
  import count = util.count;
  const TILE_SIZE = {x: 24, y: 24}
  const RUNE_SIZE = {x: 25, y: 25}
  const DIAGONAL_SPACING = {x: 24, y: 24}
  const FROM_ANCHOR_TO_TILE = {x: -11, y: 9}
  const MAX_GRID_SIZE = {x: 15, y: 13}

  const SCANNING_X = 177

  function isLaneBorder(color: [number, number, number, number]): boolean {
    return color[0] < 60 && color[1] < 60 && color[2] < 40
  }

  function isBackground(color: [number, number, number]): boolean {
    const samples: [number, number, number][] = [
      [159, 145, 86],
      [177, 161, 95],
      [144, 131, 79]
    ]

    return lodash.max(samples.map(s => rgbSimilarity(s, color))) > 0.8
  }

  function getTrackColor(rgb: [number, number, number]): { lane_id: number, certainty: number }[] {
    const refs: {
      track_id: number | null,
      colors: [number, number, number][]
    }[] =
      [
        {
          track_id: 0, colors: [ // blue
            [50, 50, 85]
          ]
        },
        {track_id: 1, colors: [[144, 107, 6]],},
        {track_id: 2, colors: [[23, 23, 35]],}, //darkblue
        {track_id: 3, colors: [[109, 77, 0], [205, 146, 0]],}, //yellow bl
      ]


    return refs.map(r => ({
      lane_id: r.track_id,
      certainty: lodash.max(r.colors.map(ref_color => rgbSimilarity(ref_color, rgb)))
    }))
  }


  export type Result = {
    state: CelticKnots.PuzzleState,
    buttons: {
      clockwise: Vector2,
      counterclockwise: Vector2
    }[]
  }

  let overlay: OverlayGeometry = new OverlayGeometry().withTime(2000)

  type Tile = {
    pos: Vector2,
    rune: {
      strip_color: number,
      neighbours_exist: boolean[],
      id: number,
      intersection: {
        matches: boolean
      } | null
    },
  }

  class KnotReader {
    private img_data: ImageData
    private border_anchor: Vector2
    private anchor_grid_origin: Vector2
    private grid_size: Vector2
    private runes_on_odd_tiles: boolean

    private grid: Tile[][]

    private detected_rune_types: ImageFingerprint[] = []

    constructor(private ui: MatchedUI.Modal) {
      this.img_data = ui.image.toData()

      this.findOrigin()

      this.grid = new Array(this.grid_size.y)

      for (let y = 0; y < this.grid_size.y; y++) {
        this.grid[y] = new Array(this.grid_size.x)

        for (let x = 0; x < this.grid_size.x; x++) {
          if (((x + y) % 2 == 1) != this.runes_on_odd_tiles) continue

          this.grid[y][x] = this.readTile({x, y})
        }
      }

      overlay?.clear()

      for (let x = 0; x < this.grid_size.x; x++) {
        for (let y = 0; y < this.grid_size.y; y++) {

          const o = this.tileOrigin({x, y})

          const tile = this.grid[y][x]

          if (!tile) continue

          /*overlay.rect(Rectangle.fromOriginAndSize(o, TILE_SIZE),
            {color: mixColor(255, 0, 0), width: 1}
          )*/

          if (tile.rune) {
            const n = count(tile.rune.neighbours_exist, identity)

            overlay.text(n.toString(), Vector2.add(o, Vector2.scale(0.5, TILE_SIZE)), {
              width: n == 4 ? 5 : 10,
              shadow: true,
              color: mixColor(255, 255, 255),
              centered: true
            })

          }
        }
      }

      overlay.render()
    }

    private findOrigin() {

      const intercepted = ((): Vector2 => {
        let y = 5

        while (y < 200) {
          const pixel = Vector2.add(Rectangle.screenOrigin(this.ui.rect), {x: SCANNING_X, y: y})

          if (isLaneBorder(this.img_data.getPixel(pixel.x, pixel.y))) return pixel

          y++
        }

        return null
      })()

      // Move intersection up as far as possible
      while (intercepted.y > 0) {
        if (isLaneBorder(this.img_data.getPixel(intercepted.x - 1, intercepted.y - 1))) {
          intercepted.x--
          intercepted.y--
        } else if (isLaneBorder(this.img_data.getPixel(intercepted.x + 1, intercepted.y - 1))) {
          intercepted.x++
          intercepted.y--
        } else break
      }

      // Maybe move a pixel left in to get the left pixel of the top
      if (isLaneBorder(this.img_data.getPixel(intercepted.x - 1, intercepted.y))) intercepted.x--

      this.border_anchor = intercepted

      const origin_of_a_tile = Vector2.add(this.border_anchor, FROM_ANCHOR_TO_TILE)

      const DEAD = {x: 70, y: 0}

      const DEADZONE = Vector2.add(Rectangle.screenOrigin(this.ui.rect), DEAD)

      const index_of_detected_rune = {
        x: Math.floor((origin_of_a_tile.x - DEADZONE.x) / TILE_SIZE.x),
        y: Math.floor((origin_of_a_tile.y - DEADZONE.y) / TILE_SIZE.y),
      }

      this.anchor_grid_origin = Vector2.sub(origin_of_a_tile, Vector2.mul(TILE_SIZE, index_of_detected_rune))

      this.runes_on_odd_tiles = (index_of_detected_rune.x + index_of_detected_rune.y) % 2 == 1

      this.grid_size = {
        x: Math.floor((this.ui.rect.botright.x - this.anchor_grid_origin.x - DEAD.x) / TILE_SIZE.x),
        y: Math.floor((this.ui.rect.topleft.y - this.anchor_grid_origin.y - DEAD.y) / TILE_SIZE.y)
      }
    }

    private tileOrigin(tile: Vector2): Vector2 {
      return Vector2.add(this.anchor_grid_origin, Vector2.mul(tile, TILE_SIZE))
    }

    private sample(coords: Vector2): [number, number, number] {
      return this.img_data.getPixel(coords.x, coords.y) as unknown as [number, number, number]
    }

    private readTile(pos: Vector2): Tile {
      const tile_origin = this.tileOrigin(pos)

      const background_sample_positions: Vector2[] = [
        {x: 0, y: 0},
        {x: 24, y: 0},
        {x: 0, y: 24},
        {x: 24, y: 24},
      ]

      const background = background_sample_positions.map(pos => isBackground(this.sample(Vector2.add(tile_origin, pos)))) as [boolean, boolean, boolean, boolean]

      if (pos.x == 3 && pos.y == 2) {
        const bg = background_sample_positions.map(pos => this.sample(Vector2.add(tile_origin, pos)))

        console.log(background)
        console.log(bg)

        debugger
      }

      const background_neighbours = count(background, identity)

      //if (background_neighbours > 2) return {pos: pos, rune: null}

      const is_intersection = background_neighbours == 0

      const lane_color_sample_positions: Vector2[] = [
        {x: 2, y: 2},
        {x: 22, y: 2},
        {x: 2, y: 22},
        {x: 22, y: 22},
      ]

      /*
      lane_color_sample_positions.map(pos => {
        getTrackColor(this.sample(Vector2.add(tile_origin, pos)))
      })*/

      return {
        pos: pos,
        rune: {
          id: 0,
          strip_color: 0,
          neighbours_exist: background.map(e => !!e),
          intersection: is_intersection ? {matches: false} : null
        }
      }
    }
  }

  export function read(modal: MatchedUI.Modal): KnotReader.Result {
    // Idea: Read grid into

    new KnotReader(modal)

    return null
    // TODO: Find origin of knot coordinate system


  }


}