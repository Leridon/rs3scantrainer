import {Action, RotationScriptInterface} from "./rotationtraner";

namespace RotationScriptAPI {

  export function run() {

  }

  export function send(msg: RotationScriptInterface.OutMessage) {
    postMessage(msg)
  }

  export function schedule(tick: number, action: Action) {
    send({type: "schedule", tick: tick, action: action})
  }

  export function init() {
    self.onmessage = function (msg: MessageEvent<RotationScriptInterface.InMessage>) {
      console.log(msg.data)
    }
  }
}

import schedule = RotationScriptAPI.schedule;

schedule(3, {type: "ability", ability: "conjureundeadarmy"})
schedule(3, {type: "ability", ability: "livingdeath"})
schedule(6, {type: "ability", ability: "commandvengefulghost"})
schedule(9, {type: "ability", ability: "splitsoul"})
schedule(9, {type: "ability", ability: "surge"})
schedule(12, {type: "ability", ability: "invokedeath"})
schedule(15, {type: "ability", ability: "commandskeletonwarrior"})
schedule(18, {type: "ability", ability: "undeadslayer"})
schedule(18, {type: "item", item: "vulnerabilitybomb"})
schedule(18, {type: "ability", ability: "deathskulls"})
schedule(21, {type: "ability", ability: "touchofdeath"})
schedule(24, {type: "ability", ability: "fingerofdeath"})
schedule(27, {type: "ability", ability: "specialattack"})