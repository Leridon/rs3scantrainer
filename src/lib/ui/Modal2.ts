import * as jquery from "jquery";
import {ewent, Observable, observe} from "../reactive";
import Widget from "./Widget";
import * as bootstrap from "bootstrap"
import observe_combined = Observable.observe_combined;

export abstract class Modal2 {
  private bs_modal: bootstrap.Modal

  state = observe<"unmounted" | "showing" | "shown" | "hiding" | "hidden">("unmounted")

  shown = ewent<this>()
  hidden = ewent<this>()
  removed = ewent<this>()

  protected _modal: Widget
  protected _dialog: Widget
  protected _content: Widget

  private visible = observe(false)
  private should_dismount = observe(false)
  private should_hide = false

  protected constructor(protected options: Modal2.Options = {}) {
    this._modal = c("<div class='modal ctr-modal' tabindex='-1'></div>")
    this._dialog = c("<div class='modal-dialog'></div>").appendTo(this._modal)
    this._content = c("<div class='modal-content'></div>").appendTo(this._dialog)

    if (!options.no_fade) this._modal.addClass("fade")

    switch (options.size || "medium") {
      case "small":
        this._dialog.addClass("modal-sm")
        break;
      case "large":
        this._dialog.addClass("modal-lg")
        break;
      case "fullscreen":
        this._dialog.addClass("ctr-modal-fullscreen")
    }

    observe_combined({visible: this.visible, should_dismount: this.should_dismount}).subscribe(({visible, should_dismount}) => {
      if (!visible && should_dismount) this.dismount()
    })
  }

  abstract render(): Promise<void> | void

  private mount() {
    if (this._modal.container.parent().length == 0) {
      this._modal.appendTo(jquery("body"))

      this._modal.raw().addEventListener("shown.bs.modal", () => {
        this.visible.set(true)
        this.shown.trigger(this)

        this.state.set("shown")

        Modal2.open_count++

        if (this.should_hide) this.hide()
      })

      this._modal.raw().addEventListener("hidden.bs.modal", () => {
        this.visible.set(false)
        this.hidden.trigger(this)

        this.state.set("hidden")

        Modal2.open_count--

        if (Modal2.open_count == 0) {
          const backdrops = document.getElementsByClassName("modal-backdrop")
          for (let i = 0; i < backdrops.length; i++) {
            backdrops[i].remove()
          }
        }
      })

      this.bs_modal = new bootstrap.Modal(this._modal.raw(), {
        backdrop: this.options.fixed ? "static" : true,
        keyboard: !this.options.fixed,
      })
    }
  }

  private dismount() {
    this._modal.remove()
    this.state.set("hidden")
    this.removed.trigger(this)
  }

  async show(): Promise<this> {
    let promise = new Promise<this>((resolve) => {
      this.hidden.on(() => resolve(this))
    })

    this.mount()

    await this.render()

    this.state.set("showing")
    this.bs_modal.show()

    return promise
  }

  hide() {
    if (this.state.value() == "showing") {
      this.should_hide = true
    } else if (this.state.value() == "shown") {
      this.bs_modal.hide()
      this.state.set("hiding")
    }
  }

  remove() {
    this.should_dismount.set(true)
    this.hide()
  }

  content(): Widget {
    return this._content
  }
}

export namespace Modal2 {
  export let open_count: number = 0

  export type Options = {
    no_fade?: boolean,
    size?: "small" | "medium" | "large" | "fullscreen",
    fixed?: boolean,
    disable_close_button?: boolean
  }
}