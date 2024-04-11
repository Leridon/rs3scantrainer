import * as lodash from "lodash";
import {Sliders} from "./ui/neosolving/puzzles/Sliders";
import {NisModal} from "../lib/ui/NisModal";
import Properties from "./ui/widgets/Properties";
import {C} from "../lib/ui/constructors";
import {AStarSlideSolver} from "./ui/neosolving/puzzles/AStarSlideSolver";
import LightButton from "./ui/widgets/LightButton";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import hgrid = C.hgrid;
import span = C.span;
import skillbertRandom = Sliders.SlideSolver.skillbertRandom;
import isSolveable = Sliders.SliderState.isSolveable;

export async function makeshift_main(): Promise<void> {
  console.log(isSolveable([
    0, 1, 2, 3, 4,
    5, 6, 7, 8, 9,
    10, 11, 12, 13, 14,
    15, 16, 17, 18, 19,
    20, 21, 23, 22, 24
  ]))
  console.log(isSolveable(SliderState.SOLVED))


  await (new class extends NisModal {

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
        construct: (state: SliderState) => Sliders.SlideSolver
      }

      type Result = {
        candidate: Candidate,
        tests: {
          start: SliderState,
          moves: MoveList | null
        }[],
        success_count: number
        average: number
      }

      const candidates: Candidate[] = [
        {name: "Skillbert Random", construct: s => skillbertRandom(s)},
        {name: "IDA* Default", construct: s => new AStarSlideSolver(s)},
      ]

      const test_set: SliderState[] = []

      const TIMEOUT = 20000
      const TEST_SIZE = 5

      while (test_set.length < TEST_SIZE) {
        const shuffled = lodash.shuffle(SliderState.SOLVED)

        if (SliderState.isSolveable(shuffled)) test_set.push(shuffled)
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

          let best = await solver.solve(TIMEOUT)

          if (best) {
            let sanity = test

            for (let m of best) {
              sanity = SliderState.withMove(sanity, m)
            }

            if (!SliderState.equals(sanity, SliderState.SOLVED)) {
              best = null
              debugger
            }
          }

          testsResult.push({
            start: test,
            moves: best
          })
        }

        const success = testsResult.filter(e => !!e.moves)


        results.push({
          candidate: candidate,
          tests: testsResult,
          success_count: success.length,
          average: success.length >= 1 ? lodash.sumBy(success, e => e.moves.length) / success.length : -1
        })
      }

      const layout = this.layout.empty()

      layout.header("Results")
      layout.paragraph(`On a total of ${test_set.length} configurations with ${(TIMEOUT / 1000).toFixed(1)}s per configuration.`)

      layout.named("", hgrid(span("Solved"), span("Average"), span("Performance")))

      const ref_average = results[0].average

      for (let row of results) {
        layout.named(row.candidate.name, hgrid(
          c().text(row.success_count),
          c().text(row.average.toFixed(1)),
          c().text(`${(100 * (row.average / ref_average - 1)).toFixed(2)}%`),
        ))
      }

      this.run_button.setEnabled(false)
    }

  })
    .show()

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