import {Sliders} from "./ui/neosolving/puzzles/Sliders";
import {Application} from "./application";
import * as lodash from "lodash";
import {storage} from "../lib/util/storage";
import SliderPuzzle = Sliders.SliderPuzzle;
import SliderState = Sliders.SliderState;

export class CrowdSourcing {
  private last_slider_state = new storage.Variable<{
    timestamp: number,
    theme: string,
    state: SliderState
  }>("crowdsourcing/last_slider_state",
    () => null
  )

  constructor(private parent: Application, private server_url: string) {

  }

  private endpoint(endpoint: string): string {
    return `${this.server_url}/api/crowdsourcing/${endpoint}`
  }

  pushSlider(slider: SliderPuzzle): void {
    if (this.parent.settings.settings.crowdsourcing.slider_states) {

      const last = this.last_slider_state.get()

      const timestamp = Date.now()

      // Don't use the same theme twice in a row and apply a cooldown to sanitize data
      if (last && (last.theme == slider.theme || last.timestamp >= timestamp - 4500)) return

      const state = SliderPuzzle.getState(slider)

      this.last_slider_state.set({
        timestamp: timestamp,
        theme: slider.theme,
        state: state
      })

      const body = JSON.stringify({
        tiles: state,
        theme: slider.theme
      })

      console.log(`Adding ${body} to crowdsourcing`)

      fetch(this.endpoint("initial_slider_state"), {
        method: "POST",
        body: body,
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      });
    }
  }
}

export namespace CrowdSourcing {
  export type Settings = {
    slider_states: boolean
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      slider_states: false
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return lodash.cloneDeep(DEFAULT)

      if (![true, false].includes(settings.slider_states)) settings.slider_states = DEFAULT.slider_states

      return settings
    }
  }
}