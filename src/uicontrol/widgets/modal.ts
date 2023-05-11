import Dict = NodeJS.Dict;

export class Modal {
    _modal: JQuery

    public constructor(id: string) {
        this._modal = $(`#${id}`)

        this._modal.on("shown.bs.modal", () => {
            this.shown()
        })

        this._modal.on("hidden.bs.modal", () => {
            this.hidden()
        })
    }

    protected shown() {
    }

    protected hidden() {
    }

    show() {
        this._modal.modal("show")
    }

    hide() {
        this._modal.modal("hide")
    }
}

let modal_cache: Dict<Modal> = {}

export function modal(id: string, constructor: new (id: string) => Modal = Modal) {
    if (!(id in modal_cache)) modal_cache[id] = new constructor(id)

    return modal_cache[id]
}