import Dict = NodeJS.Dict;

export class Modal {
    _modal: JQuery
    private hidden_promise: Promise<void>

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

    show(): Promise<void> {
        this._modal.modal("show")

        this.hidden_promise = new Promise<void>((resolve) => {
            this._modal.on("hidden.bs.modal", () => resolve())
        })

        return new Promise<void>((resolve) => {
            let listener = () => {
                resolve()
                this._modal.off("hidden.bs.modal", listener)
            }

            this._modal.on("hidden.bs.modal", listener)
        })
    }

    hide() {
        this._modal.modal("hide")
    }
}

let modal_cache: Dict<Modal> = {}

export function modal<T extends Modal>(id: string, constructor: new (id: string) => T = (Modal as new (id: string) => T)): T {
    if (!(id in modal_cache)) modal_cache[id] = new constructor(id)

    return modal_cache[id] as T
}