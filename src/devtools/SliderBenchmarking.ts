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
import natural_order = util.Order.natural_order;
import {BigNisButton} from "../trainer/ui/widgets/BigNisButton";
import AsyncInitialization = util.AsyncInitialization;
import async_init = util.async_init;

export type SliderDataEntry = {
  id: number,
  state: SliderState,
  timestamp: number,
  theme: string
}

export const crowdsourcedSliderData = async_lazy(async () => await (await fetch("data/sliders.json")).json())
export const crowdsourcedSliderData2024 = async_lazy(async () => await (await fetch("data/sliders_2024.json")).json())

type Statistics = {
  success_chance: number,
  average: number,
  median: number,
  standard_deviation: number,
  min: number,
  max: number
}

type SimulationResult = {
  test_set: BenchmarkSettings["test_cases"][number]
  candidates: {
    candidate: Candidate,
    tests: {
      start: SliderState,
      moves: MoveList | null,
    }[],
    statistics: Statistics
  }[]
}[]

function median(list: number[]): number {
  if (list.length == 0) return Number.NaN

  const sorted = lodash.sortBy(list, natural_order)

  const mid = ~~(sorted.length / 2)

  if (list.length % 2 == 0) return (sorted[mid - 1] + sorted[mid]) / 2
  else return sorted[mid]
}

function variance(list: number[]): number {
  const mean = avg(...list)

  return lodash.sum(list.map(element => Math.pow(element - mean, 2))) / list.length
}

function stddev(list: number[]): number {
  return Math.sqrt(variance(list))
}

function doStatistics(res: SimulationResult[number]["candidates"][number]): Statistics {
  const sorted_lengths = lodash.sortBy(res.tests.filter(t => t.moves).map(t => t.moves.length))

  return {
    average: avg(...sorted_lengths),
    min: sorted_lengths[0],
    max: sorted_lengths[sorted_lengths.length - 1],
    success_chance: count(res.tests, r => !!r.moves) / res.tests.length,
    median: median(sorted_lengths),
    standard_deviation: stddev(sorted_lengths)
  }
}

type BenchmarkSetup = {
  metric: "stm" | "mtm",
  testcase_count: number,
  testcase_type: ("crowdsourced" | "trueshuffle" | "osrsshuffle" | "crowdsourced2024")[],
  candidates: ({ timeout: number } &
    ({ type: "random" } |
      { type: "pdb", db: string, reflect: boolean }))[],
  continuation_solving?: {
    lookahead: number,
    assumed_moves_per_second: number
  } | null
}

