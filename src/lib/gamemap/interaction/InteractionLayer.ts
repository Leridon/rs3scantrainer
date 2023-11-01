import GameLayer from "../GameLayer";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";

export class InteractionGuard {
    private interaction: InteractionLayer = null

    set(interaction: InteractionLayer, target: GameLayer): this {
        this.reset()


        if (interaction) {
            if (interaction._guard) interaction._guard.reset()

            this.interaction = interaction
            interaction._guard = this

            interaction.addTo(target)
        }

        return this
    }

    reset() {
        if (this.interaction) {
            console.log("Removing")
            console.log(this.interaction)
            this.interaction._guard = null
            this.interaction.remove()
            this.interaction.cancel()
        }

        this.interaction = null

        return this
    }
}

export default class InteractionLayer extends GameLayer {
    _guard: InteractionGuard = null

    events: TypedEmitter<{
        "cancelled": InteractionLayer
    }> = new TypedEmitter()

    cancel() {
        console.log("Cancel")

        if (this._guard) this._guard.reset()
        else this.cancelled()
    }

    onCancel(handler: () => any) {
        this.events.on("cancelled", handler)
    }

    protected cancelled() {
        this.events.emit("cancelled", this)
    }
}