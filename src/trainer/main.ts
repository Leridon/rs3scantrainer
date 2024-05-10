import * as lodash from "lodash";
import {Sliders} from "./ui/neosolving/puzzles/Sliders";
import {NisModal} from "../lib/ui/NisModal";
import Properties from "./ui/widgets/Properties";
import {C} from "../lib/ui/constructors";
import LightButton from "./ui/widgets/LightButton";
import Widget from "../lib/ui/Widget";
import ExportStringModal from "./ui/widgets/modals/ExportStringModal";
import {LocParsingTableData} from "./ui/devutilitylayer/cachetools/ParsingTable";
import {util} from "../lib/util/util";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import hgrid = C.hgrid;
import span = C.span;
import skillbertRandom = Sliders.SlideSolver.skillbertRandom;
import spacer = C.spacer;
import hbox = C.hbox;
import {test_slide_reader} from "../test/test_slide_reader";
import {timeSync} from "../lib/gamemap/GameLayer";
import {Towers} from "../lib/cluetheory/Towers";
import towers = Towers.towers;
import {CelticKnots} from "../lib/cluetheory/CelticKnots";
import {clue_trainer_test_set} from "../test/tests";
import {CompassReader} from "./ui/neosolving/cluereader/CompassReader";
import {radiansToDegrees} from "../lib/math";

type DataEntry = {
  id: number,
  state: SliderState,
  timestamp: number,
  theme: string
}

async function crowdsourcedSliderData(): Promise<DataEntry[]> {
  return await (await fetch("data/sliders.json")).json()
}

class SliderBenchmarkModal extends NisModal {
  layout: Properties
  run_button: LightButton

  constructor() {
    super();

    this.title.set("Slider Solving Benchmark")
  }

  render() {
    super.render()

    this.layout = new Properties().appendTo(this.body)

    this.run_button = new LightButton("Run").onClick(() => {
      this.run()
    }).appendTo(this.body)
  }

