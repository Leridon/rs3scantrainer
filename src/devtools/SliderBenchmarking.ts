import {NisModal} from "../lib/ui/NisModal";
import Properties from "../trainer/ui/widgets/Properties";
import LightButton from "../trainer/ui/widgets/LightButton";
import NumberSlider from "../lib/ui/controls/NumberSlider";
import {Sliders} from "../lib/cluetheory/Sliders";
import {RandomSolver} from "../lib/cluetheory/sliders/RandomSolver";
import {PDBSolver} from "../lib/cluetheory/sliders/PDBSolver";
import {RegionDistanceTable} from "../lib/cluetheory/sliders/RegionDistanceTable";
import {PDBManager} from "../trainer/ui/neosolving/subbehaviours/SliderSolving";
import {OptimizedSliderState} from "../lib/cluetheory/sliders/OptimizedSliderState";
import * as lodash from "lodash";
import {Process} from "../lib/Process";
import {ewent} from "../lib/reactive";
import {util} from "../lib/util/util";
import Widget from "../lib/ui/Widget";
import ButtonRow from "../lib/ui/ButtonRow";
import {Checkbox} from "../lib/ui/controls/Checkbox";
import {C} from "../lib/ui/constructors";
import {async_lazy} from "../lib/properties/Lazy";
import {DropdownSelection} from "../trainer/ui/widgets/DropdownSelection";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import avg = util.avg;
import hboxc = C.hboxc;
import hgrid = C.hgrid;
import span = C.span;
import count = util.count;
import vbox = C.vbox;

export type SliderDataEntry = {
  id: number,
  state: SliderState,
  timestamp: number,
  theme: string
}

export const crowdsourcedSliderData = async_lazy(async () => await (await fetch("data/sliders.json")).json())

type Result = {
  candidate: Candidate,
  tests: {
    start: SliderState,
    moves: MoveList | null,
  }[],
  statistics: {
    success_chance: number,
    average: number,
    median: number,
    standard_deviation: number,
    min: number,
    max: number
  }
}

function doStatistics(res: Result["tests"]): Result["statistics"] {

  return {
    average: avg(...res.filter(t => t.moves).map(t => t.moves.length)),
    min: Math.min(...res.filter(t => t.moves).map(t => t.moves.length)),
    max: Math.max(...res.filter(t => t.moves).map(t => t.moves.length)),
    success_chance: count(res, r => !!r.moves) / res.length,
    median: 0,
    standard_deviation: 0
  }
}

type BenchmarkSetup = {
  timeout: number,
  metric: "stm" | "mtm",
  testcase_count: number,
  testcase_type: "crowdsourced" | "trueshuffle" | "osrsshuffle",
  candidates: (
    { type: "random" } |
    { type: "pdb", db: string, reflect: boolean })[],
  continuation_solving?: {
    lookahead: number,
    assumed_moves_per_second: number
  } | null
}

namespace BenchmarkSetup {
  export async function instantiate(setup: BenchmarkSetup): Promise<BenchmarkSettings> {
    const testset: SliderState[] = []

    while (testset.length < setup.testcase_count) {
      switch (setup.testcase_type) {
        case "crowdsourced":
          const data = await crowdsourcedSliderData.get()

          const shuffled = data[lodash.random(data.length - 1)]
          if (SliderState.isSolveable(shuffled.state)) testset.push(shuffled.state)
          break;
        case "trueshuffle":
          testset.push(SliderState.createRandom())

          break;
        case "osrsshuffle":
          testset.push(OptimizedSliderState.asState(OptimizedSliderState.ramenShuffle()))
          break;

      }
    }

    const candidates: BenchmarkSettings["candidates"] = await Promise.all(setup.candidates.map(async c => {

      switch (c.type) {
        case "random":
          return {
            solver: RandomSolver,
            name: "Random"
          }
        case "pdb":
          const mngr = await PDBManager.instance.get()

          const name = `PDB ${c.db}${c.reflect ? " +R" : ""}`
          const solver = new PDBSolver(new RegionDistanceTable.RegionGraph((await mngr.getSimple(await mngr.find(undefined, c.db))).tables, c.reflect))

          return {
            solver: solver,
            name: name
          }
      }
    }))

    return {
      setup: setup,
      test_cases: testset,
      candidates: candidates
    }

  }
}

