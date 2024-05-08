import {CelticKnots} from "../../../../lib/cluetheory/CelticKnots";
import {Rectangle, Vector2} from "../../../../lib/math";
import {util} from "../../../../lib/util/util";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {ImageData, ImageDetect, mixColor} from "@alt1/base";
import {ImageFingerprint} from "../../../../lib/util/ImageFingerprint";
import * as lodash from "lodash";
import {identity} from "lodash";
import {CapturedImage, CapturedModal} from "../../../../lib/alt1/ImageCapture";


export namespace KnotReader {
  import rgbSimilarity = util.rgbSimilarity;
  import count = util.count;
  const TILE_SIZE = {x: 24, y: 24}
  const RUNE_SIZE = {x: 25, y: 25}
  const DIAGONAL_SPACING = {x: 24, y: 24}
  const FROM_ANCHOR_TO_TILE = {x: -11, y: 9}
  const MAX_GRID_SIZE = {x: 15, y: 13}

  const RUNE_REFERENCE_SIZE = {x: 12, y: 12}
  const RUNE_KERNEL_SIZE = {x: 3, y: 3}

  const SCANNING_X = 107

  const button_positions: {
    hash: number[],
    buttons: ButtonPositions
  }[] = [{
    hash: [16, 16, 16, 30113, 60110, 1050203, 1090209, 1110213, 1070207, 70211, 40214],
    buttons: [
      {clockwise: {x: 0, y: 1}, counterclockwise: {x: 0, y: 3}},
      {clockwise: {x: 12, y: 5}, counterclockwise: {x: 12, y: 3}},
      {clockwise: {x: 4, y: 9}, counterclockwise: {x: 6, y: 9}},
    ]
  }, {
    hash: [16, 16, 16, 20214, 70109, 1070209, 10115, 60210, 1010215],
    buttons: [
      {clockwise: {x: -1, y: 3}, counterclockwise: {x: -1, y: 5}},
      {clockwise: {x: 5, y: 9}, counterclockwise: {x: 7, y: 9}},
      {clockwise: {x: 13, y: 5}, counterclockwise: {x: 13, y: 3}},
    ]
  },
  ]

  export function getButtons(shape: CelticKnots.PuzzleShape): ButtonPositions {
    const hash = CelticKnots.PuzzleShape.hash(shape)
    return button_positions.find(entry => lodash.isEqual(entry.hash, hash))?.buttons
  }

  type ButtonPositions = {
    clockwise: Vector2,
    counterclockwise: Vector2
  }[]

  function isLaneBorder(color: [number, number, number, number]): boolean {
    return color[0] < 60 && color[1] < 60 && color[2] < 40
  }

  function isBackground(color: [number, number, number]): boolean {
    const samples: [number, number, number][] = [
      [159, 145, 86],
      [177, 161, 95],
      [144, 131, 79]
    ]

    return lodash.max(samples.map(s => rgbSimilarity(s, color))) > 0.9
  }


  let rune_references: ImageFingerprint[] = undefined

  export async function getRuneReferences(): Promise<ImageFingerprint[]> {

    if (rune_references == undefined) {
      const atlas = await ImageDetect.imageDataFromUrl("alt1anchors/knot_runes/atlas.png")

      const fingerprints: ImageFingerprint[] = []

      for (let i = 0; i < Math.floor(atlas.width / 12); i++) {
        fingerprints.push(ImageFingerprint.get(atlas, {x: i * 12, y: 0}, RUNE_REFERENCE_SIZE, RUNE_KERNEL_SIZE, ImageFingerprint.TypeRGB))
      }

      rune_references = fingerprints
    }

    return rune_references
  }

