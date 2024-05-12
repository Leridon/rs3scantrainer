import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {Vector2} from "../../../../lib/math";
import {CapturedModal} from "./capture/CapturedModal";
import {Towers} from "../../../../lib/cluetheory/Towers";
import * as lodash from "lodash";
import * as OCR from "@alt1/ocr";

export namespace TowersReader {

  const font: OCR.FontDefinition = require("@alt1/ocr/fonts/aa_10px_mono.js");
  const font_with_just_digits = {...font, chars: font.chars.filter(c => !isNaN(+c.chr))};

  export const TILE_SIZE = {x: 42, y: 42}
  const SPACE_BETWEEN_TILES = {x: 2, y: 2}
  const TILE_OFFSET = Vector2.add(TILE_SIZE, SPACE_BETWEEN_TILES)
  const SIZE = 5

  const MODAL_BODY_TO_TL_TILE_OFFSET = {x: 41, y: 38}

  export class TowersReader {

    private debug_overlay: OverlayGeometry

    tile_area: CapturedImage

    private puzzle_computed = false
    private puzzle: Towers.PuzzleState = null

    public isBroken = false
    public brokenReason: string = ""

    private _hint_cache: Towers.Hints2 = {
      top: new Array<Towers.Tower>(5),
      bottom: new Array<Towers.Tower>(5),
      left: new Array<Towers.Tower>(5),
      right: new Array<Towers.Tower>(5),
    }
    private _tile_cache: Towers.Tower[][] = new Array(5).fill(null).map(() => new Array<Towers.Tower>(5).fill(null))

    private _hints: Towers.Hints = null

    constructor(public modal: CapturedModal) {

      this.tile_area = modal.body.getSubSection(
        {
          origin: MODAL_BODY_TO_TL_TILE_OFFSET,
          size: Vector2.add(Vector2.scale(SIZE, TILE_SIZE), Vector2.scale(SIZE - 1, SPACE_BETWEEN_TILES))
        },
      )

      this._tile_cache = new Array(SIZE).fill(null).map(() => new Array(SIZE).fill(null))
    }

    public tileOrigin(tile: Vector2, on_screen: boolean = false): Vector2 {
      if (on_screen) {
        return Vector2.add(Vector2.mul(TILE_OFFSET, tile), this.tile_area.screenRectangle().origin)
      } else {
        return Vector2.add(Vector2.mul(TILE_OFFSET, tile))
      }
    }

    private readCharacter(pos: Vector2, in_grid: boolean = true): number | null {
      const COLOR: OCR.ColortTriplet[] = in_grid
        ? [[255, 255, 255]]
        : [[255, 205, 10], [102, 102, 102]];

      const wiggle_candidates = [-3, -2, -1, -4, 0]

      for (let col of COLOR) {
        for (const wiggle_x of wiggle_candidates) {
          const res = OCR.readChar(this.modal.body.getData(),
            font_with_just_digits,
            col,
            pos.x + wiggle_x,
            pos.y,
            false,
            true);

          if (res) {
            console.log(`${wiggle_x} | 0`)
            return Number(res.chr);
          }
        }
      }

      return null
    }

    public readHints(): Towers.Hints2 {
      const start = {
        top: {x: 60, y: 25},
        bottom: {x: 60, y: 275},
        left: {x: 23, y: 62},
        right: {x: 274, y: 62},
      }

      for (let i = 0; i < SIZE; i++) {
        this._hint_cache.top[i] = this.readCharacter(Vector2.add(start.top, Vector2.mul({x: i, y: 0}, TILE_OFFSET)), false)
        this._hint_cache.bottom[i] = this.readCharacter(Vector2.add(start.bottom, Vector2.mul({x: i, y: 0}, TILE_OFFSET)), false)
        this._hint_cache.left[i] = this.readCharacter(Vector2.add(start.left, Vector2.mul({x: 0, y: i}, TILE_OFFSET)), false)
        this._hint_cache.right[i] = this.readCharacter(Vector2.add(start.right, Vector2.mul({x: 0, y: i}, TILE_OFFSET)), false)
      }

      return this._hint_cache
    }

    getHints(): Towers.Hints {

      if (!this._hints) {
        this.readHints()

        this._hints = {
          columns: lodash.zip(
            this._hint_cache.top,
            this._hint_cache.bottom,
          ).map(([top, bottom]) => [top, bottom] as Towers.StreetLabel) as Towers.Hints["columns"],
          rows: lodash.zip(
            this._hint_cache.left,
            this._hint_cache.right,
          ).map(([top, bottom]) => [top, bottom] as Towers.StreetLabel) as Towers.Hints["rows"]
        }
      }

      return this._hints
    }

    async getState(): Promise<"okay" | "likelyconcealed" | "likelyclosed"> {
      return "okay"
    }

    async getPuzzle(): Promise<Towers.PuzzleState> {
      if (!this.puzzle_computed) {

        const hints = this.getHints()

      }

      return this.puzzle
    }

    showDebugOverlay() {
      if (!this.debug_overlay) {
        this.debug_overlay = new OverlayGeometry()
      }

      this.debug_overlay.clear()

      this.debug_overlay.render()
    }
  }
}