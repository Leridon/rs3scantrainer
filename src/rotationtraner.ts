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
    const TICK_HEIGHT = 40
    const ACTION_WIDTH = 40
    const LOOKAHEAD = 15

    while (!this.should_stop) {
      await this.checkTime()

      this.tick = (Date.now() - start_time) / TICK_LENGTH

      overlay.clear()

      for (let t = 0; t < LOOKAHEAD; t++) {
        const center = Vector2.add(BASELINE, Vector2.scale(t, {x: 0, y: -TICK_HEIGHT}))

        overlay.line(
          Vector2.add(center, {x: -100, y: 0}),
          Vector2.add(center, {x: 100, y: 0}),
          {color: A1Color.fromHex("#8888FF")}
        )
      }

      for (let i = 0; i < this.schedule._schedule.length; i++) {
        const action = this.schedule._schedule[i]

        if (action.tick < this.currentTick()) continue

        if (action.tick > this.tick + LOOKAHEAD) break

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

          const pos = Vector2.add(
            BASELINE,
            Vector2.snap(Vector2.scale(action.tick - this.currentTick(), {y: -TICK_HEIGHT, x: 0})),
            Vector2.snap(Vector2.scale(j - (same_tick_actions.length - 1) / 2, {y: 0, x: ACTION_WIDTH})),
          )

          overlay.image(pos, img)

          overlay.text("s+A", Vector2.add(pos, {x: 15, y: 15}), {width: 14, color: A1Color.fromHex("#FFFFFF")})
        }
      }

      overlay.render()
    }

    overlay.clear().render()
  }

  currentTick(): number {
    return Math.floor(this.tick)
  }
}


export class RotationModal extends NisModal {

  render() {
    super.render();

    new LightButton("Play").onClick(() => {
      const player = new Player().withTimeout(20000);

      player.schedule.schedule(3, {type: "ability", ability: "conjureundeadarmy"})
      player.schedule.schedule(3, {type: "ability", ability: "livingdeath"})
      player.schedule.schedule(6, {type: "ability", ability: "commandvengefulghost"})
      player.schedule.schedule(9, {type: "ability", ability: "splitsoul"})
      player.schedule.schedule(9, {type: "ability", ability: "surge"})
      player.schedule.schedule(12, {type: "ability", ability: "invokedeath"})
      player.schedule.schedule(15, {type: "ability", ability: "commandskeletonwarrior"})
      player.schedule.schedule(18, {type: "ability", ability: "undeadslayer"})
      player.schedule.schedule(18, {type: "item", item: "vulnerabilitybomb"})
      player.schedule.schedule(18, {type: "ability", ability: "deathskulls"})
      player.schedule.schedule(21, {type: "ability", ability: "touchofdeath"})
      player.schedule.schedule(24, {type: "ability", ability: "fingerofdeath"})
      player.schedule.schedule(27, {type: "ability", ability: "specialattack"})

      player.run()
    }).appendTo(this.body)
  }
}