  function getTrackColor(samples: [number, number, number][]): { lane_id: number, certainty: number } {
    const refs: {
      track_id: number | null,
      colors: [number, number, number][]
    }[] =
      [
        {track_id: 0, colors: [[46, 46, 77], [45, 45, 75], [28, 28, 47], [28, 28, 47], [35, 25, 58], [50, 50, 85]]},// blue
        {track_id: 1, colors: [[137, 60, 43], [67, 29, 21], [97, 43, 30], [62, 27, 17]],}, // red
        {track_id: 2, colors: [[12, 12, 18], [11, 11, 16], [18, 18, 27]],}, //darkblue
        {track_id: 3, colors: [[43, 30, 0], [159, 112, 0], [205, 146, 0]]}, // yellow
        {track_id: 4, colors: [[95, 89, 76], [123, 116, 98], [30, 28, 24]]}, // gray
      ]

    const res = lodash.maxBy(refs.map(r => ({
      lane_id: r.track_id,
      certainty: lodash.sum(samples.map(col => lodash.max(r.colors.map(ref_color => rgbSimilarity(ref_color, col))))) / samples.length
    })), e => e.certainty)

    if (res.certainty > 0.8) return res
    else return null
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

  type Lane = {
    color: number,
    tiles: Tile[]
  }

  const directions: {
    offset: Vector2,
    background_sample_position: Vector2,
  }[] = [
    {offset: {x: -1, y: -1}, background_sample_position: {x: 0, y: 0}},
    {offset: {x: 1, y: -1}, background_sample_position: {x: 23, y: 0}},
    {offset: {x: 1, y: 1}, background_sample_position: {x: 24, y: 24}},
    {offset: {x: -1, y: 1}, background_sample_position: {x: 0, y: 24}},
  ]

  const track_color_sample_positions: Vector2[] = [
    {x: 11, y: -3},
    {x: -5, y: 12},
    {x: 29, y: 13},
    {x: 11, y: 28},
  ]

  const intersection_type_sample_positions: Vector2[] = [
    {x: 12, y: -1},
    {x: -1, y: 12},
    {x: 24, y: 12},
    {x: 12, y: 24},
  ]

  const intersection_sample_colors: {
    match: [number, number, number][],
    nomatch: [number, number, number][]
  } = {
    match: [[99, 178, 74], [86, 155, 64], [108, 195, 81], [130, 235, 98]],
    nomatch: [[60, 0, 0], [86, 0, 0], [92, 0, 0], [106, 0, 0]]
  }

  function isMatchingIntersection(samples: [number, number, number][]): boolean {
    const match_score = lodash.sum(samples.map(col => lodash.max(intersection_sample_colors.match.map(ref_color => rgbSimilarity(ref_color, col)))))
    const nomatch_score = lodash.sum(samples.map(col => lodash.max(intersection_sample_colors.nomatch.map(ref_color => rgbSimilarity(ref_color, col)))))

    return match_score > nomatch_score
  }

  const DEADZONE = {x: 70, y: 13}

  export class KnotReader {
    private img_data: ImageData
    private border_anchor: Vector2
    private anchor_grid_origin: Vector2
    private grid_size: Vector2
    private runes_on_odd_tiles: boolean
    private puzzle: CelticKnots.PuzzleState

    private grid: Tile[][]
    private lanes: Lane[]
    public isBroken = false
    public brokenReason: string = ""

    public relevant_body: CapturedImage

    constructor(public ui: CapturedModal) {
      this.relevant_body = ui.body.getSubSection({
        origin: DEADZONE,
        size: {
          x: ui.body.size.x - 2 * DEADZONE.x,
          y: ui.body.size.y - 2 * DEADZONE.y
        }
      })

      this.img_data = this.relevant_body.getData()
    }

    private async identifyRune(img: ImageFingerprint): Promise<number> {
      const similarities = (await getRuneReferences()).map((r, i) => {
        return {id: i, certainty: ImageFingerprint.similarity(img, r)}
      })

      const best = lodash.maxBy(similarities, e => e.certainty)

      if (best && best.certainty > 0.9) {
        return best.id
      } else {
        return null
      }
    }

    private findOrigin() {
      if (this.anchor_grid_origin) return

      const intercepted = ((): Vector2 => {
        let y = 5

        while (y < 200) {
          const pixel = {x: SCANNING_X, y: y}

          if (isLaneBorder(this.img_data.getPixel(pixel.x, pixel.y))) return pixel

          y++
        }

        return null
      })()

      if (!intercepted) {
        this.isBroken = true
        this.brokenReason = "Not intercepted"
        return
      }

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

      const index_of_detected_rune = {
        x: Math.floor(origin_of_a_tile.x / TILE_SIZE.x),
        y: Math.floor(origin_of_a_tile.y / TILE_SIZE.y),
      }

      this.anchor_grid_origin = Vector2.sub(origin_of_a_tile, Vector2.mul(TILE_SIZE, index_of_detected_rune))

      this.runes_on_odd_tiles = (index_of_detected_rune.x + index_of_detected_rune.y) % 2 == 1

      this.grid_size = {
        x: Math.floor((this.relevant_body.size.x - this.anchor_grid_origin.x) / TILE_SIZE.x),
        y: Math.floor((this.relevant_body.size.y - this.anchor_grid_origin.y) / TILE_SIZE.y)
      }
    }

    public tileOrigin(tile: Vector2, on_screen: boolean = false): Vector2 {
      if (on_screen) {
        return Vector2.add(this.anchor_grid_origin, Vector2.mul(tile, TILE_SIZE), this.relevant_body.screenRectangle().origin)
      } else {
        return Vector2.add(this.anchor_grid_origin, Vector2.mul(tile, TILE_SIZE))
      }
    }

    private sample(coords: Vector2): [number, number, number] {
      return this.img_data.getPixel(coords.x, coords.y) as unknown as [number, number, number]
    }

    private async readGrid() {
      if (this.grid) return

      this.findOrigin()

      if (this.isBroken) return

      this.grid = new Array(this.grid_size.y)

      for (let y = 0; y < this.grid_size.y; y++) {
        this.grid[y] = new Array(this.grid_size.x)

        for (let x = 0; x < this.grid_size.x; x++) {
          if (((x + y) % 2 == 1) != this.runes_on_odd_tiles) continue

          this.grid[y][x] = await this.readTile({x, y})
        }
      }

      const valid_tiles = count(this.grid.flat(), t => !!t.rune)

      if (valid_tiles < 20) {
        this.brokenReason = "Not enough valid tiles"
        this.isBroken = true
      }
    }

    private async readTile(pos: Vector2): Promise<Tile> {
      const tile_origin = this.tileOrigin(pos)

      const background = directions.map(pos => isBackground(this.sample(Vector2.add(tile_origin, pos.background_sample_position)))) as [boolean, boolean, boolean, boolean]

      const background_neighbours = count(background, identity)

      const rune_fingerprint = ImageFingerprint.get(this.img_data, Vector2.add(tile_origin, {x: 7, y: 7}), RUNE_REFERENCE_SIZE, RUNE_KERNEL_SIZE, ImageFingerprint.TypeRGB)

      if (background_neighbours > 2) return {pos: pos, rune: null}

      const is_intersection = background_neighbours == 0

      const track_color = getTrackColor(track_color_sample_positions.map(pos => this.sample(Vector2.add(tile_origin, pos))))

      let intersection_matches = false

      if (is_intersection) {
        intersection_matches = isMatchingIntersection(
          intersection_type_sample_positions.map(pos => this.sample(Vector2.add(tile_origin, pos)))
        )
      }

      const rune = await this.identifyRune(rune_fingerprint)

      if (rune == null) {
        return {pos: pos, rune: null}
      }

      return {
        pos: pos,
        rune: {
          id: await this.identifyRune(rune_fingerprint),
          strip_color: track_color?.lane_id ?? 5,
          neighbours_exist: background.map(e => !e),
          intersection: is_intersection ? {matches: intersection_matches} : null
        }
      }
    }

    private async findLanes() {
      if (this.lanes) return

      await (this.readGrid())

      if (this.isBroken) return

      this.lanes = []

      while (true) {
        const start_tile = this.grid.flat().find(t => t.rune && !t.rune.intersection && !this.lanes.some(l => l.color == t.rune.strip_color))

        if (!start_tile) {
          console.log("No start tile")
          break
        }

        console.log(`Start tile ${Vector2.toString(start_tile.pos)}`)

        const lane: Lane = {
          color: start_tile.rune.strip_color,
          tiles: []
        }

        let d = 2

        let tile = start_tile

        while (true) {
          lane.tiles.push(tile)

          const tile_i = Vector2.add(tile.pos, directions[d].offset)

          tile = this.grid[tile_i.y][tile_i.x]

          if (!tile?.rune || tile == start_tile || lane.tiles.length > 40) break

          if (!tile.rune.intersection && !tile.rune.neighbours_exist[d]) {
            d = [0, 1, 2, 3].find(i => i != (d + 2) % 4 && tile.rune.neighbours_exist[i])
          }
        }

        this.lanes.push(lane)

        if (lane.tiles.length < 10) {
          this.brokenReason = "Lane too short"
          this.isBroken = true
          break;
        }
      }

      if (this.lanes.length < 3) {
        this.brokenReason = `Not enough lanes: ${this.lanes.length}`
        this.isBroken = true
      }
    }

    public async getPuzzle(): Promise<CelticKnots.PuzzleState> {
      if (this.puzzle) return this.puzzle

      await (this.findLanes())

      if (this.isBroken) return null

      const locks: CelticKnots.Lock[] = []

      const lock_positions: Vector2[] = []

      for (let lane_i = 0; lane_i < this.lanes.length; lane_i++) {
        const lane = this.lanes[lane_i]

        for (let tile_i = 0; tile_i < lane.tiles.length; tile_i++) {
          const tile = lane.tiles[tile_i]

          if (tile.rune.intersection && tile.rune.strip_color != lane.color) {
            const intersecting_lane_i = this.lanes.findIndex(l => l.color == tile.rune.strip_color)
            const intersecting_lane = this.lanes[intersecting_lane_i]

            const intersecting_tile_i = intersecting_lane.tiles.findIndex(t => t == tile)

            locks.push({
              first: {
                snake: lane_i,
                tile: tile_i,
              }, second: {
                snake: intersecting_lane_i,
                tile: intersecting_tile_i
              }
            })
            lock_positions.push(tile.pos)
          }
        }
      }

      return this.puzzle = {
        shape: {
          snake_lengths: this.lanes.map(l => l.tiles.length),
          locks: locks
        },
        snakes: this.lanes.map(lane => lane.tiles.map(t => {
          if (t.rune.intersection && !t.rune.intersection.matches && t.rune.strip_color != lane.color) return {value: t.rune.id, type: "isnot"}
          else return {value: t.rune.id, type: "is"}
        }))
      }
    }

    public async showDebugOverlay(
      show_grid: boolean = false,
      text_mode: "runeid" | "neighbour_count" | "neighbour_array" = "runeid"
    ) {
      await (this.getPuzzle())

      const colors = [
        mixColor(0, 0, 255), // blue
        mixColor(255, 0, 0), // red
        mixColor(23, 23, 100), // darkblue
        mixColor(235, 167, 0),  // yellow
        mixColor(255, 255, 255),   // gray
      ]

      overlay?.clear()

      for (let i = 0; i < this.lanes.length; i++) {
        const lane = this.lanes[i]

        overlay.polyline(lane.tiles.map(t => Vector2.add(this.relevant_body.screenRectangle().origin, this.tileOrigin(t.pos), {x: 12, y: 12})),
          true,
          {
            color: colors[lane.color],
            width: 2
          }
        )
      }

      if (this.grid_size) {

        for (let x = 0; x < this.grid_size.x; x++) {
          for (let y = 0; y < this.grid_size.y; y++) {

            const o = Vector2.add(this.relevant_body.screenRectangle().origin, this.tileOrigin({x, y}))

            const t1 = this.grid[y]
            if (!t1) debugger

            const tile = t1[x]

            if (!tile) continue

            if (show_grid) {
              overlay.rect(Rectangle.fromOriginAndSize(o, TILE_SIZE),
                {color: mixColor(255, 0, 0), width: 1}
              )
            }

            if (tile.rune) {
              const text = (() => {
                switch(text_mode) {
                  case "neighbour_array":
                    return `${tile.rune.neighbours_exist[0] ? "t" : " "}   ${tile.rune.neighbours_exist[1] ? "t" : " "}\n${tile.rune.neighbours_exist[3] ? "t" : " "}   ${tile.rune.neighbours_exist[2] ? "t" : " "}`
                  case "neighbour_count":
                    return count(tile.rune.neighbours_exist, identity).toString()
                  case "runeid":
                    return tile.rune.id.toString()
                }
              })()

              overlay.text(text, Vector2.add(o, Vector2.scale(0.5, TILE_SIZE)), {
                  width: 12,
                  shadow: true,
                  color: text_mode == "runeid" ? colors[tile.rune.strip_color] : mixColor(255, 255, 255),
                  centered: true
                }
              )

            }
          }
        }
      }

      overlay.render()
    }
  }
}