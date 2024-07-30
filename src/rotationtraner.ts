import * as lodash from "lodash";
import {Process} from "./lib/Process";
import {NisModal} from "./lib/ui/NisModal";
import LightButton from "./trainer/ui/widgets/LightButton";
import {OverlayGeometry, OverlayImage} from "./lib/alt1/OverlayGeometry";
import over = OverlayGeometry.over;
import {Vector2} from "./lib/math";
import {ImageDetect} from "@alt1/base";

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

    const BASELINE = {x: 500, y: 500}
    const TICK_HEIGHT = 30
    const ACITON_WIDTH = 40

    while (!this.should_stop) {
      await this.checkTime()

      this.tick = (Date.now() - start_time) / TICK_LENGTH

      overlay.clear()

      for (let i = 0; i < this.schedule._schedule.length; i++) {
        const action = this.schedule._schedule[i]

        if (action.tick > this.tick + 10) break

        const same_tick_actions = lodash.filter(this.schedule._schedule, a => a.tick == action.tick)

        i += same_tick_actions.length - 1

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

          overlay.image(Vector2.add(
            BASELINE,
            Vector2.snap(Vector2.scale(action.tick - this.currentTick(), {y: TICK_HEIGHT, x: 0})),
            //Vector2.snap(Vector2.scale((same_tick_actions.length - 1), {y: 0, x: ACITON_WIDTH / 2})),
          ), img, 30)
        }
      }

      overlay.render()
    }

    overlay.clear().render()
  }

  currentTick(): number {
    return this.tick
  }
}


export class RotationModal extends NisModal {

  render() {
    super.render();

    new LightButton("Play").onClick(() => {
      const player = new Player().withTimeout(20000);

      player.schedule.schedule(3, {type: "ability", ability: "conjureundeadarmy"})
      //player.schedule.schedule(3, {type: "ability", ability: "livingdeath"})
      player.schedule.schedule(6, {type: "ability", ability: "commandvengefulghost"})
      player.schedule.schedule(9, {type: "ability", ability: "splitsoul"})
      // player.schedule.schedule(9, {type: "ability", ability: "surge"})
      player.schedule.schedule(12, {type: "ability", ability: "invokedeath"})
      player.schedule.schedule(15, {type: "ability", ability: "commandskeletonwarrior"})
      player.schedule.schedule(18, {type: "ability", ability: "undeadslayer"})
      // player.schedule.schedule(18, {type: "item", item: "vulnerabilitybomb"})
      //player.schedule.schedule(18, {type: "ability", ability: "deathskulls"})
      player.schedule.schedule(21, {type: "ability", ability: "touchofdeath"})
      player.schedule.schedule(24, {type: "ability", ability: "fingerofdeath"})
      player.schedule.schedule(27, {type: "ability", ability: "specialattack"})

      player.run()
    }).appendTo(this.body)
  }
}