type BenchmarkSettings = {
  setup: BenchmarkSetup,
  test_cases: SliderState[],
  candidates: Candidate[],
}

class BenchmarkProcess extends Process<Result[]> {
  on_progress = ewent<Result[]>()

  constructor(private settings: BenchmarkSettings) {super();}

  async implementation(): Promise<Result[]> {

    const results: Result[] = this.settings.candidates.map(c => {
      return {
        candidate: c,
        done_count: 0,
        tests: [],
        success_count: 0,
        statistics: {
          average: 0,
          max: 0,
          min: 0,
          standard_deviation: 0,
          success_chance: 0,
          median: 0
        }
      }
    })

    this.on_progress.trigger(results)

    for (let candidate_i = 0; candidate_i < this.settings.candidates.length; candidate_i++) {
      const candidate = this.settings.candidates[candidate_i]

      for (let test_i = 0; test_i < this.settings.test_cases.length; test_i++) {
        if (this.should_stop) return results

        // this.layout.empty().row(`Running Candidate ${candidate_i + 1}/${candidates.length}, test ${test_i + 1}/${test_set.length}`)

        const test = this.settings.test_cases[test_i]
        const solver = candidate.solver.instantiate(test)
          .setCombineStraights(this.settings.setup.metric == "mtm")

        let best = await solver.withTimeout(this.settings.setup.timeout).run()

        if (this.settings.setup.continuation_solving && best) {
          const TIME_PER_STEP = (2/3) * (this.settings.setup.continuation_solving.lookahead / this.settings.setup.continuation_solving.assumed_moves_per_second) * 1000

          for (let i = this.settings.setup.continuation_solving.lookahead; i < best.length; i += this.settings.setup.continuation_solving.lookahead) {
            const better = await candidate.solver.instantiate(SliderState.withMove(test, ...best.slice(0, i)))
              .withTimeout(TIME_PER_STEP)
              .setCombineStraights(this.settings.setup.metric == "mtm")
              .registerSolution(best.slice(i))
              .run()

            best.splice(i, best.length, ...better)
          }
        }

        if (best) {
          let sanity = SliderState.withMove(test, ...best)

          if (!SliderState.equals(sanity, SliderState.SOLVED)) {
            debugger
            best = null
          }
        }

        results[candidate_i].tests.push({
          start: test,
          moves: best,
        })

        results[candidate_i].statistics = doStatistics(results[candidate_i].tests)
        await this.on_progress.trigger(results)
      }

    }

    return results
  }


  onProgress(f: (p: Result[]) => void): this {
    this.on_progress.on(f)

    return this
  }
}


type Candidate = {
  name: string,
  solver: Sliders.Solver
}

class BenchmarkProgressWidget extends Widget {
  constructor(setup: BenchmarkSettings, progress: Result[]) {
    super();

    const layout = new Properties().appendTo(this)

    layout.header("Results")
    layout.paragraph(`On a total of ${setup.test_cases.length} configurations with ${(setup.setup.timeout / 1000).toFixed(1)}s per configuration.`)

    layout.named("", hgrid(span("Solved"), span("Average"), span("Performance")))

    const ref_average = progress[0]?.statistics?.average ?? 0

    for (let row of progress) {
      layout.named(row.candidate.name, hgrid(
        c().text(`${row.tests.length}/${setup.test_cases.length}, ${(row.statistics.success_chance * 100).toFixed(1)}%`),
        c().text(row.statistics.average.toFixed(1)),
        c().text(`${(100 * (row.statistics.average / ref_average - 1)).toFixed(2)}%`),
      ))
    }
  }
}

class BenchmarkConfigurator extends Widget {
  private settings: BenchmarkSetup = {
    timeout: 1000,
    testcase_count: 20,
    metric: "mtm",
    testcase_type: "crowdsourced",
    candidates: [
      {type: "random"},
      {type: "pdb", reflect: false, db: "mtm_huge"},
      {type: "pdb", reflect: true, db: "mtm_huge"},
      {type: "pdb", reflect: false, db: "mtm_large"},
      {type: "pdb", reflect: true, db: "mtm_large"},
      {type: "pdb", reflect: false, db: "mtm_large_builtinreflection"},
    ]
  }

  constructor() {
    super();

    this.render()
  }