  private async run() {

    this.run_button.setEnabled(false)

    type Candidate = {
      name: string,
      construct: (state: SliderState) => Sliders.SlideSolver,
      continuation_solving?: {
        lookahead: number,
        assumed_moves_per_second: number
      } | null
    }

    type Result = {
      candidate: Candidate,
      tests: {
        start: SliderState,
        moves: MoveList | null,
        moves_after_continuation: MoveList | null
      }[],
      success_count: number
      average: number,
      average_continuation: number
    }

    const candidates: Candidate[] = [
      /* {name: "Skillbert Random", construct: s => skillbertRandom(s)},
       {name: "Skillbert Random", construct: s => skillbertRandom(s), continuation_solving: {lookahead: 20, assumed_moves_per_second: 4}},
       {name: "Skillbert Random", construct: s => skillbertRandom(s), continuation_solving: {lookahead: 20, assumed_moves_per_second: 5}},
       {name: "Skillbert Random", construct: s => skillbertRandom(s), continuation_solving: {lookahead: 20, assumed_moves_per_second: 6}},
 */
      //{name: "IDA* Default", construct: s => new AStarSlideSolver(s)},
    ]

    for (let mps = 4; mps <= 6; mps++) {
      for (let la = 10; la <= 20; la += 2) {
        candidates.push(
          {name: "Skillbert Random", construct: s => skillbertRandom(s), continuation_solving: {lookahead: la, assumed_moves_per_second: mps}},
        )
      }
    }

    const test_set: SliderState[] = []

    const TIMEOUT = 2000
    const TEST_SIZE = 20

    const data = await crowdsourcedSliderData()

    while (test_set.length < TEST_SIZE) {
      const shuffled = data[lodash.random(data.length - 1)]

      if (SliderState.isSolveable(shuffled.state)) test_set.push(shuffled.state)
    }

    const results: Result[] = []

    for (let candidate_i = 0; candidate_i < candidates.length; candidate_i++) {
      const candidate = candidates[candidate_i]

      const testsResult: Result["tests"] = []

      for (let test_i = 0; test_i < test_set.length; test_i++) {
        this.layout.empty().row(`Running Candidate ${candidate_i + 1}/${candidates.length}, test ${test_i + 1}/${test_set.length}`)

        const test = test_set[test_i]
        const solver = candidate.construct(test)
          .setCombineStraights(true)

        let best = await solver.withTimeout(TIMEOUT).run()

        const best_before_continuation = [...best]

        if (candidate.continuation_solving && best) {
          const TIME_PER_STEP = (candidate.continuation_solving.lookahead / candidate.continuation_solving.assumed_moves_per_second) * 1000

          for (let i = candidate.continuation_solving.lookahead; i < best.length; i += candidate.continuation_solving.lookahead) {
            const better = await candidate.construct(SliderState.withMove(test, ...best.slice(0, i)))
              .withTimeout(TIME_PER_STEP)
              .withInterrupt(30, 10)
              .setCombineStraights(true)
              .registerSolution(best.slice(i))
              .run()

            best.splice(i, best.length, ...better)
          }
        }

        if (best) {
          let sanity = SliderState.withMove(test, ...best)

          if (!SliderState.equals(sanity, SliderState.SOLVED)) {
            best = null
            debugger
          }
        }

        testsResult.push({
          start: test,
          moves: best_before_continuation,
          moves_after_continuation: best
        })
      }

      const success = testsResult.filter(e => !!e.moves)

      results.push({
        candidate: candidate,
        tests: testsResult,
        success_count: success.length,
        average: success.length >= 1 ? lodash.sumBy(success, e => e.moves.length) / success.length : -1,
        average_continuation: success.length >= 1 ? lodash.sumBy(success, e => e.moves_after_continuation.length) / success.length : -1
      })
    }

    const layout = this.layout.empty()

    layout.header("Results")
    layout.paragraph(`On a total of ${test_set.length} configurations with ${(TIMEOUT / 1000).toFixed(1)}s per configuration.`)

    layout.named("", hgrid(span("Solved"), span("Average"), span("Performance"), span("Cont"), span("Average cont."), span("Performance cont.")))

    const ref_average = results[0].average

    for (let row of results) {

      layout.named(row.candidate.name, hgrid(
        c().text(row.success_count),
        c().text(row.average.toFixed(1)),
        c().text(`${(100 * (row.average / ref_average - 1)).toFixed(2)}%`),

        row.candidate.continuation_solving ? c().text(`${row.candidate.continuation_solving.lookahead}LA@${row.candidate.continuation_solving.assumed_moves_per_second}mps`) : c(),
        row.candidate.continuation_solving ? c().text(row.average_continuation.toFixed(1)) : c(),
        row.candidate.continuation_solving ? c().text(`${(100 * (row.average_continuation / row.average - 1)).toFixed(2)}%`) : c(),
      ))
    }

    this.run_button.setEnabled(false)
  }

}

class SliderAnalysisModal extends NisModal {
  layout: Properties

  run_button: LightButton

  constructor() {
    super({size: "fullscreen"});

    this.title.set("Slider Analysis Modal")
  }

  render() {
    super.render();

    this.layout = new Properties().appendTo(this.body)

    this.run_button = new LightButton("Run").onClick(() => {
      this.run()
    }).appendTo(this.body)
  }