namespace BenchmarkSetup {
  export async function instantiate(setup: BenchmarkSetup): Promise<BenchmarkSettings> {
    const testset: BenchmarkSettings["test_cases"] = []

    for (const type of setup.testcase_type) {
      const set: SliderState[] = []

      while (set.length < setup.testcase_count) {
        switch (type) {
          case "crowdsourced": {
            const data = await crowdsourcedSliderData.get()

            const shuffled = data[lodash.random(data.length - 1)]
            if (SliderState.isSolveable(shuffled.state)) set.push(shuffled.state)
            break;
          }
          case "crowdsourced2024": {
            const data = await crowdsourcedSliderData2024.get()

            const shuffled = data[lodash.random(data.length - 1)]
            if (SliderState.isSolveable(shuffled.state)) set.push(shuffled.state)
            break;
          }
          case "trueshuffle":
            set.push(SliderState.createRandom())

            break;
          case "osrsshuffle":
            set.push(OptimizedSliderState.asState(OptimizedSliderState.ramenShuffle()))
            break;
        }
      }

      const namemap: Record<BenchmarkSetup["testcase_type"][number], string> = {
        "trueshuffle": "True Shuffle",
        "osrsshuffle": "Suspected New Shuffle",
        "crowdsourced": "Old Shuffle (Crowdsourced)",
        "crowdsourced2024": "New Shuffle (Crowdsourced)",
      }


      testset.push({
        states: set,
        name: namemap[type]
      })
    }


    const candidates: BenchmarkSettings["candidates"] = await Promise.all(setup.candidates.map(async c => {
      switch (c.type) {
        case "random":
          return {
            timeout: c.timeout,
            solver: RandomSolver,
            name: "Random"
          }
        case "pdb":
          const mngr = await PDBManager.instance.get()

          const name = `PDB ${c.db}${c.reflect ? " +R" : ""}`
          const solver = new PDBSolver(new RegionDistanceTable.RegionGraph((await mngr.getSimple(await mngr.find(undefined, c.db))).tables, c.reflect))

          return {
            timeout: c.timeout,
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
  test_cases: {
    name: string,
    states: SliderState[],
  }[],
  candidates: Candidate[],
}

class BenchmarkProcess extends Process<SimulationResult> {
  on_progress = ewent<SimulationResult>()

  constructor(private settings: BenchmarkSettings) {super();}

  async implementation(): Promise<SimulationResult> {
    const results: SimulationResult = this.settings.test_cases.map(tc => ({
      test_set: tc,
      candidates: this.settings.candidates.map(c => {
        return {
          test_set: tc,
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
    }))

    this.on_progress.trigger(results)

    for (const test_set_i in this.settings.test_cases) {
      const test_set = this.settings.test_cases[test_set_i]

      for (let candidate_i = 0; candidate_i < this.settings.candidates.length; candidate_i++) {
        const candidate = this.settings.candidates[candidate_i]

        for (let test_i = 0; test_i < test_set.states.length; test_i++) {
          if (this.should_stop) return results

          // this.layout.empty().row(`Running Candidate ${candidate_i + 1}/${candidates.length}, test ${test_i + 1}/${test_set.length}`)

          const test = test_set.states[test_i]
          const solver = candidate.solver.instantiate(test)
            .setCombineStraights(this.settings.setup.metric == "mtm")

          let best = await solver.withTimeout(candidate.timeout).run()

          if (this.settings.setup.continuation_solving && best) {
            const TIME_PER_STEP = (2 / 3) * (this.settings.setup.continuation_solving.lookahead / this.settings.setup.continuation_solving.assumed_moves_per_second) * 1000

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

          results[test_set_i].candidates[candidate_i].tests.push({
            start: test,
            moves: best,
          })

          results[test_set_i].candidates[candidate_i].statistics = doStatistics(results[test_set_i].candidates[candidate_i])
          await this.on_progress.trigger(results)
        }

      }
    }

    return results
  }

  onProgress(f: (p: SimulationResult) => void): this {
    this.on_progress.on(f)

    return this
  }
}


type Candidate = {
  name: string,
  timeout: number,
  solver: Sliders.Solver
}

class BenchmarkProgressWidget extends Widget {
  constructor(setup: BenchmarkSettings, progress: SimulationResult) {
    super();

    const layout = new Properties().appendTo(this)

    layout.header("Results")

    layout.named("", hgrid(span("Time"), span("n"), span("Mean"), span("Median"), span("𝞼"), span("Δ"), span("Δ (In Group)"), span("Δ (First Group)")))

    const ref_average = progress[0]?.candidates?.[0]?.statistics?.average ?? 0

    for (let test_set of progress) {
      layout.header(test_set.test_set.name, "left")

      const ref_average2 = test_set.candidates?.[0]?.statistics?.average ?? 0

      for (let row_i in test_set.candidates) {
        const row = test_set.candidates[row_i]

        layout.named(row.candidate.name, hgrid(
          c().text(row.candidate.timeout + "ms"),
          c().text(`${row.tests.length}/${test_set.test_set.states.length}`),
          c().text(row.statistics.average.toFixed(1)),
          c().text(row.statistics.median.toString()),
          c().text(row.statistics.standard_deviation.toFixed(1)),
          c().text(`${(100 * (row.statistics.average / ref_average - 1)).toFixed(2)}%`),
          c().text(`${(100 * (row.statistics.average / ref_average2 - 1)).toFixed(2)}%`),
          c().text(`${(100 * (row.statistics.average / progress[0].candidates[row_i].statistics.average - 1)).toFixed(2)}%`),
        ))
      }
    }


  }
}

class BenchmarkRunner extends NisModal {
  private process: BenchmarkProcess

  private constructor(private settings: BenchmarkSettings) {
    super({size: "large"});

    this.process = new BenchmarkProcess(this.settings)
      .withTimeout(10000);

    this.shown.on(() => this.process.run())
    this.hidden.on(() => this.process.stop())
  }


  render() {
    super.render();

    this.setTitle("Running Benchmarks")

    const layout = new Properties().appendTo(this.body)

    const result_container = c()

    layout.row(result_container)

    this.process.onProgress(progress => {
      result_container.empty()

      new BenchmarkProgressWidget(this.settings, progress).appendTo(result_container)
    })

    const stop_button = new LightButton("Stop", "rectangle")
      .onClick(() => {
        this.process.stop()
      })

    this.process.onFinished(() => {
      stop_button.remove()
    })

    layout.row(stop_button)
  }

  static async run(setup: BenchmarkSetup): Promise<BenchmarkRunner> {
    return new BenchmarkRunner(await BenchmarkSetup.instantiate(setup)).show()

  }
}

class BenchmarkConfigurator extends Widget {
  public settings: BenchmarkSetup = {
    testcase_count: 20,
    metric: "mtm",
    testcase_type: ["crowdsourced", "crowdsourced2024", "osrsshuffle"],
    candidates: [
      {type: "random", timeout: 2000},
      {type: "pdb", reflect: false, db: "mtm_huge", timeout: 500},
      //{type: "pdb", reflect: true, db: "mtm_huge"},
      //{type: "pdb", reflect: false, db: "mtm_large"},
      //{type: "pdb", reflect: true, db: "mtm_large"},
      //{type: "pdb", reflect: false, db: "mtm_large_builtinreflection"},
    ]
  }

  constructor() {
    super();

    this.render()
  }

  private async render() {
    this.empty()


    const layout = new Properties().appendTo(this)

    layout.named("Metric", hboxc(
      ...new Checkbox.Group([
        {button: new Checkbox("MTM"), value: "mtm" as const},
        {button: new Checkbox("STM"), value: "stm" as const},
      ])
        .setValue(this.settings.metric)
        .onChange(m => this.settings.metric = m)
        .checkboxes()))

    layout.header("Test cases")

    layout.named("Count", new NumberSlider(1, 100, 1).setValue(this.settings.testcase_count)
      .onCommit(c => this.settings.testcase_count = c)
    )

    const boxes: [string, BenchmarkSetup["testcase_type"][number]][] = [
      ["Real (Old)", "crowdsourced"],
      ["Real (2024)", "crowdsourced2024"],
      ["Shuffle", "trueshuffle"],
      ["Osrs", "osrsshuffle"],
    ]

    layout.named("Type", hboxc(
      ...boxes.map(([name, id]) =>
        new Checkbox(name).onChange(v => {
          if (v && !this.settings.testcase_type.includes(id)) this.settings.testcase_type.push(id)
          if (!v) this.settings.testcase_type = this.settings.testcase_type.filter(i => i != id)
        })
      )
    ))

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
              this.settings.candidates[i] = {type: "random", timeout: 2000};
              break
            case "pdb":
              this.settings.candidates[i] = {type: "pdb", reflect: true, db: "mtm_large", timeout: 500};
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
      this.settings.candidates.push({type: "random", timeout: 1000})
      this.render()
    }))

    layout.row(
      new ButtonRow()
        .buttons(
          new LightButton("Export"),
          new LightButton("Import"),
          new LightButton("Run").onClick(async () => {
          }),
        )
    )
  }
}

export class SliderBenchmarkModal extends NisModal {
  layout: Properties
  run_button: LightButton

  private configuration: BenchmarkConfigurator

  constructor() {
    super();

    this.title.set("Slider Solving Benchmark")
  }

  render() {
    super.render()

    this.configuration = new BenchmarkConfigurator().appendTo(this.body)
  }

  getButtons(): BigNisButton[] {
    return [
      new BigNisButton("Run", "confirm")
        .onClick(() => {
          BenchmarkRunner.run(this.configuration.settings)
        })
    ]
  }
}