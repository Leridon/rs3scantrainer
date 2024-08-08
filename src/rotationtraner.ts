import * as lodash from "lodash";
import {Process} from "./lib/Process";
import {NisModal} from "./lib/ui/NisModal";
import LightButton from "./trainer/ui/widgets/LightButton";
import {OverlayGeometry, OverlayImage} from "./lib/alt1/OverlayGeometry";
import over = OverlayGeometry.over;
import {Vector2} from "./lib/math";
import {ImageDetect} from "@alt1/base";
import {util} from "./lib/util/util";
import A1Color = util.A1Color;
import {ewent} from "./lib/reactive";
import todo = util.todo;

export type Hotkey = {
  modifiers: ("shift" | "alt" | "ctrl")[],
  key: string
}

export type Ability = Ability.Necromancy | Ability.Constitution | Ability.Magic

export namespace Ability {
  export type Necromancy = "necromancy" | "conjureskeletonwarrior" | "fingerofdeath" | "touchofdeath"
    | "commandskeletonwarrior" | "deathskulls" | "bloodsiphon" | "conjureputridzombie" | "conjurevengefulghost" | "bloat"
    | "soulsap" | "soulstrike" | "commandputridzombie" | "commandvengefulghost" | "spectralscythe" | "volleyofsouls"
    | "livingdeath" | "conjureundeadarmy" | "splitsoul" | "invokedeath"

  export type Constitution = "specialattack" | "undeadslayer" | "dragonslayer" | "demonslayer"

  export type Magic = "surge"

  const _icon_cache = {}

  export async function getIcon(ability: Ability): Promise<OverlayImage> {
    if (!_icon_cache[ability]) {
      _icon_cache[ability] = new OverlayImage(await ImageDetect.imageDataFromUrl(`assets/icons/abilities/${ability}.webp`))
    }

    return _icon_cache[ability]
  }
}

export type Item = "vulnerabilitybomb"

export type Action = {
  type: "ability",
  ability: Ability
} | {
  type: "item",
  item: Item
}

export type ScheduledAction = {
  action: Action,
  tick: number
}

export class Schedule {
  public _schedule: ScheduledAction[] = []

  schedule(tick: number, action: Action): void {
    this._schedule.push({tick, action})
  }

  private sort() {
    lodash.sortBy(this._schedule, a => a.tick)


    this._schedule.sort()
  }
}

const TICK_LENGTH = 600

export class Player extends Process {
  private tick = 0

  constructor(public schedule: Schedule = new Schedule()) {
    super();
  }

  async implementation(): Promise<void> {
    const start_time = Date.now()

    const overlay = over()

    const BASELINE = {x: 800, y: 600}
    const TICK_HEIGHT = 40
    const ACTION_WIDTH = 40
    const LOOKAHEAD = 10

    while (!this.should_stop) {
      await this.checkTime()

      this.tick = (Date.now() - start_time) / TICK_LENGTH

      overlay.clear()

      for (let t = 0; t < LOOKAHEAD; t++) {
        const center = Vector2.add(BASELINE, Vector2.scale(t, {x: 0, y: -TICK_HEIGHT}))

        const is_global_cooldown_border = (t % 3) == 0

        overlay.line(
          Vector2.add(center, {x: is_global_cooldown_border ? -100 : -80, y: 0}),
          Vector2.add(center, {x: is_global_cooldown_border ? 100 : 80, y: 0}),
          {color: A1Color.fromHex("#8888FF"), width: is_global_cooldown_border ? 3 : 1}
        )
      }

      for (let i = 0; i < this.schedule._schedule.length; i++) {
        const action = this.schedule._schedule[i]

        if (action.tick < this.currentTick()) continue

        if (action.tick > this.tick + LOOKAHEAD) break

        const same_tick_actions = lodash.filter(this.schedule._schedule, a => a.tick == action.tick)

        i += same_tick_actions.length - 1

        const in_future = action.tick - this.currentTick()

        for (let j = 0; j < same_tick_actions.length; j++) {
          const action = same_tick_actions[j]

          const img = await (async () => {
            switch (action.action.type) {
              case "ability":
                return await Ability.getIcon(action.action.ability)
              case "item":
                return await Ability.getIcon("necromancy")
            }
          })()


          const pos = Vector2.add(
            BASELINE,
            Vector2.snap(Vector2.scale(in_future, {y: -TICK_HEIGHT, x: 0})),
            Vector2.snap(Vector2.scale(j - (same_tick_actions.length - 1) / 2, {y: 0, x: ACTION_WIDTH})),
          )

          overlay.image(pos, img)


          const hotkey = (() => {
            switch ((action.action.type == "ability" ? action.action.ability.charCodeAt(5) : action.action.item.charCodeAt(5)) % 6) {
              case 0:
                return "A"
              case 1:
                return "F1"
              case 2:
                return "s+A"
              case 3:
                return "a+S"
              case 5:
                return "\\"
              default:
                return "."
            }
          })()

          overlay.text(hotkey, pos, {width: in_future < 1 ? 14 : 12, color: A1Color.fromHex("#FFFFFF"), centered: true, shadow: true})
        }
      }

      overlay.render()
    }

    overlay.clear().render()
  }

  currentTick(): number {
    //return Math.floor(this.tick)
    return this.tick
  }
}

export class RotationScriptWorkerInterface {
  message_received = ewent<RotationScriptInterface.OutMessage>()

  constructor(private worker: Worker, private environment: RotationScriptWorkerInterface.Environment) {
    this.worker.onmessage = (e: MessageEvent<RotationScriptInterface.OutMessage>) => {
      this.message_received.trigger(e.data)

      switch (e.data.type) {
        case "schedule":
          this.environment.schedule.schedule(e.data.tick, e.data.action)
      }
    }
  }

  send(msg: RotationScriptInterface.InMessage) {
    this.worker.postMessage(msg)
  }

  tick() {
    todo()
  }

  static fromURL(url: string, environment: RotationScriptWorkerInterface.Environment): RotationScriptWorkerInterface {
    return new RotationScriptWorkerInterface(new Worker(url), environment)
  }
}

export namespace RotationScriptWorkerInterface {
  export type Environment = {
    schedule: Schedule
  }
}

type GameState = {}

export namespace RotationScriptInterface {
  export type InMessage =
    { type: "gamestate", data: GameState }
    | { type: "schedule", data: ScheduledAction[] }

  export type OutMessage =
    { type: "schedule", tick: number, action: Action }
}

export class RotationModal extends NisModal {

  render() {
    super.render();

    new LightButton("Play").onClick(() => {
      const player = new Player().withTimeout(20000);

      RotationScriptWorkerInterface.fromURL("script_sample.bundle.js", {schedule: player.schedule})

      player.run()
    }).appendTo(this.body)
  }
}