  async run() {
    this.layout.empty()

    type SliderAnalysis = {
      original: DataSet
      tile_frequency: number[][],
      counts: [SliderState, DataEntry[]][]
    }


    type DataSet = {
      states: DataEntry[],
      name: string
    }

    const ANALYSE_UNIQUENSS = false

    function analyse(dataset: DataSet): SliderAnalysis {
      const data = new Array(25).fill(0).map(() => new Array(25).fill(0))
      const counts: [SliderState, DataEntry[]][] = []

      for (let state of dataset.states) {
        if (!state) debugger

        state.state.forEach((tile_id, position_id) => {
          data[tile_id][position_id]++ // First index: The tile id, i.e., where the tile should be. Second index: Where the tile currently is
        })

        if (ANALYSE_UNIQUENSS) {
          const c_tuple = counts.find(([key, value]) => SliderState.equals(key, state.state))

          if (c_tuple) c_tuple[1].push(state)
          else counts.push([state.state, [state]])
        }
      }

      return {
        original: dataset,
        tile_frequency: data,
        counts: ANALYSE_UNIQUENSS ? counts : undefined
      }
    }

    function heatMapColorforValue(value: number) {
      const r_value = lodash.clamp((1 - value) * 510, 0, 255)
      const g_value = lodash.clamp(value * 510, 0, 255)

      return `rgb(${r_value.toFixed(0)}, ${g_value.toFixed(0)}, 0)`

      var h = (1.0 - value) * 240
      return "hsl(" + h + ", 100%, 50%)";
    }

    function render(layout: Properties, analysis: SliderAnalysis): Widget {
      const container = c()


      const INVERTED = true

      layout.header(analysis.original.name)
      if (analysis.counts) {
        layout.paragraph(`Analysis based on ${analysis.original.states.length} initial slider states containing ${analysis.counts?.length} unique states.`)
      } else {
        layout.paragraph(`Analysis based on ${analysis.original.states.length} initial slider states.`)
      }

      layout.paragraph(`The outer 5 by 5 grid refers to where the respective tile belongs. The inner 5 by 5 grid shows where this tile is most likely to spawn.`)

      if (analysis.counts && analysis.counts.length != analysis.original.states.length) {
        for (let [state, duplicates] of analysis.counts.filter(c => c[1].length > 1)) {
          layout.header(state.toString(), "left", 1)

          layout.row(duplicates.map((entry, i) => {
            return `${new Date(entry.timestamp).toString()} (${entry.theme}, ${entry.id})`
          }).join(", "))
        }
      }

      layout.row(hbox(spacer(), container, spacer()))

      for (let should_y = 0; should_y < 5; should_y++) {

        const outer_row = hgrid().appendTo(container)

        for (let should_x = 0; should_x < 5; should_x++) {
          const should_tile = should_y * 5 + should_x

          const spawn_distribution = INVERTED
            ? analysis.tile_frequency.map(t => t[should_tile])
            : analysis.tile_frequency[should_tile]

          const outer_tile = c()
            .css2({
              "border": "1px solid white",
              "padding": "5px",
              "margin": "10px"
            })
            .appendTo(outer_row)

          const frequencies = spawn_distribution.map(count => count / analysis.original.states.length)

          const max_frequency = Math.max(...frequencies, 1 / 12)

          for (let is_y = 0; is_y < 5; is_y++) {
            const inner_row = hgrid().appendTo(outer_tile)

            for (let is_x = 0; is_x < 5; is_x++) {

              const is_tile = is_y * 5 + is_x

              const frequency = frequencies[is_tile]

              function scale(f: number): number {
                if (f <= (1 / 24)) return 0.5 * f / (1 / 24)
                else return 0.5 + 0.5 * (f - (1 / 24)) / (max_frequency - (1 / 24))
              }

              const tile = c()
                .css2({
                  "margin": "2px",
                  "border": is_tile == should_tile ? "2px solid blue" : "2px solid white",
                  "border-radius": "3px",
                  "max-width": "40px",
                  "max-height": "40px",
                  "min-width": "40px",
                  "min-height": "40px",
                  "line-height": "40px",
                  "text-align": "center",
                  "background-color": frequency == 0 ? "none" : heatMapColorforValue(scale(frequency)),
                  "text-shadow": "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  "font-weight": "bold",
                  "mix-blend-mode": "difference"
                })
                .text(`${(100 * frequency).toFixed(1)}%`)
                .appendTo(inner_row)
            }
          }
        }
      }

      return container
    }

    const crowdsourced_data: DataEntry[] = await (await fetch("data/sliders.json")).json()

    const datasets: DataSet[] = [
      {
        name: "Truly shuffled", states: new Array(10000).fill(0).map((_, i) => ({
          state: SliderState.createRandom(),
          id: i,
          theme: null,
          timestamp: Date.now()
        }))
      },
      {name: "Crowdsourced", states: crowdsourced_data},
    ]

    for (let dataset of datasets) {
      render(this.layout, analyse(dataset))
    }
  }
}

