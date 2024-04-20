import {ImageDetect, ImgRef} from "@alt1/base";
import {Vector2} from "../../../../lib/math";
import * as lodash from "lodash";
import {Sliders} from "../puzzles/Sliders";
import {ImageFingerprint} from "../../../../lib/util/ImageFingerprint";
import {deps} from "../../../dependencies";

export namespace SlideReader {
  export const DETECTION_THRESHOLD_SCORE = 0.9

  const DEBUG_SLIDE_READER = false

  import SliderPuzzle = Sliders.SliderPuzzle;
  import Tile = Sliders.Tile;

  export const SLIDER_SIZE = 5

  const KERNEL_INTERVAL = 7

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

    for (let y = 0; y < SLIDER_SIZE; y++) {
      for (let x = 0; x < SLIDER_SIZE; x++) {
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

  let reference_sliders: Record<string, SliderPuzzle> = undefined

  export async function getReferenceSliders(): Promise<Record<string, SliderPuzzle>> {

    if (reference_sliders == undefined) {
      const themes = ["adventurer", "araxxor", "archers", "black_dragon", "bridge", "castle", "clan_citadel", "corporeal_beast", "drakan_bloodveld",
        "elves", "general_graardor", "gregorovic", "helwyr", "ice_strykewyrm", "menaphos_pharaoh", "nomad", "nymora", "sword_of_edicts", "tree", "troll", "tuska", "v", "vanstrom_klause", "werewolf", "wizard", "wyvern"
      ]

      const unused_themes = ["seal"]

      reference_sliders = Object.fromEntries(await Promise.all(themes.map(async theme => {
        return [theme, parseSliderImage(await ImageDetect.imageDataFromUrl(getThemeImageUrl(theme)),
          0,
          theme)]
      })))
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
      const compare_to = known_theme
        ? [(await getReferenceSliders())[known_theme]]
        : Object.values(await getReferenceSliders())

      for (let slider of compare_to) {
        for (let ref_tile of slider.tiles) {
          tile_scores.push({
            tile: tile,
            reference_tile: ref_tile,
            score: ImageFingerprint.similarity(tile.signature, ref_tile.signature)
          })
        }
      }
    }

    const grouped = lodash.groupBy(tile_scores, e => e.reference_tile.theme)

    const matches: {
      theme: string,
      all_match_pairs: (typeof tile_scores)[number][],
      preliminary_best_matching: {
        score: number,
        match: (typeof tile_scores)[number][]
      }
    }[] = await Promise.all(Object.entries(grouped).map(async ([theme, tile_matches]) => {
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

      if (DEBUG_SLIDE_READER) {
        const debug_for = []

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
        theme: theme,
        all_match_pairs: tile_matches,
        preliminary_best_matching: {
          score: lodash.sumBy(matched_tiles, e => e.score) / matched_tiles.length,
          match: matched_tiles
        }
      }
    }))

    const greedy_best = lodash.maxBy(matches, m => m.preliminary_best_matching.score)

    if (DEBUG_SLIDE_READER) {
      const perfect_pairs = greedy_best.all_match_pairs.filter(e => e.score == 1)
      console.log(`Perfect score pairs ${perfect_pairs.length}`)

      perfect_pairs.forEach(e => {
        console.log((`Perfect Match: Tile ${e.tile.position} with ${e.reference_tile.position}`))
      })
    }

    const DO_BACKTRACKING_IMPROVEMENT = deps().app.settings.settings.solving.puzzles.sliders.improve_slider_matches_backtracking && greedy_best.preliminary_best_matching.score > DETECTION_THRESHOLD_SCORE

    if (DO_BACKTRACKING_IMPROVEMENT) {
      let best: (typeof tile_scores)[number][] = greedy_best.preliminary_best_matching.match
      let best_score = greedy_best.preliminary_best_matching.score * 25
      const working_tiles = new Array(25).fill(null)

      const max_improvements = new Array(25).fill(0).map((_, i) => {
        return Math.max(...greedy_best.all_match_pairs.slice(i * 25, (i + 1) * 25).map(e => e.score))
      })

      for (let i = 23; i >= 0; i--) {
        max_improvements[i] += max_improvements[i + 1]
      }

      const better_match_max_exist = max_improvements[0] > best_score

      const reference_used = new Array(25).fill(false)

      function backtracking(i: number, similarity_so_far: number) {
        if (i >= 25) {
          if (similarity_so_far > best_score) {
            best = [...working_tiles]
            best_score = similarity_so_far
          }

          return;
        }

        for (let index = 0; index < 25; index++) {
          const match = greedy_best.all_match_pairs[i * 25 + index]

          if (reference_used[match.reference_tile.position] || match.score < DETECTION_THRESHOLD_SCORE || (similarity_so_far + match.score) + max_improvements[i + 1] <= best_score) {
            continue
          }

          tiles[i] = match
          reference_used[match.reference_tile.position] = true
          backtracking(i + 1, similarity_so_far + match.score)
          reference_used[match.reference_tile.position] = false
        }
      }

      if (better_match_max_exist) backtracking(0, 0)

      return {
        tiles: best.map(m => m.reference_tile),
        theme: greedy_best.theme,
        match_score: best_score / 25
      }
    } else {
      return {
        tiles: greedy_best.preliminary_best_matching?.match.map(e => e.reference_tile),
        theme: greedy_best.theme,
        match_score: greedy_best.preliminary_best_matching.score
      }
    }
  }
}