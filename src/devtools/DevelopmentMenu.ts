import {NisModal} from "../lib/ui/NisModal";
import Properties from "../trainer/ui/widgets/Properties";
import LightButton from "../trainer/ui/widgets/LightButton";
import {SliderBenchmarkModal} from "./SliderBenchmarking";
import {PDBGeneratorModal, RegionIndexingModal, StateIndexBenchmarkWidget} from "./sliderdb/RegionEditor";
import {CompassReader} from "../trainer/ui/neosolving/cluereader/CompassReader";
import {clue_trainer_test_set} from "../test/tests";


export class DevelopmentModal extends NisModal {


  constructor() {
    super();

    this.setTitle("Super Secret Development Menu")
  }

  render() {
    super.render();

    const layout = new Properties().appendTo(this.body)

    layout.paragraph("Welcome to the super secret development menu! If you're not a developer, you probably won't find anything useful here, but feel free to take a look around. Important note: Some options may mess up your local data/settings without warning you about it before doing so!")

    layout.header("Slider Puzzles")

    layout.row(new LightButton("Benchmark", "rectangle")
      .onClick(() => {
        new SliderBenchmarkModal().show()
      })
    )

    layout.row(new LightButton("Generate PDB", "rectangle")
      .onClick(() => {
        new PDBGeneratorModal().show()
      })
    )

    layout.row(new LightButton("Benchmark Region Indexing", "rectangle")
      .onClick(() => {
        new RegionIndexingModal().show()
      })
    )

    layout.header("Compass")
    layout.row(new LightButton("Calibration Tool", "rectangle")
      .onClick(() => {
        new CompassReader.CalibrationTool().show()
      })
    )

    layout.header("Tests")

    layout.row(new LightButton("Run Tests", "rectangle")
      .onClick(() => {
        clue_trainer_test_set.run()
      })
    )

  }
}