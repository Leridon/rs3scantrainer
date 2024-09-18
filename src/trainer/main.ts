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
import {MoveTable} from "../lib/cluetheory/sliders/MoveTable";
import {Region} from "../lib/cluetheory/sliders/Region";


export async function makeshift_main(): Promise<void> {

  const regions: Region[] =  [
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[2,2,2,2,2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[2,2,2,2,2,2,2,2,2,2,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0],[2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,2,2,1,1,0,2,2,1,0,1],[2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,0,1,1,1,0,1],[2,2,2,2,2,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0],[2,2,2,2,2,2,1,1,1,1,2,1,0,0,0,2,1,0,0,0,2,1,0,0,0]]


  for (const r of regions) {
    console.log(new MoveTable(r, false, false).move_table[25][19].join(","))
  }

  const table = new MoveTable([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 1, 1, 0, 2, 2, 1, 0, 1], false, false)

}