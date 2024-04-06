import {ImageDetect, ImgRef} from "@alt1/base";
import {Vector2} from "../../../../lib/math";
import * as oldlib from "../../../../skillbertssolver/cluesolver/oldlib";
import * as lodash from "lodash";
import {Sliders} from "../puzzles/Sliders";

export namespace SlideReader {
  import SliderPuzzle = Sliders.SliderPuzzle;
  import Tile = Sliders.Tile;
  export const SLIDER_SIZE = 5

  const TILING_INTERVAL = 12

  /**
   * Parses the tiles of a slider image from a reference image.
   * Tiles are assumed to be 49 by 49 pixels.
   *
   * @param img The image to parse.
   * @param gutter The size of the gap between pixels. For clean reference images this is 0, for captures images from Alt1 this should be 7.
   * @param known_theme The theme of the slider if known
   */
  export function parseSliderImage(img: ImageData, gutter: number = 0, known_theme: string = undefined): SliderPuzzle {
    // Assumes a slider size of 245 x 245!
    const TILE_SIZE = 49

    const tiles: Tile[] = []

    for (let x = 0; x < SLIDER_SIZE; x++) {
      for (let y = 0; y < SLIDER_SIZE; y++) {
        tiles.push(
          {
            theme: known_theme,
            position: y * SLIDER_SIZE + x,
            signature: oldlib.computeImageFingerprint(img, TILING_INTERVAL, TILING_INTERVAL,
              x * (TILE_SIZE + gutter),
              y * (TILE_SIZE + gutter),
              TILE_SIZE, TILE_SIZE)
          }
        )
      }
    }

    return {tiles, theme: known_theme}
  }

  let reference_sliders: SliderPuzzle[] = undefined

  export async function getReferenceSliders(): Promise<SliderPuzzle[]> {

    if (reference_sliders == undefined) {
      const themes = ["archer", "bandos", "bridge", "castle", "cit", "corp", "dragon", "edicts", "elderdrag",
        "elf", "float", "frost", "greg", "helwyr", "jas", "mage", "maple", "menn", "nomad", "rax", "seal", "troll", "tuska", "twins", "v", "vyre", "wolf"
      ]
      reference_sliders = await Promise.all(themes.map(async theme => {
        return parseSliderImage(await ImageDetect.imageDataFromUrl(getThemeImageUrl(theme)),
          0,
          theme)
      }))
    }

    return reference_sliders
  }

  export function getThemeImageUrl(theme: string): string {
    return `alt1anchors/sliders/${theme}.png`
  }

  export type ReadResult = {
    uncertainy: number,
    puzzle: SliderPuzzle
  }

  export async function read(image: ImgRef, origin: Vector2, known_theme: string = undefined): Promise<ReadResult> {
    // Parse the slider image from screen
    const tiles = parseSliderImage(image.toData(origin.x, origin.y, 280, 280), 7)

    let tile_scores: {
      tile: Tile,
      reference_tile: Tile,
      score: number
    }[] = []

    for (let tile of tiles.tiles) {
      for (let slider of await getReferenceSliders()) {
        if (known_theme && slider.theme != known_theme) continue

        for (let ref_tile of slider.tiles) {
          tile_scores.push({
            tile: tile,
            reference_tile: ref_tile,
            score: oldlib.comparetiledata(tile.signature, ref_tile.signature)
          })
        }
      }
    }

    const grouped = lodash.groupBy(tile_scores, e => e.reference_tile.theme)

    const matches = Object.entries(grouped).map<ReadResult>(([theme, tile_matches]) => {
      const sorted = lodash.sortBy(tile_matches, e => e.score)

      const matched_tiles: (typeof tile_scores)[number][] = new Array(25).fill(null)
      const tiles_used: boolean[] = new Array(25).fill(false)

      for (let match of sorted) {
        if (matched_tiles[match.tile.position]) continue
        if (tiles_used[match.reference_tile.position]) continue

        matched_tiles[match.tile.position] = match
        tiles_used[match.reference_tile.position] = true
      }

      return {
        puzzle: {tiles: matched_tiles.map(m => m.reference_tile), theme: theme},
        uncertainy: lodash.sumBy(matched_tiles, m => m.score)
      }
    })

    return lodash.minBy(matches, m => m.uncertainy)
  }
}