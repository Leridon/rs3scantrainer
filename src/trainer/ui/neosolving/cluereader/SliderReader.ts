import {ImageDetect, ImgRef} from "@alt1/base";
import {Vector2} from "../../../../lib/math";
import * as oldlib from "../../../../skillbertssolver/cluesolver/oldlib";
import * as lodash from "lodash";

export namespace SlideReader {
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
            signature: oldlib.tiledata(img, TILING_INTERVAL, TILING_INTERVAL,
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
        return parseSliderImage(await ImageDetect.imageDataFromUrl(`alt1anchors/sliders/${theme}.png`),
          0,
          theme)
      }))
    }

    return reference_sliders
  }

  export type Tile = { position: number, signature: number[], theme?: string }
  export type SliderPuzzle = { tiles: Tile[], theme?: string }

  export async function read(image: ImgRef, origin: Vector2): Promise<SliderPuzzle> {
    // Parse the slider image from screen
    const tiles = parseSliderImage(image.toData(origin.x, origin.y, 280, 280), 7)

    let tile_scores: {
      tile: Tile,
      reference_tile: Tile,
      score: number
    }[] = []

    for (let tile of tiles.tiles) {
      for (let slider of await getReferenceSliders()) {
        for (let ref_tile of slider.tiles) {
          tile_scores.push({
            tile: tile,
            reference_tile: ref_tile,
            score: oldlib.comparetiledata(tile.signature, ref_tile.signature)
          })
        }
      }
    }

    const theme_scores: Record<string, number> = {} //get the match rate for every theme
    
    // TODO: This is broken! It should only take the best score for each tile instead of all 625 pairs
    for (let score of tile_scores) {
      if (theme_scores[score.reference_tile.theme] == undefined) {
        theme_scores[score.reference_tile.theme] = 0
      }
      theme_scores[score.reference_tile.theme] += score.score
    }

    console.log(theme_scores)

    const best_theme = lodash.minBy(Object.entries(theme_scores), e => e[1])[0]

    // Filter to only handle matches for the selected theme, sort by score
    const tile_matches = lodash.sortBy(tile_scores.filter(s => s.reference_tile.theme == best_theme), e => e.score)

    const matched_tiles: Tile[] = new Array(25).fill(null)
    const tiles_used: boolean[] = new Array(25).fill(false)

    for (let match of tile_matches) {
      if (matched_tiles[match.tile.position]) continue
      if (tiles_used[match.reference_tile.position]) continue

      matched_tiles[match.tile.position] = match.reference_tile
      tiles_used[match.reference_tile.position] = true
    }

    return {tiles: matched_tiles, theme: best_theme};
  }
}