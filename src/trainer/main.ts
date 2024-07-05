import * as lodash from "lodash";
import {Sliders} from "../lib/cluetheory/Sliders";
import {NisModal} from "../lib/ui/NisModal";
import Properties from "./ui/widgets/Properties";
import {C} from "../lib/ui/constructors";
import LightButton from "./ui/widgets/LightButton";
import Widget from "../lib/ui/Widget";
import SliderState = Sliders.SliderState;

import hgrid = C.hgrid;
import spacer = C.spacer;
import hbox = C.hbox;
import {crowdsourcedSliderData, SliderBenchmarkModal, SliderDataEntry} from "../devtools/SliderBenchmarking";

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
      counts: [SliderState, SliderDataEntry[]][]
    }


    type DataSet = {
      states: SliderDataEntry[],
      name: string
    }

    const ANALYSE_UNIQUENSS = false

    function analyse(dataset: DataSet): SliderAnalysis {
      const data = new Array(25).fill(0).map(() => new Array(25).fill(0))
      const counts: [SliderState, SliderDataEntry[]][] = []

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


      const INVERTED = false

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
                .tooltip(
                  (INVERTED
                    ? analysis.tile_frequency[is_tile][should_tile]
                    : analysis.tile_frequency[should_tile][is_tile]).toString() + " samples"
                )
                .appendTo(inner_row)
            }
          }
        }
      }

      return container
    }

    const crowdsourced_data: SliderDataEntry[] = await crowdsourcedSliderData.get()

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

  new SliderBenchmarkModal().show()

  /*await (new class extends NisModal {
    private region: RegionChainEditor

    render() {
      super.render()

      this.region = new RegionChainEditor()
        .setValue({
          multitile: true,
          regions: [
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ]
        })
        .appendTo(this.body)

    }
  }).show()*/

  // await clue_trainer_test_set.run()

  //new SliderAnalysisModal().show()

  //new ExportStringModal(CompassReader.calibration_tables.off.getSampleTable().map(radiansToDegrees).join("\n")).show()

  /*
    const sample_size = 200
    const start = 1231

    const dataset: SliderState[] = (await crowdsourcedSliderData()).slice(start, start + sample_size).map(s => s.state)

    const result: {
      state: SliderState,
      multitile_solution: MoveList,
      smallstep_solution: MoveList
    }[] = []

    for (let i = 0; i < dataset.length; i++) {
      const state = dataset[i]

      console.log(`Running ${i + 1}/${dataset.length}`)

      result.push({
        state: state,
        multitile_solution: await skillbertRandom(state).setCombineStraights(true).withTimeout(3000).run(),
        smallstep_solution: await skillbertRandom(state).setCombineStraights(false).withTimeout(3000).run(),
      })
    }

    await new ExportStringModal(result.map(r => {
      return r.state.join("|") + "," + r.smallstep_solution.length + "," + r.multitile_solution.length
    }).join("\n")).show()
    */
  //await new CompassReader.CalibrationTool().show()

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