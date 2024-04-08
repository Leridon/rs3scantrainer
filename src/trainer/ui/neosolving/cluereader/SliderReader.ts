import {ImageDetect, ImgRef} from "@alt1/base";
import {Vector2} from "../../../../lib/math";
import * as lodash from "lodash";
import {Sliders} from "../puzzles/Sliders";
import {ImageFingerprint} from "../../../../lib/util/ImageFingerprint";

export namespace SlideReader {
  const DEBUG_SLIDE_READER = false

  import SliderPuzzle = Sliders.SliderPuzzle;
  import Tile = Sliders.Tile;

  export const SLIDER_SIZE = 5

  const KERNEL_INTERVAL = 12

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
            signature: ImageFingerprint.get(img, {x: x * (TILE_SIZE + gutter), y: y * (TILE_SIZE + gutter)},
              {x: TILE_SIZE, y: TILE_SIZE},
              {x: KERNEL_INTERVAL, y: KERNEL_INTERVAL}
            )
          }
        )
      }
    }

    return {tiles, theme: known_theme}
  }

  let reference_sliders: SliderPuzzle[] = undefined

  export async function getReferenceSliders(): Promise<SliderPuzzle[]> {

    if (reference_sliders == undefined) {
      const themes = ["adventurer", "araxxor", "archers", "black_dragon", "bridge", "castle", "clan_citadel", "corporeal_beast", "drakan_bloodveld",
        "elves", "general_graardor", "gregorovic", "helwyr", "ice_strykewyrm", "menaphos_pharaoh", "nomad", "nymora", "sword_of_edicts", "tree", "troll", "tuska", "v", "vanstrom_klause", "werewolf", "wizard", "wyvern"
      ]

      const unused_themes = ["seal"]

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

  export type ReadResult = SliderPuzzle

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
            score: ImageFingerprint.delta(tile.signature, ref_tile.signature)
          })
        }
      }
    }

    const grouped = lodash.groupBy(tile_scores, e => e.reference_tile.theme)

    const matches = Object.entries(grouped).map<ReadResult>(([theme, tile_matches]) => {
      const sorted = lodash.sortBy(tile_matches, e => -e.score)

      const matched_tiles: (typeof tile_scores)[number][] = new Array(25).fill(null)
      const tiles_used: boolean[] = new Array(25).fill(false)

      for (let match of sorted) {
        if (matched_tiles[match.tile.position]) continue
        if (tiles_used[match.reference_tile.position]) continue

        if (DEBUG_SLIDE_READER) console.log(`Matching ${match.tile.position} to reference tile #${match.reference_tile.position}`)

        matched_tiles[match.tile.position] = match
        tiles_used[match.reference_tile.position] = true
      }

      const debug_for = [17, 20, 21]

      if (DEBUG_SLIDE_READER) {

        for (let ref_tile of debug_for) {
          console.log(`Similarity to reference tile ${ref_tile}`)

          const tiles = lodash.sortBy(tile_matches.filter(m => m.reference_tile.position == ref_tile), e => e.tile.position)

          for (let y = 0; y < 5; y++) {
            console.log(tiles.slice(y * 5, (y + 1) * 5).map(t => t.score.toFixed(2)).join(", "));
          }

          console.log()
        }

        console.log("Chosen similarity")

        for (let y = 0; y < 5; y++) {
          console.log(matched_tiles.slice(y * 5, (y + 1) * 5).map(t => t.score.toFixed(2)).join(", "));
        }
      }

      return {
        tiles: matched_tiles.map(m => m.reference_tile),
        theme: theme,
        match_score: lodash.sumBy(matched_tiles, m => m.score) / matched_tiles.length
      }
    })

    return lodash.maxBy(matches, m => m.match_score)
  }
}