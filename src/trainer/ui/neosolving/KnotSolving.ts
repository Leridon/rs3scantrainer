import {NeoSolvingSubBehaviour} from "./NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {KnotReader} from "./cluereader/KnotReader";
import {Process} from "../../../lib/Process";
import * as a1lib from "@alt1/base"


 class KnotSolvingProcess extends  Process {
   constructor(private parent: KnotSolving) {
     super();

     this.asInterval(1000 / 20)
   }

   implementation(): Promise<void> | void {
     while(!this.should_stop) {
       a1lib.captureHold()

       KnotReader.read()

       this.checkTime()
     }
   }

 }

export class KnotSolving extends NeoSolvingSubBehaviour {
  constructor(parent: NeoSolvingBehaviour, private knot: KnotReader.Result) {
    super(parent, true);
  }

  protected begin() {
  }

  protected end() {
  }
}