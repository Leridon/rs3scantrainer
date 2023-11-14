import InteractionLayer from "./InteractionLayer";
import {Observable, observe} from "../../properties/Observable";
import * as leaflet from "leaflet";

export class ValueInteraction<T> extends InteractionLayer {
    private _preview: leaflet.Layer = null

    value: Observable<{ value: T, committed: boolean }> = observe({value: null, committed: false})

    constructor(protected config: ValueInteraction.option_t<T> = {}) {
        super();

        if (config.preview_render) {
            this.onPreview(value => {
                if (this._preview) this._preview.remove()

                if (value != null) this._preview = this.config.preview_render(value)?.addTo(this)
            })
        }
    }

    cancel() {
        if(!this.value.get().committed) this.value.set({value: null, committed: true})
        super.cancel()
    }

    protected commit(value: T) {
        this.value.set({value: value, committed: true})
        this.cancel()
    }

    preview(value: T): this {
        this.value.set({value: value, committed: false})
        return this
    }

    onChange(handler: (_: { value: T, committed: boolean }) => any): this {
        this.value.subscribe(handler)
        return this
    }

    onPreview(handler: (_: T) => any): this {
        this.value.subscribe((v) => {if (!v.committed) handler(v.value)})
        return this
    }

    onCommit(handler: (_: T) => any): this {
        this.value.subscribe((v) => {if (v.committed && v.value) handler(v.value)})
        return this
    }

    onDiscarded(handler: () => any): this {
        this.value.subscribe((v) => {if (v.committed && !v.value) handler()})
        return this
    }
}

export namespace ValueInteraction {
    export type option_t<T> = {
        preview_render?: (_: T) => leaflet.Layer
    }
}