export async function makeshift_main(): Promise<void> {


  //new ExportStringModal(CompassReader.calibration_tables.off.getSampleTable().map(radiansToDegrees).join("\n")).show()

  //clue_trainer_test_set.run()

  /*
   const shape: CelticKnots.PuzzleShape = {
     snake_lengths: [16, 16, 16],
     locks: [
       {first: {snake: 0, tile: 5}, second: {snake: 1, tile: 3}},
       {first: {snake: 0, tile: 6}, second: {snake: 2, tile: 2}},
       {first: {snake: 1, tile: 5}, second: {snake: 2, tile: 3}},

       {first: {snake: 0, tile: 11}, second: {snake: 1, tile: 13}},
       {first: {snake: 0, tile: 10}, second: {snake: 2, tile: 14}},
       {first: {snake: 1, tile: 11}, second: {snake: 2, tile: 13}},
     ]
   }

   const puzzles = new Array(10000).fill(0).map(() => CelticKnots.PuzzleState.shuffle(CelticKnots.PuzzleState.generashape)))

   /*const solutions = timeSync("Solving", () =>
     puzzles.map(p => CelticKnots.solve(p))
   )

   console.log(solutions.every(s => CelticKnots.PuzzleState.isSolved(s.end_state)))*/

  /*
  console.log(Towers.StreetLabel.candidateMap())

  Towers.towers.forEach(left => towers.forEach(right => {
    console.log(`${left}:${right} = ${Towers.StreetLabel.getCandidates([left, right]).length}`)
  }))

  const result = timeSync("solve", () => {
    return Towers.Puzzle.solve({
      rows: [[3, 2], [2, 3], [2, 1], [1, 3], [3, 2]],
      columns: [[3, 2], [2, 2], [1, 4], [5, 1], [2, 3]],
    })
  })

  console.log(result.rows.map(row => row.join("  ")).join("\n"));

   */


  // await test_slide_reader()

  //await new SliderAnalysisModal().show()
  //await new SliderBenchmarkModal().show()

  /*
  await (new class extends NisModal {
    render() {
      super.render()

      new LightButton("Do")
        .onClick(async () => {
          const res = await SlideReader.read(new ImgRefData(await ImageDetect.imageDataFromUrl("assets/test.png")), {x: 0, y: 0}, "bridge")

          const tiles = SliderPuzzle.getState(res)

          for (let y = 0; y < 5; y++) {
            console.log(tiles.slice(y * 5, (y + 1) * 5).join(", "));
          }

          console.log(res)
        }).appendTo(this.body)
    }
  }).show()*/


  /* let output = ""

   for (let step of clue_data.all) {
       if (step.solution?.type == "search") {
           if ("x" in step.solution.spot) {
               step.solution.spot = TileRectangle.fromTile(step.solution.spot as unknown as TileCoordinates)
           }
       }
   }

   new ExportStringModal(JSON.stringify(clue_data.all, (key, value) => {
       if ((key == "range" || key == "area") && value["topleft"]) return TileArea.fromRect(value)

       return value
   }, 4)).show()*/


  /*
      let cmp = Order.chain(
          Order.comap(Order.natural_order, (c: Clues.Step) => [null, "easy", "medium", "hard", "elite", "master"].indexOf(c.tier)),
          Order.comap(Order.natural_order, (c: Clues.Step) => c.id),
      )

      for (let type of ClueType.all) {
          let obj = clues.filter(c => c.type == type).sort(cmp)

          const allKeys = ["id", "type", "tier"]
          JSON.stringify(obj, (key, value) => {
              allKeys.push(key)
              return value
          });

          await ExportStringModal.do(JSON.stringify(obj, allKeys, 4))
      }*/


  //console.log(`Length: ${c["map"].length}`)

  // return JSON.stringify(await Promise.all(old_methods.map(async m => await translate(m))), null, 4)
}