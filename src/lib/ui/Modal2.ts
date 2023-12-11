import {ewent, Observable, observe} from "../reactive";
import Widget from "./Widget";
import observe_combined = Observable.observe_combined;

export class Modal2 {
    shown = ewent<this>()
    hidden = ewent<this>()
    removed = ewent<this>()

    protected _modal: Widget
    protected _dialog: Widget
    protected _content: Widget

    private visible = observe(false)
    private should_dismount = observe(false)

    private hidden_resolvers: ((_: this) => any)[] = []

    constructor(protected options: Modal2.Options = {}) {
        this._modal = c("<div class='modal' tabindex='-1'><div class='modal-dialog'></div></div>")
        this._dialog = c("<div class='modal-dialog'></div>").appendTo(this._modal)
        this._content = c("<div class='modal-content'></div>").appendTo(this._dialog)

        this._modal.container.modal({
            backdrop: options.fixed ? "static" : true,
            keyboard: !options.fixed,
        })

        this._modal.container.on("shown.bs.modal", () => {
            this.visible.set(true)
            this.shown.trigger(this)
        })

        if (!options.no_fade) this._modal.addClass("fade")

        switch (options.size || "medium") {
            case "small":
                this._dialog.addClass("modal-sm")
                break;
            case "large":
                this._dialog.addClass("modal-lg")
                break;
        }

        this._modal.container.on("hidden.bs.modal", () => {
            this.visible.set(false)
            this.hidden.trigger(this)

            this.hidden_resolvers.forEach(f => f(this))
            this.hidden_resolvers = []
        })

        observe_combined({visible: this.visible, should_dismount: this.should_dismount}).subscribe(({visible, should_dismount}) => {
            if (!visible && should_dismount) this.dismount()
        })
    }

    private mount() {
        if (this._modal.container.parent().length == 0) {
            this._modal.appendTo($("body"))
        }
    }

    private dismount() {
        this._modal.detach()
        this.removed.trigger(this)
    }

    show(): Promise<this> {
        let promise = new Promise<this>((resolve) => {
            this.hidden_resolvers.push(resolve)
        })

        this.mount()
        this._modal.container.modal("show")

        return promise
    }

    hide() {
        this._modal.container.modal("hide")
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
        size?: "small" | "medium" | "large",
        fixed?: boolean
    }
}