  private async render() {
    this.empty()


    const layout = new Properties().appendTo(this)

    layout.named("Timeout", new NumberSlider(100, 5000, 100).setValue(this.settings.timeout)
      .onCommit(t => this.settings.timeout = t)
    )

    layout.named("Metric", hboxc(
      ...new Checkbox.Group([
        {button: new Checkbox("MTM"), value: "mtm" as const},
        {button: new Checkbox("STM"), value: "stm" as const},
      ])
        .setValue(this.settings.metric)
        .onChange(m => this.settings.metric = m)
        .checkboxes()))

    layout.header("Tests cases")

    layout.named("Count", new NumberSlider(1, 100, 1).setValue(this.settings.testcase_count)
      .onCommit(c => this.settings.testcase_count = c)
    )

    layout.named("Type", hboxc(
      ...new Checkbox.Group([
        {button: new Checkbox("Real"), value: "crowdsourced" as const},
        {button: new Checkbox("Shuffle"), value: "trueshuffle" as const},
        {button: new Checkbox("Osrs"), value: "osrsshuffle" as const},
      ])
        .setValue(this.settings.testcase_type)
        .onChange(m => this.settings.testcase_type = m)
        .checkboxes()))

    layout.row(new Checkbox("Continuous solving", "checkbox")
      .setValue(!!this.settings.continuation_solving)
      .onCommit(v => {
        if (v) {
          this.settings.continuation_solving = {
            assumed_moves_per_second: 5,
            lookahead: 12,
          }
        } else {
          this.settings.continuation_solving = undefined
        }
      })
    )

    layout.header("Candidates")

    for (let i = 0; i < this.settings.candidates.length; i++) {
      const can = vbox()
      const candidate = this.settings.candidates[i]

      layout.named(`Candidate ${i + 1}`, can)

      new DropdownSelection<BenchmarkSetup["candidates"][number]["type"]>({
        type_class: {
          toHTML(v): C.Appendable {
            switch (v) {
              case "random":
                return "Random";
              case "pdb":
                return "PDB";

            }
            return v
          }
        }
      }, ["pdb", "random"])
        .setValue(candidate.type)
        .onSelection(t => {
          switch (t) {
            case "random":
              this.settings.candidates[i] = {type: "random"};
              break
            case "pdb":
              this.settings.candidates[i] = {type: "pdb", reflect: true, db: "mtm_large"}
              break
          }
          this.render()
        })
        .appendTo(can)

      if (candidate.type == "pdb") {
        const tables = await PDBManager.instance.get().pdbs.get()

        new DropdownSelection({
          type_class: {
            toHTML(v): C.Appendable {
              return v
            }
          }
        }, tables.map(t => t.id))
          .setValue(candidate.db)
          .onSelection(t => {
            candidate.db = t
          })
          .appendTo(can)

        new Checkbox("Reflect").setValue(candidate.reflect)
          .onCommit(v => candidate.reflect = v)
          .appendTo(can)
      }
    }

    layout.row(new LightButton("Add Candidate", "rectangle").onClick(() => {
      this.settings.candidates.push({type: "random"})
      this.render()
    }))

    layout.row(
      new ButtonRow()
        .buttons(
          new LightButton("Export"),
          new LightButton("Import"),
          new LightButton("Run").onClick(async () => {
            const settings = await BenchmarkSetup.instantiate(this.settings);

            const process = new BenchmarkProcess(settings);

            const modal = new class extends NisModal {
              render() {
                super.render();

                this.setTitle("Running Benchmarks")

                const layout = new Properties().appendTo(this.body)

                layout.row(new LightButton("Stop", "rectangle")
                  .onClick(() => {
                    process.stop()
                  })
                )

                const result_container = c()

                layout.row(result_container)

                process.onProgress(progress => {
                  result_container.empty()

                  new BenchmarkProgressWidget(settings, progress).appendTo(result_container)
                })
              }
            }

            modal.hidden.on(() => process.stop())

            modal.show()
            process.run()
          }),
        )
    )
  }
}

export class SliderBenchmarkModal extends NisModal {
  layout: Properties
  run_button: LightButton

  constructor() {
    super();

    this.title.set("Slider Solving Benchmark")
  }

  render() {
    super.render()

    new BenchmarkConfigurator().appendTo(this.body)
  }
}