import * as jquery from "jquery";
import {ewent, Observable, observe} from "../reactive";
import Widget from "./Widget";
import * as bootstrap from "bootstrap"
import observe_combined = Observable.observe_combined;

export abstract class Modal2 {
  private bs_modal: bootstrap.Modal

  shown = ewent<this>()
  hidden = ewent<this>()
  removed = ewent<this>()

  protected _modal: Widget
  protected _dialog: Widget
  protected _content: Widget

  private visible = observe(false)
  private should_dismount = observe(false)

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
      })

      this._modal.raw().addEventListener("hidden.bs.modal", () => {
        this.visible.set(false)
        this.hidden.trigger(this)
      })

      this.bs_modal = new bootstrap.Modal(this._modal.raw(), {
        backdrop: this.options.fixed ? "static" : true,
        keyboard: !this.options.fixed,
      })
    }
  }

  private dismount() {
    this._modal.detach()
    this.removed.trigger(this)
  }

  async show(): Promise<this> {
    let promise = new Promise<this>((resolve) => {
      this.hidden.on(() => resolve(this))
    })

    this.mount()

    await this.render()

    this.bs_modal.show()

    return promise
  }

  hide() {
    this.bs_modal.hide()
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
  export type Options = {
    no_fade?: boolean,
    size?: "small" | "medium" | "large" | "fullscreen",
    fixed?: boolean,
    disable_close_button?: boolean
  }
}